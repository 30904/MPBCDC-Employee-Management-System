const fs = require('fs');
const path = require('path');

const extractDir = 'c:/Users/saraj/Desktop/MPBCDC/_tracker_extract';
const sharedStrings = fs.readFileSync(path.join(extractDir, 'xl/sharedStrings.xml'), 'utf8');
const sheet3 = fs.readFileSync(path.join(extractDir, 'xl/worksheets/sheet4.xml'), 'utf8');

const strings = [];
const siRegex = /<si>([\s\S]*?)<\/si>/g;
let match;
while ((match = siRegex.exec(sharedStrings))) {
  const block = match[1];
  const tMatch = block.match(/<t[^>]*>([\s\S]*?)<\/t>/g);
  if (tMatch) {
    strings.push(
      tMatch
        .map((t) => t.replace(/<[^>]+>/g, ''))
        .join('')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
    );
  } else {
    strings.push('');
  }
}

const rows = [];
const rowRegex = /<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
while ((match = rowRegex.exec(sheet3))) {
  const rnum = Number(match[1]);
  const rowXml = match[2];
  const cells = {};
  const cellRegex = /<c[^>]*r="([A-Z]+)\d+"([^>]*)>(?:<v>([\s\S]*?)<\/v>)?/g;
  let cellMatch;
  while ((cellMatch = cellRegex.exec(rowXml))) {
    const col = cellMatch[1];
    const attrs = cellMatch[2];
    const raw = cellMatch[3] ?? '';
    const isShared = attrs.includes('t="s"');
    cells[col] = isShared ? strings[Number(raw)] : raw;
  }
  rows.push({ rnum, cells });
}

rows
  .filter((row) => row.rnum <= 120)
  .forEach((row) => {
    const values = Object.entries(row.cells)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v)
      .filter(Boolean)
      .join(' | ');
    if (values) {
      console.log(`${row.rnum}: ${values}`);
    }
  });
