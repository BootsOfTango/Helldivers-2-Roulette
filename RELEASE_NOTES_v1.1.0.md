# Helldivers 2 Chaos Roulette — v1.1.0 Desktop ZIP Release

Release date: 2026-08-05

## Highlights

- Ships the Windows x64 desktop ZIP package for normal users who do not have Node.js or Python installed.
- Stores roulette data in the desktop save folder with automatic backups, recovery copies, and portable JSON export/import support.
- Keeps Spin, Results, Compare, Armory, and Rank available offline with bundled catalog data and local artwork/placeholders.
- Supports imports from the older browser/localStorage JSON format so existing players can move to the desktop app.

## Release validation notes

The release ZIP was rebuilt and verified from the packaged artifact. The Linux CI-style environment could inspect and extract the Windows ZIP, verify bundled runtime contents, run automated storage/catalog/asset tests, and inspect the packaged Electron contents. Windows-only owner checks are listed in `docs/FINAL_TEST_REPORT.md` and must be completed on a Windows machine before public announcement.

## Fixes made during final release testing

- Removed the packaged Electron application menu so users do not see unexpected default Electron menus in the release build.

## User instructions

1. Download `Helldivers-2-Chaos-Roulette-v1.1.0-win-x64.zip` and its `.sha256` checksum file from the release.
2. Verify the ZIP checksum if desired:
   ```powershell
   Get-FileHash .\Helldivers-2-Chaos-Roulette-v1.1.0-win-x64.zip -Algorithm SHA256
   ```
3. Extract the entire ZIP into a normal folder such as Downloads, Desktop, or Documents.
4. Open the extracted folder and double-click `Helldivers 2 Chaos Roulette.exe`.
5. Do not move only the `.exe`; keep it with the files and folders extracted from the ZIP.
6. Use **Results → Export JSON** to create a portable manual backup.
7. Use **Results → Import JSON** to restore a desktop export or an older browser-version JSON backup.
8. Use **Results → Clear All Data** only when you want to reset the active desktop save; the app creates a final backup first.
