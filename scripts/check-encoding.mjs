import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const textExt = new Set(['.html','.css','.js','.mjs','.json','.md','.txt','.yml','.yaml']);
const skip = new Set(['.git','node_modules']);
const bad = /[\u0080-\u009f\ufffd]/u;
let checked = 0;
let failed = false;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (textExt.has(path.extname(entry.name).toLowerCase())) {
      checked += 1;
      const text = fs.readFileSync(full, 'utf8');
      if (bad.test(text)) {
        failed = true;
        console.error(`Encoding warning: ${path.relative(root, full)}`);
      }
    }
  }
}
walk(root);
if (failed) process.exit(1);
console.log(`Encoding check clean (${checked} text files).`);
