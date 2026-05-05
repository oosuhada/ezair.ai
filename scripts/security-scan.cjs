const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const excludedDirs = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage']);
const allowedBasenames = new Set(['.env.example', 'SECURITY_NOTES.md', 'security-scan.js', 'security-scan.cjs', 'smoke-check.js', 'smoke-check.cjs']);
const binaryExt = /\.(png|jpe?g|gif|svg|mp4|webm|woff2?|ttf|ico|zip|lock)$/i;

const patterns = [
  ['client_gemini_global', /window\.GEMINI_API_KEY/],
  ['google_api_key_literal', /AIza[0-9A-Za-z_-]{20,}/],
  ['openai_key_literal', /sk-[0-9A-Za-z_-]{20,}/],
  ['non_placeholder_gemini_assignment', /GEMINI_API_KEY[ \t]*=[ \t]*(?!<)[^\s#]+/],
  ['non_placeholder_amadeus_secret_assignment', /AMADEUS_API_SECRET[ \t]*=[ \t]*(?!<)[^\s#]+/],
];

function isLocalEnvFile(relPath) {
  const basename = path.basename(relPath);
  return basename.startsWith('.env') && basename !== '.env.example';
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excludedDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const findings = [];
for (const file of walk(projectRoot)) {
  const rel = path.relative(projectRoot, file);
  if (isLocalEnvFile(rel)) continue;
  if (allowedBasenames.has(path.basename(file))) continue;
  if (binaryExt.test(file)) continue;
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
  for (const [name, pattern] of patterns) {
    if (pattern.test(text)) findings.push(`${rel}: ${name}`);
  }
}

if (findings.length) {
  console.error('Security scan failed. Potential secret patterns found:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}
console.log('Security scan passed');
