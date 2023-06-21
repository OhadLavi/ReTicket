const fs = require('fs');
const puppeteer = require('puppeteer');
const websiteConfigs = require('./websiteConfigs');
const { saveEvent } = require('../services/event.service');

async function scrapeWebsite(websiteName) {
  const config = websiteConfigs[websiteName];
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36');
    await page.goto(config.url, { waitUntil: 'networkidle0' });
    await page.screenshot({path: 'screenshot.png'});
    console.log('Scraping in process...');
    const eventLinks = await page.evaluate((linkSelector) => {
      let links = Array.from(document.querySelectorAll(linkSelector)).map(a => a.href);
      links = links.filter(link => !link.endsWith('.pdf'));
      return links;
  }, config.linkSelector);
    let data = [];
    for(let link of eventLinks) {
    //for(let i = 0; i < 1; i++) {
      //await page.goto(eventLinks[i], { waitUntil: 'networkidle0' });
      await page.goto(link, { waitUntil: 'networkidle0' });
        const eventDetails = await page.evaluate((selectors) => {
        let name = document.querySelector(selectors.name)?.innerText || '';
        let timeDate = document.querySelector(selectors.timeDate)?.getAttribute('datetime') || '';
        let location = document.querySelector(selectors.location)?.innerText || '';
        let venue = document.querySelector(selectors.venue)?.innerText || '';
        let img = document.querySelector(selectors.img)?.src || '';
        let description = document.querySelector(selectors.description)?.innerText || '';
        return { name, timeDate, venue, location, img, description };
      }, config.eventDetailsSelectors);
      if (eventDetails.name && eventDetails.timeDate && eventDetails.venue && eventDetails.location) {
        data.push(eventDetails);
        await saveEvent(eventDetails);
      }
    }
    await browser.close();
    fs.writeFileSync('scrapedData.txt', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('An error occurred while scraping:', error);
  }
}

module.exports = { scrapeWebsite };
