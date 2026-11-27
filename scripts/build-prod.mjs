import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  rmSync,
  writeFileSync,
  readFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const nextDir = path.join(root, '.next');

function run(command, args, cwd = root, env = process.env) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function loadEnvFile(file) {
  const envPath = path.join(root, file);
  if (!existsSync(envPath)) return {};
  return Object.fromEntries(
    readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const i = line.indexOf('=');
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      }),
  );
}

console.log('Removing old dist and .next...');
for (const dir of [dist, nextDir]) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

const envProduction = path.join(root, '.env.production');
if (!existsSync(envProduction)) {
  console.error('Missing .env.production — cannot create production build.');
  process.exit(1);
}

const prodEnv = loadEnvFile('.env.production');

console.log('Building Next.js app with production env...');
run('npx', ['next', 'build'], root, {
  ...process.env,
  ...prodEnv,
  NODE_ENV: 'production',
});

if (!existsSync(nextDir)) {
  console.error('Build failed: .next/ was not created.');
  process.exit(1);
}

console.log('Packaging into dist/...');
cpSync(nextDir, path.join(dist, '.next'), { recursive: true });

if (existsSync(path.join(root, 'public'))) {
  cpSync(path.join(root, 'public'), path.join(dist, 'public'), {
    recursive: true,
  });
}

for (const file of ['next.config.ts', 'next.config.js', 'next.config.mjs']) {
  const src = path.join(root, file);
  if (existsSync(src)) {
    cpSync(src, path.join(dist, file));
  }
}

console.log('Copying production env into dist...');
cpSync(envProduction, path.join(dist, '.env.production'));
cpSync(envProduction, path.join(dist, '.env'));

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const port = Number(prodEnv.PORT) || 3046;
const prodPkg = {
  name: pkg.name,
  version: pkg.version,
  private: true,
  scripts: {
    start: `next start -p ${port}`,
    'pm2:start': 'pm2 start ecosystem.config.cjs',
    'pm2:stop': `pm2 stop education-admin-${port}`,
    'pm2:restart': `pm2 restart education-admin-${port}`,
    'pm2:delete': `pm2 delete education-admin-${port}`,
    'pm2:logs': `pm2 logs education-admin-${port}`,
  },
  dependencies: pkg.dependencies || {},
};
writeFileSync(
  path.join(dist, 'package.json'),
  `${JSON.stringify(prodPkg, null, 2)}\n`,
);

console.log('Writing ecosystem.config.cjs into dist...');
writeFileSync(
  path.join(dist, 'ecosystem.config.cjs'),
  `const fs = require('fs');
const path = require('path');

function loadEnv(file) {
  const envPath = path.join(__dirname, file);
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(envPath, 'utf8')
      .split(/\\r?\\n/)
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const i = line.indexOf('=');
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      }),
  );
}

const fileEnv = { ...loadEnv('.env'), ...loadEnv('.env.production') };
const port = Number(fileEnv.PORT) || 3046;

module.exports = {
  apps: [
    {
      name: \`education-admin-\${port}\`,
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: \`start -p \${port}\`,
      instances: 1,
      exec_mode: 'fork',
      env: {
        ...fileEnv,
        NODE_ENV: 'production',
        PORT: port,
        NEXT_PUBLIC_API_URL:
          fileEnv.NEXT_PUBLIC_API_URL ||
          'https://educationapi.electrodigitalai.com',
      },
      max_memory_restart: '512M',
      watch: false,
      autorestart: true,
    },
  ],
};
`,
);

console.log('Installing production node_modules into dist...');
run('npm', ['install', '--omit=dev'], dist);

console.log('');
console.log('Production build ready in admin/dist/');
console.log('  - .next build');
console.log('  - .env / .env.production');
console.log('  - node_modules (production)');
console.log('  - ecosystem.config.cjs');
console.log('');
console.log('Deploy: copy the dist folder to the server, then:');
console.log('  cd dist && npm run pm2:start');
