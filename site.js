// Shared behavior for index.html and post.html.
// Page-specific code (the writing list, the markdown renderer) stays inline
// in each page; everything here is common to both.

// Images that open full-size in the lightbox. Also the set the bubble
// cursor reacts to, so anything zoomable announces itself on hover.
const ZOOMABLE = "#fig0 img, #fig-bugs img, .strip img";

// ---- Pop-out figures ----------------------------------------------------
// Fig. 0 (the author) hangs off the dagger beside the wordmark; Fig. 1
// (Bruce) off the "bugs" nav button. Click again, press Escape, or click
// elsewhere to dismiss. Opening one closes the other.
(function () {
  const HOVER_GRACE = 170;   // ms to cross the gap from trigger to figure
  const figures = [
    // `zone` is what you hover; `btn` is what you click and focus. For Fig. 0
    // they differ: hovering anywhere on the name opens it, but the dagger
    // alone is the button — the name itself is a link home.
    { btn: "author-toggle", fig: "fig0", zone: ".wordmark-group" },
    { btn: "bugs-toggle", fig: "fig-bugs", zone: null },
  ]
    .map(({ btn, fig, zone }) => {
      const b = document.getElementById(btn);
      return {
        btn: b,
        fig: document.getElementById(fig),
        zone: (zone && document.querySelector(zone)) || b,
      };
    })
    .filter(({ btn, fig }) => btn && fig);
  if (!figures.length) return;

  let timer = null;

  function setOpen(item, open) {
    item.fig.hidden = !open;
    item.btn.setAttribute("aria-expanded", String(open));
    if (open) requestAnimationFrame(() => item.fig.classList.add("shown"));
    else item.fig.classList.remove("shown");
  }

  const closeAll = (except) =>
    figures.forEach((f) => { if (f !== except && !f.fig.hidden) setOpen(f, false); });

  function open(item) {
    clearTimeout(timer);
    closeAll(item);
    setOpen(item, true);
  }
  // A grace period, so moving the pointer off the trigger and onto the photo
  // does not close the thing you are reaching for.
  function closeSoon() {
    clearTimeout(timer);
    timer = setTimeout(() => closeAll(null), HOVER_GRACE);
  }

  figures.forEach((item) => {
    item.zone.addEventListener("mouseenter", () => open(item));
    item.zone.addEventListener("mouseleave", closeSoon);
    item.fig.addEventListener("mouseenter", () => clearTimeout(timer));
    item.fig.addEventListener("mouseleave", closeSoon);
    item.btn.addEventListener("focus", () => open(item));
    item.btn.addEventListener("blur", closeSoon);
    // Click still toggles — the only way in on touch, and for keyboard users.
    item.btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = item.fig.hidden;
      closeAll(item);
      setOpen(item, willOpen);
    });
  });

  document.addEventListener("click", (e) => {
    figures.forEach((item) => {
      if (!item.fig.hidden && !item.fig.contains(e.target)) setOpen(item, false);
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll(null);
  });
})();

// ---- Visits as training steps -------------------------------------------
// Total visits from GoatCounter become the "step" count under the loss
// curve: every visitor is one more gradient update. Fails silently — if
// analytics are unreachable, the caption just says "still descending".
// Setup: replace YOURCODE with your GoatCounter code (see README).
(function () {
  const caption = document.getElementById("loss-caption");
  if (!caption) return;                 // post pages have no loss curve
  const GC = "YOURCODE";
  if (GC === "YOUR" + "CODE") return;   // not configured yet
  fetch("https://" + GC + ".goatcounter.com/counter//TOTAL.json")
    .then(r => r.json())
    .then(d => {
      const n = parseInt(String(d.count).replace(/\D/g, ""), 10);
      if (!Number.isFinite(n)) return;
      caption.textContent = "step " + n.toLocaleString("en-US") + " · still descending";
    })
    .catch(() => {});
})();

// ---- The wanderer -------------------------------------------------------
// A single ink dot drifting down the left margin, leaving a fading trace.
// The path is a damped random walk rather than a fixed curve: every frame
// adds a random impulse, friction bleeds it off over ~750ms, and a very
// weak pull toward the band centre stops it parking against an edge. The
// steady descent is kept OUT of the friction term, otherwise drag cancels
// it and the dot stalls. Nothing repeats; it wanders the full width of the
// margin and sometimes drifts back upward.
// Lives only in the whitespace outside the text column, disappears on
// narrow screens, and respects reduced-motion settings.
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = document.getElementById("wanderer");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const COLUMN = 680;          // must match .wrap max-width in style.css
  const MIN_MARGIN = 110;      // px of free margin required to run
  const EDGE_PAD = 18;         // clearance from the text and the window edge

  // These four are time-scaled together (x0.4), which slows the dot without
  // narrowing its range: halving speed alone would also shrink the wander.
  const JITTER = 0.0004;       // random impulse strength
  const FRICTION = 1875;       // ms for an impulse to decay ~63%
  const CENTRE_PULL = 0.00000013;
  const FALL = 0.006;          // steady descent, px/ms — a pass takes ~2.2min

  let w = 0, h = 0, dpr = 1, running = false, raf = null;
  let bandL = 0, bandR = 0;
  let x = 0, y = 0, wx = 0, wy = 0, last = 0;
  const noise = () => Math.random() * 2 - 1;

  // --- Carrying the trace across pages ---------------------------------
  // Moving between the index and a post would normally wipe everything the
  // dot has drawn. Snapshot the canvas on the way out, paint it back on
  // arrival. A real refresh clears it — that is the one way to start over.
  // Stored as JPEG: the canvas is opaque paper with a few faint marks, so it
  // compresses to a few tens of KB, well inside the sessionStorage quota.
  const TRACE_KEY = "wanderer-trace";
  let restored = null;

  function paintRestored() {
    if (restored && w && h) ctx.drawImage(restored, 0, 0, w, h);
  }

  (function loadTrace() {
    let nav = "";
    try {
      nav = (performance.getEntriesByType("navigation")[0] || {}).type || "";
    } catch (e) { /* older browsers — just try to restore */ }
    try {
      if (nav === "reload") { sessionStorage.removeItem(TRACE_KEY); return; }
      const saved = sessionStorage.getItem(TRACE_KEY);
      if (!saved) return;
      const im = new Image();
      im.onload = () => { restored = im; paintRestored(); };
      im.src = saved;
    } catch (e) { /* storage blocked — the trace simply starts fresh */ }
  })();

  window.addEventListener("pagehide", () => {
    if (!running) return;
    try {
      sessionStorage.setItem(TRACE_KEY, canvas.toDataURL("image/jpeg", 0.7));
    } catch (e) { /* quota exceeded — drop it rather than break navigation */ }
  });

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#FCFCFA"; ctx.fillRect(0, 0, w, h);
    paintRestored();

    const margin = (w - COLUMN) / 2;
    bandL = EDGE_PAD;                // just inside the window edge
    bandR = margin - EDGE_PAD;       // just left of the text column
    if (x < bandL || x > bandR) x = bandL + Math.random() * (bandR - bandL);

    const ok = margin >= MIN_MARGIN && !reduced.matches;
    canvas.style.display = ok ? "block" : "none";
    if (ok && !running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
    if (!ok && running) { running = false; cancelAnimationFrame(raf); }
  }

  function frame(now) {
    if (!running) return;
    const dt = last ? Math.min(now - last, 50) : 16;   // cap after a tab switch
    last = now;

    // Gentle fade toward paper — this is what turns motion into a trace.
    ctx.fillStyle = "rgba(252, 252, 250, 0.045)";
    ctx.fillRect(0, 0, w, h);

    const decay = Math.exp(-dt / FRICTION);

    // Horizontal: random walk, softly centred, reflecting off the band edges.
    wx += noise() * JITTER * dt;
    wx += ((bandL + bandR) / 2 - x) * CENTRE_PULL * dt;
    wx *= decay;
    x += wx * dt;
    if (x < bandL) { x = bandL; wx = Math.abs(wx) * 0.5; }
    if (x > bandR) { x = bandR; wx = -Math.abs(wx) * 0.5; }

    // Vertical: the same jitter riding on top of the constant descent, so it
    // hesitates and sometimes climbs without ever stalling.
    wy += noise() * JITTER * dt;
    wy *= decay;
    y += (FALL + wy) * dt;
    if (y > h + 60) { y = -60; x = bandL + Math.random() * (bandR - bandL); }
    if (y < -60) y = h + 60;

    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(28, 27, 24, 0.5)";
    ctx.fill();

    raf = requestAnimationFrame(frame);
  }

  reduced.addEventListener?.("change", resize);
  window.addEventListener("resize", resize);
  resize();
})();

// ---- Bubble cursor & ink ripples ----------------------------------------
// The pointer is a soap bubble: a thin film that thickens toward the rim,
// a faint iridescent edge, a specular highlight up-left and a weaker bounce
// light down-right, and an outline that breathes with surface tension.
// Clicking bursts it — droplets scatter and rings spread from the break all
// the way to the furthest corner of the window before dissolving. Only once
// the last ring is gone does a new bubble swell back into place.
// Drawn on an overlay canvas cleared every frame: unlike the wanderer, this
// must not smear across the text. Skipped entirely without a fine pointer
// (touch) or under reduced-motion, where the native cursor is left alone.
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = window.matchMedia("(pointer: fine)");
  if (!fine.matches || reduced.matches) return;

  const canvas = document.createElement("canvas");
  canvas.id = "surface";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  document.documentElement.classList.add("bubble-cursor");

  const TAU = Math.PI * 2;
  const INK = "28, 27, 24";
  const PAPER = "252, 252, 250";
  const IRI = "43, 74, 203";     // the link blue, used as a hint of iridescence
  const R_IDLE = 11;             // bubble radius at rest
  const R_HOT = 15;              // over a link or button
  const POP_HIDE_MS = 600;       // gone this long after a burst, then swells back
  const REFORM_MS = 420;         // how long the swelling itself takes
  const RIPPLE_BASE = 900;       // ms, plus travel time to the far corner
  const RIPPLE_PER_PX = 1.9;
  const MAX_RIPPLES = 4;

  let w = 0, h = 0, dpr = 1;
  let mx = -200, my = -200, inside = false, hot = false;
  let radius = R_IDLE, reformAt = -1e9;
  const ripples = [], drops = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY; inside = true;
    hot = !!(e.target.closest &&
             e.target.closest("a, button, [role=button], " + ZOOMABLE));
  }, { passive: true });
  document.addEventListener("mouseleave", () => { inside = false; });
  document.addEventListener("mouseenter", () => { inside = true; });

  document.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    const now = performance.now();
    const x = e.clientX, y = e.clientY;
    // Reach the furthest corner, so the ring always dies at the page edge.
    const reach = Math.max(
      Math.hypot(x, y), Math.hypot(w - x, y),
      Math.hypot(x, h - y), Math.hypot(w - x, h - y)
    );
    const life = RIPPLE_BASE + reach * RIPPLE_PER_PX;
    if (ripples.length >= MAX_RIPPLES) ripples.shift();
    ripples.push({ x, y, t0: now, life, reach, seed: Math.random() * 6.28 });
    reformAt = now + POP_HIDE_MS;   // independent of how far the ripple travels
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * TAU;
      const s = 0.05 + Math.random() * 0.11;
      drops.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.03,
        r: 0.8 + Math.random() * 1.3, life: 1,
      });
    }
  }, { passive: true });

  // A closed wobbling contour. Radius is perturbed by two low-frequency
  // sines so nothing reads as a vector circle — ink in water, not geometry.
  function contour(cx, cy, r, seed, m1, m2, step) {
    ctx.beginPath();
    for (let a = 0; a <= TAU + 0.001; a += step) {
      const rr = r * (1 + m1 * Math.sin(a * 2 + seed) + m2 * Math.sin(a * 3 - seed * 1.7));
      const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr;
      if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function ripple(cx, cy, r, seed, alpha, width) {
    if (alpha <= 0.002 || r <= 0) return;
    contour(cx, cy, r, seed, 0.020, 0.013, Math.PI / 60);
    ctx.strokeStyle = "rgba(" + INK + ", " + alpha + ")";
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function bubble(cx, cy, r, t) {
    // Film: nearly clear at the centre, thickening to an iridescent rim.
    contour(cx, cy, r, t * 0.0016, 0.030, 0.018, Math.PI / 72);
    const g = ctx.createRadialGradient(cx, cy, r * 0.05, cx, cy, r * 1.02);
    g.addColorStop(0.00, "rgba(" + INK + ", 0.02)");
    g.addColorStop(0.62, "rgba(" + INK + ", 0.06)");
    g.addColorStop(0.88, "rgba(" + IRI + ", 0.16)");
    g.addColorStop(1.00, "rgba(" + INK + ", 0.16)");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "rgba(" + INK + ", 0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
    // The lit side is up-left, so the rim reads heavier along the bottom.
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.99, Math.PI * 0.06, Math.PI * 0.94);
    ctx.strokeStyle = "rgba(" + INK + ", 0.6)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // Specular highlight, and a weaker bounce off the far wall.
    ctx.save();
    ctx.translate(cx - r * 0.32, cy - r * 0.36);
    ctx.rotate(-0.6);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.32, r * 0.17, 0, 0, TAU);
    ctx.fillStyle = "rgba(" + PAPER + ", 1)";
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx + r * 0.33, cy + r * 0.35, r * 0.12, 0, TAU);
    ctx.fillStyle = "rgba(" + PAPER + ", 0.85)";
    ctx.fill();
  }

  let last = 0;
  function frame(now) {
    const dt = last ? Math.min(now - last, 50) : 16;
    last = now;
    ctx.clearRect(0, 0, w, h);

    // Rings widen to the far corner, thinning and fading as they go.
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      const t = (now - rp.t0) / rp.life;
      if (t >= 1) { ripples.splice(i, 1); continue; }
      const ease = 1 - Math.pow(1 - t, 2.2);     // fast off the mark, then coasting
      const fade = Math.pow(1 - t, 1.4);
      const R = ease * rp.reach;
      ripple(rp.x, rp.y, R, rp.seed, 0.30 * fade, Math.max(0.4, 1.8 * (1 - t)));
      ripple(rp.x, rp.y, R * 0.70, rp.seed + 1.3, 0.17 * fade, Math.max(0.4, 1.3 * (1 - t)));
      ripple(rp.x, rp.y, R * 0.42, rp.seed + 2.6, 0.09 * fade, Math.max(0.4, 1.0 * (1 - t)));
    }

    // Droplets from the burst, thrown out and pulled down.
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.vy += 0.00022 * dt;
      d.x += d.vx * dt; d.y += d.vy * dt;
      d.life -= dt / 620;
      if (d.life <= 0) { drops.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r * d.life, 0, TAU);
      ctx.fillStyle = "rgba(" + INK + ", " + (0.42 * d.life) + ")";
      ctx.fill();
    }

    // No bubble at all while a ripple is still travelling.
    if (inside && now >= reformAt) {
      const k = Math.min(1, (now - reformAt) / REFORM_MS);
      const scale = 1 - Math.pow(1 - k, 3);      // ease back into being
      radius += ((hot ? R_HOT : R_IDLE) - radius) * Math.min(1, dt / 90);
      const r = radius * scale;
      if (r > 0.6) bubble(mx, my, r, now);
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
})();

// ---- Wordmark: don't reload the page you are already on -------------------
// The name links home, but on the homepage that would reload and wipe the
// wanderer's accumulated trace for no navigation gain. Cross-page trips
// (a post back to the index) still reload — that is a real navigation.
(function () {
  const home = document.querySelector("a.wordmark");
  if (!home) return;
  const norm = (p) => p.replace(/\/$/, "/index.html");
  home.addEventListener("click", (e) => {
    if (norm(location.pathname) === norm(new URL(home.href).pathname)) {
      e.preventDefault();
    }
  });
})();

// ---- Lightbox -------------------------------------------------------------
// The header figures are cropped to fit their small frames, so clicking one
// opens the whole photo. Click anywhere or press Escape to dismiss.
(function () {
  let box = null, img = null, cap = null;

  function build() {
    box = document.createElement("div");
    box.className = "lightbox";
    box.hidden = true;
    const fig = document.createElement("figure");
    img = document.createElement("img");
    img.alt = "";
    cap = document.createElement("figcaption");
    cap.className = "mono";
    fig.append(img, cap);
    box.appendChild(fig);
    box.addEventListener("click", close);
    document.body.appendChild(box);
  }

  function open(src, alt, caption) {
    if (!box) build();
    img.src = src;
    img.alt = alt || "";
    cap.textContent = caption || "";
    box.hidden = false;
    requestAnimationFrame(() => box.classList.add("shown"));
  }

  function close() {
    if (!box || box.hidden) return;
    box.classList.remove("shown");
    setTimeout(() => { box.hidden = true; }, 200);
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest) return;
    const hit = e.target.closest(ZOOMABLE);
    if (!hit) return;
    e.preventDefault();
    const figure = hit.closest("figure");
    const text = figure && figure.querySelector("figcaption");
    open(hit.src, hit.alt, text ? text.textContent : "");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();
