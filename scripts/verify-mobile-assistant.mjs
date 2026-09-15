import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EVIDENCE_DIR = path.resolve(process.cwd(), 'test_evidence', 'screenshots');

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function verifyMobileAssistant() {
  console.log('[VERIFY MOBILE] Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    // Mobile Viewport: 390x844 (iPhone 14 / modern smartphone)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    // Bypass splash
    await page.evaluateOnNewDocument(() => {
      sessionStorage.setItem("nirman_splash_shown", "true");
    });

    console.log('[VERIFY MOBILE] Navigating to http://localhost:3000/...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 35000 });

    // 1. Wait for launcher button
    await page.waitForSelector('button[aria-label="Open NIRMAN Saathi Assistant"]', { timeout: 10000 });
    console.log('[VERIFY MOBILE] Found assistant launcher button on mobile view');

    // Wait a moment for animations
    await new Promise(r => setTimeout(r, 1200));

    // Capture mobile launcher screenshot
    const mobileLauncherPath = path.join(EVIDENCE_DIR, 'mobile_assistant_launcher.png');
    await page.screenshot({ path: mobileLauncherPath });
    console.log('[VERIFY MOBILE] Captured mobile launcher screenshot:', mobileLauncherPath);

    // 2. Open Assistant
    const assistantBtn = await page.$('button[aria-label="Open NIRMAN Saathi Assistant"]');
    await assistantBtn.click();
    await new Promise(r => setTimeout(r, 1000));

    // Capture open assistant screenshot
    const mobileOpenPath = path.join(EVIDENCE_DIR, 'mobile_assistant_open.png');
    await page.screenshot({ path: mobileOpenPath });
    console.log('[VERIFY MOBILE] Captured mobile open assistant screenshot:', mobileOpenPath);

    // 3. Test a quick chip
    const chips = await page.$$('button');
    for (const chip of chips) {
      const text = await page.evaluate(el => el.innerText, chip);
      if (text && text.includes('bid on tenders')) {
        console.log('[VERIFY MOBILE] Tapping quick chip "How to bid on tenders?"');
        await chip.click();
        await new Promise(r => setTimeout(r, 1000));
        break;
      }
    }

    // Capture answered assistant screenshot
    const mobileAnsweredPath = path.join(EVIDENCE_DIR, 'mobile_assistant_answered.png');
    await page.screenshot({ path: mobileAnsweredPath });
    console.log('[VERIFY MOBILE] Captured mobile answered screenshot:', mobileAnsweredPath);

    // 4. Close Assistant
    const closeBtn = await page.$('button[aria-label="Close Assistant"]');
    if (closeBtn) {
      await closeBtn.click();
      await new Promise(r => setTimeout(r, 600));
    }

    // 5. Open More sheet to verify assistant shortcut
    const moreBtn = await page.$('button[aria-label="More navigation options"]');
    if (moreBtn) {
      await moreBtn.click();
      await new Promise(r => setTimeout(r, 800));
      const mobileMorePath = path.join(EVIDENCE_DIR, 'mobile_more_menu_with_assistant.png');
      await page.screenshot({ path: mobileMorePath });
      console.log('[VERIFY MOBILE] Captured mobile more menu screenshot:', mobileMorePath);
    }

    console.log('[VERIFY MOBILE] All checks completed successfully!');
  } catch (err) {
    console.error('[VERIFY MOBILE ERROR]', err);
  } finally {
    await browser.close();
  }
}

verifyMobileAssistant();
