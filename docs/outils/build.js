const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const [md, out] = process.argv.slice(2);
const html = execFileSync('pandoc', [md, '-f', 'gfm+yaml_metadata_block', '-t', 'html5'], { encoding: 'utf8' });
const meta = fs.readFileSync(md, 'utf8').match(/^---\n([\s\S]*?)\n---/)[1];
const get = k => (meta.match(new RegExp('^' + k + ': "(.*)"', 'm')) || [])[1] || '';
const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
const doc = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="cover"><div class="brand">FRANCK SCHOOL</div><div class="sub">${get('subtitle')}</div><div class="rule"></div>
<h1 class="t">Audit de la base de données</h1><div class="date">${get('date')}</div></div>${html}</body></html>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent(doc, { waitUntil: 'load' });
  await p.addScriptTag({ path: path.join(__dirname, process.env.MERMAID_JS || 'node_modules/mermaid/dist/mermaid.min.js') });
  const n = await p.evaluate(async () => {
    mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: { primaryColor: '#e8efff', primaryBorderColor: '#1e40af', primaryTextColor: '#0f2a4a', lineColor: '#1e40af', fontFamily: 'DejaVu Sans' }, er: { useMaxWidth: true }, flowchart: { useMaxWidth: true } });
    const blocks = [...document.querySelectorAll('pre.mermaid')]; let i = 0;
    for (const pre of blocks) {
      const src = pre.textContent;
      const { svg } = await mermaid.render('m' + (i++), src);
      const wrap = document.createElement('div'); wrap.className = 'mermaid-wrap'; wrap.innerHTML = svg;
      const lab = document.createElement('div'); lab.className = 'srclabel'; lab.textContent = 'Code source Mermaid :';
      const code = document.createElement('pre'); code.textContent = src;
      pre.replaceWith(wrap, lab, code);
    }
    return blocks.length;
  });
  console.log('diagrammes rendus:', n);
  await p.pdf({ path: out, format: 'A4', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="font-size:7pt;color:#64748b;width:100%;padding:0 16mm;display:flex;justify-content:space-between"><span>FRANCK SCHOOL — Audit de la base de données V1.0</span><span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
    margin: { top: '16mm', bottom: '18mm', left: '16mm', right: '16mm' } });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
