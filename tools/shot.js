const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage();
  p.on('console', m => console.log('console:', m.text()));
  p.on('pageerror', e => console.log('err:', e.message));
  for (const j of jobs) {
    await p.goto('http://localhost:8765/tools/render.html?' + j.q, { waitUntil: 'load' });
    await p.waitForFunction('window.__done', null, { timeout: 180000 });
    const data = await p.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
    fs.writeFileSync(j.out, Buffer.from(data.split(',')[1], 'base64'));
    console.log('ok', j.out);
  }
  await b.close();
})();
