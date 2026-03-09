# Changelog

## 2026-03-09

### Stable release tags

- **v0.1:** First stable version.
- **v0.2:** Second stable version (current baseline, marked stable).

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
