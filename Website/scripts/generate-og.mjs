import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.resolve(__dirname, '../public/og-default.png')

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400;9..144,500;9..144,600&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1200px; height: 630px; }
  body {
    background: oklch(96.2% 0.022 78);
    color: oklch(36% 0.105 32);
    font-family: 'Fraunces', Georgia, serif;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 80px 96px;
    position: relative;
    overflow: hidden;
  }
  .deco {
    position: absolute;
    inset: auto -180px -260px auto;
    width: 620px;
    height: 620px;
    border-radius: 50%;
    background: oklch(62% 0.160 38 / 0.10);
  }
  .eyebrow {
    font-family: 'Fraunces', Georgia, serif;
    font-variation-settings: 'opsz' 14, 'SOFT' 60;
    font-weight: 500;
    font-size: 22px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: oklch(46% 0.030 45);
    display: flex;
    align-items: center;
    gap: 18px;
  }
  .eyebrow .rule {
    width: 56px;
    height: 1px;
    background: oklch(36% 0.105 32 / 0.40);
  }
  h1 {
    font-variation-settings: 'opsz' 144, 'SOFT' 0;
    font-weight: 500;
    font-size: 92px;
    line-height: 1.02;
    letter-spacing: -0.015em;
    max-width: 920px;
    text-wrap: balance;
  }
  h1 em {
    font-style: italic;
    color: oklch(54% 0.170 36);
    font-weight: 500;
  }
  .foot {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    font-variation-settings: 'opsz' 24, 'SOFT' 60;
  }
  .name { font-size: 30px; font-weight: 500; }
  .meta {
    font-size: 22px;
    color: oklch(46% 0.030 45);
    line-height: 1.4;
    text-align: right;
  }
</style>
</head>
<body>
  <div class="deco"></div>
  <div class="eyebrow"><span class="rule"></span><span>The Au Pair Childcare Consultant</span></div>
  <h1>Newport Beach's guide to finding the <em>perfect au pair</em>.</h1>
  <div class="foot">
    <div class="name">Kim Arvdalen<br/><span style="font-size:20px;color:oklch(46% 0.030 45);font-weight:400;">Local Childcare Consultant</span></div>
    <div class="meta">theaupairchildcareconsultant.com<br/>(714) 510-0002</div>
  </div>
</body>
</html>`

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
})
const page = await ctx.newPage()
await page.setContent(html, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: outPath, type: 'png', omitBackground: false })
await browser.close()
console.log('Wrote', outPath)
