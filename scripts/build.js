const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Manually load local env files since Node doesn't do it automatically
function loadEnvFile(filename) {
  const filepath = path.join(process.cwd(), filename);
  if (!fs.existsSync(filepath)) return;
  const content = fs.readFileSync(filepath, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    // Ignore comments
    if (line.trim().startsWith('#')) return;
    const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = (match[2] || '').trim();
      // Remove surrounding quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      // Only set if not already set by parent environment (e.g. Vercel dashboard)
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  });
}

// Load env files (.env.local overrides .env)
loadEnvFile('.env.local');
loadEnvFile('.env');

// Fallback mapping for databases that only configure DATABASE_URL
const rawPrismaUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
const rawDirectUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

const cleanUrl = (url) => url ? url.replace(/^"|"$/g, '').trim() : url;

if (rawPrismaUrl) {
  process.env.POSTGRES_PRISMA_URL = cleanUrl(rawPrismaUrl);
}
if (rawDirectUrl) {
  process.env.POSTGRES_URL_NON_POOLING = cleanUrl(rawDirectUrl);
}

try {
  console.log('Prisma schema sync: pushing to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  console.log('Compiling production Next.js build...');
  execSync('npx next build', { stdio: 'inherit' });
} catch (error) {
  console.error('Production build step failed:', error);
  process.exit(1);
}
