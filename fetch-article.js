import fetch   from 'node-fetch';
import * as cheerio from 'cheerio';
import fs      from 'fs';

const KT_URL  = 'https://www.koreatimes.co.kr/?edition=south-korea';
const KT_HOST = 'https://www.koreatimes.co.kr';

async function run() {
  console.log('🔍 Korea Times 최신 기사 수집 중...');
  const res  = await fetch(KT_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsLearner/1.0)' }
  });
  const html = await res.text();
  const $    = cheerio.load(html);

  const seen    = new Set();
  const results = [];

  $('a[href]').each((_, el) => {
    const raw  = $(el).attr('href') || '';
    const href = raw.startsWith('http') ? raw : KT_HOST + raw;
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (
      href.includes('koreatimes.co.kr') &&
      /\/\d{8}\//.test(href) &&
      !href.includes('edition=') &&
      text.length > 15 &&
      !seen.has(href)
    ) {
      seen.add(href);
      results.push({ href, title: text });
    }
  });

  const articles = results.slice(0, 3);
  fs.writeFileSync('./articles.json', JSON.stringify({
    date: new Date().toISOString().slice(0, 10),
    fetched_at: new Date().toISOString(),
    articles
  }, null, 2), 'utf-8');

  console.log(`✅ ${articles.length}개 저장 완료`);
  articles.forEach((a, i) => console.log(`  [${i+1}] ${a.title}`));
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
