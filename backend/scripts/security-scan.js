const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..', '..');
const excludedDirs = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage']);
const allowedFiles = new Set(['.env.example', 'SECURITY_NOTES.md', 'security-scan.js', 'smoke-check.js', 'security-scan.cjs', 'smoke-check.cjs']);

const patterns = [
  ['client_gemini_global', /window\.GEMINI_API_KEY/],
  ['google_api_key_literal', /AIza[0-9A-Za-z_-]{20,}/],
  ['openai_key_literal', /sk-[0-9A-Za-z_-]{20,}/],
  ['non_example_gemini_env_assignment', /GEMINI_API_KEY[ \t]*=[ \t]*(?!<)[^\s#]+/],
  ['non_example_amadeus_secret_assignment', /AMADEUS_API_SECRET[ \t]*=[ \t]*(?!<)[^\s#]+/],
  ['client_secret_assignment', /client_secret\s*[:=]\s*['\"][^'\"]+['\"]/i],
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
  if (allowedFiles.has(path.basename(file))) continue;
  if (/\.(png|jpe?g|gif|svg|mp4|woff2?|ttf|ico|zip|lock)$/i.test(file)) continue;

  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
  for (const [name, re] of patterns) {
    if (re.test(text)) findings.push(`${rel}: ${name}`);
  }
}

if (findings.length > 0) {
  console.error('Security scan failed. Potential secret patterns found:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log('Security scan passed');
