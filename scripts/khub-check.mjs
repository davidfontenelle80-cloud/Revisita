import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const required = [
  'index.html','manifest.json','sw.js','css/main.css','js/app.js','js/map.js','js/map-utils.js','js/storage.js',
  'icons/icon-192.png','icons/icon-512.png','icons/icon-192-maskable.png','icons/icon-512-maskable.png',
  'icons/apple-touch-icon.png','icons/favicon.png','README.md','PROJECT_STATUS.md','.ai/ACTIVE_TASK.md'
];
let failed = false;
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) { console.error(`Missing required file: ${rel}`); failed = true; }
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/main.css'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const checks = [
  [html.includes('maximum-scale=1.0') && html.includes('user-scalable=no'), 'locked phone-first viewport'],
  [html.includes('font-size: 16px') || css.includes('input, textarea { font-size: 16px; }'), '16px form inputs'],
  [html.includes('bottom-nav'), 'persistent navigation'],
  [css.includes('--radius-sm') && css.includes('--radius-md') && css.includes('--radius-lg'), 'radius tokens'],
  [css.includes('[data-theme="light"]'), 'light theme'],
  [sw.includes("CACHE_PREFIX = 'revisita-'"), 'app-scoped cache prefix'],
  [manifest.name?.startsWith('Revisita'), 'manifest name'],
  [manifest.icons?.some((i) => i.purpose === 'maskable' && i.sizes === '512x512'), '512 maskable icon'],
];
for (const [ok, label] of checks) {
  if (!ok) { console.error(`Ship check failed: ${label}`); failed = true; }
}
if (failed) process.exit(1);
console.log('KHub ship check passed.');
