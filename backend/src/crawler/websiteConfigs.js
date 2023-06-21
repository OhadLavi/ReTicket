const websiteConfigs = {
    eventim: {
      url: "https://www.eventim.co.il/en/",
      linkSelector: '.swiper-slide a',
      eventDetailsSelectors: {
        name: { primary: '.stage-headline' },
        timeDate: { primary: '.event-listing-month', alternative: 'time[data-qa="event-date"]' },
        venue: { primary: '.event-listing-event', alternative: 'span[data-qa="event-venue"]' },
        location: { primary: '.event-listing-venue', alternative: 'span[data-qa="event-venue"]' },
        description: { primary: '.moretext-teaser', alternative: '.external-content' },
        img: { primary: '.show-stage-image img' }
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