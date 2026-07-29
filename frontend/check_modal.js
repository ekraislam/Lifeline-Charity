import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  
  // Fill the login form
  await page.type('input[type="email"]', 'salman@gmail.com');
  await page.type('input[type="password"]', 'password123'); 
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  
  // Go to the events page
  await page.goto('http://localhost:5173/ngo/events', { waitUntil: 'networkidle2' });
  
  // Wait for Create New Event button to be visible
  await page.waitForSelector('button');
  
  // Find the button with text "Create New Event" or "Create your first event"
  const buttons = await page.$$('button');
  for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Create your first event')) {
          console.log('Clicking "Create your first event"');
          await btn.click();
          break;
      }
      if (text && text.includes('Create New Event')) {
          console.log('Clicking "Create New Event"');
          await btn.click();
          break;
      }
  }
  
  // Wait a bit to ensure any async errors are caught
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
