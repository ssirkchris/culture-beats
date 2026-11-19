import type { Fact } from './model.ts';

type Question = [prompt: string, answer: string, distractor1: string, distractor2: string, distractor3: string];

function fact(id: string, topic: Fact['topic'], country: Fact['country'], difficulty: Fact['difficulty'],
    title: string, url: string, explanation: string, questions: [Question, Question], eventDate?: string): Fact {
  return {
    id, topic, country, difficulty, explanation, source: { title, url }, eventDate,
    variants: questions.map(([prompt, ...options], index) => ({ id: id + '-' + (index + 1), prompt, options, correct: 0 })),
  };
}

export const bank = [
  fact('uk-elected-commons', 'Politics', 'UK', 'Foundation', 'UK Parliament', 'https://www.parliament.uk/about/how/role/system/',
    'Voters elect MPs to the House of Commons, one of the two chambers of the UK Parliament.', [
      ['Which chamber of the UK Parliament is elected by the public?', 'House of Commons', 'House of Lords', 'Privy Council', 'Supreme Court'],
      ['Where does an MP elected in a UK general election take a seat?', 'House of Commons', 'House of Lords', 'Cabinet Office', 'Privy Council'],
    ]),
  fact('us-two-senators', 'Politics', 'USA', 'Foundation', 'U.S. Senate', 'https://www.senate.gov/about/origins-foundations/senate-and-constitution/two-senators-per-state.htm',
    'Each US state has two senators, regardless of its population.', [
      ['How many US senators does each state have?', 'Two', 'One', 'Three', 'Four'],
      ['Which rule determines how many seats a state has in the US Senate?', 'Every state gets two seats', 'Every state gets one seat', 'Seats depend on population', 'Seats depend on land area'],
    ]),
  fact('uk-scottish-haggis', 'Food', 'UK', 'Foundation', 'VisitScotland', 'https://www.visitscotland.com/things-to-do/food-drink/haggis',
    'Haggis, a savoury dish traditionally made with meat, oatmeal, onion and spices, is known as Scotland’s national dish.', [
      ['Which food is known as Scotland’s national dish?', 'Haggis', 'Welsh rarebit', 'Cornish pasty', 'Bakewell tart'],
      ['What is the name of the Scottish national dish made with meat, oatmeal and spices?', 'Haggis', 'Shortbread', 'Bara brith', 'Yorkshire pudding'],
    ]),
  fact('uk-wimbledon-grass', 'Sports', 'UK', 'Foundation', 'The Championships, Wimbledon', 'https://www.wimbledon.com/en_GB/about/grass_courts',
    'Wimbledon’s Championships are played on grass. The tournament maintains grass courts specifically for the event.', [
      ['What surface is used at Wimbledon?', 'Grass', 'Clay', 'Carpet', 'Acrylic hard court'],
      ['A player is preparing for the traditional court surface of the Wimbledon Championships. What should they practise on?', 'Grass', 'Red clay', 'Green clay', 'Acrylic hard court'],
    ]),
  fact('us-denali-alaska', 'Geography', 'USA', 'Foundation', 'National Park Service', 'https://www.nps.gov/articles/denali-crp-summit-survey.htm',
    'North America’s highest peak stands in Alaska. Its summit is roughly 6,190 metres above sea level.', [
      ['In which US state is Denali, North America’s highest peak?', 'Alaska', 'Colorado', 'California', 'Washington'],
      ['Which state contains the highest mountain in North America?', 'Alaska', 'Montana', 'Wyoming', 'Oregon'],
    ]),
  fact('uk-austen-pride', 'Literature', 'UK', 'Foundation', 'Jane Austen’s House', 'https://janeaustens.house/jane-austen/novels/pride-and-prejudice/',
    'Jane Austen wrote Pride and Prejudice, the novel featuring Elizabeth Bennet and Mr Darcy.', [
      ['Who wrote Pride and Prejudice?', 'Jane Austen', 'Charlotte Brontë', 'Virginia Woolf', 'Mary Shelley'],
      ['Which novelist created Elizabeth Bennet and Mr Darcy in Pride and Prejudice?', 'Jane Austen', 'George Eliot', 'Emily Brontë', 'Elizabeth Gaskell'],
    ]),
  fact('us-apollo-first-landing', 'Science', 'USA', 'Foundation', 'NASA', 'https://www.nasa.gov/mission/apollo-11/',
    'Apollo 11 made the first crewed Moon landing in 1969. Neil Armstrong and Buzz Aldrin walked on the surface.', [
      ['Which NASA mission made the first crewed Moon landing?', 'Apollo 11', 'Apollo 8', 'Apollo 13', 'Apollo 17'],
      ['On which mission did Neil Armstrong and Buzz Aldrin walk on the Moon in 1969?', 'Apollo 11', 'Gemini 8', 'Apollo 10', 'Apollo 12'],
    ]),
  fact('us-artemis-ii-flyby', 'Current Affairs', 'USA', 'Challenge', 'NASA mission report',
    'https://www.nasa.gov/news-release/nasa-welcomes-record-setting-artemis-ii-moonfarers-back-to-earth/',
    'Artemis II flew four astronauts around the Moon and returned them to Earth on 10 April 2026. It was a flyby.', [
      ['Which NASA mission carried four astronauts around the Moon in April 2026?', 'Artemis II', 'Artemis I', 'Apollo 8', 'Apollo 11'],
      ['Which mission ended with the 10 April 2026 splashdown after a crewed lunar flyby?', 'Artemis II', 'Apollo 13', 'Gemini 12', 'Artemis I'],
    ], '2026-04-10'),
  fact('uk-glasgow-games-2026', 'Current Affairs', 'UK', 'Challenge', 'Commonwealth Sport',
    'https://www.commonwealthsport.com/commonwealth-games/glasgow-2026',
    'Glasgow, Scotland, hosted the 2026 Commonwealth Games from 23 July to 2 August.', [
      ['Which city hosted the 2026 Commonwealth Games?', 'Glasgow', 'Birmingham', 'Cardiff', 'Edinburgh'],
      ['Where in Scotland did the Commonwealth Games conclude on 2 August 2026?', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness'],
    ], '2026-08-02'),
  fact('us-declaration-adoption', 'History', 'USA', 'Challenge', 'U.S. National Archives',
    'https://www.archives.gov/milestone-documents/declaration-of-independence',
    'The Continental Congress adopted the Declaration of Independence on 4 July 1776. Most delegates signed the engrossed version on 2 August.', [
      ['When did the Continental Congress adopt the Declaration of Independence?', '4 July 1776', '2 July 1776', '2 August 1776', '17 September 1787'],
      ['Which date marks congressional adoption of the Declaration, the event commemorated by US Independence Day?', '4 July 1776', '2 August 1776', '3 September 1783', '17 September 1787'],
    ]),
  fact('us-1995-best-picture', 'Cinema', 'USA', 'Challenge', 'Academy of Motion Picture Arts and Sciences',
    'https://www.oscars.org/oscars/ceremonies/1995/F--J',
    'Forrest Gump won Best Picture at the 67th Academy Awards, held in 1995.', [
      ['Which film won Best Picture at the 1995 Oscars?', 'Forrest Gump', 'Pulp Fiction', 'Quiz Show', 'The Shawshank Redemption'],
      ['Which of these films took home the top film prize at the 67th Academy Awards?', 'Forrest Gump', 'Four Weddings and a Funeral', 'The Lion King', 'Speed'],
    ]),
  fact('uk-beatles-liverpool', 'Music', 'UK', 'Foundation', 'Rock & Roll Hall of Fame Library', 'https://library.rockhall.com/beatles',
    'The Beatles formed in Liverpool. The city is central to the story of the band’s early years.', [
      ['In which English city did the Beatles form?', 'Liverpool', 'Manchester', 'Birmingham', 'London'],
      ['Which city is home to the band that brought John, Paul, George and Ringo together?', 'Liverpool', 'Leeds', 'Bristol', 'Newcastle upon Tyne'],
    ]),
  fact('us-thanksgiving-november', 'Holidays & Traditions', 'USA', 'Foundation', 'United States Code',
    'https://www.govinfo.gov/content/pkg/USCODE-2023-title5/html/USCODE-2023-title5-partIII-subpartE-chap61-subchapI-sec6103.htm',
    'Federal law sets US Thanksgiving Day on the fourth Thursday of November. November can have five Thursdays.', [
      ['When is Thanksgiving Day in the United States?', 'The fourth Thursday in November', 'The first Thursday in November', 'The second Monday in October', 'The last Friday in November'],
      ['If November has five Thursdays, on which one does US Thanksgiving fall?', 'The fourth', 'The fifth', 'The first', 'The third'],
    ]),
  fact('uk-st-david-day', 'Holidays & Traditions', 'UK', 'Challenge', 'Visit Wales', 'https://www.visitwales.com/annual-holidays/st-davids-day',
    'Wales celebrates St David, its patron saint, on 1 March.', [
      ['When is St David’s Day in Wales?', '1 March', '17 March', '23 April', '30 November'],
      ['On what date do Welsh celebrations honour the country’s patron saint, St David?', '1 March', '1 May', '25 January', '31 October'],
    ]),
] satisfies readonly Fact[];
