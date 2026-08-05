$ErrorActionPreference = 'Stop'

$package = Get-Content package.json -Raw | ConvertFrom-Json
$zipPath = "dist/Helldivers-2-Chaos-Roulette-v$($package.version)-win-x64.zip"
$extractPath = 'dist/verify-win-signature'

if (!(Test-Path $zipPath)) {
  Write-Error "Missing expected ZIP: $zipPath"
  exit 1
}

if (Test-Path $extractPath) {
  Remove-Item -Recurse -Force $extractPath
}
New-Item -ItemType Directory -Force -Path $extractPath | Out-Null
Expand-Archive -LiteralPath $zipPath -DestinationPath $extractPath -Force

$exe = Get-ChildItem -Path $extractPath -Recurse -Filter 'Helldivers 2 Chaos Roulette.exe' | Select-Object -First 1
if ($null -eq $exe) {
  Write-Error 'Could not find Helldivers 2 Chaos Roulette.exe in the release ZIP.'
  exit 1
}

$signature = Get-AuthenticodeSignature -FilePath $exe.FullName
if ($signature.Status -ne 'Valid') {
  Write-Error "Executable signature is not valid. Status: $($signature.Status). Message: $($signature.StatusMessage)"
  exit 1
}

$expectedPublisher = $env:WINDOWS_SIGNING_PUBLISHER_NAME
if ([string]::IsNullOrWhiteSpace($expectedPublisher)) {
  Write-Error 'WINDOWS_SIGNING_PUBLISHER_NAME is required to verify the release publisher.'
  exit 1
}

$actualSubject = $signature.SignerCertificate.Subject
if ($actualSubject -ne $expectedPublisher) {
  Write-Error "Executable signer subject '$actualSubject' does not match expected publisher '$expectedPublisher'."
  exit 1
}

if ($null -eq $signature.TimeStamperCertificate) {
  Write-Error 'Executable signature is missing a timestamp counter-signature.'
  exit 1
}

Write-Host "Valid Authenticode signature found on $($exe.FullName)."
Write-Host "Signer: $actualSubject"
Write-Host "Timestamp authority: $($signature.TimeStamperCertificate.Subject)"
