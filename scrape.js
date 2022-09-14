import needle from 'needle';
import cheerio from 'cheerio';

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
  let nextEvent = $events('tr[itemtype="http://schema.org/Event"]')
    .first()
    .text();

  let lines = nextEvent.split(/\r?\n/);
  lines = lines.map((l) => {
    // remove white space
    return l.trim();
  });

  // remove empty lines
  lines = lines.filter((l) => {
    return l.length > 0;
  });
  // add spaces to the date line
  let dateLine = lines[0].split('');
  dateLine.splice(3, 0, ' ');
  dateLine.splice(6, 0, ' ');

  lines[0] = dateLine.join('');

  console.log(lines);
};

export { getMMAData };
