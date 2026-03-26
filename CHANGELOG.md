# Changelog

## 2026-03-26

### Entrenched Division warbond content update ✅

- **Change:** Added the Entrenched Division warbond gear to the catalog, defaults, and image mappings.
- **Weapons/Equipment:** Entrenchment Tool, Veto, Stoker, Sweeper, Giga Grenade.
- **Stratagems:** Gas Mortar, Cremator.
- **Why:** Keeps roulette pools aligned with newly released warbond content so new items can be rolled immediately.

## 2026-03-22

### Official stable release tag

- **v1.0.0:** First official 1.0 release of **HD2 TANGO Roulette**.
- **Status:** UI version tag, release notes, and release prep now align on the official 1.0 designation.

### Release focus ✅

- **Change:** Promoted the current Roulette build to the official **1.0** release milestone.
- **Why:** Establishes a clear stable launch point for GitHub tagging and future release notes.

## 2026-03-14

### Armory catalog maintenance + icon integrity ✅

- **Change:** Added a canonical `assets/item-catalog.json` source and automated item/image validation checks before release publication.
- **Why:** Prevents ARMORY stat cards from showing missing or mismatched icons when item pools are updated.

### Newly added weapons/stratagems this update

- **Weapons:** None (catalog/data integrity update only).
- **Stratagems:** None (catalog/data integrity update only).


## 2026-03-09

### Stable release tags

- **v0.1:** First stable version.
- **v0.2:** Second stable version.
- **v1.0.0:** Official 1.0 baseline release.

### Spin tab – Manual planet search + choose ✅

- **Change:** Added a **SEARCH PLANET** button next to **ROLL PLANET** so players can manually pick a planet when they want to override random planet rolls.
- **Details:** Search supports filtering by **planet name**, **biome**, **environment/hazards**, or an all-fields mode. The results include the full internal planet list (not only currently active/MO planets), grouped by **Sector** with planets sorted **alphabetically** inside each sector.
- **Details:** Choosing a planet from search sets the same current-run planet data used by roll/reroll (name, sector, biome, environment) so the Spin and Results behavior remains consistent.
- **Status:** Stable – manual selection and grouped search view integrated into Spin workflow.

## 2026-02-25

### Results tab – Biome on cards ✅

- **Change:** Biome info from the Spin tab is now carried over and shown on saved loadout cards in the Results tab.
- **Details:** When you roll a planet and hit "USE THIS RUN", the card now displays **Sector**, **Biome** (e.g. "Scorched Moor"), **Environment**, and **Faction**. Biome is persisted on both `card.planetBiome` and `card.planet.biome` so it always shows correctly for new and existing cards.
- **Status:** Successful – confirmed working (e.g. "Scorched Moor" on Menkent / Hydra Sector card).
