# Changelog

## 2026-02-25

### Results tab – Biome on cards ✅

- **Change:** Biome info from the Spin tab is now carried over and shown on saved loadout cards in the Results tab.
- **Details:** When you roll a planet and hit "USE THIS RUN", the card now displays **Sector**, **Biome** (e.g. "Scorched Moor"), **Environment**, and **Faction**. Biome is persisted on both `card.planetBiome` and `card.planet.biome` so it always shows correctly for new and existing cards.
- **Status:** Successful – confirmed working (e.g. "Scorched Moor" on Menkent / Hydra Sector card).
