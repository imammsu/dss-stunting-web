const fs = require('fs');
const path = require('path');

const files = [
  path.join(process.cwd(), 'src/App.tsx'),
  path.join(process.cwd(), 'src/components/Sidebar.tsx'),
  path.join(process.cwd(), 'src/components/RankingTable.tsx'),
  path.join(process.cwd(), 'src/components/MapView.tsx'),
];

// Target to fully light mode.
// We strip out any standard dark classes from App or MapView first:
const stripDarkRegex = /dark:[\w\-\/\.]+\s?/g;

const replaceMapLight = {
  // Common Dark -> Light mappings
  'bg-slate-950': 'bg-slate-50',
  'bg-slate-950/60': 'bg-white/60',
  'text-slate-200': 'text-slate-800',
  'text-slate-100': 'text-slate-900',
  'bg-slate-900/80': 'bg-white/80',
  'bg-slate-900/90': 'bg-white/90',
  'border-slate-800/60': 'border-slate-200',
  'border-slate-800': 'border-slate-200',
  'border-slate-800/50': 'border-slate-200',
  'border-slate-700/60': 'border-slate-300',
  'border-slate-700/50': 'border-slate-300',
  'border-slate-700': 'border-slate-300',
  'bg-slate-800/50': 'bg-slate-100',
  'bg-slate-800/20': 'bg-slate-50',
  'bg-slate-800/80': 'bg-slate-100/90',
  'bg-slate-900/50': 'bg-slate-50',
  'bg-black/30': 'bg-slate-900/20',
  'bg-black/40': 'bg-slate-900/40',
  'bg-slate-900': 'bg-white',
  'hover:bg-slate-800': 'hover:bg-slate-200',
  'hover:text-slate-200': 'hover:text-slate-800',
  'hover:bg-slate-800/50': 'hover:bg-slate-100',
  'text-slate-300': 'text-slate-600',
  'text-slate-400': 'text-slate-500',
  'text-slate-500': 'text-slate-500',
  'text-slate-600': 'text-slate-400',
};

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Strip dark variants if they exist
  content = content.replace(stripDarkRegex, '');

  // Strip toggle button and dark mode logic if present in App.tsx
  if (file.includes('App.tsx')) {
    content = content.replace(/const \[isDarkMode, setIsDarkMode\] = useState\(true\);\s+useEffect\(\(\) => \{\s+if \(isDarkMode\) \{\s+document\.documentElement\.classList\.add\('dark'\);\s+\} else \{\s+document\.documentElement\.classList\.remove\('dark'\);\s+\}\s+\}, \[isDarkMode\]\);/g, '');
    // remove the button block completely by finding it
    const buttonBlock = />\s*\{\s*isDarkMode \? \([\s\S]*?\}<\/button>/g;
    content = content.replace(buttonBlock, '>');
    content = content.replace(/<button[^>]+onClick=\{[^}]*setIsDarkMode[^}]*\}[^>]*>\s*>\s*/g, '');
    content = content.replace(/import { useState, useCallback, useEffect }/g, 'import { useState, useCallback }');
  }

  // Replace dark classes with light classes
  for (const [darkClass, lightClass] of Object.entries(replaceMapLight)) {
    const regex = new RegExp(`(\\\\s|["\\'\`])` + darkClass.replace(/\//g, '\\\\/') + `(?![\\\\w\\\\-])`, 'g');
    content = content.replace(regex, `$1${lightClass}`);
  }

  fs.writeFileSync(file, content);
}
console.log('Update Complete');
