#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "assets" / "item-images.json"

ALLOWED = {"defensive", "orbital", "eagle", "support"}
EXPECTED = {
    "Shield Generator Relay": "defensive",
    "Ballistic Shield Backpack": "support",
    "Supply Pack": "support",
    "Rocket Sentry": "defensive",
    "Orbital Laser": "orbital",
    "Eagle Airstrike": "eagle",
}


def main() -> int:
    payload = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    stratagems = payload.get("stratagem", [])

    by_name = {str(entry.get("name", "")).strip(): entry for entry in stratagems}
    failures: list[str] = []

    for entry in stratagems:
        name = str(entry.get("name", "")).strip() or "<missing name>"
        rim = str(entry.get("rimCategory", "")).strip().lower()
        if not rim:
            failures.append(f"{name}: missing rimCategory")
        elif rim not in ALLOWED:
            failures.append(f"{name}: invalid rimCategory '{rim}'")

    for name, expected in EXPECTED.items():
        entry = by_name.get(name)
        if not entry:
            failures.append(f"{name}: missing stratagem entry")
            continue
        actual = str(entry.get("rimCategory", "")).strip().lower()
        if actual != expected:
            failures.append(f"{name}: expected rimCategory '{expected}', got '{actual or '<missing>'}'")

    if failures:
        print("FAIL: stratagem rim category checks failed")
        for issue in failures:
            print(f" - {issue}")
        return 1

    print(f"PASS: validated {len(stratagems)} stratagem rimCategory values")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
