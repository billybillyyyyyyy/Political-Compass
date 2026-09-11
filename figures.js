/*
 * Public figures with estimated positions on the four axes.
 *
 * These are editorial placements based on each person's public record
 * (votes, policies, stated positions), on the same -100..+100 scale as the
 * test. They are not test results; nobody here took the test. Treat them
 * as rough, argue with them, and send corrections.
 *
 * pos: [econ, auth, cult, world]
 *   econ  -100 Left ........ +100 Right
 *   auth  -100 Libertarian . +100 Authoritarian
 *   cult  -100 Progressive . +100 Traditional
 *   world -100 Global ...... +100 National
 * wiki: English Wikipedia page title, used only to fetch a portrait thumbnail.
 */
(function (root) {
  var F = [], cat = '';
  function add(id, name, role, pos, why, wiki) { F.push({ id: id, name: name, role: role, pos: pos, why: why, wiki: wiki, cat: cat }); }

  /* ---- United States ---- */
  cat = 'US politics';
  add('reagan',    'Ronald Reagan',            'US President 1981–89',            [70, 25, 55, 45],  'Tax cuts and deregulation, Cold War hawk, war on drugs, socially conservative coalition.', 'Ronald_Reagan');
  add('trump',     'Donald Trump',             'US President 2017–21, 2025–',      [35, 55, 50, 85],  'Tariffs and immigration restriction, strongman style, mixed on economics, nation first.', 'Donald_Trump');
  add('biden',     'Joe Biden',                'US President 2021–25',            [-30, 10, -35, -35], 'Union-friendly Democrat, expanded welfare, pro-alliance, socially liberal from an older generation.', 'Joe_Biden');
  add('obama',     'Barack Obama',             'US President 2009–17',            [-30, 10, -45, -50], 'Affordable Care Act, regulated markets, multilateralist, socially progressive, kept the surveillance state.', 'Barack_Obama');
  add('gwbush',    'George W. Bush',           'US President 2001–09',            [45, 55, 55, 30],  'Tax cuts, Patriot Act, Iraq war, socially conservative, but pro-trade and pro-immigration reform.', 'George_W._Bush');
  add('bclinton',  'Bill Clinton',             'US President 1993–2001',          [0, 15, -25, -55], 'Third Way: welfare reform, NAFTA, the 1994 crime bill, socially moderate-to-liberal.', 'Bill_Clinton');
  add('nixon',     'Richard Nixon',            'US President 1969–74',            [-10, 55, 40, 20], 'Wage and price controls, founded the EPA, law and order, drug war, realist foreign policy.', 'Richard_Nixon');
  add('lbj',       'Lyndon B. Johnson',        'US President 1963–69',            [-55, 30, -10, -10], 'Great Society and civil rights at home, escalation in Vietnam abroad.', 'Lyndon_B._Johnson');
  add('jfk',       'John F. Kennedy',          'US President 1961–63',            [-20, 20, 15, -20], 'Tax cuts and spending, Cold War liberal, cautious on civil rights until 1963.', 'John_F._Kennedy');
  add('fdr',       'Franklin D. Roosevelt',    'US President 1933–45',            [-65, 35, 10, -30], 'New Deal and a much bigger federal state; wartime internment; led the move to internationalism.', 'Franklin_D._Roosevelt');
  add('sanders',   'Bernie Sanders',           'US Senator, Vermont',             [-75, -15, -55, -20], 'Democratic socialist: Medicare for All, pro-union, skeptical of free trade deals.', 'Bernie_Sanders');
  add('aoc',       'Alexandria Ocasio-Cortez', 'US Representative, New York',     [-75, -30, -75, -50], 'Green New Deal, democratic socialist, strongly progressive on culture, wants ICE abolished.', 'Alexandria_Ocasio-Cortez');
  add('warren',    'Elizabeth Warren',         'US Senator, Massachusetts',       [-60, 0, -55, -20], 'Wealth tax, break up big tech, consumer protection, progressive but a self-described capitalist.', 'Elizabeth_Warren');
  add('harris',    'Kamala Harris',            'US Vice President 2021–25',       [-30, 5, -50, -40], 'Mainstream Democrat, former prosecutor, socially progressive, pro-alliance.', 'Kamala_Harris');
  add('hclinton',  'Hillary Clinton',          'US Secretary of State 2009–13',   [-20, 15, -40, -45], 'Centre-left, hawkish on foreign policy, socially liberal, pro-trade.', 'Hillary_Clinton');
  add('newsom',    'Gavin Newsom',             'Governor of California',          [-30, 10, -60, -40], 'Progressive on culture, big-state Democrat, business-friendly streak.', 'Gavin_Newsom');
  add('buttigieg', 'Pete Buttigieg',           'US Secretary of Transportation 2021–25', [-25, 0, -55, -45], 'Technocratic centre-left, socially progressive, internationalist.', 'Pete_Buttigieg');
  add('romney',    'Mitt Romney',              'US Senator, Utah 2019–25',        [55, 15, 40, -20], 'Business conservative, institutionalist, internationalist, moderate on culture in practice.', 'Mitt_Romney');
  add('randpaul',  'Rand Paul',                'US Senator, Kentucky',            [80, -70, 25, 50], 'Libertarian Republican: anti-surveillance, non-interventionist, deep spending cuts.', 'Rand_Paul');
  add('desantis',  'Ron DeSantis',             'Governor of Florida',             [50, 50, 65, 60], 'Culture-war conservative willing to use state power against companies and schools; tough on immigration.', 'Ron_DeSantis');
  add('vance',     'JD Vance',                 'US Vice President',               [10, 45, 65, 80], 'National conservative: skeptical of free trade, pro-family policy, immigration restrictionist.', 'JD_Vance');
  add('cruz',      'Ted Cruz',                 'US Senator, Texas',               [70, 40, 70, 50], 'Small-government on the economy, socially conservative, hawkish, tough on the border.', 'Ted_Cruz');
  add('haley',     'Nikki Haley',              'US Ambassador to the UN 2017–18', [60, 25, 40, -10], 'Business conservative and foreign-policy hawk who backs alliances and trade.', 'Nikki_Haley');
  add('mtg',       'Marjorie Taylor Greene',   'US Representative, Georgia',      [30, 55, 75, 90], 'Populist right: America First, culturally traditional, hostile to foreign aid and alliances.', 'Marjorie_Taylor_Greene');
  add('ronpaul',   'Ron Paul',                 'US Representative, Texas 1976–2013', [85, -80, 35, 55], 'Libertarian: end the Fed, non-interventionist, opposed the Patriot Act and drug war, socially conservative personally.', 'Ron_Paul');
  add('gjohnson',  'Gary Johnson',             'Libertarian presidential nominee 2012, 2016', [80, -75, -20, -30], 'Cut spending, legalise cannabis, open trade, non-interventionist, socially liberal.', 'Gary_Johnson');
  cat = 'Thinkers';
  add('friedman',  'Milton Friedman',          'Economist',                       [95, -60, 10, -60], 'Free markets above all, opposed the draft and the drug war, pro-free trade.', 'Milton_Friedman');
  add('chomsky',   'Noam Chomsky',             'Linguist and activist',           [-85, -80, -60, -70], 'Anarcho-syndicalist, anti-imperialist, critic of state and corporate power alike.', 'Noam_Chomsky');
  add('aynrand',   'Ayn Rand',                 'Novelist and philosopher',        [100, -70, -20, -20], 'Laissez-faire capitalism, radical individualism, atheist, opposed altruism as a duty.', 'Ayn_Rand');
  add('mlk',       'Martin Luther King Jr.',   'Civil rights leader',             [-60, -40, 0, -50], 'Democratic socialist in economics, nonviolent resistance to unjust law, Christian minister.', 'Martin_Luther_King_Jr.');

  /* ---- United Kingdom ---- */
  cat = 'World leaders';
  add('thatcher',  'Margaret Thatcher',        'UK Prime Minister 1979–90',       [80, 40, 50, 40], 'Privatisation, broke the unions, law and order, Euroskeptic, Atlanticist.', 'Margaret_Thatcher');
  add('churchill', 'Winston Churchill',        'UK Prime Minister 1940–45, 1951–55', [35, 40, 55, 30], 'Imperialist Tory who backed early welfare reforms; wartime state power; European unity from outside.', 'Winston_Churchill');
  add('blair',     'Tony Blair',               'UK Prime Minister 1997–2007',     [10, 30, -35, -60], 'Third Way: markets plus public spending, Iraq war, ID cards and anti-terror laws, pro-EU.', 'Tony_Blair');
  add('corbyn',    'Jeremy Corbyn',            'UK Labour leader 2015–20',        [-80, -25, -55, -35], 'Socialist: nationalisation, anti-war, anti-nuclear, pro-Palestinian.', 'Jeremy_Corbyn');
  add('starmer',   'Keir Starmer',             'UK Prime Minister',               [-20, 25, -30, -25], 'Managerial centre-left, tough on protest and crime, cautious on immigration.', 'Keir_Starmer');
  add('bjohnson',  'Boris Johnson',            'UK Prime Minister 2019–22',       [30, 20, 15, 55], 'Brexit, high-spending Tory, socially liberal by Tory standards.', 'Boris_Johnson');
  add('farage',    'Nigel Farage',             'Leader of Reform UK',             [55, 30, 55, 90], 'Brexit, immigration restriction, low taxes, hostile to net zero.', 'Nigel_Farage');

  /* ---- Europe ---- */
  add('merkel',    'Angela Merkel',            'German Chancellor 2005–21',       [30, 20, 25, -45], 'Christian Democrat, fiscal discipline, opened borders to refugees in 2015, pro-EU.', 'Angela_Merkel');
  add('scholz',    'Olaf Scholz',              'German Chancellor 2021–25',       [-20, 15, -30, -50], 'Social Democrat, pro-EU, cautious and technocratic.', 'Olaf_Scholz');
  add('macron',    'Emmanuel Macron',          'French President',                [40, 30, -30, -70], 'Pro-market reforms, strongly pro-EU, technocratic, tough on protests.', 'Emmanuel_Macron');
  add('lepen',     'Marine Le Pen',            'French National Rally leader',    [-10, 50, 50, 90], 'Protectionist, anti-immigration, welfare for citizens first, hostile to the EU.', 'Marine_Le_Pen');
  add('meloni',    'Giorgia Meloni',           'Italian Prime Minister',          [25, 45, 70, 70], 'National conservative: family, faith, borders; pragmatic on the EU and NATO in office.', 'Giorgia_Meloni');
  add('sanchez',   'Pedro Sánchez',            'Spanish Prime Minister',          [-40, 10, -60, -50], 'Social democrat, progressive on culture, pro-EU.', 'Pedro_S%C3%A1nchez');
  add('orban',     'Viktor Orbán',             'Hungarian Prime Minister',        [10, 70, 75, 85], 'Illiberal democracy, state-directed economy, family policy, anti-immigration, anti-Brussels.', 'Viktor_Orb%C3%A1n');
  add('gorbachev', 'Mikhail Gorbachev',        'Soviet leader 1985–91',           [-30, 0, 0, -60], 'Reformed a planned economy, loosened censorship, ended the Cold War.', 'Mikhail_Gorbachev');
  add('putin',     'Vladimir Putin',           'Russian President',               [10, 95, 65, 85], 'Authoritarian state capitalism, traditional values, nationalism, war in Ukraine.', 'Vladimir_Putin');
  add('zelensky',  'Volodymyr Zelensky',       'Ukrainian President',             [20, 40, -10, -30], 'Wartime leader under martial law, pro-EU and NATO, anti-corruption liberal before the war.', 'Volodymyr_Zelenskyy');

  /* ---- Americas ---- */
  add('trudeau',   'Justin Trudeau',           'Canadian Prime Minister 2015–25', [-25, 15, -65, -55], 'Progressive liberal: carbon tax, cannabis legalisation, high immigration.', 'Justin_Trudeau');
  add('poilievre', 'Pierre Poilievre',         'Canadian Conservative leader',    [65, 5, 30, 25], 'Small-government populist, anti-carbon-tax, civil-liberties streak, cautious on culture.', 'Pierre_Poilievre');
  add('milei',     'Javier Milei',             'Argentine President',             [95, -50, 40, 20], 'Anarcho-capitalist rhetoric, deep spending cuts, socially conservative on abortion.', 'Javier_Milei');
  add('lula',      'Lula da Silva',            'Brazilian President',             [-55, 10, -25, -30], 'Left populist: welfare expansion, pro-union, Global South diplomacy.', 'Luiz_In%C3%A1cio_Lula_da_Silva');
  add('bolsonaro', 'Jair Bolsonaro',           'Brazilian President 2019–22',     [40, 60, 80, 55], 'Socially conservative populist, pro-gun, pro-military, market-leaning economics.', 'Jair_Bolsonaro');
  add('pinochet',  'Augusto Pinochet',         'Chilean dictator 1973–90',        [75, 95, 70, 50], 'Free-market economics imposed by a military dictatorship.', 'Augusto_Pinochet');
  add('che',       'Che Guevara',              'Revolutionary',                   [-90, 70, 10, -60], 'Marxist-Leninist revolutionary, armed struggle, internationalist.', 'Che_Guevara');

  /* ---- Asia, Africa, Middle East ---- */
  add('xi',        'Xi Jinping',               'Chinese President',               [-40, 95, 45, 75], 'Party-state control of the economy, mass surveillance, nationalism.', 'Xi_Jinping');
  add('deng',      'Deng Xiaoping',            'Chinese leader 1978–89',          [10, 80, 20, 20], 'Market reforms under one-party rule; Tiananmen.', 'Deng_Xiaoping');
  add('modi',      'Narendra Modi',            'Indian Prime Minister',           [30, 60, 65, 75], 'Hindu nationalism, pro-business reforms, centralised power.', 'Narendra_Modi');
  add('gandhi',    'Mahatma Gandhi',           'Indian independence leader',      [-40, -60, 40, -20], 'Village self-rule, nonviolence, religious traditionalism, anti-imperialism.', 'Mahatma_Gandhi');
  add('lky',       'Lee Kuan Yew',             'Singapore Prime Minister 1959–90', [40, 85, 55, 10], 'Free markets with a paternalist, tightly controlled state.', 'Lee_Kuan_Yew');
  add('mandela',   'Nelson Mandela',           'South African President 1994–99', [-45, -20, -30, -40], 'Reconciliation, mixed economy, a rights-based constitution.', 'Nelson_Mandela');
  add('netanyahu', 'Benjamin Netanyahu',       'Israeli Prime Minister',          [50, 55, 45, 60], 'Free-market reformer, security hawk, nationalist coalition.', 'Benjamin_Netanyahu');
  add('ardern',    'Jacinda Ardern',           'NZ Prime Minister 2017–23',       [-40, 15, -60, -50], 'Social democrat, gun ban after Christchurch, strict Covid lockdowns.', 'Jacinda_Ardern');

  /* ---- Commentators and media ---- */
  cat = 'Commentators';
  add('kirk',      'Charlie Kirk',             'Turning Point USA founder (1993–2025)', [75, 40, 80, 70], 'Free-market conservative activist, Christian in public life, pro-Trump, immigration restrictionist.', 'Charlie_Kirk');
  add('piker',     'Hasan Piker',              'Streamer and commentator',        [-85, -45, -70, -65], 'Socialist: abolish billionaires, anti-police, anti-imperialist, pro-Palestinian.', 'Hasan_Piker');
  add('fuentes',   'Nick Fuentes',             'Streamer, America First',         [-10, 80, 95, 95], 'White nationalist and Catholic integralist; immigration moratorium, economically populist, anti-interventionist.', 'Nick_Fuentes');
  add('withers',   'Dean Withers',             'Streamer and debater',            [-55, -35, -75, -45], 'Progressive Gen Z debater: pro-choice, LGBT rights, gun control, Medicare for All.', 'Dean_Withers');
  add('shapiro',   'Ben Shapiro',              'Daily Wire co-founder',           [80, 30, 75, 30], 'Free-market conservative, Orthodox Jewish social conservative, foreign-policy hawk, pro-Israel.', 'Ben_Shapiro');
  add('knowles',   'Michael Knowles',          'Daily Wire host',                 [60, 55, 95, 55], 'Catholic traditionalist who wants the state to enforce moral norms; integralist-leaning.', 'Michael_Knowles_(political_commentator)');
  add('walsh',     'Matt Walsh',               'Daily Wire host',                 [55, 55, 95, 60], 'Social conservative focused on gender and family; comfortable using law to enforce it.', 'Matt_Walsh_(political_commentator)');
  add('dimartino', 'Daniel Di Martino',        'Economist, Manhattan Institute',  [85, 5, 45, -30], 'Venezuelan-born anti-socialist, free markets, supports high-skilled and legal immigration.', 'Daniel_Di_Martino');
  add('carlson',   'Tucker Carlson',           'Broadcaster',                     [10, 40, 70, 90], 'Populist nationalist: anti-immigration, anti-interventionist, skeptical of free markets and big business.', 'Tucker_Carlson');
  add('owens',     'Candace Owens',            'Commentator',                     [50, 50, 85, 75], 'Social conservative, anti-feminist, anti-interventionist, deeply skeptical of institutions.', 'Candace_Owens');
  add('mkelly',    'Megyn Kelly',              'Broadcaster',                     [55, 35, 55, 45], 'Conservative-leaning independent, tough on crime and gender activism, hawkish on security.', 'Megyn_Kelly');
  add('rogan',     'Joe Rogan',                'Podcaster',                       [40, -55, 10, 30], 'Libertarian-leaning: legalise drugs, pro-gun, distrusts institutions, drifted right since 2020.', 'Joe_Rogan');
  add('peterson',  'Jordan Peterson',          'Psychologist and author',         [65, 10, 70, 20], 'Free markets, opposed compelled speech laws, traditional roles and hierarchy, order over chaos.', 'Jordan_Peterson');
  add('destiny',   'Destiny (Steven Bonnell)', 'Streamer and debater',            [10, 20, -60, -60], 'Liberal institutionalist: pro-market social democrat, socially liberal, defends alliances and trade.', 'Destiny_(streamer)');
  add('vaush',     'Vaush',                    'Streamer',                        [-85, -55, -80, -70], 'Libertarian socialist, anti-police, strongly progressive on culture.', 'Vaush');
  add('bannon',    'Steve Bannon',             'Strategist and broadcaster',      [-20, 60, 70, 95], 'Economic nationalism, anti-elite, anti-China, tariffs, deportations.', 'Steve_Bannon');
  add('musk',      'Elon Musk',                'Businessman',                     [70, 30, 20, 40], 'Anti-regulation, cut government, anti-“woke”, pro-Trump, but pro-skilled-immigration.', 'Elon_Musk');
  add('ramaswamy', 'Vivek Ramaswamy',          'Businessman and politician',      [80, 25, 55, 55], 'Free market, America First, anti-DEI, shut down federal agencies.', 'Vivek_Ramaswamy');
  add('hannity',   'Sean Hannity',             'Broadcaster',                     [70, 50, 70, 60], 'Partisan conservative: law and order, hawkish, low taxes.', 'Sean_Hannity');
  add('maddow',    'Rachel Maddow',            'Broadcaster',                     [-40, 5, -60, -50], 'Progressive liberal, institutionalist, pro-alliance.', 'Rachel_Maddow');
  add('stewart',   'Jon Stewart',              'Comedian and host',               [-45, -30, -50, -30], 'Liberal populist, anti-war, critical of both parties and of corporate money.', 'Jon_Stewart');
  add('greenwald', 'Glenn Greenwald',          'Journalist',                      [-40, -85, -30, -40], 'Civil libertarian: anti-surveillance, anti-war, free speech absolutist, culturally heterodox.', 'Glenn_Greenwald');
  add('maher',     'Bill Maher',               'Comedian and host',               [15, -30, 0, -10], 'Libertarian-ish liberal: atheist, anti-“woke”, pro-Israel, legalise drugs.', 'Bill_Maher');
  add('yang',      'Andrew Yang',              'Entrepreneur and politician',     [-20, -20, -40, -30], 'Universal basic income, technocratic, moderate on culture, founded the Forward Party.', 'Andrew_Yang');
  add('uygur',     'Cenk Uygur',               'The Young Turks founder',         [-60, -20, -55, -30], 'Progressive populist: Medicare for All, get money out of politics.', 'Cenk_Uygur');
  add('mamdani',   'Zohran Mamdani',           'Mayor of New York City',          [-90, -35, -70, -55], 'DSA socialist who said in 2021 “the end goal is seizing the means of production”; rent freeze, city-owned groceries, free buses; civil libertarian on policing.', 'Zohran_Mamdani');
  add('buchanan',  'Pat Buchanan',             'Commentator, presidential candidate', [-5, 45, 85, 90], 'Paleoconservative: protectionism, immigration restriction, traditionalism, non-interventionism.', 'Pat_Buchanan');
  add('goldwater', 'Barry Goldwater',          'US Senator, Arizona; 1964 nominee', [85, -40, 30, 40], 'Libertarian conservative; later defended gay rights and attacked the religious right.', 'Barry_Goldwater');
  add('nader',     'Ralph Nader',              'Consumer advocate, Green candidate', [-65, -30, -40, 20], 'Consumer protection, anti-corporate, anti-war, skeptical of free trade deals.', 'Ralph_Nader');

  /* ---- Thinkers ---- */
  cat = 'Thinkers';
  add('marx',      'Karl Marx',                'Philosopher and economist',       [-100, 30, -40, -70], 'Abolish private capital; workers’ state as a transition; workers of the world unite.', 'Karl_Marx');

  var api = { FIGURES: F };
  root.PCFigures = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
