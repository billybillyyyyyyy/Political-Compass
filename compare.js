/*
 * Compare view: public figures on the compass next to you, portraits from
 * Wikipedia, a zoomable compass with labelled regions, and the gallery page.
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
  var MAX_SEL = 6;
  var state = { selected: [] };

  /* ---------- portraits ----------
   * Thumbnail URLs come from the Wikipedia REST API. They are cached on the
   * device for a week so repeat visits do not refetch, and cards only look
   * up their portrait once they scroll into view. */
  var thumbs = {}, CACHE_KEY = 'pc_thumbs_v1', CACHE_TTL = 7 * 24 * 3600 * 1000, saveTimer = null;
  try {
    var cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && cached.ts && Date.now() - cached.ts < CACHE_TTL && cached.map) thumbs = cached.map;
  } catch (e) {}
  function persistThumbs() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), map: thumbs })); } catch (e) {} }, 500);
  }
  var inflight = {};
  function thumb(fig) {
    if (!fig.wiki) return Promise.resolve(null);
    if (thumbs[fig.wiki] !== undefined) return Promise.resolve(thumbs[fig.wiki]);
    if (inflight[fig.wiki]) return inflight[fig.wiki];
    inflight[fig.wiki] = fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + fig.wiki, { headers: { accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { var u = j && j.thumbnail && j.thumbnail.source || null; thumbs[fig.wiki] = u; persistThumbs(); return u; })
      .catch(function () { return null; })   // leave uncached so a flaky network can retry later
      .then(function (u) { delete inflight[fig.wiki]; return u; });
    return inflight[fig.wiki];
  }
  function avatarHTML(fig, size, color) {
    var s = size || 40;
    return '<span class="avatar" data-wiki="' + esc(fig.wiki || '') + '" style="width:' + s + 'px;height:' + s + 'px;background:' + (color || 'var(--line)') + '"><span>' + esc(initials(fig.name)) + '</span></span>';
  }
  function fillAvatar(el) {
    var wiki = el.getAttribute('data-wiki'); if (!wiki || el.getAttribute('data-done')) return;
    el.setAttribute('data-done', '1');
    thumb({ wiki: wiki }).then(function (u) { if (u) el.innerHTML = '<img src="' + esc(u) + '" alt="" loading="lazy" decoding="async">'; });
  }
  var io = ('IntersectionObserver' in root) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); fillAvatar(en.target); } });
  }, { rootMargin: '200px' }) : null;
  function hydrateAvatars(container) {
    Array.prototype.forEach.call(container.querySelectorAll('.avatar[data-wiki]'), function (el) {
      if (!el.getAttribute('data-wiki')) return;
      if (io) io.observe(el); else fillAvatar(el);
    });
  }

  /* ---------- region labels for the classic compass ----------
   * 4 x 4 cells, 50 units each. Rows top (authoritarian) to bottom, columns left to right.
   * Broad families of positions, not verdicts. */
  var REGIONS = [
    ['State socialist / Marxist-Leninist', 'Left nationalist / Authoritarian social democrat', 'National conservative / Authoritarian conservative', 'Right-wing authoritarian / Military capitalist'],
    ['Democratic socialist (statist)',      'Social democrat / Mainstream centre-left',           'Mainstream conservative / Christian democrat',      'Free-market conservative / Neoconservative'],
    ['Libertarian socialist / Green left',  'Progressive liberal / Social liberal',               'Classical liberal / Market liberal',                'Libertarian conservative'],
    ['Anarchist / Anarcho-communist',       'Left-libertarian / Mutualist',                       'Civil libertarian / Minarchist',                    'Anarcho-capitalist / Libertarian']
  ];
  function regionFor(econ, auth) {
    var col = Math.min(3, Math.floor((econ + 100) / 50)), row = Math.min(3, Math.floor((100 - auth) / 50));
    return REGIONS[row][col];
  }

  /* ---------- tooltip ---------- */
  var tip;
  function showTip(html, x, y) {
    if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; document.body.appendChild(tip); }
    tip.innerHTML = html; tip.style.display = 'block';
    var w = tip.offsetWidth, h = tip.offsetHeight;
    var left = x + 14, top = y + 14;
    if (left + w > window.innerWidth - 8) left = x - w - 14;
    if (top + h > window.innerHeight - 8) top = y - h - 14;
    tip.style.left = (left + window.scrollX) + 'px'; tip.style.top = (top + window.scrollY) + 'px';
  }
  function hideTip() { if (tip) tip.style.display = 'none'; }

  /* ---------- compass drawing (shared with app.js) ----------
   * points: [{econ, auth, label, sub, color, text, r, img, id}]
   * The svg keeps its own view state (svg._view = {x, y, k}) so zooming survives redraws.
   * Dots keep a constant screen size under zoom so crowded spots spread out. */
  var W = 320, P = 30, INNER = W - 2 * P;
  function toXY(econ, auth) { return { x: P + (econ + 100) / 200 * INNER, y: P + (100 - auth) / 200 * INNER }; }
  function drawCompass(svg, points) {
    var v = svg._view || (svg._view = { x: 0, y: 0, k: 1 });
    var k = v.k;
    var q = function (x, y, w, h, c) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '" opacity=".18"/>'; };
    var h = q(P, P, INNER / 2, INNER / 2, cssVar('--left')) + q(P + INNER / 2, P, INNER / 2, INNER / 2, cssVar('--right')) +
            q(P, P + INNER / 2, INNER / 2, INNER / 2, cssVar('--left')) + q(P + INNER / 2, P + INNER / 2, INNER / 2, INNER / 2, cssVar('--right'));
    // region cells (hover targets)
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      h += '<rect class="cell" data-r="' + r + '" data-c="' + c + '" x="' + (P + c * INNER / 4) + '" y="' + (P + r * INNER / 4) + '" width="' + (INNER / 4) + '" height="' + (INNER / 4) + '" fill="transparent"/>';
    }
    for (var g = 1; g < 10; g++) {
      var t = P + INNER * g / 10, op = g === 5 ? '.6' : '.12', sw = 1 / k;
      h += '<line x1="' + t + '" y1="' + P + '" x2="' + t + '" y2="' + (P + INNER) + '" stroke="currentColor" stroke-opacity="' + op + '" stroke-width="' + sw + '" data-sw="1" pointer-events="none"/>';
      h += '<line x1="' + P + '" y1="' + t + '" x2="' + (P + INNER) + '" y2="' + t + '" stroke="currentColor" stroke-opacity="' + op + '" stroke-width="' + sw + '" data-sw="1" pointer-events="none"/>';
    }
    h += '<rect x="' + P + '" y="' + P + '" width="' + INNER + '" height="' + INNER + '" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="' + (1 / k) + '" data-sw="1" pointer-events="none"/>';
    var defs = '';
    (points || []).forEach(function (p, i) {
      if (p.econ === null || p.auth === null) return;
      var xy = toXY(p.econ, p.auth), cx = xy.x, cy = xy.y, rr = (p.r || 9) / k;
      var base = (p.r || 9), attrs = ' class="dot" data-i="' + i + '" data-cx="' + cx + '" data-cy="' + cy + '" data-r="' + base + '"';
      if (p.img) {
        defs += '<clipPath id="cp' + i + '"><circle class="clip" cx="' + cx + '" cy="' + cy + '" r="' + rr + '" data-r="' + base + '"/></clipPath>';
        h += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (rr + 2 / k) + '" fill="' + p.color + '"' + attrs + ' data-ring="1"/>';
        h += '<image href="' + esc(p.img) + '" x="' + (cx - rr) + '" y="' + (cy - rr) + '" width="' + (2 * rr) + '" height="' + (2 * rr) + '" clip-path="url(#cp' + i + ')" preserveAspectRatio="xMidYMid slice"' + attrs + '/>';
      } else {
        h += '<circle cx="' + cx + '" cy="' + cy + '" r="' + rr + '" fill="' + p.color + '" stroke="white" stroke-width="' + (2 / k) + '" data-sw="2"' + attrs + '/>';
        if (p.text) h += '<text class="dl" x="' + cx + '" y="' + (cy + 3.5 / k) + '" data-cy="' + cy + '" font-size="' + (9 / k) + '" font-weight="700" fill="white" text-anchor="middle" pointer-events="none">' + esc(p.text) + '</text>';
      }
    });
    var f = 'font-size="12" fill="currentColor" fill-opacity=".7" text-anchor="middle" pointer-events="none"';
    var labels = '<text x="' + (W / 2) + '" y="' + (P - 12) + '" ' + f + '>Authoritarian</text>' +
      '<text x="' + (W / 2) + '" y="' + (W - P + 20) + '" ' + f + '>Libertarian</text>' +
      '<text x="' + (P - 14) + '" y="' + (W / 2) + '" ' + f + ' transform="rotate(-90 ' + (P - 14) + ' ' + (W / 2) + ')">Left</text>' +
      '<text x="' + (W - P + 16) + '" y="' + (W / 2) + '" ' + f + ' transform="rotate(90 ' + (W - P + 16) + ' ' + (W / 2) + ')">Right</text>';
    // zoom about the plot centre: translate so that view (x,y) in plot units is centred
    var tr = 'translate(' + (W / 2 - k * (W / 2 + v.x)) + ' ' + (W / 2 - k * (W / 2 + v.y)) + ') scale(' + k + ')';
    svg.innerHTML = (defs ? '<defs>' + defs + '</defs><clipPath id="plotclip"><rect x="' + P + '" y="' + P + '" width="' + INNER + '" height="' + INNER + '"/></clipPath>' : '<clipPath id="plotclip"><rect x="' + P + '" y="' + P + '" width="' + INNER + '" height="' + INNER + '"/></clipPath>') +
      '<g clip-path="url(#plotclip)"><g class="plot" transform="' + tr + '">' + h + '</g></g>' + labels;
    svg._points = points || [];
    if (!svg._wired) wire(svg);
  }

  /* Cheap zoom/pan update: move the group and resize dots in place, no rebuild. */
  function applyView(svg) {
    var v = svg._view, k = v.k, plot = svg.querySelector('g.plot'); if (!plot) return;
    plot.setAttribute('transform', 'translate(' + (W / 2 - k * (W / 2 + v.x)) + ' ' + (W / 2 - k * (W / 2 + v.y)) + ') scale(' + k + ')');
    var i, els = svg.querySelectorAll('[data-sw]');
    for (i = 0; i < els.length; i++) els[i].setAttribute('stroke-width', (+els[i].getAttribute('data-sw')) / k);
    els = svg.querySelectorAll('circle.dot, circle.clip');
    for (i = 0; i < els.length; i++) { var base = +els[i].getAttribute('data-r'); els[i].setAttribute('r', base / k + (els[i].getAttribute('data-ring') ? 2 / k : 0)); }
    els = svg.querySelectorAll('image.dot');
    for (i = 0; i < els.length; i++) {
      var rr = (+els[i].getAttribute('data-r')) / k, cx = +els[i].getAttribute('data-cx'), cy = +els[i].getAttribute('data-cy');
      els[i].setAttribute('x', cx - rr); els[i].setAttribute('y', cy - rr); els[i].setAttribute('width', 2 * rr); els[i].setAttribute('height', 2 * rr);
    }
    els = svg.querySelectorAll('text.dl');
    for (i = 0; i < els.length; i++) { els[i].setAttribute('font-size', 9 / k); els[i].setAttribute('y', (+els[i].getAttribute('data-cy')) + 3.5 / k); }
  }

  /* hover: dots show who, cells show the region label; click on a dot fires svg.onDot(point) */
  function wire(svg) {
    svg._wired = true;
    function pointAt(e) {
      var el = e.target.closest ? e.target.closest('.dot') : null;
      if (el) return svg._points[+el.getAttribute('data-i')] || null;
      return null;
    }
    svg.addEventListener('mousemove', function (e) {
      var p = pointAt(e);
      if (p) { showTip('<b>' + esc(p.label) + '</b>' + (p.sub ? '<div class="muted small">' + esc(p.sub) + '</div>' : '') + '<div class="small">Economic ' + fmt(p.econ) + ' · Authority ' + fmt(p.auth) + '</div>', e.clientX, e.clientY); return; }
      var cell = e.target.closest ? e.target.closest('.cell') : null;
      if (cell) { showTip('<div class="small muted">This part of the map</div><b>' + esc(REGIONS[+cell.getAttribute('data-r')][+cell.getAttribute('data-c')]) + '</b>', e.clientX, e.clientY); return; }
      hideTip();
    });
    svg.addEventListener('mouseleave', hideTip);
    svg.addEventListener('click', function (e) {
      var p = pointAt(e);
      if (p && svg.onDot) { svg.onDot(p); hideTip(); }
      else if (p) { showTip('<b>' + esc(p.label) + '</b>' + (p.sub ? '<div class="muted small">' + esc(p.sub) + '</div>' : ''), e.clientX, e.clientY); }
      else { var cell = e.target.closest ? e.target.closest('.cell') : null; if (cell) showTip('<b>' + esc(REGIONS[+cell.getAttribute('data-r')][+cell.getAttribute('data-c')]) + '</b>', e.clientX, e.clientY); }
    });
  }
  function fmt(v) { return (v > 0 ? '+' : '') + v; }

  /* ---------- zoom / pan ---------- */
  function clampView(v) {
    v.k = Math.max(1, Math.min(8, v.k));
    var lim = (INNER / 2) * (1 - 1 / v.k);   // keep the plot covering the frame
    v.x = Math.max(-lim, Math.min(lim, v.x)); v.y = Math.max(-lim, Math.min(lim, v.y));
    return v;
  }
  function scheduleView(svg) {
    if (svg._raf) return;
    svg._raf = requestAnimationFrame(function () { svg._raf = 0; applyView(svg); });
  }
  function zoomBy(svg, factor) {
    var v = svg._view || (svg._view = { x: 0, y: 0, k: 1 });
    v.k *= factor; clampView(v); scheduleView(svg);
  }
  function resetZoom(svg) { svg._view = { x: 0, y: 0, k: 1 }; scheduleView(svg); }
  function attachZoom(svg) {
    if (svg._zoomed) return; svg._zoomed = true;
    var v = svg._view || (svg._view = { x: 0, y: 0, k: 1 });
    function unit() { return svg.getBoundingClientRect().width / W; }  // screen px per plot unit at k=1
    svg.addEventListener('wheel', function (e) {
      e.preventDefault();
      var factor = e.deltaY < 0 ? 1.25 : 0.8;
      var rect = svg.getBoundingClientRect(), u = unit();
      var px = (e.clientX - rect.left) / u - W / 2, py = (e.clientY - rect.top) / u - W / 2;   // cursor offset from frame centre, plot units
      var k0 = v.k, k1 = Math.max(1, Math.min(8, k0 * factor));
      v.x += px / k0 - px / k1; v.y += py / k0 - py / k1; v.k = k1;
      clampView(v); scheduleView(svg);
    }, { passive: false });
    var drag = null, pinch = null;
    svg.addEventListener('pointerdown', function (e) { if (e.isPrimary) drag = { x: e.clientX, y: e.clientY, vx: v.x, vy: v.y, id: e.pointerId }; });
    svg.addEventListener('pointermove', function (e) {
      if (!drag || !e.isPrimary || pinch) return;
      if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) < 3) return;
      if (!drag.captured) { drag.captured = true; try { svg.setPointerCapture(drag.id); } catch (err) {} }
      var u = unit();
      v.x = drag.vx - (e.clientX - drag.x) / u / v.k; v.y = drag.vy - (e.clientY - drag.y) / u / v.k;
      clampView(v); scheduleView(svg);
    });
    svg.addEventListener('pointerup', function () { drag = null; });
    svg.addEventListener('pointercancel', function () { drag = null; });
    svg.addEventListener('touchstart', function (e) { if (e.touches.length === 2) { pinch = { d: dist2(e.touches), k: v.k }; drag = null; } }, { passive: true });
    svg.addEventListener('touchmove', function (e) {
      if (e.touches.length === 2 && pinch) { e.preventDefault(); v.k = pinch.k * dist2(e.touches) / pinch.d; clampView(v); scheduleView(svg); }
    }, { passive: false });
    svg.addEventListener('touchend', function (e) { if (e.touches.length < 2) pinch = null; });
    svg.style.touchAction = 'none'; svg.style.cursor = 'grab';
  }
  function dist2(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }
  function zoomControlsHTML(id) {
    return '<div class="zoomctl" data-for="' + id + '"><button class="btn" data-z="in" title="Zoom in">+</button><button class="btn" data-z="out" title="Zoom out">−</button><button class="btn" data-z="reset" title="Reset">Reset</button><span class="small muted">Scroll, drag or pinch to zoom. Hover or tap a square for its political label, a dot for the person.</span></div>';
  }
  function wireZoomControls(container, svg) {
    container.addEventListener('click', function (e) {
      var b = e.target.closest('[data-z]'); if (!b) return;
      var z = b.getAttribute('data-z');
      if (z === 'in') zoomBy(svg, 1.5); else if (z === 'out') zoomBy(svg, 1 / 1.5); else resetZoom(svg);
    });
  }

  /* ---------- selection ---------- */
  function isSelected(fig) { return state.selected.some(function (f) { return f.id === fig.id; }); }
  function toggle(fig) {
    if (isSelected(fig)) state.selected = state.selected.filter(function (f) { return f.id !== fig.id; });
    else if (state.selected.length < MAX_SEL) state.selected.push(fig);
    else return false;
    return true;
  }
  function selectedIds() { return state.selected.map(function (f) { return f.id; }); }
  function setFromIds(csv) {
    state.selected = [];
    (csv || '').split(',').forEach(function (id) { var f = byId(id.trim()); if (f && !isSelected(f)) state.selected.push(f); });
  }

  /* ---------- results-page comparison block ---------- */
  function dist(a, b) { var d = 0; for (var i = 0; i < 4; i++) d += Math.pow(a[i] - b[i], 2); return Math.round(Math.sqrt(d)); }

  function render(container, user, onChange) {
    var people = [];
    if (user) people.push({ id: 'you', name: 'You', pos: user.pos, color: cssVar('--accent'), you: true });
    state.selected.forEach(function (f, i) { people.push({ id: f.id, name: f.name, role: f.role, pos: f.pos, why: f.why, wiki: f.wiki, color: PALETTE[i % PALETTE.length] }); });
    var others = people.filter(function (p) { return !p.you; });

    var h = '<div class="cmp-search"><input id="cmpq" type="search" placeholder="Search a public figure, e.g. Reagan, Thatcher, Mamdani" autocomplete="off"><div id="cmpsug" class="sug hidden"></div></div>';
    h += '<div class="chips" id="cmpchips">' + others.map(function (p) {
      return '<button class="chip" data-rm="' + esc(p.id) + '" style="border-color:' + p.color + '">' + avatarHTML(p, 22, p.color) + ' ' + esc(p.name) + ' <span class="x">×</span></button>';
    }).join('') + '</div>';
    if (!others.length) h += '<p class="muted small">Pick up to ' + MAX_SEL + ' people. Try the search box, or <a href="#figures" data-nav="figures">browse all ' + FIG.length + '</a>.</p>';
    if (people.length) {
      h += '<div class="compass-wrap"><div><svg class="compass" id="cmpcompass" viewBox="0 0 320 320" role="img" aria-label="Compass with selected people"></svg>' + zoomControlsHTML('cmpcompass') + '</div><div class="axes" id="cmpaxes">';
      AXIS_KEYS.forEach(function (ax, ai) {
        var A = AXES[ax];
        h += '<div class="axis"><div class="lbl"><span>' + esc(A.minus) + '</span><span>' + esc(A.name) + '</span><span>' + esc(A.plus) + '</span></div><div class="bar multi"><div class="mid"></div>';
        people.forEach(function (p) {
          var val = p.pos[ai]; if (val === null) return;
          h += '<div class="mark' + (p.you ? ' you' : '') + '" style="left:' + ((val + 100) / 2) + '%;background:' + p.color + '" title="' + esc(p.name + ': ' + fmt(val)) + '">' + (p.you ? '' : '<span>' + esc(initials(p.name)) + '</span>') + '</div>';
        });
        h += '</div></div>';
      });
      h += '</div></div>';
    }
    if (others.length) {
      h += '<table class="cmp-table"><tr><th></th><th>Economic</th><th>Authority</th><th>Cultural</th><th>World</th>' + (user ? '<th>Distance from you</th>' : '') + '</tr>';
      others.forEach(function (p) {
        var cells = p.pos.map(function (val, i) { var b = S.band(AXIS_KEYS[i], val); return '<td>' + esc(b.label) + ' <span class="muted">(' + fmt(val) + ')</span></td>'; }).join('');
        var d = user ? dist(user.pos, p.pos) : null;
        h += '<tr><td><div class="who">' + avatarHTML(p, 36, p.color) + '<div><b>' + esc(p.name) + '</b><div class="muted small">' + esc(p.role || '') + '</div></div></div></td>' + cells +
          (user ? '<td><b>' + d + '</b> <span class="muted small">' + (d < 60 ? 'close' : d < 120 ? 'some overlap' : 'far apart') + '</span></td>' : '') + '</tr>';
        h += '<tr class="why"><td colspan="' + (user ? 6 : 5) + '" class="muted small">' + esc(p.why || '') + '</td></tr>';
      });
      h += '</table>';
    }
    container.innerHTML = h;

    if (people.length) {
      var svg = $('cmpcompass');
      var pts = people.map(function (p) { return { id: p.id, econ: p.pos[0], auth: p.pos[1], label: p.name, sub: p.role, color: p.color, text: p.you ? '' : initials(p.name), r: p.you ? 9 : 13 }; });
      var redraw = function () { drawCompass(svg, pts); };
      redraw(); attachZoom(svg); wireZoomControls(container, svg);
      people.forEach(function (p, i) { if (p.you || !p.wiki) return; thumb(p).then(function (u) { if (u && $('cmpcompass') === svg) { pts[i].img = u; redraw(); } }); });
    }
    hydrateAvatars(container);

    var q = $('cmpq'), sug = $('cmpsug');
    function showSug() {
      var v = q.value.trim().toLowerCase();
      if (!v) { sug.classList.add('hidden'); return; }
      var hits = FIG.filter(function (f) { return (f.name + ' ' + f.role + ' ' + f.cat).toLowerCase().indexOf(v) >= 0; }).slice(0, 8);
      if (!hits.length) { sug.innerHTML = '<div class="sug-item muted">No match in the list of ' + FIG.length + '.</div>'; sug.classList.remove('hidden'); return; }
      sug.innerHTML = hits.map(function (f) { return '<button class="sug-item" data-add="' + f.id + '">' + avatarHTML(f, 28) + '<span><b>' + esc(f.name) + '</b> <span class="muted small">' + esc(f.role) + '</span></span></button>'; }).join('');
      sug.classList.remove('hidden'); hydrateAvatars(sug);
    }
    q.addEventListener('input', showSug);
    q.addEventListener('focus', showSug);
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var b = sug.querySelector('[data-add]'); if (b) b.click(); } });
    container.addEventListener('click', function (e) {
      var add = e.target.closest('[data-add]'), rm = e.target.closest('[data-rm]');
      if (add) { var f = byId(add.getAttribute('data-add')); if (f && !isSelected(f)) { if (!toggle(f)) alert(MAX_SEL + ' people is the limit. Remove one first.'); } onChange(); }
      else if (rm) { state.selected = state.selected.filter(function (f) { return f.id !== rm.getAttribute('data-rm'); }); onChange(); }
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.cmp-search')) sug.classList.add('hidden'); });
  }

  /* ---------- figures gallery page ---------- */
  var CATS = [];
  FIG.forEach(function (f) { if (CATS.indexOf(f.cat) < 0) CATS.push(f.cat); });
  function renderGallery(container, user, onChange) {
    var h = '<h1>Public figures on the compass</h1><p class="muted">Editorial placements of ' + FIG.length + ' well-known people, based on their public record. Nobody here took the test. Rough by nature; the point is to give your own result some landmarks. Tap a person or a dot to add them to your comparison (up to ' + MAX_SEL + ').</p>';
    h += '<div class="cmp-search"><input id="galq" type="search" placeholder="Filter by name or role" autocomplete="off"></div>';
    h += '<div class="chips" id="galcats"><button class="chip sel" data-cat="">All</button>' + CATS.map(function (c) { return '<button class="chip" data-cat="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>';
    h += '<div class="gallery-top"><svg class="compass big" id="galcompass" viewBox="0 0 320 320" role="img" aria-label="All public figures"></svg>' + zoomControlsHTML('galcompass') + '<div id="galpick" class="small"></div></div>';
    h += '<div class="grid" id="galgrid"></div>';
    h += '<div class="share" style="margin-top:16px">' + (user ? '<a class="btn primary" id="galcmp" href="' + esc(user.link) + '">Compare with my result</a>' : '<a class="btn primary" href="#" data-nav="home">Take the test to compare</a>') + '</div>';
    container.innerHTML = h;
    var grid = $('galgrid'), q = $('galq'), svg = $('galcompass'), cat = '';
    function list() {
      var v = q.value.trim().toLowerCase();
      return FIG.filter(function (f) { return (!cat || f.cat === cat) && (!v || (f.name + ' ' + f.role + ' ' + f.why).toLowerCase().indexOf(v) >= 0); });
    }
    function pts() {
      var L = list();
      var out = L.map(function (f) { var sel = isSelected(f); return { id: f.id, econ: f.pos[0], auth: f.pos[1], label: f.name, sub: f.role, color: sel ? cssVar('--accent') : 'rgba(110,110,125,.8)', r: sel ? 9 : 6, text: sel ? initials(f.name) : '' }; });
      if (user) out.push({ id: 'you', econ: user.pos[0], auth: user.pos[1], label: 'You', color: cssVar('--accent'), r: 10, text: 'You' });
      return out;
    }
    var redraw = function () { drawCompass(svg, pts()); };
    function drawGrid() {
      var L = list();
      grid.innerHTML = L.map(function (f) {
        var sel = isSelected(f);
        return '<button class="fig' + (sel ? ' sel' : '') + '" data-fig="' + f.id + '">' + avatarHTML(f, 56) + '<div><b>' + esc(f.name) + '</b><div class="muted small">' + esc(f.role) + '</div>' +
          '<div class="small">' + AXIS_KEYS.map(function (ax, i) { return '<span class="tag">' + esc(S.band(ax, f.pos[i]).label) + '</span>'; }).join(' ') + '</div></div></button>';
      }).join('') || '<p class="muted">No match.</p>';
      hydrateAvatars(grid);
      $('galpick').innerHTML = state.selected.length ? '<b>Selected:</b> ' + state.selected.map(function (x) { return esc(x.name); }).join(', ') : '<span class="muted">Nobody selected yet.</span>';
    }
    function all() { drawGrid(); redraw(); }
    q.addEventListener('input', all);
    container.addEventListener('click', function (e) {
      var c = e.target.closest('[data-cat]');
      if (c) { cat = c.getAttribute('data-cat'); Array.prototype.forEach.call(container.querySelectorAll('[data-cat]'), function (b) { b.classList.toggle('sel', b === c); }); all(); return; }
      var b = e.target.closest('[data-fig]'); if (!b) return;
      pick(byId(b.getAttribute('data-fig')));
    });
    function pick(f) {
      if (!f) return;
      if (!toggle(f)) { alert(MAX_SEL + ' people is the limit. Remove one first.'); return; }
      all(); onChange();
    }
    svg.onDot = function (p) { if (p.id !== 'you') pick(byId(p.id)); };
    all(); attachZoom(svg); wireZoomControls(container, svg);
  }

  root.PCCompare = { state: state, render: render, renderGallery: renderGallery, drawCompass: drawCompass, selectedIds: selectedIds, setFromIds: setFromIds, byId: byId, regionFor: regionFor, REGIONS: REGIONS };
})(window);
