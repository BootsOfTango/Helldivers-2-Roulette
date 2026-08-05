const requireSigning = process.env.WINDOWS_SIGNING_REQUIRED === 'true';
const enableSigning = process.env.WINDOWS_SIGNING_ENABLED === 'true' || requireSigning;

const requiredSigningEnv = [
  'AZURE_TENANT_ID',
  'AZURE_CLIENT_ID',
  'AZURE_CLIENT_SECRET',
  'AZURE_TRUSTED_SIGNING_ENDPOINT',
  'AZURE_TRUSTED_SIGNING_ACCOUNT_NAME',
  'AZURE_TRUSTED_SIGNING_CERTIFICATE_PROFILE_NAME',
  'WINDOWS_SIGNING_PUBLISHER_NAME',
];

if (requireSigning) {
  const missing = requiredSigningEnv.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Windows release signing is required, but these environment variables are missing: ${missing.join(', ')}`);
  }
}

const win = {
  target: [
    {
      target: 'zip',
      arch: ['x64'],
    },
  ],
  icon: 'build/icon.ico',
};

if (!enableSigning) {
  win.signExecutable = false;
}

if (enableSigning) {
  win.azureSignOptions = {
    publisherName: process.env.WINDOWS_SIGNING_PUBLISHER_NAME,
    endpoint: process.env.AZURE_TRUSTED_SIGNING_ENDPOINT,
    codeSigningAccountName: process.env.AZURE_TRUSTED_SIGNING_ACCOUNT_NAME,
    certificateProfileName: process.env.AZURE_TRUSTED_SIGNING_CERTIFICATE_PROFILE_NAME,
    fileDigest: 'SHA256',
    timestampDigest: 'SHA256',
    timestampRfc3161: process.env.WINDOWS_SIGNING_TIMESTAMP_RFC3161 || 'http://timestamp.acs.microsoft.com',
  };
}

module.exports = {
  productName: 'Helldivers 2 Chaos Roulette',
  appId: 'com.bootsoftango.helldivers2chaosroulette',
  files: [
    'index.html',
    'electron/**/*',
    'assets/**/*',
    'build/icon.ico',
    'build/icon.png',
    '*.png',
    'LICENSE.txt',
    'README.md',
    'package.json',
    '!**/.git/**',
    '!**/node_modules/**',
    '!test/**',
    '!scripts/**',
    '!*.md',
    'README.md',
    '!RELEASE_NOTES*.md',
    '!sample-card-tidied.html',
    '!**/*.map',
    '!**/*.tmp',
    '!**/*.log',
    '!**/.env*',
    '!**/*secret*',
    '!**/coverage/**',
  ],
  directories: {
    buildResources: 'build',
  },
  win,
  artifactName: 'Helldivers-2-Roulette-Windows.${ext}',
  extraFiles: [
    {
      from: 'README-FIRST.txt',
      to: 'README-FIRST.txt',
    },
  ],
  extraResources: [
    {
      from: 'build/icon.ico',
      to: 'build/icon.ico',
    },
    {
      from: 'build/icon.png',
      to: 'build/icon.png',
    },
  ],
};
