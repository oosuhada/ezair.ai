const fs = require('fs');
const path = require('path');

const backendRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(backendRoot, '..');

const requiredFiles = [
  'server.js',
  'routes/amadeus.js',
  'routes/gemini.js',
  'services/amadeusService.js',
  'services/cacheService.js',
  'services/flightIntentSchema.js',
  'services/flightNormalizer.js',
  'services/geminiService.js',
  'services/locationResolver.js',
  'services/mockFlightService.js',
];

const failures = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(backendRoot, file))) failures.push(`Missing backend/${file}`);
}

const indexPath = path.join(projectRoot, 'index.html');
if (!fs.existsSync(indexPath)) {
  failures.push('Missing index.html');
} else {
  const index = fs.readFileSync(indexPath, 'utf8');
  const forbidden = [
    ['window.GEMINI_API_KEY', /window\.GEMINI_API_KEY/],
    ['Google API key literal', /AIza[0-9A-Za-z_-]{20,}/],
    ['GoogleGenerativeAI client SDK', /GoogleGenerativeAI/],
  ];
  for (const [name, re] of forbidden) {
    if (re.test(index)) failures.push(`Forbidden client secret/API pattern in index.html: ${name}`);
  }
}

const pkg = require(path.join(backendRoot, 'package.json'));
if (!pkg.scripts || !pkg.scripts.start) failures.push('backend/package.json missing scripts.start');
if (!fs.existsSync(path.join(projectRoot, '.gitignore'))) failures.push('Missing .gitignore');

if (failures.length > 0) {
  console.error('Smoke check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Smoke check passed');
