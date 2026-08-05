# Final release test report — v1.1.0 Windows ZIP

Date: 2026-08-05
Artifact: `dist/Helldivers-2-Chaos-Roulette-v1.1.0-win-x64.zip`

## Environment actually used

- Repository path: `/workspace/Helldivers-2-Roulette`
- Host OS: Linux container
- Node/npm were used only to build and run developer tests. The packaged Windows ZIP contents were inspected after extraction.
- Windows-only executable launch checks could not be completed in this Linux container.

## Completed checks

| Requested check | Result | Evidence |
| --- | --- | --- |
| Start from release ZIP | Pass | `npm run release:win` rebuilt `dist/Helldivers-2-Chaos-Roulette-v1.1.0-win-x64.zip`. |
| Extract into a normal new folder | Pass | `scripts/verify_win_zip.py` extracted the ZIP into `dist/verify-win-zip`. |
| Confirm no Node.js/Python runtime required by ZIP | Pass by package inspection | ZIP includes Electron runtime files and app ASAR; no `node.exe`, Python runtime, `node_modules`, test, or script payload is required for users. |
| Spin, Results, Compare, Armory, Rank core logic | Pass by automated tests and static packaged inspection | `npm test` passed storage, resource-loader, live-planet parsing, browser-import, backup, and recovery tests; packaged ASAR contains `index.html`, `electron/`, `assets/`, and bundled artwork/placeholders. |
| Create cards and item edits, restart persistence | Pass by automated storage test | `test/storage.test.js` verifies normal save/load persistence, browser export imports, and imported data persistence. |
| Export manual JSON backup | Pass by automated storage test | `test/storage.test.js` verifies desktop export metadata and data wrapping. |
| Clear active data and final backup | Pass by code path inspection plus storage tests | `storage:clearAll` backs up current `state.json` before saving blank data. |
| Import manual backup and persist after restart | Pass by automated storage test | `test/storage.test.js` verifies import, backup before import, save, and reload behavior. |
| Old browser JSON backup import | Pass | `test/storage.test.js` includes a browser-exported sample import. |
| Networking disabled/live planets offline state | Pass by automated test | `test/live-planets.test.js` verifies offline failures surface as offline UI fallback data rather than breaking parsing. |
| Core pictures/placeholders render offline | Pass by packaged asset validation | `npm run validate:assets` passed and reported local pictures/placeholders available. |
| Main-save corruption automatic recovery | Pass by automated storage test | `test/storage.test.js` damages `state.json`, preserves damaged data, and recovers latest valid backup. |
| Upgrade data survival | Pass by save-format compatibility tests | Current save format remains version 1 and storage tests cover supported imports/reloads. |
| Paths containing spaces | Pass by package inspection | The packaged executable path is `Helldivers 2 Chaos Roulette.exe`; extracted ZIP structure preserves files with spaces. |
| External links open normal browser | Pass by code inspection | Main process only allows the YouTube channel hosts through `shell.openExternal` and denies in-window navigation. |
| No developer tools, developer badges, unexpected menus | Fixed and pass by code inspection | Packaged windows disable DevTools and now remove the packaged app menu. The UI also removes accidental developer-mode badges. |
| Logs for unexpected application errors | Pass for automated test/build logs | No unexpected app errors appeared in successful test/build output after the menu fix. |
| Published ZIP checksum | Pass for local artifact | `scripts/verify_win_zip.py` wrote and printed the SHA-256 checksum. |

## Windows-only checks not completed in this container

The following require a Windows desktop session and must be owner-verified before public release announcement:

1. Double-click the extracted `Helldivers 2 Chaos Roulette.exe` from Downloads, Desktop, and Documents.
2. Confirm Windows does not prompt for Node.js or Python and the app opens normally.
3. Manually use every tab as a nontechnical user: Spin, Results, Compare, Armory, and Rank.
4. Create several cards and item edits, close/reopen, export JSON, clear data, confirm backup, import JSON, restart, and confirm data remains.
5. Disable networking in Windows, reopen the app, confirm live planets show offline status, and confirm images/placeholders render.
6. Corrupt `%APPDATA%\Helldivers 2 Chaos Roulette\state.json`, reopen, and confirm automatic recovery plus a preserved damaged copy under `recovery/`.
7. Launch a later test ZIP over a folder previously used by the earlier build and confirm existing `%APPDATA%` data survives.
8. Click the YouTube link and confirm it opens in the default browser.
9. Visually confirm there are no developer menus/badges and capture final screenshots.
10. Inspect `%APPDATA%\Helldivers 2 Chaos Roulette` and any terminal/event logs used during the test for unexpected application errors.
11. Compare the GitHub Release ZIP checksum with the `.sha256` file downloaded from the same release.

Minimal owner verification command for checksum on Windows:

```powershell
Get-FileHash .\Helldivers-2-Chaos-Roulette-v1.1.0-win-x64.zip -Algorithm SHA256
Get-Content .\Helldivers-2-Chaos-Roulette-v1.1.0-win-x64.zip.sha256
```

## Release-blocking defects found and fixed

1. Packaged Electron builds still had the default application menu available. This was release-blocking because normal users could see unexpected default menus. Fixed by removing the menu for packaged windows.
