#!/usr/bin/env python3
import hashlib
import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
package = json.loads((ROOT / 'package.json').read_text())
version = package['version']
zip_path = ROOT / 'dist' / f'Helldivers-2-Chaos-Roulette-v{version}-win-x64.zip'
if not zip_path.exists():
    raise SystemExit(f'Missing ZIP: {zip_path}')

extract_dir = ROOT / 'dist' / 'verify-win-zip'
if extract_dir.exists():
    import shutil
    shutil.rmtree(extract_dir)
with zipfile.ZipFile(zip_path) as zf:
    names = zf.namelist()
    zf.extractall(extract_dir)

asar_listing = []
asar_path = next(extract_dir.glob('**/resources/app.asar'), None)
if asar_path:
    import subprocess
    result = subprocess.run(['npx', 'asar', 'list', str(asar_path)], cwd=ROOT, text=True, capture_output=True, check=True)
    asar_listing = [line.lstrip('/') for line in result.stdout.splitlines()]
all_names = names + asar_listing

checks = {
    'exe': 'Helldivers 2 Chaos Roulette.exe',
    'electron': 'resources/app.asar',
    'runtime': 'resources/',
    'catalog': 'assets/item-catalog.json',
    'image mappings': 'assets/item-images.json',
    'artwork': 'assets/branding/helldivers-2-logo.svg',
    'icon': 'build/icon.ico',
    'readme first': 'README-FIRST.txt',
}

missing = []
for label, needle in checks.items():
    if not any(name.endswith(needle) or needle in name for name in all_names):
        missing.append(f'{label}: {needle}')

runtime_needles = ['resources/app.asar', 'chrome_100_percent.pak', 'icudtl.dat', 'snapshot_blob.bin', 'v8_context_snapshot.bin']
for needle in runtime_needles:
    if not any(name.endswith(needle) for name in all_names):
        missing.append(f'Electron runtime: {needle}')

forbidden_parts = ['.git/', 'node_modules/', 'test/', 'coverage/', '.env']
forbidden_names = ['package-lock.json', 'sample-card-tidied.html']
forbidden = []
for name in names:
    lower = name.lower()
    if any(part in lower for part in forbidden_parts) or any(lower.endswith(f) for f in forbidden_names) or 'secret' in lower:
        forbidden.append(name)

if missing or forbidden:
    if missing:
        print('Missing required package content:')
        print('\n'.join(f' - {m}' for m in missing))
    if forbidden:
        print('Forbidden/unnecessary package content:')
        print('\n'.join(f' - {f}' for f in forbidden[:50]))
    raise SystemExit(1)

sha = hashlib.sha256(zip_path.read_bytes()).hexdigest()
sha_path = zip_path.with_suffix(zip_path.suffix + '.sha256')
sha_path.write_text(f'{sha}  {zip_path.name}\n')
print(f'ZIP: {zip_path}')
print(f'Size bytes: {zip_path.stat().st_size}')
print(f'SHA-256: {sha}')
print(f'Entries: {len(names)}')
print('Required runtime files and assets are present; forbidden development/secrets patterns are absent.')
