const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  MAX_BACKUPS,
  BACKUP_DIR,
  RECOVERY_DIR,
  MAX_IMPORT_BYTES,
  wrapData,
  saveStateFile,
  loadStateFile,
  validateData,
  validatePayload,
  parseImport,
  importStateFile,
  exportStateFile
} = require('../electron/storage');

function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'hd2-save-')); }
function data(id = 'card-1') { return { items: { primaries: [{ name: 'AR-23 Liberator', enabled: true }] }, cards: [{ id, seed: 'Seed: 1' }], settings: { rememberedPlayerName: 'Diver' } }; }
function writeJson(dir, name, payload) { const file = path.join(dir, name); fs.writeFileSync(file, JSON.stringify(payload), 'utf8'); return file; }

test('normal saving writes state.json with metadata', () => {
  const dir = tmp();
  saveStateFile(dir, data(), '1.2.3');
  const saved = JSON.parse(fs.readFileSync(path.join(dir, 'state.json'), 'utf8'));
  assert.equal(saved.saveFormatVersion, 1);
  assert.equal(saved.applicationVersion, '1.2.3');
  assert.ok(Date.parse(saved.savedAt));
  assert.equal(saved.data.cards[0].id, 'card-1');
});

test('export writes complete supported state with app and export metadata', () => {
  const dir = tmp();
  const target = path.join(dir, 'export.json');
  exportStateFile(target, data('exported'), '2.0.0');
  const saved = JSON.parse(fs.readFileSync(target, 'utf8'));
  assert.equal(saved.saveFormatVersion, 1);
  assert.equal(saved.applicationVersion, '2.0.0');
  assert.ok(Date.parse(saved.exportedAt));
  assert.equal(saved.data.cards[0].id, 'exported');
  assert.equal(saved.data.items.primaries[0].enabled, true);
  assert.equal(saved.data.settings.rememberedPlayerName, 'Diver');
});

test('restart persistence loads the working save', () => {
  const dir = tmp();
  saveStateFile(dir, data('persisted'), '1.2.3');
  const loaded = loadStateFile(dir);
  assert.equal(loaded.recovered, false);
  assert.equal(loaded.data.cards[0].id, 'persisted');
});

test('damaged working save is preserved and newest valid backup is recovered', async () => {
  const dir = tmp();
  saveStateFile(dir, data('old'), '1.2.3');
  await new Promise(r => setTimeout(r, 5));
  saveStateFile(dir, data('newest-backup'), '1.2.3');
  fs.writeFileSync(path.join(dir, 'state.json'), '{ damaged', 'utf8');
  const loaded = loadStateFile(dir);
  assert.equal(loaded.recovered, true);
  assert.equal(loaded.data.cards[0].id, 'old');
  assert.ok(fs.readdirSync(path.join(dir, RECOVERY_DIR)).some(f => f.startsWith('state-damaged')));
});

test('backup rotation keeps the latest 20 backups', async () => {
  const dir = tmp();
  for (let i = 0; i < MAX_BACKUPS + 5; i += 1) {
    saveStateFile(dir, data(`card-${i}`), '1.2.3');
    await new Promise(r => setTimeout(r, 2));
  }
  const backups = fs.readdirSync(path.join(dir, BACKUP_DIR)).filter(f => f.endsWith('.json'));
  assert.equal(backups.length, MAX_BACKUPS);
});

test('invalid save data is rejected before writing', () => {
  const dir = tmp();
  assert.throws(() => saveStateFile(dir, { items: [], cards: [] }, '1.2.3'), /Items must be a JSON object/);
  assert.equal(fs.existsSync(path.join(dir, 'state.json')), false);
  assert.throws(() => validateData({ items: {}, cards: {} }), /Cards must be a list/);
});

test('future unsupported save versions are rejected', () => {
  const future = wrapData(data(), '9.9.9');
  future.saveFormatVersion = 999;
  assert.throws(() => validatePayload(future), /newer than this app supports/);
});

test('good desktop import backs up current data and persists after restart', () => {
  const dir = tmp();
  saveStateFile(dir, data('before'), '1.2.3');
  const source = writeJson(dir, 'incoming.json', wrapData(data('after'), '1.2.4'));
  const result = importStateFile(dir, source, '1.2.5');
  assert.equal(result.ok, true);
  assert.equal(result.data.cards[0].id, 'after');
  assert.ok(result.backup);
  assert.equal(loadStateFile(dir).data.cards[0].id, 'after');
  const backups = fs.readdirSync(path.join(dir, BACKUP_DIR)).filter(f => f.includes('before-import') || f.startsWith('state-'));
  assert.ok(backups.length >= 1);
});

test('real browser-exported sample imports without desktop metadata', () => {
  const sample = { items: { primaries: [{ name: 'SG-225 Breaker', enabled: false }] }, cards: [{ id: 'browser-card', seed: 'Browser Export' }], settings: { rememberedPlayerName: 'Browser Diver' } };
  const imported = parseImport(JSON.stringify(sample));
  assert.equal(imported.cards[0].id, 'browser-card');
  assert.equal(imported.items.primaries[0].enabled, false);
  assert.equal(imported.settings.rememberedPlayerName, 'Browser Diver');
});

test('bad imports are rejected without changing current data', () => {
  const dir = tmp();
  saveStateFile(dir, data('untouched'), '1.2.3');
  const malformed = path.join(dir, 'bad.json');
  fs.writeFileSync(malformed, '{ nope', 'utf8');
  assert.throws(() => importStateFile(dir, malformed, '1.2.3'), /not valid JSON/);
  assert.equal(loadStateFile(dir).data.cards[0].id, 'untouched');
  const future = writeJson(dir, 'future.json', { ...wrapData(data('future'), '9.9.9'), saveFormatVersion: 999 });
  assert.throws(() => importStateFile(dir, future, '1.2.3'), /newer than this app supports/);
  assert.equal(loadStateFile(dir).data.cards[0].id, 'untouched');
  const wrong = writeJson(dir, 'wrong.json', { cards: {} });
  assert.throws(() => importStateFile(dir, wrong, '1.2.3'), /Cards must be a list/);
  assert.equal(loadStateFile(dir).data.cards[0].id, 'untouched');
});

test('excessively large imports are rejected before parsing', () => {
  const dir = tmp();
  const file = path.join(dir, 'too-large.json');
  fs.writeFileSync(file, `${' '.repeat(MAX_IMPORT_BYTES + 1)}{}`, 'utf8');
  assert.throws(() => importStateFile(dir, file, '1.2.3'), /too large/);
});
