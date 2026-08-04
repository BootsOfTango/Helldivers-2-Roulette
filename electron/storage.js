const fs = require('node:fs');
const path = require('node:path');

const SAVE_FORMAT_VERSION = 1;
const MAX_SUPPORTED_SAVE_FORMAT_VERSION = 1;
const MAX_BACKUPS = 20;
const STATE_FILE = 'state.json';
const BACKUP_DIR = 'backups';
const RECOVERY_DIR = 'recovery';

function safePackageVersion() {
  try { return require('../package.json').version || '0.0.0'; } catch { return '0.0.0'; }
}

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function stamp(date = new Date()) { return date.toISOString().replace(/[:.]/g, '-'); }
function statePath(userDataPath) { return path.join(userDataPath, STATE_FILE); }
function backupPath(userDataPath, date = new Date()) { return path.join(userDataPath, BACKUP_DIR, `state-${stamp(date)}.json`); }
function recoveryPath(userDataPath, prefix = 'state', date = new Date()) { return path.join(userDataPath, RECOVERY_DIR, `${prefix}-${stamp(date)}.json`); }

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Save must be a JSON object.');
  const version = Number(payload.saveFormatVersion);
  if (!Number.isInteger(version) || version < 1) throw new Error('Save format version is missing or invalid.');
  if (version > MAX_SUPPORTED_SAVE_FORMAT_VERSION) throw new Error(`Save format version ${version} is newer than this app supports.`);
  if (typeof payload.applicationVersion !== 'string' || !payload.applicationVersion.trim()) throw new Error('Application version is missing.');
  if (Number.isNaN(Date.parse(payload.savedAt))) throw new Error('Save date is missing or invalid.');
  if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) throw new Error('Save data is missing.');
  validateData(payload.data);
  return true;
}

function validateData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('State data must be an object.');
  if (data.items != null && (typeof data.items !== 'object' || Array.isArray(data.items))) throw new Error('Items must be an object.');
  if (data.cards != null && !Array.isArray(data.cards)) throw new Error('Cards must be an array.');
  if (data.settings != null && (typeof data.settings !== 'object' || Array.isArray(data.settings))) throw new Error('Settings must be an object.');
  return true;
}

function wrapData(data, appVersion = safePackageVersion(), date = new Date()) {
  validateData(data);
  return { saveFormatVersion: SAVE_FORMAT_VERSION, applicationVersion: String(appVersion), savedAt: date.toISOString(), data };
}

function unwrapPayload(payload) {
  validatePayload(payload);
  return payload.data;
}

function parseSave(raw) { return unwrapPayload(JSON.parse(raw)); }

function preserveDamagedSave(userDataPath, sourcePath, prefix = 'state') {
  ensureDir(path.join(userDataPath, RECOVERY_DIR));
  const target = recoveryPath(userDataPath, prefix);
  fs.copyFileSync(sourcePath, target);
  return target;
}

function rotateBackups(userDataPath, maxBackups = MAX_BACKUPS) {
  const dir = path.join(userDataPath, BACKUP_DIR);
  ensureDir(dir);
  const files = fs.readdirSync(dir).filter(f => /^state-.*\.json$/.test(f)).map(f => ({ f, p: path.join(dir, f), t: fs.statSync(path.join(dir, f)).mtimeMs })).sort((a,b) => b.t - a.t);
  files.slice(maxBackups).forEach(x => fs.rmSync(x.p, { force: true }));
}

function saveStateFile(userDataPath, data, appVersion = safePackageVersion()) {
  ensureDir(userDataPath); ensureDir(path.join(userDataPath, BACKUP_DIR)); ensureDir(path.join(userDataPath, RECOVERY_DIR));
  const file = statePath(userDataPath);
  const tmp = path.join(userDataPath, `.${STATE_FILE}.${process.pid}.${Date.now()}.tmp`);
  const payload = JSON.stringify(wrapData(data, appVersion), null, 2);
  fs.writeFileSync(tmp, payload, 'utf8');
  if (!fs.existsSync(tmp)) throw new Error('Temporary save file was not created.');
  if (fs.existsSync(file)) fs.copyFileSync(file, backupPath(userDataPath));
  fs.renameSync(tmp, file);
  rotateBackups(userDataPath);
  return { ok: true, path: file };
}

function loadStateFile(userDataPath) {
  ensureDir(userDataPath); ensureDir(path.join(userDataPath, BACKUP_DIR)); ensureDir(path.join(userDataPath, RECOVERY_DIR));
  const file = statePath(userDataPath);
  if (fs.existsSync(file)) {
    try { return { data: parseSave(fs.readFileSync(file, 'utf8')), recovered: false, path: file }; }
    catch (err) { preserveDamagedSave(userDataPath, file, 'state-damaged'); fs.rmSync(file, { force: true }); }
  }
  const dir = path.join(userDataPath, BACKUP_DIR);
  const backups = fs.readdirSync(dir).filter(f => /^state-.*\.json$/.test(f)).map(f => ({ f, p: path.join(dir, f), t: fs.statSync(path.join(dir, f)).mtimeMs })).sort((a,b) => b.t - a.t);
  for (const b of backups) {
    try { return { data: parseSave(fs.readFileSync(b.p, 'utf8')), recovered: true, path: b.p }; }
    catch { preserveDamagedSave(userDataPath, b.p, 'backup-damaged'); }
  }
  return { data: null, recovered: false, path: null };
}

module.exports = { SAVE_FORMAT_VERSION, MAX_SUPPORTED_SAVE_FORMAT_VERSION, MAX_BACKUPS, STATE_FILE, BACKUP_DIR, RECOVERY_DIR, validateData, validatePayload, wrapData, parseSave, saveStateFile, loadStateFile, rotateBackups };
