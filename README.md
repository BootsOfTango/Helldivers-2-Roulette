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
