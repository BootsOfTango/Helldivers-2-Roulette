const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeResourcePath } = require('../electron/resource-loader');

test('packaged JSON reader allows only bundled catalog resources', () => {
  assert.equal(normalizeResourcePath('./assets/item-catalog.json'), 'assets/item-catalog.json');
  assert.equal(normalizeResourcePath('assets/item-images.json'), 'assets/item-images.json');
  assert.throws(() => normalizeResourcePath('../package.json'), /not allowed/);
  assert.throws(() => normalizeResourcePath('assets/other.json'), /not allowed/);
});
