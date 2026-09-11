/*
 * Scoring. Everything here is deliberately simple and public.
 *
 * Answers: value in {-2,-1,0,1,2} (strongly disagree .. strongly agree),
 *          or null for "skip". `important: true` gives the item 1.5x weight.
 *
 * Per axis:   score = sum(dir * value * weight) / sum(2 * weight) * 100
 *             over answered items only. Range -100..+100. 0 means your
 *             answers balanced out, not "moderate for your country".
 *
 * No hidden offsets. No item counts on more than one axis.
 */
(function (root) {
  var bank = root.PCBank || (typeof require !== 'undefined' ? require('./questions.js') : null);
  var AXES = bank.AXES, QUESTIONS = bank.QUESTIONS, LENGTHS = bank.LENGTHS;
  var AXIS_KEYS = ['econ', 'auth', 'cult', 'glob'];
  var IMPORTANT_WEIGHT = 1.5;

  function itemsForLength(lengthKey) {
    var maxTier = LENGTHS[lengthKey].maxTier;
    return QUESTIONS.filter(function (q) { return q.tier <= maxTier; });
  }

  /* answers: { [id]: { value: number|null, important: boolean } } */
  function score(answers) {
    var out = { axes: {}, answered: 0, skipped: 0, acquiescence: 0 };
    var rawSum = 0, rawN = 0;
    AXIS_KEYS.forEach(function (ax) {
      var num = 0, den = 0, n = 0;
      QUESTIONS.forEach(function (q) {
        if (q.axis !== ax) return;
        var a = answers[q.id];
        if (!a) return;
        if (a.value === null || a.value === undefined) { out.skipped++; return; }
        var w = a.important ? IMPORTANT_WEIGHT : 1;
        num += q.dir * a.value * w;
        den += 2 * w;
        n++;
        rawSum += a.value; rawN++;
      });
      out.answered += n;
      out.axes[ax] = {
        key: ax,
        name: AXES[ax].name,
        n: n,
        score: den > 0 ? Math.round((num / den) * 1000) / 10 : null,
        enough: n >= 3
      };
    });
    // With balanced keying, a consistent respondent of any ideology averages
    // near 0 here. A large value means yes-saying or no-saying.
    out.acquiescence = rawN ? Math.round((rawSum / rawN) * 100) / 100 : 0;
    return out;
  }

  /* Plain-language band for a signed score. */
  function band(ax, s) {
    if (s === null) return { label: 'Not enough answers', strength: 0, side: null };
    var a = Math.abs(s);
    var pole = s < 0 ? AXES[ax].minus : AXES[ax].plus;
    if (a < 10) return { label: 'Centre', strength: 0, side: null };
    if (a < 30) return { label: 'Leans ' + pole, strength: 1, side: pole };
    if (a < 60) return { label: pole, strength: 2, side: pole };
    return { label: 'Strongly ' + pole, strength: 3, side: pole };
  }

  function quadrant(econ, auth) {
    if (econ === null || auth === null) return 'Incomplete';
    var e = econ < 0 ? 'Left' : 'Right';
    var a = auth < 0 ? 'Libertarian' : 'Authoritarian';
    if (Math.abs(econ) < 10 && Math.abs(auth) < 10) return 'Centre';
    return a + ' ' + e;
  }

  /*
   * Closest recognisable positions. Coordinates are rough, argued-over
   * placements, not measurements. The result page says so.
   * [econ, auth, cult, glob]
   */
  var LABELS = [
    { name: 'Anarchist',                 pos: [-90, -95, -70, -70], note: 'No state, no bosses. Collective ownership, radical personal freedom, no borders.' },
    { name: 'Left-Libertarian / Green',  pos: [-55, -70, -70, -60], note: 'Redistribution and public services, but deep suspicion of police and surveillance. Socially open, internationalist.' },
    { name: 'Democratic Socialist',      pos: [-75, -30, -60, -50], note: 'Public ownership of major industries and strong welfare, won through elections. Socially progressive.' },
    { name: 'Social Democrat',           pos: [-50, -20, -50, -40], note: 'Market economy with high taxes, strong unions and a big welfare state. Mainstream centre-left in Europe.' },
    { name: 'Progressive Liberal',       pos: [-25, -40, -70, -60], note: 'Regulated capitalism, civil liberties, strong emphasis on social change and minority rights.' },
    { name: 'State Socialist',           pos: [-85, 60, -20, -30], note: 'Centrally planned economy run by a strong state. Little tolerance for dissent.' },
    { name: 'Nationalist Left',          pos: [-60, 20, 30, 70],  note: 'Economic protection for workers at home, tough on immigration and trade, culturally moderate to traditional.' },
    { name: 'Centrist',                  pos: [0, 0, 0, 0],       note: 'Balanced answers across the board, or strong views that cancel out. Look at the individual axes.' },
    { name: 'Market Liberal',            pos: [55, -10, -40, -70], note: 'Free trade, open immigration, light regulation, socially liberal. Often called "neoliberal".' },
    { name: 'Classical Liberal',         pos: [55, -60, -30, -50], note: 'Small government in both the economy and private life. Rule of law, free speech, free trade.' },
    { name: 'Libertarian',               pos: [75, -85, -20, -30], note: 'Minimal state. Property rights and personal freedom above nearly everything else.' },
    { name: 'Christian Democrat',        pos: [15, 20, 55, -20],  note: 'Traditional values with a social conscience. Moderate on the economy, comfortable with the state, pro-cooperation.' },
    { name: 'Moderate Conservative',     pos: [40, 15, 45, 30],   note: 'Lower taxes, law and order, respect for tradition, cautious about rapid change.' },
    { name: 'Paternalist Conservative',  pos: [-20, 55, 55, 40],  note: 'A strong state that looks after people and enforces shared morals. Economically interventionist.' },
    { name: 'National Conservative',     pos: [30, 50, 70, 75],   note: 'Sovereignty, borders and national culture first. Traditional on social questions, tough on crime.' },
    { name: 'Populist Right',            pos: [10, 45, 50, 80],   note: 'Anti-immigration, anti-elite, protectionist. Less interested in free markets than in national interest.' },
    { name: 'Authoritarian Nationalist', pos: [20, 85, 60, 85],   note: 'Order, strength and national unity above individual rights. The state directs both economy and culture.' }
  ];

  function closestLabels(result, k) {
    var vec = AXIS_KEYS.map(function (ax) { return result.axes[ax].score; });
    if (vec.some(function (v) { return v === null; })) return [];
    var scored = LABELS.map(function (l) {
      var d = 0;
      for (var i = 0; i < 4; i++) d += Math.pow(vec[i] - l.pos[i], 2);
      return { name: l.name, note: l.note, distance: Math.round(Math.sqrt(d)) };
    });
    scored.sort(function (a, b) { return a.distance - b.distance; });
    return scored.slice(0, k || 3);
  }

  /* ---- share-link encoding ----
   * One character per item in QUESTIONS order.
   *  '-' not part of this test length
   *  's' skipped
   *  '0'..'4' value -2..+2
   *  '5'..'9' value -2..+2 marked important
   */
  function encode(lengthKey, answers) {
    return QUESTIONS.map(function (q) {
      var a = answers[q.id];
      if (!a) return '-';
      if (a.value === null || a.value === undefined) return 's';
      var idx = (a.value + 2) + (a.important ? 5 : 0);
      return String(idx);
    }).join('');
  }

  function decode(str) {
    if (typeof str !== 'string' || str.length !== QUESTIONS.length) return null;
    var answers = {};
    for (var i = 0; i < str.length; i++) {
      var ch = str[i], q = QUESTIONS[i];
      if (ch === '-') continue;
      if (ch === 's') { answers[q.id] = { value: null, important: false }; continue; }
      var idx = parseInt(ch, 10);
      if (isNaN(idx) || idx < 0 || idx > 9) return null;
      answers[q.id] = { value: (idx % 5) - 2, important: idx >= 5 };
    }
    return answers;
  }

  var api = {
    AXIS_KEYS: AXIS_KEYS, IMPORTANT_WEIGHT: IMPORTANT_WEIGHT, LABELS: LABELS,
    itemsForLength: itemsForLength, score: score, band: band, quadrant: quadrant,
    closestLabels: closestLabels, encode: encode, decode: decode
  };
  root.PCScoring = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
