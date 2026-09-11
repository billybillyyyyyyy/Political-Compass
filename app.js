(function () {
  var B = window.PCBank, S = window.PCScoring;
  var AXES = B.AXES, LENGTHS = B.LENGTHS, AXIS_KEYS = S.AXIS_KEYS;
  var $ = function (id) { return document.getElementById(id); };

  var state = { length: null, order: [], i: 0, answers: {} };

  /* ---------------- routing ---------------- */
  function show(view) {
    ['home', 'test', 'results', 'method'].forEach(function (v) {
      $('view-' + v).classList.toggle('hidden', v !== view);
    });
    window.scrollTo(0, 0);
  }
  function route() {
    var h = location.hash || '';
    if (h === '#method') { renderMethod(); show('method'); return; }
    if (h.indexOf('#r?') === 0) {
      var p = new URLSearchParams(h.slice(3));
      var t = p.get('t'), a = S.decode(p.get('a') || '');
      if (LENGTHS[t] && a) { state.length = t; state.answers = a; renderResults(); show('results'); return; }
    }
    show('home');
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-nav]');
    if (!el) return;
    e.preventDefault();
    var nav = el.getAttribute('data-nav');
    if (nav === 'home') { location.hash = ''; show('home'); }
    else if (nav === 'method') { location.hash = '#method'; }
  });
  window.addEventListener('hashchange', route);

  /* ---------------- home ---------------- */
  function renderHome() {
    var box = $('lengths'); box.innerHTML = '';
    Object.keys(LENGTHS).forEach(function (k) {
      var L = LENGTHS[k];
      var n = S.itemsForLength(k).length;
      var b = document.createElement('button');
      b.className = 'length' + (k === 'standard' ? ' rec' : '');
      b.innerHTML = '<div class="n">' + n + ' <span class="muted small">statements</span></div>' +
        '<div class="t">' + L.label + ' <span class="muted">· about ' + L.minutes + '</span>' +
        (k === 'standard' ? '<span class="badge">Recommended</span>' : '') + '</div>' +
        '<div class="d">' + L.desc + '</div>';
      b.addEventListener('click', function () { startTest(k); });
      box.appendChild(b);
    });
  }

  /* ---------------- test ---------------- */
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  /* Shuffle within each axis, then deal round-robin so no axis clumps. */
  function buildOrder(lengthKey) {
    var items = S.itemsForLength(lengthKey);
    var byAxis = {};
    AXIS_KEYS.forEach(function (ax) { byAxis[ax] = shuffle(items.filter(function (q) { return q.axis === ax; })); });
    var order = [], axes = shuffle(AXIS_KEYS.slice()), n = items.length / AXIS_KEYS.length;
    for (var r = 0; r < n; r++) axes.forEach(function (ax) { order.push(byAxis[ax][r]); });
    return order;
  }
  function startTest(lengthKey) {
    state.length = lengthKey; state.order = buildOrder(lengthKey); state.i = 0; state.answers = {};
    history.replaceState(null, '', location.pathname);
    show('test'); renderQuestion();
  }
  function renderQuestion() {
    var q = state.order[state.i], n = state.order.length;
    $('qcount').textContent = (state.i + 1) + ' of ' + n;
    $('qaxis').textContent = AXES[q.axis].name;
    $('qprog').style.width = (state.i / n * 100) + '%';
    $('qtext').textContent = q.text;
    var a = state.answers[q.id];
    Array.prototype.forEach.call($('scale').querySelectorAll('button'), function (b) {
      b.classList.toggle('sel', !!a && a.value !== null && String(a.value) === b.getAttribute('data-v'));
    });
    $('qimp').checked = !!(a && a.important);
    $('qback').disabled = state.i === 0;
  }
  function answer(value) {
    var q = state.order[state.i];
    state.answers[q.id] = { value: value, important: $('qimp').checked };
    if (state.i + 1 >= state.order.length) { finish(); return; }
    state.i++; renderQuestion();
  }
  function finish() {
    var enc = S.encode(state.length, state.answers);
    location.hash = '#r?t=' + state.length + '&a=' + enc;   // triggers route -> renderResults
  }
  $('scale').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-v]'); if (!b) return;
    answer(parseInt(b.getAttribute('data-v'), 10));
  });
  $('qskip').addEventListener('click', function () { answer(null); });
  $('qback').addEventListener('click', function () { if (state.i > 0) { state.i--; renderQuestion(); } });
  document.addEventListener('keydown', function (e) {
    if ($('view-test').classList.contains('hidden')) return;
    if (e.target && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') return;
    if (e.key >= '1' && e.key <= '5') { answer(parseInt(e.key, 10) - 3); e.preventDefault(); }
    else if (e.key === 's' || e.key === 'S') { answer(null); e.preventDefault(); }
    else if (e.key === 'm' || e.key === 'M') { $('qimp').checked = !$('qimp').checked; e.preventDefault(); }
    else if (e.key === 'Backspace') { if (state.i > 0) { state.i--; renderQuestion(); } e.preventDefault(); }
  });

  /* ---------------- results ---------------- */
  var COLORS = { econ: ['--left', '--right'], auth: ['--lib', '--auth'], cult: ['--prog', '--trad'], glob: ['--glob', '--nat'] };
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function renderResults() {
    var res = S.score(state.answers);
    var L = LENGTHS[state.length];
    $('rlen').textContent = L.label + ' test · ' + res.answered + ' answered' + (res.skipped ? ', ' + res.skipped + ' skipped' : '');
    var econ = res.axes.econ.score, auth = res.axes.auth.score;
    $('rquad').textContent = S.quadrant(econ, auth);

    var notes = [];
    if (Math.abs(res.acquiescence) >= 0.8) {
      notes.push('Your average raw answer was ' + (res.acquiescence > 0 ? '+' : '') + res.acquiescence +
        ' (on a -2 to +2 scale). You ' + (res.acquiescence > 0 ? 'agreed' : 'disagreed') +
        ' with most statements regardless of which way they pointed. The balanced design cancels most of that out, but treat the result with some care.');
    }
    AXIS_KEYS.forEach(function (ax) {
      if (!res.axes[ax].enough) notes.push('Not enough answers on the ' + AXES[ax].name + ' axis to measure it. Skips are left out of the score.');
    });
    $('rnotice').innerHTML = notes.map(function (n) { return '<div class="notice small">' + esc(n) + '</div>'; }).join('');

    drawCompass(econ, auth);

    var box = $('raxes'); box.innerHTML = '';
    AXIS_KEYS.forEach(function (ax) {
      var r = res.axes[ax], b = S.band(ax, r.score), A = AXES[ax];
      var pct = r.score === null ? 50 : (r.score + 100) / 2;
      var color = cssVar(r.score < 0 ? COLORS[ax][0] : COLORS[ax][1]);
      var fillLeft = r.score === null ? 50 : Math.min(50, pct), fillW = r.score === null ? 0 : Math.abs(pct - 50);
      var d = document.createElement('div'); d.className = 'axis';
      d.innerHTML = '<div class="lbl"><span>' + esc(A.minus) + '</span><span>' + esc(A.name) + '</span><span>' + esc(A.plus) + '</span></div>' +
        '<div class="bar"><div class="mid"></div><div class="fill" style="left:' + fillLeft + '%;width:' + fillW + '%;background:' + color + '"></div>' +
        (r.score === null ? '' : '<div class="dot" style="left:' + pct + '%;background:' + color + '"></div>') + '</div>' +
        '<div class="band"><b>' + esc(b.label) + '</b>' + (r.score === null ? '' : ' <span class="muted">(' + (r.score > 0 ? '+' : '') + r.score + ')</span>') + '</div>' +
        '<div class="why">' + esc(A.blurb) + '</div>';
      box.appendChild(d);
    });

    var labels = S.closestLabels(res, 3), lb = $('rlabels'); lb.innerHTML = '';
    if (!labels.length) lb.innerHTML = '<p class="muted">Needs all four axes measured.</p>';
    labels.forEach(function (l, i) {
      var fit = l.distance < 60 ? 'close match' : l.distance < 120 ? 'rough match' : 'weak match';
      var d = document.createElement('div'); d.className = 'label';
      d.innerHTML = '<div class="n"><span>' + (i + 1) + '. ' + esc(l.name) + '</span><span class="muted small">distance ' + l.distance + ' · ' + fit + '</span></div><div class="d">' + esc(l.note) + '</div>';
      lb.appendChild(d);
    });

    $('rlink').value = location.href;
    $('rreviewbox').classList.add('hidden'); $('rreviewbox').innerHTML = '';
  }

  function drawCompass(econ, auth) {
    var svg = $('rcompass'), W = 320, P = 30, inner = W - 2 * P;
    var q = function (x, y, w, h, c) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '" opacity=".18"/>'; };
    var h = q(P, P, inner / 2, inner / 2, cssVar('--left')) + q(P + inner / 2, P, inner / 2, inner / 2, cssVar('--right')) +
            q(P, P + inner / 2, inner / 2, inner / 2, cssVar('--left')) + q(P + inner / 2, P + inner / 2, inner / 2, inner / 2, cssVar('--right'));
    h += '<rect x="' + P + '" y="' + P + '" width="' + inner + '" height="' + inner + '" fill="none" stroke="currentColor" stroke-opacity=".35"/>';
    for (var g = 1; g < 10; g++) {
      var t = P + inner * g / 10, op = g === 5 ? '.6' : '.12';
      h += '<line x1="' + t + '" y1="' + P + '" x2="' + t + '" y2="' + (P + inner) + '" stroke="currentColor" stroke-opacity="' + op + '"/>';
      h += '<line x1="' + P + '" y1="' + t + '" x2="' + (P + inner) + '" y2="' + t + '" stroke="currentColor" stroke-opacity="' + op + '"/>';
    }
    var f = 'font-size="12" fill="currentColor" fill-opacity=".7" text-anchor="middle"';
    h += '<text x="' + (W / 2) + '" y="' + (P - 12) + '" ' + f + '>Authoritarian</text>';
    h += '<text x="' + (W / 2) + '" y="' + (W - P + 20) + '" ' + f + '>Libertarian</text>';
    h += '<text x="' + (P - 14) + '" y="' + (W / 2) + '" ' + f + ' transform="rotate(-90 ' + (P - 14) + ' ' + (W / 2) + ')">Left</text>';
    h += '<text x="' + (W - P + 16) + '" y="' + (W / 2) + '" ' + f + ' transform="rotate(90 ' + (W - P + 16) + ' ' + (W / 2) + ')">Right</text>';
    if (econ !== null && auth !== null) {
      var cx = P + (econ + 100) / 200 * inner, cy = P + (100 - auth) / 200 * inner;
      h += '<circle cx="' + cx + '" cy="' + cy + '" r="9" fill="' + cssVar('--accent') + '" stroke="white" stroke-width="3"/>';
    }
    svg.innerHTML = h;
  }

  $('rcopy').addEventListener('click', function () {
    var inp = $('rlink'); inp.select();
    var done = function () { $('rcopy').textContent = 'Copied'; setTimeout(function () { $('rcopy').textContent = 'Copy link'; }, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(inp.value).then(done, function () { document.execCommand('copy'); done(); });
    else { document.execCommand('copy'); done(); }
  });
  $('rretake').addEventListener('click', function () { startTest(state.length); });
  $('rlonger').addEventListener('click', function () {
    var next = state.length === 'quick' ? 'standard' : 'full';
    startTest(next);
  });
  $('rreview').addEventListener('click', function () {
    var box = $('rreviewbox');
    if (!box.classList.contains('hidden')) { box.classList.add('hidden'); return; }
    var names = { '-2': 'Strongly disagree', '-1': 'Disagree', '0': 'Neutral', '1': 'Agree', '2': 'Strongly agree' };
    var rows = B.QUESTIONS.filter(function (q) { return state.answers[q.id]; }).map(function (q) {
      var a = state.answers[q.id];
      var ans = a.value === null ? 'Skipped' : names[String(a.value)] + (a.important ? ' (important)' : '');
      var push = a.value === null || a.value === 0 ? '' : (q.dir * a.value > 0 ? AXES[q.axis].plus : AXES[q.axis].minus);
      return '<tr><td>' + esc(q.text) + '</td><td>' + esc(ans) + '</td><td class="muted">' + esc(AXES[q.axis].name) + (push ? ' → ' + esc(push) : '') + '</td></tr>';
    }).join('');
    box.innerHTML = '<table><tr><th>Statement</th><th>Your answer</th><th>Counts toward</th></tr>' + rows + '</table>';
    box.classList.remove('hidden');
  });

  /* ---------------- method ---------------- */
  function renderMethod() {
    $('maxes').innerHTML = AXIS_KEYS.map(function (ax) {
      var A = AXES[ax];
      return '<h3>' + esc(A.name) + ': ' + esc(A.minus) + ' ↔ ' + esc(A.plus) + '</h3><p>' + esc(A.blurb) + '</p>';
    }).join('');
    $('mbank').innerHTML = AXIS_KEYS.map(function (ax) {
      var rows = B.QUESTIONS.filter(function (q) { return q.axis === ax; }).map(function (q) {
        return '<tr><td class="muted">' + q.tier + '</td><td>' + esc(q.text) + '</td><td>' + esc(q.dir > 0 ? AXES[ax].plus : AXES[ax].minus) + '</td></tr>';
      }).join('');
      return '<h3>' + esc(AXES[ax].name) + '</h3><table><tr><th>Tier</th><th>Statement</th><th>Agree pushes</th></tr>' + rows + '</table>';
    }).join('');
  }

  renderHome();
  route();
})();
