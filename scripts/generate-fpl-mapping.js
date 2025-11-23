/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars, no-prototype-builtins */
const fs = require('fs');
const path = require('path');

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function findBasesInNode(node) {
  if (node == null) return [];
  if (Array.isArray(node)) return node.flatMap(findBasesInNode);
  if (typeof node !== 'object') return [];
  const bases = [];
  if (Object.prototype.hasOwnProperty.call(node, '*') && Array.isArray(node['*']) && node['*'].length === 2) {
    const [a, b] = node['*'];
    if (a && a.var === 'householdSize' && typeof b === 'number') {
      bases.push(b);
    }
    if (b && b.var === 'householdSize' && typeof a === 'number') {
      bases.push(a);
    }
  }
  for (const v of Object.values(node)) {
    bases.push(...findBasesInNode(v));
  }
  return bases;
}

function extractNumbersFromExplanation(text) {
  if (!text || typeof text !== 'string') return [];
  const re = /\$?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?)/g;
  const nums = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const cleaned = m[1].replace(/,/g, '');
    const n = Number(cleaned);
    if (!Number.isNaN(n)) nums.push(n);
  }
  return nums;
}

function inferIncrementFromExplanation(base, explanation) {
  const nums = extractNumbersFromExplanation(explanation);
  if (nums.length < 2) return null;
  const unique = Array.from(new Set(nums)).sort((a,b) => a-b);
  // find closest to base
  let closestIdx = 0;
  let minDiff = Infinity;
  for (let i=0;i<unique.length;i++){
    const d = Math.abs(unique[i]-base);
    if (d < minDiff){ minDiff = d; closestIdx = i; }
  }
  if (closestIdx < unique.length - 1) {
    const inc = unique[closestIdx+1] - unique[closestIdx];
    if (Number.isFinite(inc) && inc > 0) return inc;
  }
  // fallback: try difference between first two
  const fallback = Math.abs(unique[1] - unique[0]);
  return Number.isFinite(fallback) && fallback > 0 ? fallback : null;
}

function walkRules(dir) {
  const files = [];
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(current, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && e.name.endsWith('.json')) files.push(p);
    }
  }
  walk(dir);
  return files;
}

(function main(){
  const mappingPath = path.join(process.cwd(), 'scripts', 'fpl-mapping.json');
  const existing = readJson(mappingPath) || {};
  const statesDir = path.join(process.cwd(), 'src', 'rules', 'state');
  const federalDir = path.join(process.cwd(), 'src', 'rules', 'federal');
  const exampleDir = path.join(process.cwd(), 'src', 'rules', 'core', 'examples');
  const fileList = [];
  if (fs.existsSync(statesDir)) fileList.push(...walkRules(statesDir));
  if (fs.existsSync(federalDir)) fileList.push(...walkRules(federalDir));
  if (fs.existsSync(exampleDir)) fileList.push(...walkRules(exampleDir));

  const newMappings = {};
  for (const file of fileList) {
    const pkg = readJson(file);
    if (!pkg || !Array.isArray(pkg.rules)) continue;
    for (const rule of pkg.rules) {
      const bases = findBasesInNode(rule.ruleLogic);
      for (const base of bases) {
        if (!Number.isFinite(base)) continue;
        if (existing[base] !== undefined) continue; // already known
        if (newMappings[base] !== undefined) continue; // already inferred in this pass
        const inc = inferIncrementFromExplanation(base, rule.explanation || '');
        if (inc !== null) {
          newMappings[base] = inc;
          console.log(`Inferred mapping: ${base} -> ${inc} from ${file} (${rule.id})`);
        }
      }
    }
  }

  const merged = Object.assign({}, existing, newMappings);
  writeJson(mappingPath, merged);
  console.log('Wrote', Object.keys(newMappings).length, 'new mappings to', mappingPath);
})();
