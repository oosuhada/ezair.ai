const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const required = [
  'README.md',
  'docs/ARCHITECTURE.md',
  'docs/API.md',
  'docs/DEPLOYMENT_CHECKLIST.md',
  'src/types/flight.ts',
  'src/api/client.ts',
  'src/features/flightSearch/index.ts',
  'next-ezair/package.json',
  'next-ezair/app/page.tsx',
  'next-ezair/db/schema.sql',
];
const failures = [];
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) failures.push(`Missing ${rel}`);
}
const indexPath = path.join(root, 'index.html');
if (fs.existsSync(indexPath)) {
  const index = fs.readFileSync(indexPath, 'utf8');
  if (/window\.GEMINI_API_KEY|AIza[0-9A-Za-z_-]{20,}|GoogleGenerativeAI/.test(index)) {
    failures.push('Forbidden Gemini client pattern remains in index.html');
  }
}
if (failures.length) {
  console.error('Smoke check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Smoke check passed');
