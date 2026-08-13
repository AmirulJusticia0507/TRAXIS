export default async function run(page, ui) {
  await page.goto('http://localhost:4321/', { waitUntil: 'load' });
  await page.getByRole('link', { name: /Live Tracking/i }).click();
  await page.waitForSelector('.live-map__marker');
  await page.waitForTimeout(2000);
  return await page.evaluate(async () => {
    const urls = performance
      .getEntriesByType('resource')
      .map((e) => e.name)
      .filter((u) => u.includes('.js'));
    const out = [];
    for (const u of urls) {
      try {
        const r = await fetch(u);
        const t = await r.text();
        const hasLiveMap = t.includes('live-map') || t.includes('onKeydown') || t.includes('openTrain');
        out.push({ file: u.split('/').pop(), hasLiveMap, hasLm: t.includes('__lm'), len: t.length });
      } catch (e) {
        out.push({ file: u.split('/').pop(), err: String(e) });
      }
    }
    return out.filter((o) => o.hasLiveMap || o.hasLm || o.file.startsWith('chunk'));
  });
}
