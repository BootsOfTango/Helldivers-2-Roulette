# Helldivers 2 Chaos Roulette

A browser-based Helldivers 2 roulette and performance tracking lab.

## Desktop development

This repository now includes an Electron shell for the existing `index.html` application. The desktop app keeps the current Spin, Results, Compare, Armory, and Rank interfaces intact while adding a secure desktop window, an isolated preload bridge, external browser handling for the YouTube channel link, and Windows packaging metadata.

### Commands

- `npm install` installs Electron and the Windows packaging toolchain.
- `npm run dev` launches the Electron desktop application for local development.
- `npm start` launches the Electron desktop application normally.
- `npm run prepare:icons` regenerates the local desktop icon files from the existing repository logo asset.
- `npm run build:win` regenerates those icon files, then creates a Windows installer build with the product name `Helldivers 2 Chaos Roulette` and stable app ID `com.bootsoftango.helldivers2chaosroulette`.

## Desktop save files and recovery

The desktop app uses Electron's stable per-user application data directory for the app ID `com.bootsoftango.helldivers2chaosroulette`, which keeps the save location consistent across future updates. On Windows, Electron stores this under your user profile's AppData area for **Helldivers 2 Chaos Roulette**.

Your working desktop save is a clearly named `state.json` file in that save folder. The file includes the save-format version, the application version that wrote it, the save date, and your saved cards/item edits. Browser `localStorage` is now only used as a development fallback when the app is not running through Electron.

To open the folder, go to **Results** and select **Open Save Folder**. Windows Explorer will open the directory that contains:

- `state.json` — the working save.
- `backups/` — dated automatic backup files. Each backup is stored as a separate JSON file, and the app keeps the latest 20 backups.
- `recovery/` — damaged working saves or damaged backups preserved for manual inspection.

On startup, the app tries `state.json` first. If it is damaged, the app copies it into `recovery/` instead of silently discarding it, then tries backups from newest to oldest. If a backup is recovered, the app shows a friendly message so you know what happened. A blank save is used only when no valid working save or backup exists.
