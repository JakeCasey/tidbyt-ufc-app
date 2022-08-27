const needle = require('needle');
const cheerio = require('cheerio');

let root = 'https://www.sherdog.com';

let getMMAData = async () => {
  // Get headlines from sherdog
  let { body } = await needle('get', root);
  let $ = cheerio.load(body);
  //   let headlines = [];
  //   let text = $('.news-tab-ufc li').each((i, el) => {
  //     headlines.push($(el).text());
  //   });
  //   //take the first 3 headlines
  //   headlines = headlines.slice(0, 3);

  // Get the events link from sherdog
  let eventsLink = $('a:contains("UFC EVENTS")').attr('href');
  eventsLink = `${root}${eventsLink}`;
  // retrieve ufc events page
  let { body: eventsBody } = await needle('get', eventsLink);
  let $events = cheerio.load(eventsBody);
  // Get the next event from the events page.
  let nextEvent = $events('tr[itemtype="http://schema.org/Event"]').first();

  console.log(nextEvent.text());
};

module.exports = { getMMAData };
