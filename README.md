# Helldivers 2 Chaos Roulette

A browser-based Helldivers 2 roulette and performance tracking lab.

## Desktop development

This repository now includes an Electron shell for the existing `index.html` application. The desktop app keeps the current Spin, Results, Compare, Armory, and Rank interfaces intact while adding a secure desktop window, an isolated preload bridge, external browser handling for the YouTube channel link, and Windows packaging metadata.

### Commands

- `npm install` installs Electron and the Windows packaging toolchain.
- `npm run dev` launches the Electron desktop application for local development.
- `npm start` launches the Electron desktop application normally.
- `npm run prepare:icons` regenerates the local desktop icon files from the existing repository logo asset.
- `npm run build:win` regenerates those icon files, then creates the dependable Windows x64 ZIP package with the product name `Helldivers 2 Chaos Roulette` and stable app ID `com.bootsoftango.helldivers2chaosroulette`. The ZIP is named `Helldivers-2-Chaos-Roulette-v1.1.0-win-x64.zip`, includes `README-FIRST.txt`, and should be extracted as a complete folder before running the `.exe`.


## Windows releases

Maintainers publish the Windows ZIP with the **Windows Release ZIP** GitHub Actions workflow. Push a version tag that matches `package.json`, such as `v1.1.0`, to run validation, tests, packaging, ZIP inspection, checksum generation, and GitHub Release upload on GitHub's Windows runner. Use **Actions → Windows Release ZIP → Run workflow** for a manual test build on a branch before tagging. See `docs/RELEASE.md` for the release checklist and owner steps.

## Desktop save files and recovery

The desktop app uses Electron's stable per-user application data directory for the app ID `com.bootsoftango.helldivers2chaosroulette`, which keeps the save location consistent across future updates. On Windows, Electron stores this under your user profile's AppData area for **Helldivers 2 Chaos Roulette**.

Your working desktop save is a clearly named `state.json` file in that save folder. The file includes the save-format version, the application version that wrote it, the save date, and your saved cards/item edits. Browser `localStorage` is now only used as a development fallback when the app is not running through Electron.

To open the folder, go to **Results** and select **Open Save Folder**. Windows Explorer will open the directory that contains:

- `state.json` — the working save.
- `backups/` — dated automatic backup files. Each backup is stored as a separate JSON file, and the app keeps the latest 20 backups.
- `recovery/` — damaged working saves or damaged backups preserved for manual inspection.

On startup, the app tries `state.json` first. If it is damaged, the app copies it into `recovery/` instead of silently discarding it, then tries backups from newest to oldest. If a backup is recovered, the app shows a friendly message so you know what happened. A blank save is used only when no valid working save or backup exists.

## Exporting, importing, and clearing data

Use the existing **Results → Export JSON** button to make a portable copy of your supported roulette state. In the desktop app this opens the normal Windows **Save As** dialog with a dated filename such as `helldivers-2-chaos-roulette-export-2026-08-04.json`. The exported JSON includes:

- Saved loadout cards and mission stats.
- Item ownership/enabled changes.
- Supported settings, including the remembered player name.
- Save-format version.
- Application version.
- Export date.

Use **Results → Import JSON** to open the normal Windows file-selection dialog. The app validates the selected JSON before touching the current working save. Unsupported JSON, incorrectly shaped JSON, files over 5 MB, and exports from future save formats are rejected with a friendly explanation. When an import is accepted, the app creates an automatic backup of the current data before saving the imported data, refreshes the affected pages, and writes the imported data to `state.json` so it remains available after restarting the desktop app.

### Moving data from the browser version on first launch

1. Open the browser version.
2. Select **Export JSON** and save the exported file somewhere easy to find.
3. Open the desktop version.
4. Go to **Results → Import JSON** and choose the exported JSON file.
5. Restart the desktop app if you want to confirm the imported cards and item changes were persisted.

### Clear All Data recovery behavior

**Results → Clear All Data** explains that it will erase saved cards, mission stats, item ownership changes, remembered player name, current spin details, rank comparisons, and roulette settings from the working desktop save. It requires typing `CLEAR ALL DATA` exactly. The desktop app creates one final recovery backup before clearing; if that backup cannot be created, the clear operation stops and the working save is left alone.

## Offline behavior and optional live data

The core roulette app is designed to work without internet access. Application startup, Spin, difficulty selection, built-in planet selection, card creation, Results, Compare, Armory, Rank, Save, Import, and Export all use bundled data and local storage.

The desktop package includes the item catalog and image manifest at `assets/item-catalog.json` and `assets/item-images.json`. In Electron, those files are read through a limited preload bridge that only allows those packaged JSON resources, so ordinary relative-file quirks in packaged builds do not prevent the Armory and item insights from loading. Browser security protections remain enabled.

The **Current active planets (live API)** panel is optional bonus information and requires internet. It checks the public Helldivers 2 campaigns API with a short timeout, does not block startup, and can be refreshed manually from **Armory → Current active planets (live API) → Refresh Live Planets**. If the request fails, the app keeps the built-in planet list available, shows a friendly offline message, and displays the last successful live result when one has been cached. Cached live data is labeled with its last-updated date.

The YouTube channel link is also optional external navigation. In the desktop app it opens only through the secure Electron external-link handler and is not required for any roulette feature.
