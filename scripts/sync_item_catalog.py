#!/usr/bin/env python3
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'index.html'
CATALOG = ROOT / 'assets' / 'item-catalog.json'
ITEM_IMAGES = ROOT / 'assets' / 'item-images.json'

TYPE_TO_DEFAULTS_KEY = {
    'primary': 'primaries',
    'sidearm': 'sidearms',
    'throwable': 'throwables',
    'stratagem': 'stratagems',
}


def local_asset_exists(asset_path: str) -> bool:
    return bool(asset_path) and (ROOT / asset_path).exists()


def normalize_key(value: str) -> str:
    value = (value or '').lower().replace('&', ' and ')
    value = re.sub(r'[^a-z0-9]+', ' ', value)
    return re.sub(r'\s+', ' ', value).strip()


def build_aliases(catalog_items):
    aliases = {}
    for item in catalog_items:
        name = item['name']
        variants = {
            normalize_key(name),
            normalize_key(name.replace('&', 'and')),
            normalize_key(name.replace('&', '')),
            normalize_key(name.replace('/', ' ')),
            normalize_key(name.replace("'", '')),
        }
        for key in [v for v in variants if v]:
            aliases[key] = name
    return dict(sorted(aliases.items()))


def render_defaults_block(catalog_items):
    grouped = {k: [] for k in TYPE_TO_DEFAULTS_KEY.values()}
    for item in catalog_items:
        grouped[TYPE_TO_DEFAULTS_KEY[item['type']]].append(item)

    lines = ['            items: {']
    order = ['primaries', 'sidearms', 'throwables', 'stratagems']
    for idx, group_key in enumerate(order):
        lines.append(f'                {group_key}: [')
        for item in grouped[group_key]:
            name = json.dumps(item['name'])
            warbond = json.dumps(item['warbond'])
            subgroup = json.dumps(item['subgroup'])
            source = json.dumps(item['source'])
            lines.append(f'                    {{ name: {name}, enabled: true, warbond: {warbond}, subgroup: {subgroup}, source: {source} }},')
        lines.append('                ],')
        if idx < len(order) - 1:
            lines.append('')
    lines.append('            },')
    return '\n'.join(lines)


def render_warbond_map(catalog_items):
    lines = ['        const ITEM_WARBOND_BY_NAME = {']
    for item in catalog_items:
        name = json.dumps(item['name'])
        warbond = json.dumps(item['warbond'])
        lines.append(f'            {name}: {warbond},')
    lines.append('        };')
    return '\n'.join(lines)


def sync_index(catalog_items):
    text = INDEX.read_text()
    defaults_block = render_defaults_block(catalog_items)
    text, n1 = re.subn(
        r"items: \{.*?\n\s+planets:",
        defaults_block + '\n\n            planets:',
        text,
        count=1,
        flags=re.S,
    )
    if n1 != 1:
        raise RuntimeError('Unable to replace DEFAULTS.items block')

    warbond_map = render_warbond_map(catalog_items)
    text, n2 = re.subn(
        r"\s{8}const ITEM_WARBOND_BY_NAME = \{.*?\n\s{8}\};",
        '\n' + warbond_map,
        text,
        count=1,
        flags=re.S,
    )
    if n2 != 1:
        raise RuntimeError('Unable to replace ITEM_WARBOND_BY_NAME block')

    INDEX.write_text(text)


def sync_item_images(catalog_items):
    existing = json.loads(ITEM_IMAGES.read_text())
    existing_by_type = {
        t: {entry['name']: entry for entry in existing.get(t, [])}
        for t in TYPE_TO_DEFAULTS_KEY
    }

    result = {
        'generatedAt': existing.get('generatedAt', ''),
        'source': 'Derived from assets/item-catalog.json via scripts/sync_item_catalog.py',
        'nameAliases': build_aliases(catalog_items),
    }

    for t in ['primary', 'sidearm', 'throwable', 'stratagem']:
        out = []
        for item in [i for i in catalog_items if i['type'] == t]:
            prev = existing_by_type.get(t, {}).get(item['name'], {})
            catalog_asset_path = item.get('assetPath') or ''
            asset_path = catalog_asset_path if local_asset_exists(catalog_asset_path) else prev.get('assetPath', '')
            entry = {
                'name': item['name'],
                'assetPath': asset_path,
                'kind': prev.get('kind', 'icon' if t == 'stratagem' else 'image'),
            }
            for key in ['wikiTitle', 'sourceUrl', 'imageUrl', 'rimCategory']:
                if prev.get(key):
                    entry[key] = prev[key]
            out.append(entry)
        result[t] = out

    ITEM_IMAGES.write_text(json.dumps(result, indent=2) + '\n')


def main():
    data = json.loads(CATALOG.read_text())
    items = data['items']
    sync_index(items)
    sync_item_images(items)
    print(f'Synced {len(items)} catalog items into index defaults, warbond map, and item-images.')


if __name__ == '__main__':
    main()
