const fs = require('fs');
const moment = require('moment');
const puppeteer = require('puppeteer');
const websiteConfigs = require('./websiteConfigs');
const { saveEvent } = require('../services/event.service');

async function scrapeWebsite(websiteName) {
  const config = websiteConfigs[websiteName];
  try {
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36');
    await page.goto(config.url, { waitUntil: 'networkidle0' });
    console.log('Scraping in process...');
    const eventLinks = await page.evaluate((linkSelector) => {
      let links = Array.from(document.querySelectorAll(linkSelector)).map(a => a.href);
      links = links.filter(link => !link.endsWith('.pdf'));
      return links;
    }, config.linkSelector);
    let data = [];
    const pagesPromises = eventLinks.map(async (link) => {
      const page = await browser.newPage();
      await page.goto(link, { waitUntil: 'networkidle0' });

      const rawEventDetails = await page.evaluate((selectors) => {
        const getValueFromSelectors = (selObj, attr = 'innerText') => {
          let value = '';
          if (typeof selObj.primary === 'string') {
            value = document.querySelector(selObj.primary)?.[attr] || '';
          }
          if (!value && typeof selObj.alternative === 'string') {
            value = document.querySelector(selObj.alternative)?.[attr] || '';
          }
          return value;
        };
        
        let name = getValueFromSelectors(selectors.name);
        let timeDate = getValueFromSelectors(selectors.timeDate);
        let venue = getValueFromSelectors(selectors.venue);
        let location = getValueFromSelectors(selectors.location);
        if (location === name) {
          location = document.querySelector('.event-listing-city')?.innerText || '';
        }
        let img = getValueFromSelectors(selectors.img, 'src') || '';
        let description = getValueFromSelectors(selectors.description) || '';
        
        return { name, timeDate, venue, location, img, description };
      }, config.eventDetailsSelectors);
    
      if (rawEventDetails.timeDate.match(/.*, \d{2}.\d{2}.\d{4} \| \d{2}:\d{2}/)) {
        let [day, date, time] = rawEventDetails.timeDate.split(/, |\| /);
        let [dayNum, month, year] = date.split('.');
        rawEventDetails.timeDate = moment(`${dayNum}.${month}.${year} ${time}`, 'DD.MM.YYYY HH:mm').toDate();
      } else {
        rawEventDetails.timeDate = new Date(rawEventDetails.timeDate);
      }

      const eventDetails = rawEventDetails;
      if (eventDetails.name && eventDetails.timeDate && eventDetails.venue && eventDetails.location) {
        data.push(eventDetails);
        await saveEvent(eventDetails);
      }
    });
    await Promise.all(pagesPromises);
    await browser.close();
    console.log('Scraping completed!');
    fs.writeFileSync('scrapedData.txt', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('An error occurred while scraping:', error);
  }
}

module.exports = { scrapeWebsite };
