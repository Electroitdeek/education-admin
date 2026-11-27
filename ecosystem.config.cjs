const fs = require('fs');
const path = require('path');

function loadEnv(file) {
  const envPath = path.join(__dirname, file);
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const i = line.indexOf('=');
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      }),
  );
}

const fileEnv = {
  ...loadEnv('.env'),
  ...loadEnv('.env.local'),
  ...loadEnv('.env.production'),
};
const port = Number(fileEnv.PORT) || 3046;

module.exports = {
  apps: [
    {
      name: `education-admin-${port}`,
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: `start -p ${port}`,
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
