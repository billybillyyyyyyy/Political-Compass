/*
 * Question bank.
 *
 * Design rules (every item is checked by test/bank.test.js):
 *  - One idea per statement. No "and", no double-barreled items.
 *  - Concrete enough that agreeing and disagreeing both mean something.
 *  - No valence items (things almost everyone agrees with).
 *  - Balanced keying: on every axis and in every tier, exactly half the items
 *    push one way when you agree and half push the other way. This cancels
 *    the "yes-saying" bias that skews agree/disagree tests.
 *  - Neutral tone. Each side of each axis gets statements written the way
 *    someone who holds that view would say it.
 *  - No country-specific names so the test works outside the US.
 *
 * Fields:
 *  id    stable identifier (used in share links; never renumber)
 *  axis  econ | auth | cult | glob
 *  dir   +1 means agreeing pushes toward the axis's "plus" pole,
 *        -1 means agreeing pushes toward the "minus" pole
 *  tier  1 = in the quick test, 2 = added in standard, 3 = added in full
 *  text  the statement
 *
 * Poles:
 *  econ  minus = Left (collective, redistributive)   plus = Right (market, private)
 *  auth  minus = Liberty (individual freedom)        plus = Authority (state power, order)
 *  cult  minus = Progressive                         plus = Traditional
 *  glob  minus = Global (internationalist)           plus = National
 */
(function (root) {
  var AXES = {
    econ: { name: 'Economic', minus: 'Left', plus: 'Right',
      blurb: 'How much the economy should be shaped by collective decisions (taxes, public ownership, regulation) versus left to markets and private ownership.' },
    auth: { name: 'Authority', minus: 'Libertarian', plus: 'Authoritarian',
      blurb: 'How much power the state should have over individuals: policing, surveillance, speech, personal choices, emergency powers.' },
    cult: { name: 'Cultural', minus: 'Progressive', plus: 'Traditional',
      blurb: 'Whether society should keep established moral norms, religion and family structures, or change them as values shift.' },
    glob: { name: 'World', minus: 'Global', plus: 'National',
      blurb: 'Whether your country should prioritise its own people, borders and sovereignty, or cooperate, trade and open up.' }
  };

  var Q = [];
  function add(id, axis, dir, tier, text) { Q.push({ id: id, axis: axis, dir: dir, tier: tier, text: text }); }

  /* ---------------- ECONOMIC ---------------- */
  // Tier 1
  add('e01', 'econ', -1, 1, 'Healthcare should be paid for by the government through taxes rather than by individuals or private insurance.');
  add('e02', 'econ', +1, 1, 'Private businesses generally run things better than the government does.');
  add('e03', 'econ', -1, 1, 'The minimum wage should be raised, even if some businesses say they would hire fewer people.');
  add('e04', 'econ', +1, 1, 'It is fine for some people to be much richer than others, as long as they earned it legally.');
  add('e05', 'econ', -1, 1, 'Large industries like energy, water and railways should be publicly owned.');
  add('e06', 'econ', +1, 1, 'Government welfare programs make too many people dependent on them.');
  // Tier 2
  add('e07', 'econ', -1, 2, 'Workers should have a legal right to seats on the boards of large companies.');
  add('e08', 'econ', +1, 2, 'Cutting business regulations does more for ordinary people than adding new ones.');
  add('e09', 'econ', -1, 2, 'Rent should be capped by law in cities where housing is expensive.');
  add('e10', 'econ', +1, 2, 'Inherited wealth should not be heavily taxed.');
  add('e11', 'econ', -1, 2, 'University or trade-school tuition should be free, paid for by taxes.');
  add('e12', 'econ', +1, 2, 'When the government runs a deficit, the answer is to cut spending, not raise taxes.');
  // Tier 3
  add('e13', 'econ', -1, 3, 'The government should guarantee a job or a basic income to anyone who cannot find work.');
  add('e14', 'econ', +1, 3, 'Unions have too much power in the workplace.');
  add('e15', 'econ', -1, 3, 'Big companies should be broken up when they dominate a market.');
  add('e16', 'econ', +1, 3, 'Public services like the postal service or public transit would be better if they were sold to private companies.');
  add('e17', 'econ', -1, 3, 'Wealth inequality is one of the biggest problems facing my country.');
  add('e18', 'econ', +1, 3, 'How much someone earns should be decided by the market, not by what the government thinks is fair.');
  add('e19', 'econ', -1, 3, 'Banks and financial companies need much stricter rules than they have now.');
  add('e20', 'econ', +1, 3, 'Corporate taxes should be lowered to attract investment.');

  /* ---------------- AUTHORITY ---------------- */
  // Tier 1
  add('a01', 'auth', +1, 1, 'The police should be able to stop and search people without a specific reason if it helps prevent crime.');
  add('a02', 'auth', -1, 1, 'Adults should be free to use recreational drugs as long as they do not harm anyone else.');
  add('a03', 'auth', +1, 1, 'The government should be able to monitor people’s calls and messages to prevent crime and terrorism.');
  add('a04', 'auth', -1, 1, 'People should be allowed to say offensive things in public without being punished by the law.');
  add('a05', 'auth', +1, 1, 'In a national emergency, the government should be able to suspend normal rights and rules.');
  add('a06', 'auth', -1, 1, 'Peaceful protests should be allowed even when they block roads or disrupt daily life.');
  // Tier 2
  add('a07', 'auth', +1, 2, 'Some ideas are so dangerous that the government should be able to ban them from being published.');
  add('a08', 'auth', -1, 2, 'The government should not be able to force anyone to have a medical treatment or vaccine.');
  add('a09', 'auth', +1, 2, 'Judges should give longer prison sentences, even for non-violent crimes, to keep order.');
  add('a10', 'auth', -1, 2, 'People should be able to use strong encryption that even the police cannot break.');
  add('a11', 'auth', +1, 2, 'Everyone should be required to carry a government ID and show it when asked by police.');
  add('a12', 'auth', -1, 2, 'Sex work between consenting adults should be legal.');
  // Tier 3
  add('a13', 'auth', +1, 3, 'The death penalty should be used for the worst crimes.');
  add('a14', 'auth', -1, 3, 'Insulting the national flag, anthem or leaders should never be a crime.');
  add('a15', 'auth', +1, 3, 'Military service should be mandatory for young adults.');
  add('a16', 'auth', -1, 3, 'The government should not track where people go or what they buy, even if it would help catch criminals.');
  add('a17', 'auth', +1, 3, 'A strong leader who can act without waiting for parliament or congress is sometimes what a country needs.');
  add('a18', 'auth', -1, 3, 'People should be able to refuse to give police the password to their phone.');
  add('a19', 'auth', +1, 3, 'The government should be able to shut down websites and social media accounts that spread false information.');
  add('a20', 'auth', -1, 3, 'Laws that exist only to protect people from themselves, like seatbelt or helmet laws, should be repealed.');

  /* ---------------- CULTURAL ---------------- */
  // Tier 1
  add('c01', 'cult', +1, 1, 'Abortion should be illegal in most or all cases.');
  add('c02', 'cult', -1, 1, 'Same-sex couples should have exactly the same marriage rights as anyone else.');
  add('c03', 'cult', +1, 1, 'Society works best when men and women have different roles in family life.');
  add('c04', 'cult', -1, 1, 'People should be able to legally change their gender on official documents.');
  add('c05', 'cult', +1, 1, 'Religious values should have a bigger role in public life than they do today.');
  add('c06', 'cult', -1, 1, 'Schools should teach children about different sexual orientations and gender identities.');
  // Tier 2
  add('c07', 'cult', +1, 2, 'Children do best when raised by a married mother and father.');
  add('c08', 'cult', -1, 2, 'A terminally ill adult should be able to get a doctor’s help to end their life.');
  add('c09', 'cult', +1, 2, 'Statues and monuments of historical figures should stay up even if those people held views we now reject.');
  add('c10', 'cult', -1, 2, 'Religion should have no influence on the laws of my country.');
  add('c11', 'cult', +1, 2, 'It is better for society if most people share the same basic moral values.');
  add('c12', 'cult', -1, 2, 'Having children outside marriage is just as acceptable as having them within marriage.');
  // Tier 3
  add('c13', 'cult', +1, 3, 'Public schools should be allowed to start the day with a prayer.');
  add('c14', 'cult', -1, 3, 'Transgender people should be able to use the bathrooms and changing rooms that match their gender identity.');
  add('c15', 'cult', +1, 3, 'Divorce should be harder to get than it is now.');
  add('c16', 'cult', -1, 3, 'Companies should actively work to hire more women and minorities into leadership roles.');
  add('c17', 'cult', +1, 3, 'Young people today should show more respect for their elders and for tradition.');
  add('c18', 'cult', -1, 3, 'Contraception should be free and easy to get for everyone, including teenagers.');
  add('c19', 'cult', +1, 3, 'Sex outside of marriage is morally wrong.');
  add('c20', 'cult', -1, 3, 'When scientific evidence and religious teaching conflict, the evidence should win.');

  /* ---------------- GLOBAL ---------------- */
  // Tier 1
  add('g01', 'glob', +1, 1, 'My country should let in fewer immigrants than it does now.');
  add('g02', 'glob', -1, 1, 'Trade with few barriers makes my country better off, even if some local industries lose out.');
  add('g03', 'glob', +1, 1, 'My country should put its own interests first, even when that upsets other countries.');
  add('g04', 'glob', -1, 1, 'My country should accept its fair share of refugees fleeing war or persecution.');
  add('g05', 'glob', +1, 1, 'Tariffs on imports are worth it to protect jobs at home.');
  add('g06', 'glob', -1, 1, 'International organisations like the United Nations should have more power to hold countries to their commitments.');
  // Tier 2
  add('g07', 'glob', +1, 2, 'Immigrants should be expected to adopt the language and customs of my country.');
  add('g08', 'glob', -1, 2, 'Rich countries have a duty to give aid to poorer countries.');
  add('g09', 'glob', +1, 2, 'My country should not sign international agreements that limit what it can decide for itself.');
  add('g10', 'glob', -1, 2, 'Countries should give up some independence to work together on problems like climate change or pandemics.');
  add('g11', 'glob', +1, 2, 'Foreign companies should not be allowed to buy important businesses or land in my country.');
  add('g12', 'glob', -1, 2, 'It should be much easier for people from other countries to come here and work legally.');
  // Tier 3
  add('g13', 'glob', +1, 3, 'Military spending should be increased to keep my country strong.');
  add('g14', 'glob', -1, 3, 'My country should take part in peacekeeping or humanitarian missions abroad even when its own interests are not at stake.');
  add('g15', 'glob', +1, 3, 'The culture of my country is worth protecting from outside influence.');
  add('g16', 'glob', -1, 3, 'People born anywhere in the world should have the same right to move here and work as I do.');
  add('g17', 'glob', +1, 3, 'My country should be able to use its military without needing approval from international bodies.');
  add('g18', 'glob', -1, 3, 'Being part of a regional union, like the European Union, is good for a country even if it means following shared rules.');
  add('g19', 'glob', +1, 3, 'Money spent on foreign aid would be better spent on people at home.');
  add('g20', 'glob', -1, 3, 'I feel like a citizen of the world as much as a citizen of my country.');

  var LENGTHS = {
    quick:    { key: 'quick',    label: 'Quick',    maxTier: 1, minutes: '4 min',  desc: 'A fast read. 6 statements per axis. Good enough to see which quadrant you land in.' },
    standard: { key: 'standard', label: 'Standard', maxTier: 2, minutes: '8 min',  desc: 'The recommended length. 12 statements per axis. Reliable placement on all four axes.' },
    full:     { key: 'full',     label: 'Full',     maxTier: 3, minutes: '14 min', desc: 'Every statement. 20 per axis. Best precision and the most stable result if you retake it.' }
  };

  var bank = { AXES: AXES, QUESTIONS: Q, LENGTHS: LENGTHS };
  root.PCBank = bank;
  if (typeof module !== 'undefined' && module.exports) module.exports = bank;
})(typeof window !== 'undefined' ? window : globalThis);
