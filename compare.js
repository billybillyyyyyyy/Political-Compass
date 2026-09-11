/*
 * Compare view: public figures on the compass next to you, portraits from
 * Wikipedia, and an optional AI estimate for anyone not in the built-in list.
 */
(function (root) {
  var B = root.PCBank, S = root.PCScoring, FIG = root.PCFigures.FIGURES;
  var AXES = B.AXES, AXIS_KEYS = S.AXIS_KEYS;
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function initials(name) { return name.split(/\s+/).filter(Boolean).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase(); }
  function byId(id) { for (var i = 0; i < FIG.length; i++) if (FIG[i].id === id) return FIG[i]; return null; }

  var PALETTE = ['#e0562b', '#2f8f5b', '#c4741d', '#7b3fbf', '#1f9aa8', '#b23b6b', '#5b6b2f', '#3b5bd8'];
  var state = { selected: [], ai: {} };   // selected: array of figure objects (built-in or AI)

  /* ---------- portraits ---------- */
  var thumbs = {};
  function thumb(fig) {
    if (!fig.wiki) return Promise.resolve(null);
    if (thumbs[fig.wiki] !== undefined) return Promise.resolve(thumbs[fig.wiki]);
    return fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + fig.wiki, { headers: { accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { var u = j && j.thumbnail && j.thumbnail.source || null; thumbs[fig.wiki] = u; return u; })
      .catch(function () { thumbs[fig.wiki] = null; return null; });
  }
  function avatarHTML(fig, size, color) {
    var s = size || 40;
    return '<span class="avatar" data-wiki="' + esc(fig.wiki || '') + '" style="width:' + s + 'px;height:' + s + 'px;background:' + (color || 'var(--line)') + '"><span>' + esc(initials(fig.name)) + '</span></span>';
  }
  function hydrateAvatars(container) {
    Array.prototype.forEach.call(container.querySelectorAll('.avatar[data-wiki]'), function (el) {
      var wiki = el.getAttribute('data-wiki'); if (!wiki) return;
      thumb({ wiki: wiki }).then(function (u) { if (u) el.innerHTML = '<img src="' + esc(u) + '" alt="" loading="lazy">'; });
    });
  }

  /* ---------- compass drawing (shared with app.js) ---------- */
  function drawCompass(svg, points) {
    var W = 320, P = 30, inner = W - 2 * P;
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
    var defs = '';
    (points || []).forEach(function (p, i) {
      if (p.econ === null || p.auth === null) return;
      var cx = P + (p.econ + 100) / 200 * inner, cy = P + (100 - p.auth) / 200 * inner;
      var r = p.r || 9;
      if (p.img) {
        defs += '<clipPath id="cp' + i + '"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/></clipPath>';
        h += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 2) + '" fill="' + p.color + '"/>';
        h += '<image href="' + esc(p.img) + '" x="' + (cx - r) + '" y="' + (cy - r) + '" width="' + (2 * r) + '" height="' + (2 * r) + '" clip-path="url(#cp' + i + ')" preserveAspectRatio="xMidYMid slice"><title>' + esc(p.label) + '</title></image>';
      } else {
        h += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + p.color + '" stroke="white" stroke-width="2.5"><title>' + esc(p.label) + '</title></circle>';
        if (p.text) h += '<text x="' + cx + '" y="' + (cy + 3.5) + '" font-size="9" font-weight="700" fill="white" text-anchor="middle" pointer-events="none">' + esc(p.text) + '</text>';
      }
    });
    svg.innerHTML = (defs ? '<defs>' + defs + '</defs>' : '') + h;
  }

  /* ---------- selection ---------- */
  function isSelected(fig) { return state.selected.some(function (f) { return f.id === fig.id; }); }
  function toggle(fig) {
    if (isSelected(fig)) state.selected = state.selected.filter(function (f) { return f.id !== fig.id; });
    else if (state.selected.length < 6) state.selected.push(fig);
    else return false;
    return true;
  }
  function selectedIds() { return state.selected.filter(function (f) { return !f.ai; }).map(function (f) { return f.id; }); }
  function setFromIds(csv) {
    state.selected = [];
    (csv || '').split(',').forEach(function (id) { var f = byId(id.trim()); if (f && !isSelected(f)) state.selected.push(f); });
  }

  /* ---------- rendering the comparison block ---------- */
  var COLORS = { econ: ['--left', '--right'], auth: ['--lib', '--auth'], cult: ['--prog', '--trad'], glob: ['--glob', '--nat'] };
  function dist(a, b) { var d = 0; for (var i = 0; i < 4; i++) d += Math.pow(a[i] - b[i], 2); return Math.round(Math.sqrt(d)); }

  /* user: { pos:[e,a,c,w] } or null. Renders into container. onChange called after selection changes. */
  function render(container, user, onChange) {
    var people = [];
    if (user) people.push({ id: 'you', name: 'You', pos: user.pos, color: cssVar('--accent'), you: true });
    state.selected.forEach(function (f, i) { people.push({ id: f.id, name: f.name, role: f.role, pos: f.pos, why: f.why, wiki: f.wiki, ai: f.ai, confidence: f.confidence, color: PALETTE[i % PALETTE.length] }); });

    var h = '<div class="cmp-search"><input id="cmpq" type="search" placeholder="Search a public figure, e.g. Reagan, Thatcher, Milei" autocomplete="off"><div id="cmpsug" class="sug hidden"></div></div>';
    h += '<div class="chips" id="cmpchips">' + people.filter(function (p) { return !p.you; }).map(function (p) {
      return '<button class="chip" data-rm="' + esc(p.id) + '" style="border-color:' + p.color + '">' + avatarHTML(p, 22, p.color) + ' ' + esc(p.name) + (p.ai ? ' <span class="badge ai">AI estimate</span>' : '') + ' <span class="x">×</span></button>';
    }).join('') + '</div>';
    if (!people.filter(function (p) { return !p.you; }).length) {
      h += '<p class="muted small">Pick up to six people. Try the search box, or <a href="#figures" data-nav="figures">browse everyone</a>.</p>';
    }
    if (people.length) {
      h += '<div class="compass-wrap"><svg class="compass" id="cmpcompass" viewBox="0 0 320 320" role="img" aria-label="Compass with selected people"></svg><div class="axes" id="cmpaxes">';
      AXIS_KEYS.forEach(function (ax, ai) {
        var A = AXES[ax];
        h += '<div class="axis"><div class="lbl"><span>' + esc(A.minus) + '</span><span>' + esc(A.name) + '</span><span>' + esc(A.plus) + '</span></div><div class="bar multi"><div class="mid"></div>';
        people.forEach(function (p) {
          var v = p.pos[ai]; if (v === null) return;
          var pct = (v + 100) / 2;
          h += '<div class="mark' + (p.you ? ' you' : '') + '" style="left:' + pct + '%;background:' + p.color + '" title="' + esc(p.name + ': ' + (v > 0 ? '+' : '') + v) + '">' + (p.you ? '' : '<span>' + esc(initials(p.name)) + '</span>') + '</div>';
        });
        h += '</div></div>';
      });
      h += '</div></div>';
    }
    var others = people.filter(function (p) { return !p.you; });
    if (others.length) {
      h += '<table class="cmp-table"><tr><th></th><th>Economic</th><th>Authority</th><th>Cultural</th><th>World</th>' + (user ? '<th>Distance from you</th>' : '') + '</tr>';
      others.forEach(function (p) {
        var cells = p.pos.map(function (v, i) { var b = S.band(AXIS_KEYS[i], v); return '<td>' + esc(b.label) + ' <span class="muted">(' + (v > 0 ? '+' : '') + v + ')</span></td>'; }).join('');
        var d = user ? dist(user.pos, p.pos) : null;
        h += '<tr><td><div class="who">' + avatarHTML(p, 36, p.color) + '<div><b>' + esc(p.name) + '</b>' + (p.ai ? ' <span class="badge ai">AI estimate' + (p.confidence ? ', ' + esc(p.confidence) + ' confidence' : '') + '</span>' : '') + '<div class="muted small">' + esc(p.role || '') + '</div></div></div></td>' + cells +
          (user ? '<td><b>' + d + '</b> <span class="muted small">' + (d < 60 ? 'close' : d < 120 ? 'some overlap' : 'far apart') + '</span></td>' : '') + '</tr>';
        h += '<tr class="why"><td colspan="' + (user ? 6 : 5) + '" class="muted small">' + esc(p.why || '') + '</td></tr>';
      });
      h += '</table>';
    }
    h += '<details class="ai-box" id="aibox"><summary>Not in the list? Ask AI to estimate anyone</summary>' +
      '<p class="small muted">Type any public figure. The estimate comes from Claude, based on that person’s public record, and is marked as an AI estimate wherever it appears. This runs directly from your browser using your own Anthropic API key. The key is sent only to Anthropic and is never stored anywhere unless you tick “remember on this device”.</p>' +
      '<div class="ai-form"><input id="aikey" type="password" placeholder="Anthropic API key (sk-ant-...)" autocomplete="off"><label class="small"><input type="checkbox" id="airemember"> Remember on this device</label></div>' +
      '<div class="ai-form"><input id="ainame" type="text" placeholder="Name, e.g. Ronald Reagan or Jacinda Ardern"><button class="btn primary" id="aigo">Estimate</button></div>' +
      '<div id="aistatus" class="small"></div></details>';
    container.innerHTML = h;

    // compass
    if (people.length) {
      var svg = $('cmpcompass');
      var pts = people.map(function (p) { return { econ: p.pos[0], auth: p.pos[1], label: p.name, color: p.color, text: p.you ? '' : initials(p.name), r: p.you ? 9 : 13 }; });
      drawCompass(svg, pts);
      // swap in portraits as they load
      people.forEach(function (p, i) {
        if (p.you || !p.wiki) return;
        thumb(p).then(function (u) { if (!u) return; pts[i].img = u; if ($('cmpcompass') === svg) drawCompass(svg, pts); });
      });
    }
    hydrateAvatars(container);

    // wiring
    var q = $('cmpq'), sug = $('cmpsug');
    function showSug() {
      var v = q.value.trim().toLowerCase();
      if (!v) { sug.classList.add('hidden'); return; }
      var hits = FIG.filter(function (f) { return (f.name + ' ' + f.role).toLowerCase().indexOf(v) >= 0; }).slice(0, 8);
      if (!hits.length) { sug.innerHTML = '<div class="sug-item muted">No match. Use “Ask AI” below to estimate anyone.</div>'; sug.classList.remove('hidden'); return; }
      sug.innerHTML = hits.map(function (f) { return '<button class="sug-item" data-add="' + f.id + '">' + avatarHTML(f, 28) + '<span><b>' + esc(f.name) + '</b> <span class="muted small">' + esc(f.role) + '</span></span></button>'; }).join('');
      sug.classList.remove('hidden'); hydrateAvatars(sug);
    }
    q.addEventListener('input', showSug);
    q.addEventListener('focus', showSug);
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var b = sug.querySelector('[data-add]'); if (b) b.click(); } });
    container.addEventListener('click', function (e) {
      var add = e.target.closest('[data-add]'), rm = e.target.closest('[data-rm]');
      if (add) { var f = byId(add.getAttribute('data-add')); if (f && !isSelected(f)) { if (!toggle(f)) alert('Six people is the limit. Remove one first.'); } onChange(); }
      else if (rm) { state.selected = state.selected.filter(function (f) { return f.id !== rm.getAttribute('data-rm'); }); onChange(); }
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.cmp-search')) sug.classList.add('hidden'); });

    // AI
    var saved = null; try { saved = localStorage.getItem('pc_api_key'); } catch (e) {}
    if (saved) { $('aikey').value = saved; $('airemember').checked = true; }
    $('aigo').addEventListener('click', function () {
      var key = $('aikey').value.trim(), name = $('ainame').value.trim(), st = $('aistatus');
      if (!key) { st.textContent = 'Enter an API key first.'; return; }
      if (!name) { st.textContent = 'Enter a name.'; return; }
      try { if ($('airemember').checked) localStorage.setItem('pc_api_key', key); else localStorage.removeItem('pc_api_key'); } catch (e) {}
      st.textContent = 'Asking Claude…'; $('aigo').disabled = true;
      estimate(name, key).then(function (fig) {
        $('aigo').disabled = false;
        if (!fig.known) { st.textContent = 'Claude could not place that person: ' + fig.why; return; }
        if (state.selected.length >= 6) { st.textContent = 'Six people is the limit. Remove one first.'; return; }
        state.selected.push(fig); onChange();
      }).catch(function (err) { $('aigo').disabled = false; st.textContent = 'Request failed: ' + err.message; });
    });
  }

  /* ---------- AI estimate ---------- */
  var ANCHORS = FIG.filter(function (f) { return ['reagan', 'sanders', 'thatcher', 'putin', 'friedman', 'merkel', 'chomsky', 'orban', 'obama', 'milei'].indexOf(f.id) >= 0; })
    .map(function (f) { return f.name + ': econ ' + f.pos[0] + ', auth ' + f.pos[1] + ', cult ' + f.pos[2] + ', world ' + f.pos[3]; }).join('\n');
  var SYSTEM = 'You place public figures on a four-axis political compass, using only their public record: votes, policies enacted, party platform, published writing and consistent public statements. Each axis runs from -100 to +100.\n\n' +
    'econ: -100 = Left (collective ownership, redistribution, heavy regulation) ... +100 = Right (free markets, private ownership, low taxes).\n' +
    'auth: -100 = Libertarian (individual freedom, limits on police and surveillance) ... +100 = Authoritarian (strong state power, order, censorship, emergency rule).\n' +
    'cult: -100 = Progressive (change social norms, secular, gender and sexual liberalism) ... +100 = Traditional (religion in public life, traditional family, established norms).\n' +
    'world: -100 = Global (open borders, free trade, international institutions) ... +100 = National (sovereignty, borders, protectionism, own people first).\n\n' +
    'Calibration anchors on this scale:\n' + ANCHORS + '\n\n' +
    'Rules: 0 means genuinely balanced, not unknown. If the name is not a real, identifiable public figure with a political record, or is too ambiguous, set known to false and say why in "why". For living people, describe positions, not character. Keep "why" to two plain sentences naming the concrete record behind the placement. Use integers.';
  var SCHEMA = { type: 'object', properties: {
      known: { type: 'boolean' }, name: { type: 'string' }, role: { type: 'string' },
      econ: { type: 'integer' }, auth: { type: 'integer' }, cult: { type: 'integer' }, world: { type: 'integer' },
      confidence: { type: 'string', enum: ['low', 'medium', 'high'] }, why: { type: 'string' } },
    required: ['known', 'name', 'role', 'econ', 'auth', 'cult', 'world', 'confidence', 'why'], additionalProperties: false };

  function estimate(name, apiKey) {
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'server-side-fallback-2026-07-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-opus-5',
        max_tokens: 2048,
        fallbacks: 'default',
        output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
        system: SYSTEM,
        messages: [{ role: 'user', content: 'Person: ' + name }]
      })
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error((j.error && j.error.message) || ('HTTP ' + r.status));
        if (j.stop_reason === 'refusal') throw new Error('Claude declined to answer for this person.');
        var text = (j.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('');
        var d = JSON.parse(text);
        var clamp = function (v) { return Math.max(-100, Math.min(100, Math.round(v))); };
        return { id: 'ai-' + d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: d.name, role: d.role, known: d.known,
          pos: [clamp(d.econ), clamp(d.auth), clamp(d.cult), clamp(d.world)], why: d.why, confidence: d.confidence, ai: true,
          wiki: d.known ? d.name.replace(/\s+/g, '_') : null };
      });
    });
  }

  /* ---------- figures gallery page ---------- */
  function renderGallery(container, user, onChange) {
    var h = '<h1>Public figures on the compass</h1><p class="muted">Editorial placements of ' + FIG.length + ' well-known people, based on their public record. Nobody here took the test. Rough by nature; the point is to give your own result some landmarks. Tap a person to add them to your comparison.</p>';
    h += '<div class="cmp-search"><input id="galq" type="search" placeholder="Filter by name or role" autocomplete="off"></div>';
    h += '<div class="compass-wrap gallery-top"><svg class="compass" id="galcompass" viewBox="0 0 320 320" role="img" aria-label="All public figures"></svg><div id="galpick" class="small muted">Hover or tap a dot to see who it is. Selected people are outlined.</div></div>';
    h += '<div class="grid" id="galgrid"></div>';
    h += '<div class="share" style="margin-top:16px">' + (user ? '<a class="btn primary" href="' + esc(user.link) + '">Compare with my result</a>' : '<a class="btn primary" href="#" data-nav="home">Take the test to compare</a>') + '</div>';
    container.innerHTML = h;
    var grid = $('galgrid'), q = $('galq');
    function draw() {
      var v = q.value.trim().toLowerCase();
      var list = FIG.filter(function (f) { return !v || (f.name + ' ' + f.role + ' ' + f.why).toLowerCase().indexOf(v) >= 0; });
      grid.innerHTML = list.map(function (f) {
        var sel = isSelected(f);
        return '<button class="fig' + (sel ? ' sel' : '') + '" data-fig="' + f.id + '">' + avatarHTML(f, 56) + '<div><b>' + esc(f.name) + '</b><div class="muted small">' + esc(f.role) + '</div>' +
          '<div class="small">' + AXIS_KEYS.map(function (ax, i) { return '<span class="tag">' + esc(S.band(ax, f.pos[i]).label) + '</span>'; }).join(' ') + '</div></div></button>';
      }).join('') || '<p class="muted">No match. Take the test and use “Ask AI” on the results page to estimate anyone.</p>';
      hydrateAvatars(grid);
      var pts = list.map(function (f) { var sel = isSelected(f); return { econ: f.pos[0], auth: f.pos[1], label: f.name, color: sel ? cssVar('--accent') : 'rgba(120,120,130,.75)', r: sel ? 8 : 5 }; });
      if (user) pts.push({ econ: user.pos[0], auth: user.pos[1], label: 'You', color: cssVar('--accent'), r: 10, text: 'You' });
      drawCompass($('galcompass'), pts);
    }
    q.addEventListener('input', draw);
    container.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fig]'); if (!b) return;
      var f = byId(b.getAttribute('data-fig'));
      if (!toggle(f)) { alert('Six people is the limit. Remove one first.'); return; }
      $('galpick').textContent = state.selected.length ? 'Selected: ' + state.selected.map(function (x) { return x.name; }).join(', ') : 'Hover or tap a dot to see who it is.';
      draw(); onChange();
    });
    draw();
    if (state.selected.length) $('galpick').textContent = 'Selected: ' + state.selected.map(function (x) { return x.name; }).join(', ');
  }

  root.PCCompare = { state: state, render: render, renderGallery: renderGallery, drawCompass: drawCompass, selectedIds: selectedIds, setFromIds: setFromIds, estimate: estimate, byId: byId };
})(window);
