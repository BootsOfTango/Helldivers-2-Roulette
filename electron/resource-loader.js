const fs = require('node:fs/promises');
const path = require('node:path');

const ALLOWED_JSON = Object.freeze(new Set(['assets/item-catalog.json', 'assets/item-images.json']));

function normalizeResourcePath(resourcePath) {
  const normalized = String(resourcePath || '').replace(/\\/g, '/').replace(/^\.\//, '');
  if (!ALLOWED_JSON.has(normalized)) throw new Error('Resource is not allowed.');
  return normalized;
}

async function readPackagedJson(appPath, resourcePath) {
  const normalized = normalizeResourcePath(resourcePath);
  const fullPath = path.join(appPath, ...normalized.split('/'));
  const raw = await fs.readFile(fullPath, 'utf8');
  return JSON.parse(raw);
}

module.exports = { ALLOWED_JSON, normalizeResourcePath, readPackagedJson };
