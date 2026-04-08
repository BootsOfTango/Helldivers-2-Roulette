# Asset Source Checklist (Official Channels/Pages Only)

All gameplay-facing visuals below must originate from official Helldivers channels/pages. At implementation time, local placeholder assets are provided for tier visuals where official source files are not yet imported.

| Asset | Official source URL | Usage note | Local implementation path |
|---|---|---|---|
| Helldivers 2 logo | https://www.playstation.com/en-us/games/helldivers-2/ | App chrome branding (global rank button + page background watermark). | `assets/branding/helldivers-2-logo.svg` (fallback: `assets/placeholders/branding/helldivers-2-logo-fallback.svg`) |
| Cadet tier visual | https://www.playstation.com/en-us/games/helldivers-2/ | Rank tier card artwork for Cadet (Levels 1-3). | `assets/placeholders/rank-tiers/cadet-placeholder.svg` (replace with official when available) |
| Veteran tier visual | https://www.playstation.com/en-us/games/helldivers-2/ | Rank tier card artwork for Veteran (Levels 4-6). | `assets/placeholders/rank-tiers/veteran-placeholder.svg` (replace with official when available) |
| Helldiver tier visual | https://www.playstation.com/en-us/games/helldivers-2/ | Rank tier card artwork for Helldiver (Levels 7-10). | `assets/placeholders/rank-tiers/helldiver-placeholder.svg` (replace with official when available) |

## Implementation constraints

- No hotlinking: all UI references must point to files under `assets/`.
- If an official tier image is not yet available locally, keep placeholder SVGs active until the official file is added.
- When replacing a placeholder with an official file, preserve the local path contract used by the UI or update the path in this checklist and `index.html` together.
