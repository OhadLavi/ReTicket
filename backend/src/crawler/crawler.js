const request = require('request');
const cheerio = require('cheerio');

function scrape(url, selector, callback) {
  request(url, function (error, response, html) {
    console.log("hi");
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html);
      const data = $(selector).text();
      callback(null, data);
    } else {
      callback(error);
    }
  });
}

module.exports = scrape;
