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
- [ ] Complete the Windows owner-verification steps in `docs/FINAL_TEST_REPORT.md`, including launch from Downloads, Desktop, Documents, paths with spaces, offline mode, corruption recovery, upgrade survival, external links, logs, screenshots, and checksum comparison.

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

Do not commit signing passwords, certificates, `.pfx` files, private keys, signing tokens, or other private signing material to this repository. Signing credentials must live only in GitHub Actions secrets or another approved secret manager; the owner-only setup steps are documented below.

## Windows code signing setup (owner-only)

This repository is prepared for **Microsoft Azure Trusted Signing / Artifact Signing**. The application does not store certificate files, private keys, certificate passwords, signing tokens, or Azure client secrets in Git. Electron-builder signs only when `WINDOWS_SIGNING_REQUIRED=true` or `WINDOWS_SIGNING_ENABLED=true` is present in the environment.

### Provider requirements reviewed

As of August 5, 2026, electron-builder's current Windows signing documentation lists Azure Trusted Signing as the cloud-signing option that keeps the private key out of the local build environment. It requires Azure Entra authentication environment variables and an electron-builder Windows Azure signing configuration with:

- `publisherName` exactly matching the certificate profile's subject
- the Trusted Signing account endpoint
- the Trusted Signing account name
- the certificate profile name

The electron-builder Azure path signs via Microsoft's Trusted Signing service, requires network access to the Azure endpoint, and supports RFC 3161 timestamping. This repository uses `http://timestamp.acs.microsoft.com` by default for the timestamp server.

### Owner setup steps

The repository owner must complete these non-coding steps before creating a signed release:

1. Create or use an Azure subscription that can use Azure Trusted Signing / Artifact Signing.
2. Purchase or enable the Azure Trusted Signing / Artifact Signing service in the Azure portal.
3. Create an Artifact Signing account in the required Azure region.
4. Submit the identity validation request for the publisher identity that should appear on the Windows executable.
5. Complete Microsoft's required personal or organization identity verification. This cannot be completed by a build agent or by this repository.
6. After validation succeeds, create a certificate profile for Authenticode code signing.
7. Record the exact certificate subject/publisher name shown on that profile. This exact value must become `WINDOWS_SIGNING_PUBLISHER_NAME`.
8. Create an Azure app registration or service principal dedicated to GitHub Actions signing.
9. Grant that app registration/service principal the `Artifact Signing Certificate Profile Signer` role scoped to the signing account or certificate profile.
10. Create a client secret for the app registration and copy its value immediately.
11. Add these GitHub repository **Actions secrets** under **Settings → Secrets and variables → Actions**:
    - `AZURE_TENANT_ID` — Microsoft Entra tenant/directory ID.
    - `AZURE_CLIENT_ID` — app registration application/client ID.
    - `AZURE_CLIENT_SECRET` — app registration client secret value.
    - `AZURE_TRUSTED_SIGNING_ENDPOINT` — region endpoint, such as `https://wus2.codesigning.azure.net/`.
    - `AZURE_TRUSTED_SIGNING_ACCOUNT_NAME` — Azure Trusted Signing / Artifact Signing account name.
    - `AZURE_TRUSTED_SIGNING_CERTIFICATE_PROFILE_NAME` — certificate profile name.
    - `WINDOWS_SIGNING_PUBLISHER_NAME` — exact certificate subject, for example `CN=Example Publisher, O=Example Publisher, C=US`.
12. Optionally add the repository variable `WINDOWS_SIGNING_TIMESTAMP_RFC3161` if Microsoft changes the recommended timestamp server. If omitted, CI uses `http://timestamp.acs.microsoft.com`.
13. Run **Actions → Windows Release ZIP → Run workflow** with **sign-build** enabled to confirm signing and signature verification before pushing a release tag.

### Signed versus unsigned builds

- Development and manual test builds remain unsigned by default. Use `npm run build:win` locally or run the workflow manually with **sign-build** disabled.
- Signed release builds require `WINDOWS_SIGNING_REQUIRED=true`. Tagged releases set this automatically in GitHub Actions.
- When signing is required, the build fails before packaging if any required Azure signing value is missing.
- Before a tagged release is uploaded, CI extracts the ZIP and runs `scripts/verify_windows_signature.ps1`. The release fails if the executable is unsigned, the Authenticode status is not `Valid`, the signer subject does not match `WINDOWS_SIGNING_PUBLISHER_NAME`, or the timestamp counter-signature is missing.
