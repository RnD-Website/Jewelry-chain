const { chromium } = require('playwright');
(async () => {
  const [w, h, out, ...pos] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  p.on('pageerror', e => console.log('ERR', e.message));
  p.on('console', m => { if (m.type() !== 'log') console.log(m.type(), m.text()); });
  await p.goto('http://localhost:8000/index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  for (const y of pos) {
    await p.evaluate(y => { const v = y.endsWith('vh') ? parseFloat(y) * innerHeight / 100 : (y.startsWith('#') ? document.querySelector(y).offsetTop : +y); window.scrollTo(0, v); }, y);
    await p.waitForTimeout(1800);
    await p.screenshot({ path: `${out}_${y.replace('#','')}.png` });
  }
  await b.close();
})();
