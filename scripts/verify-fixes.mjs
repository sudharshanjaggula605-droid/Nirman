import puppeteer from 'puppeteer-core';

async function main() {
  console.log('--- STARTING VERIFICATION OF ALL 6 QA FIXES ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1280,800'],
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();

  async function clearSession() {
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.clearBrowserCache');
  }

  // Step 1: Login as Owner
  console.log('1. Logging in as Owner (e2e_owner@nirman.com)...');
  await clearSession();
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', 'e2e_owner@nirman.com');
  await page.type('input[type="password"]', 'NirmanTest@2026');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2500));

  // Test OWN-01 / NEW-01: Quick Action "View Active Projects"
  console.log('2. Testing OWN-01 / NEW-01: Click View Active Projects quick action button...');
  await page.goto('http://localhost:3000/owner/dashboard', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  
  const activeProjectsBtn = await page.$('#quick-action-active-projects');
  if (!activeProjectsBtn) throw new Error('Could not find #quick-action-active-projects!');
  await activeProjectsBtn.click();
  await new Promise(r => setTimeout(r, 2000));
  const currentUrl = page.url();
  console.log('   Navigated URL:', currentUrl);
  const own01Pass = currentUrl.includes('/owner/projects?status=active');
  console.log('   OWN-01 / NEW-01 Result:', own01Pass ? '✅ PASS' : '❌ FAIL');

  // Test NEW-03: DRAFT projects showing in ALL filter
  console.log('3. Testing NEW-03: Checking ALL filter includes DRAFT projects...');
  await page.goto('http://localhost:3000/owner/projects', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  const allFilterResult = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#owner-projects-container h3')).map(h => h.innerText);
    const hasNoProjects = document.body.innerText.includes('No Projects Found');
    const filterButtons = Array.from(document.querySelectorAll('#owner-projects-container button')).map(b => ({
      text: b.innerText,
      isActive: b.classList.contains('bg-orange-600')
    }));
    return { cards, hasNoProjects, filterButtons };
  });
  console.log('   ALL Filter Results:', allFilterResult);
  const new03Pass = allFilterResult.cards.length > 0 && !allFilterResult.hasNoProjects;
  console.log('   NEW-03 Result:', new03Pass ? '✅ PASS' : '❌ FAIL');

  // Test NEW-04: Project Detail Contractor Rating
  console.log('4. Testing NEW-04: Non-existent contractor should not display a rating...');
  await page.goto('http://localhost:3000/owner/projects/839187d3-8a98-448e-af50-dc8a26a0115c', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  const projectDetailText = await page.evaluate(() => {
    return document.body.innerText;
  });
  const hasContractorFirm = projectDetailText.includes('Contractor Firm');
  const hasAwaitingAssignment = projectDetailText.includes('Awaiting Assignment');
  const has48Rating = projectDetailText.includes('4.8 / 5.0 Rating') || projectDetailText.includes('4.8');
  console.log('   Project detail contains "Contractor Firm":', hasContractorFirm);
  console.log('   Project detail contains "Awaiting Assignment":', hasAwaitingAssignment);
  console.log('   Project detail contains "4.8 / 5.0 Rating":', has48Rating);
  const new04Pass = hasContractorFirm && hasAwaitingAssignment && !has48Rating;
  console.log('   NEW-04 Result:', new04Pass ? '✅ PASS' : '❌ FAIL');

  // Test NEW-02: Create New Tender button on My Tenders page
  console.log('5. Testing NEW-02: Create New Tender button navigation...');
  await page.goto('http://localhost:3000/owner/tenders', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  const createTenderBtn = await page.$('#btn-create-new-tender');
  if (!createTenderBtn) throw new Error('Could not find #btn-create-new-tender!');
  await createTenderBtn.click();
  await new Promise(r => setTimeout(r, 2000));
  const newTenderUrl = page.url();
  console.log('   Navigated URL after clicking Create New Tender:', newTenderUrl);
  const new02Pass = newTenderUrl.includes('/owner/projects/new');
  console.log('   NEW-02 Result:', new02Pass ? '✅ PASS' : '❌ FAIL');

  // Test NEW-06 & OWN-06 & OWN-08: Dashboard scrollability and Active Project Progress
  console.log('6. Testing NEW-06 / OWN-06 / OWN-08: Dashboard scroll container & Active Project Progress section...');
  await page.goto('http://localhost:3000/owner/dashboard', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  const dashboardDetails = await page.evaluate(() => {
    const main = document.querySelector('main');
    const progressCard = document.querySelector('#active-project-progress-card');
    const recentTenders = document.body.innerText.includes('Recent Tenders');
    const recentBids = document.body.innerText.includes('Latest Contractor Bids');
    return {
      hasProgressCard: !!progressCard,
      progressCardText: progressCard ? progressCard.innerText : null,
      recentTenders,
      recentBids,
      canScroll: main ? main.scrollHeight > main.clientHeight : false,
      scrollHeight: main ? main.scrollHeight : 0,
      clientHeight: main ? main.clientHeight : 0
    };
  });
  console.log('   Dashboard Metrics:', dashboardDetails);
  const new06Pass = dashboardDetails.hasProgressCard && dashboardDetails.recentTenders && dashboardDetails.recentBids && dashboardDetails.canScroll;
  console.log('   NEW-06 / OWN-06 / OWN-08 Result:', new06Pass ? '✅ PASS' : '❌ FAIL');

  // Step 2: Login as Contractor
  console.log('7. Logging in as Contractor (e2e_contractor@nirman.com)...');
  await clearSession();
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', 'e2e_contractor@nirman.com');
  await page.type('input[type="password"]', 'NirmanTest@2026');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2500));

  // Test NEW-05: Grammar check on contractor projects page
  console.log('8. Testing NEW-05: Grammar check "Showing 1 project"...');
  await page.goto('http://localhost:3000/contractor/projects', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  const grammarText = await page.evaluate(() => {
    const el = document.querySelector('.hidden.sm\\:block.text-xs.text-muted-foreground.font-semibold');
    return el ? el.innerText : '';
  });
  console.log('   Showing text:', grammarText);
  const new05Pass = grammarText.includes('Showing 1 project') && !grammarText.includes('Showing 1 projects');
  console.log('   NEW-05 Result:', new05Pass ? '✅ PASS' : '❌ FAIL');

  await browser.close();
  console.log('\n========================================');
  console.log('--- ALL QA RETEST VERIFICATION SUMMARY ---');
  console.log('OWN-01 / NEW-01 (View Active Projects Nav):', own01Pass ? '✅ PASS' : '❌ FAIL');
  console.log('NEW-02 (Create New Tender Nav):', new02Pass ? '✅ PASS' : '❌ FAIL');
  console.log('NEW-03 (DRAFT in ALL filter):', new03Pass ? '✅ PASS' : '❌ FAIL');
  console.log('NEW-04 (Not Assigned Rating):', new04Pass ? '✅ PASS' : '❌ FAIL');
  console.log('NEW-05 (Singular Project Grammar):', new05Pass ? '✅ PASS' : '❌ FAIL');
  console.log('NEW-06 (Dashboard Scroll & Progress):', new06Pass ? '✅ PASS' : '❌ FAIL');
  console.log('========================================');
}

main().catch(console.error);
