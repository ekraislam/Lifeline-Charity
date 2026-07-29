import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  
  // Fill the login form
  await page.type('input[type="email"]', 'salman@gmail.com');
  await page.type('input[type="password"]', 'password123'); // assuming this is the password
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  
  // Now go to the page that is blank
  await page.goto('http://localhost:5173/ngo/events', { waitUntil: 'networkidle2' });
  
  // Wait a bit to ensure any async errors are caught
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
