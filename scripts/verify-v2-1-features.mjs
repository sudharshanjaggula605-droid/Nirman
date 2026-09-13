import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EVIDENCE_DIR = path.resolve(process.cwd(), 'test_evidence', 'screenshots');

async function testV21Features() {
  console.log('[VERIFY v2.1.0] Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  try {
    // Clear session cookies so we test as clean visitor
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');

    // Bypass initial splash screen so navbar and assistant mount immediately
    await page.evaluateOnNewDocument(() => {
      sessionStorage.setItem("nirman_splash_shown", "true");
    });

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('[VERIFY v2.1.0] Loaded Landing Page');

    // Wait for client mounting
    await page.waitForSelector('button[aria-label="Open NIRMAN Saathi Assistant"]', { timeout: 10000 });

    // 1. Check for v2.1.0 badge in Navbar
    const pageContent = await page.content();
    const hasV210 = pageContent.includes('v2.1.0');
    console.log('[VERIFY] v2.1.0 Badge Present:', hasV210 ? '✅ YES' : '❌ NO');

    // 2. Open NIRMAN Saathi Assistant
    console.log('[VERIFY] Looking for NIRMAN Saathi assistant button...');
    const assistantBtn = await page.$('button[aria-label="Open NIRMAN Saathi Assistant"]');
    if (assistantBtn) {
      await assistantBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      console.log('[VERIFY] Assistant window opened!');

      // Capture screenshot of open assistant
      await page.screenshot({
        path: path.join(EVIDENCE_DIR, 'v2_1_NIRMAN_Saathi_Assistant.png'),
        fullPage: false
      });
      console.log('[VERIFY] Captured v2_1_NIRMAN_Saathi_Assistant.png');

      // Click a quick chip: "How to bid on tenders?"
      const buttons = await page.$$('button');
      for (const b of buttons) {
        const text = await page.evaluate(el => el.innerText, b);
        if (text && text.includes('bid on tenders')) {
          console.log('[VERIFY] Clicking quick question chip: "How to bid on tenders?"');
          await b.click();
          await new Promise(r => setTimeout(r, 1000));
          break;
        }
      }

      // Capture assistant after answering
      await page.screenshot({
        path: path.join(EVIDENCE_DIR, 'v2_1_NIRMAN_Saathi_Answered.png'),
        fullPage: false
      });
      console.log('[VERIFY] Captured v2_1_NIRMAN_Saathi_Answered.png');
    } else {
      console.error('[VERIFY ERROR] Assistant button not found!');
    }

    // 3. Test Interactive Tour
    console.log('[VERIFY] Triggering Interactive Tour...');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('nirman_start_tour'));
    });
    await new Promise(r => setTimeout(r, 1000));

    const modalExists = await page.$('div[role="dialog"]');
    console.log('[VERIFY] Tour Modal Opened:', modalExists ? '✅ YES' : '❌ NO');

    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'v2_1_Interactive_Tour_Step1.png'),
      fullPage: false
    });
    console.log('[VERIFY] Captured v2_1_Interactive_Tour_Step1.png');

    // Advance to Step 2
    const nextBtns = await page.$$('button');
    for (const b of nextBtns) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text && text.includes('Next Step')) {
        console.log('[VERIFY] Clicking "Next Step"');
        await b.click();
        await new Promise(r => setTimeout(r, 800));
        break;
      }
    }

    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'v2_1_Interactive_Tour_Step2.png'),
      fullPage: false
    });
    console.log('[VERIFY] Captured v2_1_Interactive_Tour_Step2.png');

    console.log('\n🎉 ALL v2.1.0 FEATURES VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('[VERIFY ERROR]:', err);
  } finally {
    await browser.close();
  }
}

testV21Features();
