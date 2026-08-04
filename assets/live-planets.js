(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HD2LivePlanets = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const LIVE_PLANETS_URL = 'https://api.helldivers2.dev/api/v1/campaigns';
  const LIVE_PLANETS_TIMEOUT_MS = 3500;

  function normalizeFactionFromOwner(owner) {
    const raw = String(owner || '').toLowerCase().trim();
    if (raw === 'terminids') return 'Terminids';
    if (raw === 'automaton' || raw === 'automatons') return 'Automatons';
    if (raw === 'illuminate') return 'Illuminate';
    if (raw === 'humans' || raw === 'super earth') return 'Super Earth';
    return owner || 'Unknown';
  }

  function validateCachedPlanets(cache) {
    if (!cache || typeof cache !== 'object' || !Array.isArray(cache.planets) || !cache.planets.length || !cache.updatedAt) return null;
    const planets = cache.planets.map(p => ({
      name: String((p && p.name) || '').trim() || 'Unknown',
      sector: String((p && p.sector) || '').trim() || '—',
      faction: normalizeFactionFromOwner(p && p.faction),
      biome: String((p && p.biome) || '').trim() || '—'
    })).sort((a, b) => a.name.localeCompare(b.name));
    return { planets, updatedAt: String(cache.updatedAt) };
  }

  function parseActivePlanets(data) {
    if (!Array.isArray(data)) throw new Error('Live planet response was not a list.');
    const active = data.map(c => c && c.planet).filter(Boolean).filter(p => !p.disabled).map(p => ({
      name: String(p.name || '').trim() || 'Unknown',
      sector: String(p.sector || '').trim() || '—',
      faction: normalizeFactionFromOwner(p.currentOwner || p.owner),
      biome: String((p.biome && p.biome.name) || '').trim() || '—'
    })).sort((a, b) => a.name.localeCompare(b.name));
    if (!active.length && data.length) throw new Error('Live planet response did not include active planets.');
    return active;
  }

  async function fetchActivePlanets(fetchImpl, options) {
    const fetcher = fetchImpl || fetch;
    const timeoutMs = Number((options && options.timeoutMs) || LIVE_PLANETS_TIMEOUT_MS);
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const res = await fetcher(LIVE_PLANETS_URL, {
        signal: controller && controller.signal,
        headers: {
          'X-Super-Client': 'helldivers-2-roulette',
          'X-Super-Contact': 'https://github.com/'
        }
      });
      if (!res || !res.ok) throw new Error(`HTTP ${res && res.status ? res.status : 'error'}`);
      return parseActivePlanets(await res.json());
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  return { LIVE_PLANETS_URL, LIVE_PLANETS_TIMEOUT_MS, normalizeFactionFromOwner, validateCachedPlanets, parseActivePlanets, fetchActivePlanets };
});
