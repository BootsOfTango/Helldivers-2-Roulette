# Release process

Use this checklist before publishing a Windows ZIP release.

## Release checklist

- [ ] Update the application version in `package.json` and `package-lock.json`.
- [ ] Update `CHANGELOG.md` with the release date and user-facing changes.
- [ ] Run checks locally: `npm ci`, `npm run validate:catalog`, `npm run validate:assets`, and `npm test`.
- [ ] Test saves by creating, exporting, importing, clearing, and recovering roulette data.
- [ ] Test offline behavior by launching the desktop app without network access and confirming bundled catalog/assets still load.
- [ ] Test upgrades by opening a save created by the previous released build.
- [ ] Create the matching version tag, such as `v1.1.0`.
- [ ] Inspect the published ZIP from the GitHub Release before announcing it.

## Starting a release

1. Confirm the version in `package.json` is the version you want to ship.
2. Commit the release changes and push the branch.
3. Create and push the matching tag:

   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```

4. The **Windows Release ZIP** workflow validates the catalog and assets, runs the storage/application tests, builds the Windows ZIP on GitHub's Windows runner, verifies required package contents, writes a SHA-256 checksum, and attaches both files to the GitHub Release for the same tag.
5. For a non-release test build, open **Actions → Windows Release ZIP → Run workflow**, choose the Node.js version, and start the workflow. The ZIP and checksum are uploaded as workflow artifacts for maintainer inspection only.

## Signing material

Do not commit signing passwords, certificates, `.pfx` files, or other private signing material to this repository. If code signing is added later, store secrets only in GitHub Actions secrets or another approved secret manager and document the owner-only setup steps here.
