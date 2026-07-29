import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  
  await page.type('input[type="email"]', 'salman@gmail.com');
  await page.type('input[type="password"]', 'password123'); 
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  
  await page.goto('http://localhost:5173/ngo/events', { waitUntil: 'networkidle2' });
  
  await page.waitForSelector('button');
  
  const buttons = await page.$$('button');
  for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Create your first event')) {
          await btn.click();
          break;
      }
      if (text && text.includes('Create New Event')) {
          await btn.click();
          break;
      }
  }
  
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'modal_screenshot.png' });
  
  await browser.close();
})();
