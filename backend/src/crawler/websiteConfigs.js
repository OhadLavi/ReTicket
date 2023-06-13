const websiteConfigs = {
    eventim: {
      url: "https://www.eventim.co.il/en/",
      linkSelector: '.swiper-slide a',
      eventDetailsSelectors: {
        name: '.stage-headline',
        timeDate: '.event-listing-month',
        venue: '.event-listing-event',
        location: '.event-listing-venue',
        img: '.show-stage-image img'
      }
    },
    tmisrael: {
      url: "https://www.tmisrael.co.il/homepage/ALL/iw",
      linkSelector: '.content ul.v2 li a',
      eventDetailsSelectors: {
        name: '#eventnameh1 span',
        timeDate: '[itemprop="startDate"]',
        venue: '[itemprop="name"]',
        location: '[itemprop="addressLocality"]',
        img: '.eventimage img',
        description: '[itemprop="description"]'
      }
    }
  }

  module.exports = websiteConfigs;