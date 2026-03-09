#!/usr/bin/env python3
from __future__ import annotations
import json, re, unicodedata
from html import unescape
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import quote, urlencode, urljoin, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
INDEX_HTML = ROOT / 'index.html'
OUTPUT_JSON = ROOT / 'assets' / 'item-images.json'
WIKI_BASE = 'https://helldivers.wiki.gg'
API_ENDPOINT = f'{WIKI_BASE}/api.php'
UA = 'Helldivers2RouletteAssetSync/1.0'

CATEGORY_TO_ASSET_DIR = {
    'primary': 'assets/weapons/primaries',
    'sidearm': 'assets/weapons/sidearms',
    'throwable': 'assets/weapons/throwables',
}
STRATAGEM_GROUP_DIRS = {
    'support': 'assets/stratagems/support',
    'orbital': 'assets/stratagems/orbital',
    'eagle': 'assets/stratagems/eagle',
    'defensive': 'assets/stratagems/defensive',
    'backpack': 'assets/stratagems/backpack',
    'exosuit': 'assets/stratagems/exosuits',
}
WIKI_TITLE_ALIASES: Dict[str, str] = {
    'Guard Dog Rover': 'AX/LAS-5 "Guard Dog" Rover',
    'SG-225SP Breaker Spray&Pray': 'SG-225SP Breaker Spray & Pray',
    'Orbital 120MM HE Barrage': 'Orbital 120mm HE Barrage',
    'Orbital 380MM HE Barrage': 'Orbital 380mm HE Barrage',
    'Eagle 110MM Rocket Pods': 'Eagle 110mm Rocket Pods',
}
NAME_ALIASES = {
    'sg-225sp breaker spray and pray': 'SG-225SP Breaker Spray&Pray',
    'sg 225sp breaker spray pray': 'SG-225SP Breaker Spray&Pray',
    'sta x3 wasp launcher': 'StA-X3 W.A.S.P. Launcher',
    'orbital 120mm he barrage': 'Orbital 120MM HE Barrage',
    'orbital 380mm he barrage': 'Orbital 380MM HE Barrage',
    'eagle 110mm rocket pods': 'Eagle 110MM Rocket Pods',
}
STRATAGEM_GROUP_RULES: List[Tuple[str, str]] = [
    ('orbital', 'orbital'), ('eagle', 'eagle'), ('sentry', 'defensive'),
    ('mine', 'defensive'), ('emplacement', 'defensive'),
    ('shield', 'backpack'), ('pack', 'backpack'), ('guard dog', 'backpack'), ('exosuit', 'exosuit'),
]

def fetch_text(url: str) -> str:
    with urlopen(Request(url, headers={'User-Agent': UA})) as r:
        return r.read().decode('utf-8', errors='replace')

def fetch_bytes(url: str) -> bytes:
    with urlopen(Request(url, headers={'User-Agent': UA})) as r:
        return r.read()

def normalize_name(v: str) -> str:
    v = unicodedata.normalize('NFKD', v).encode('ascii', 'ignore').decode('ascii').lower().replace('&', ' and ')
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9]+', ' ', v)).strip()

def slugify(v: str) -> str:
    v = unicodedata.normalize('NFKD', v).encode('ascii', 'ignore').decode('ascii').lower().replace('&', ' and ')
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', v)).strip('-') or 'item'

def parse_defaults_items(text: str) -> Dict[str, List[str]]:
    out = {}
    for key in ('primaries', 'sidearms', 'throwables', 'stratagems'):
        m = re.search(rf'{key}:\s*\[(.*?)\]\.map\(n => \(\{{ name: n, enabled: true \}}\)\)', text, re.S)
        if not m: raise RuntimeError(f'missing {key}')
        out[key] = [unescape(x) for x in re.findall(r'"([^"]+)"', m.group(1))]
    return out

def resolve_wiki_titles(name: str) -> List[str]:
    candidates = []
    if name in WIKI_TITLE_ALIASES: candidates.append(WIKI_TITLE_ALIASES[name])
    candidates.append(name)
    q = urlencode({'action':'opensearch','search':name,'limit':5,'namespace':0,'format':'json'})
    data = json.loads(fetch_text(f'{API_ENDPOINT}?{q}'))
    if isinstance(data,list) and len(data)>1: candidates.extend(data[1])
    seen, dedup = set(), []
    for c in candidates:
        if c and c not in seen: seen.add(c); dedup.append(c)
    return dedup

def image_from_html(html:str)->Optional[str]:
    for pat in [r'<meta\s+property="og:image"\s+content="([^"]+)"', r'<meta\s+name="twitter:image"\s+content="([^"]+)"']:
        m = re.search(pat, html, re.I)
        if m: return unescape(m.group(1))
    return None

def pick_ext(url:str)->str:
    s=Path(urlparse(url).path).suffix.lower()
    return '.jpg' if s=='.jpeg' else (s if s in {'.png','.jpg','.webp','.gif','.svg'} else '.png')

def stratagem_group(name:str)->str:
    n=normalize_name(name)
    for t,g in STRATAGEM_GROUP_RULES:
        if t in n: return g
    return 'support'

def stable_write(path:Path, content:bytes):
    if path.exists() and path.read_bytes()==content: return
    path.parent.mkdir(parents=True, exist_ok=True); path.write_bytes(content)

def sync_item(name:str, category:str)->Dict[str,str]:
    last=None; wiki_title=''; page_url=''; html=''
    for t in resolve_wiki_titles(name):
        try:
            wiki_title=t; page_url=f"{WIKI_BASE}/wiki/{quote(t.replace(' ','_'))}"; html=fetch_text(page_url); break
        except Exception as e:
            last=e
    else:
        raise RuntimeError(f'unresolved page ({last})')
    img=image_from_html(html)
    if not img: raise RuntimeError('missing og:image')
    img=urljoin(WIKI_BASE,img)
    ext=pick_ext(img); slug=slugify(name)
    if category=='stratagem':
        rel=Path(STRATAGEM_GROUP_DIRS[stratagem_group(name)]) / f'{slug}{ext}'; kind='icon'
    else:
        rel=Path(CATEGORY_TO_ASSET_DIR[category]) / f'{slug}{ext}'; kind='image'
    stable_write(ROOT/rel, fetch_bytes(img))
    return {'name':name,'assetPath':rel.as_posix(),'kind':kind,'wikiTitle':wiki_title,'sourceUrl':page_url,'imageUrl':img}

def main():
    parsed=parse_defaults_items(INDEX_HTML.read_text(encoding='utf-8'))
    mapping={'primary':[],'sidearm':[],'throwable':[],'stratagem':[]}
    failures=[]
    for category,key in [('primary','primaries'),('sidearm','sidearms'),('throwable','throwables'),('stratagem','stratagems')]:
        for name in parsed[key]:
            try:
                e=sync_item(name,category); mapping[category].append(e); print(f"Synced {category:<9} {name} -> {e['assetPath']}")
            except Exception as ex:
                failures.append(f'{category}:{name}: {ex}'); print(f'FAILED {category:<9} {name}: {ex}')
    for k in mapping: mapping[k]=sorted(mapping[k], key=lambda x:x['name'])
    aliases={normalize_name(n):n for n in parsed['primaries']+parsed['sidearms']+parsed['throwables']+parsed['stratagems']}
    aliases.update(NAME_ALIASES)
    payload={'generatedAt':'deterministic-v1','source':WIKI_BASE,'nameAliases':dict(sorted(aliases.items())),**mapping}
    stable_write(OUTPUT_JSON,(json.dumps(payload,indent=2,ensure_ascii=False)+'\n').encode())
    print(f'Wrote mapping: {OUTPUT_JSON.relative_to(ROOT)}')
    if failures: raise SystemExit('\n'.join(failures))

if __name__=='__main__':
    main()
