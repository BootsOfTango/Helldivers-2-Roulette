const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  MAX_BACKUPS,
  BACKUP_DIR,
  RECOVERY_DIR,
  wrapData,
  saveStateFile,
  loadStateFile,
  validateData,
  validatePayload
} = require('../electron/storage');

function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'hd2-save-')); }
function data(id = 'card-1') { return { items: { primaries: [{ name: 'AR-23 Liberator', enabled: true }] }, cards: [{ id, seed: 'Seed: 1' }], settings: { rememberedPlayerName: 'Diver' } }; }

test('normal saving writes state.json with metadata', () => {
  const dir = tmp();
  saveStateFile(dir, data(), '1.2.3');
  const saved = JSON.parse(fs.readFileSync(path.join(dir, 'state.json'), 'utf8'));
  assert.equal(saved.saveFormatVersion, 1);
  assert.equal(saved.applicationVersion, '1.2.3');
  assert.ok(Date.parse(saved.savedAt));
  assert.equal(saved.data.cards[0].id, 'card-1');
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
  assert.throws(() => saveStateFile(dir, { items: [], cards: [] }, '1.2.3'), /Items must be an object/);
  assert.equal(fs.existsSync(path.join(dir, 'state.json')), false);
  assert.throws(() => validateData({ items: {}, cards: {} }), /Cards must be an array/);
});

test('future unsupported save versions are rejected', () => {
  const future = wrapData(data(), '9.9.9');
  future.saveFormatVersion = 999;
  assert.throws(() => validatePayload(future), /newer than this app supports/);
});
