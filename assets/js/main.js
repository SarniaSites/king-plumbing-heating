/* King Plumbing & Heating: site behaviour (vanilla JS, no dependencies)
   - header, nav, mobile menu, sticky bar
   - the 24-hour low-rate dial (hero + interactive section) and the cylinder
   - services explorer, gallery lightbox, quote form (with its dial ring) */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  /* ---------- Low-rate hours (from the meter sticker in the pack: Super Economy 12, Band 03A) ---------- */
  var LOW = [[0, 390], [810, 930], [1230, 1440]]; // minutes: 00:00–06:30, 13:30–15:30, 20:30–24:00
  function isLow(m) { m = ((m % 1440) + 1440) % 1440; return LOW.some(function (w) { return m >= w[0] && m < w[1]; }); }
  function fmt(m) { m = ((Math.round(m) % 1440) + 1440) % 1440; var h = Math.floor(m / 60), mm = m % 60; return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm; }
  function guernseyMinutes() {
    try {
      var p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Guernsey", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var h = +p.find(function (x) { return x.type === "hour"; }).value, mi = +p.find(function (x) { return x.type === "minute"; }).value;
      return (h % 24) * 60 + mi;
    } catch (e) { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  }

  /* ---------- Dial drawing ---------- */
  function pt(r, deg) { var a = (deg - 90) * Math.PI / 180; return [200 + r * Math.cos(a), 200 + r * Math.sin(a)]; }
  function arc(r, m0, m1) {
    var a0 = m0 / 1440 * 360, a1 = m1 / 1440 * 360, p0 = pt(r, a0), p1 = pt(r, a1);
    return "M" + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + " A" + r + " " + r + " 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + p1[0].toFixed(2) + " " + p1[1].toFixed(2);
  }
  function el(tag, attrs) { var n = document.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); return n; }

  function buildDial(svg, big) {
    var arcs = $("[data-arcs]", svg), ticks = $("[data-ticks]", svg), labels = $("[data-labels]", svg);
    var rArc = big ? 180 : 181, wArc = big ? 22 : 20;
    // the night window crosses midnight: draw 20:30→24:00 and 00:00→06:30 as one arc
    [[1230, 1830], [810, 930]].forEach(function (w) {
      var p = el("path", { d: arc(rArc, w[0], w[1]), fill: "none", stroke: "#F2D23C", "stroke-width": wArc, "class": "ring-draw" });
      arcs.appendChild(p);
    });
    var d = "";
    for (var i = 0; i < 96; i++) {
      var deg = i / 96 * 360, hourMain = i % 12 === 0, hour = i % 4 === 0;
      var r1 = 192, r0 = hourMain ? 168 : hour ? 175 : 185;
      var a = pt(r1, deg), b = pt(r0, deg);
      d += "M" + a[0].toFixed(1) + " " + a[1].toFixed(1) + "L" + b[0].toFixed(1) + " " + b[1].toFixed(1);
    }
    ticks.appendChild(el("path", { d: d, "stroke-width": big ? 2 : 2.2 }));
    var every = big ? 3 : 6, rl = big ? 152 : 160;
    for (var h = 0; h < 24; h += every) {
      var q = pt(rl, h / 24 * 360);
      var t = el("text", { x: q[0].toFixed(1), y: (q[1] + 5).toFixed(1) });
      t.textContent = (h < 10 ? "0" : "") + h;
      labels.appendChild(t);
    }
    $$(".ring-draw", svg).forEach(function (p) { var L = p.getTotalLength(); p.style.setProperty("--len", L.toFixed(1)); });
  }

  /* ---------- Header, nav, menu, sticky bar ---------- */
  function initHeader() {
    var hdr = $("[data-header]"), bar = $("[data-mbar]"), hero = $("#top");
    var onScroll = function () {
      var y = window.scrollY;
      hdr.classList.toggle("is-scrolled", y > 24);
      if (bar) bar.classList.toggle("is-on", y > (hero ? hero.offsetHeight * 0.6 : 400));
    };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

    var links = $$("[data-nav]");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle("is-active", l.dataset.nav === e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (l) { var s = document.getElementById(l.dataset.nav); if (s) io.observe(s); });

    var burger = $("[data-burger]"), menu = $("[data-mmenu]");
    if (burger && menu) {
      var set = function (open) {
        burger.setAttribute("aria-expanded", open); burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        menu.classList.toggle("is-open", open); document.body.style.overflow = open ? "hidden" : "";
      };
      burger.addEventListener("click", function () { set(burger.getAttribute("aria-expanded") !== "true"); });
      $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("is-open")) { set(false); burger.focus(); } });
    }
  }

  /* ---------- Hero dial: live Guernsey time against the low-rate hours ---------- */
  function initHeroDial() {
    var svg = $('[data-dial="hero"]'); if (!svg) return;
    buildDial(svg, false);
    var hand = $("[data-hand]", svg), status = $("[data-hero-status]");
    function nextLow(m) { for (var k = 1; k <= 1440; k++) { if (isLow(m + k) && !isLow(m + k - 1)) return fmt(m + k); } return "20:30"; }
    function lowEnds(m) { for (var k = 1; k <= 1440; k++) { if (!isLow(m + k)) return fmt(m + k); } return "06:30"; }
    function update() {
      var m = guernseyMinutes();
      hand.style.transform = "rotate(" + (m / 1440 * 360) + "deg)";
      if (status) status.textContent = isLow(m) ? "Low rate on now, until " + lowEnds(m) : "Next low rate at " + nextLow(m);
    }
    hand.style.transform = "rotate(0deg)";
    requestAnimationFrame(function () {
      svg.classList.add("is-drawn");
      setTimeout(update, reduced ? 0 : 650);
    });
    setInterval(update, 30000);

    // gentle cursor drift on fine pointers
    var layer = $("[data-tilt]");
    if (layer && !reduced && window.matchMedia("(pointer: fine)").matches) {
      var amt = +layer.dataset.tilt || 10;
      window.addEventListener("pointermove", function (e) {
        var x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
        layer.style.transform = "translate(" + (x * amt).toFixed(1) + "px," + (y * amt).toFixed(1) + "px) rotate(" + (x * 3).toFixed(2) + "deg)";
      }, { passive: true });
    }
  }

  /* ---------- Signature: turn the dial, watch the cylinder ---------- */
  function initLowRate() {
    var wrap = $("[data-lowrate]"); if (!wrap) return;
    var svg = $('[data-dial="big"]', wrap); buildDial(svg, true);
    var hand = $("[data-hand]", svg), clock = $("[data-clock]", wrap), rate = $("[data-rate]", wrap);
    var hot = $("[data-hot]", wrap), coil = $("[data-coil]", wrap), tank = $("[data-tank]", wrap), cyl = $("[data-cylinder]", wrap);
    var playBtn = $("[data-play]");

    // A simple model of one day: heat only in low-rate hours, use hot water morning, lunchtime and evening.
    var level = new Float32Array(1440), L = 1;
    function use(m) {
      if (m >= 405 && m < 495) return 0.0048;   // morning showers
      if (m >= 720 && m < 780) return 0.0012;   // lunchtime
      if (m >= 1080 && m < 1260) return 0.0024; // evening washing up and baths
      return 0.00008;                           // standing loss
    }
    for (var day = 0; day < 3; day++) for (var m = 0; m < 1440; m++) {
      L = L - use(m) + (isLow(m) ? 0.0046 : 0);
      L = Math.max(0.08, Math.min(1, L)); level[m] = L;
    }

    var cur = 420, raf = null;
    function render(min) {
      cur = ((min % 1440) + 1440) % 1440;
      var mi = Math.floor(cur), low = isLow(mi), lv = level[mi];
      hand.style.transform = "rotate(" + (cur / 1440 * 360) + "deg)";
      clock.textContent = fmt(cur);
      rate.textContent = low ? "Low rate: element on" : "Normal rate: element off";
      rate.style.background = low ? "#F2D23C" : "rgba(238,239,241,.12)";
      rate.style.color = low ? "#25262A" : "#EEEFF1";
      hot.style.transform = "scaleY(" + lv.toFixed(3) + ")";
      coil.setAttribute("stroke", low ? "#F2D23C" : "#5A5C62");
      cyl.classList.toggle("is-heating", low && lv < 0.995 && !reduced);
      tank.textContent = "Tank: " + (lv > 0.9 ? "full" : lv > 0.62 ? "mostly hot" : lv > 0.35 ? "about half" : "running low");
      svg.setAttribute("aria-valuenow", Math.floor(cur));
      svg.setAttribute("aria-valuetext", fmt(cur) + ", " + (low ? "low rate" : "normal rate"));
    }
    render(cur);

    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
    function play() {
      stop();
      if (reduced) { render(840); return; }
      var start = null, from = cur, dur = 9000;
      var step = function (t) {
        if (!start) start = t;
        var p = Math.min(1, (t - start) / dur);
        var e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        render(from + e * 1440);
        if (p < 1) raf = requestAnimationFrame(step); else raf = null;
      };
      raf = requestAnimationFrame(step);
    }
    if (playBtn) playBtn.addEventListener("click", play);

    // drag
    function fromEvent(e) {
      var r = svg.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      var deg = (Math.atan2(y, x) * 180 / Math.PI + 90 + 360) % 360;
      return Math.round(deg / 360 * 1440 / 5) * 5;
    }
    var dragging = false;
    svg.addEventListener("pointerdown", function (e) { stop(); dragging = true; svg.setPointerCapture(e.pointerId); render(fromEvent(e)); });
    svg.addEventListener("pointermove", function (e) { if (dragging) render(fromEvent(e)); });
    var end = function () { dragging = false; };
    svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
    svg.addEventListener("keydown", function (e) {
      var k = e.key, d = 0;
      if (k === "ArrowRight" || k === "ArrowUp") d = 15; else if (k === "ArrowLeft" || k === "ArrowDown") d = -15;
      else if (k === "PageUp") d = 60; else if (k === "PageDown") d = -60;
      else if (k === "Home") { stop(); render(0); e.preventDefault(); return; } else if (k === "End") { stop(); render(1435); e.preventDefault(); return; }
      if (d) { stop(); render(cur + d); e.preventDefault(); }
    });

    // play the day once when the section first comes into view
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); svg.classList.add("is-drawn"); setTimeout(play, 900); }
    }, { threshold: 0.45 });
    io.observe(wrap);
    // pause the convection loop offscreen
    new IntersectionObserver(function (es) { cyl.classList.toggle("is-offscreen", !es[0].isIntersecting); }).observe(wrap);
  }

  /* ---------- Services explorer ---------- */
  function initServices() {
    var root = $("[data-services]"); if (!root) return;
    var tabs = $$("[role=tab]", root);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab, p = document.getElementById(t.getAttribute("aria-controls"));
        t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
        if (p) p.classList.toggle("is-active", on);
      });
      if (focus) tab.focus();
      if (window.innerWidth < 1024) {
        var r = tab.getBoundingClientRect();
        if (r.top < 70 || r.top > window.innerHeight * 0.6) window.scrollBy({ top: r.top - 90, behavior: reduced ? "auto" : "smooth" });
      }
    }
    tabs.forEach(function (t, i) {
      t.tabIndex = t.getAttribute("aria-selected") === "true" ? 0 : -1;
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") n = tabs[0]; if (e.key === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    // "Ask about…" links preselect the service in the form
    $$("[data-pick]").forEach(function (a) {
      a.addEventListener("click", function () {
        var sel = $("#f-service"); if (!sel) return;
        sel.value = a.dataset.pick; sel.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  }

  /* ---------- Gallery lightbox ---------- */
  function initLightbox() {
    var g = $("[data-gallery]"), lb = $("[data-lightbox]"); if (!g || !lb) return;
    var items = $$("a", g), img = $("[data-lb-img]", lb), cap = $("[data-lb-cap]", lb), count = $("[data-lb-count]", lb);
    var idx = 0, last = null;
    function show(i) {
      idx = (i + items.length) % items.length;
      var a = items[idx], th = $("img", a);
      img.style.opacity = 0;
      var n = new Image(); n.onload = function () { img.src = n.src; img.alt = th.alt; img.style.opacity = 1; }; n.src = a.getAttribute("href");
      cap.textContent = a.dataset.caption || ""; count.textContent = (idx + 1) + " / " + items.length;
    }
    function open(i) { last = document.activeElement; show(i); lb.classList.add("is-open"); document.body.style.overflow = "hidden"; $("[data-lb-close]", lb).focus(); }
    function close() { lb.classList.remove("is-open"); document.body.style.overflow = ""; if (last) last.focus(); }
    items.forEach(function (a, i) { a.addEventListener("click", function (e) { e.preventDefault(); open(i); }); });
    $("[data-lb-close]", lb).addEventListener("click", close);
    $("[data-lb-prev]", lb).addEventListener("click", function () { show(idx - 1); });
    $("[data-lb-next]", lb).addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.tagName === "FIGURE") close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close(); if (e.key === "ArrowLeft") show(idx - 1); if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "Tab") { var f = $$("button", lb).filter(function (b) { return b.offsetParent; }); var fi = f.indexOf(document.activeElement); if (e.shiftKey && fi <= 0) { f[f.length - 1].focus(); e.preventDefault(); } else if (!e.shiftKey && fi === f.length - 1) { f[0].focus(); e.preventDefault(); } }
    });
    var sx = null;
    lb.addEventListener("pointerdown", function (e) { sx = e.clientX; });
    lb.addEventListener("pointerup", function (e) { if (sx === null) return; var dx = e.clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); sx = null; });
  }

  /* ---------- Quote form: inline validation, the dial ring, submit state ---------- */
  function initForm() {
    var form = $("[data-form]"); if (!form) return;
    var ring = $("[data-ring]", form), segG = $("[data-ring-segs]", form), tick = $("[data-ring-tick]", form), crown = $("[data-ring-crown]", form);
    var segs = [];
    for (var i = 0; i < 24; i++) {
      var a0 = i / 24 * 360 + 2, a1 = (i + 1) / 24 * 360 - 2;
      var p0 = [50 + 40 * Math.sin(a0 * Math.PI / 180), 50 - 40 * Math.cos(a0 * Math.PI / 180)], p1 = [50 + 40 * Math.sin(a1 * Math.PI / 180), 50 - 40 * Math.cos(a1 * Math.PI / 180)];
      var s = el("path", { d: "M" + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + " A40 40 0 0 1 " + p1[0].toFixed(2) + " " + p1[1].toFixed(2), stroke: "#5A5C62", "class": "ring-seg" });
      segG.appendChild(s); segs.push(s);
    }
    var fields = $$(".field", form);
    var req = ["f-name", "f-phone", "f-service", "f-msg"];
    function check(f, show) {
      var inp = $("input,select,textarea", f), ok = inp.checkValidity() && (!inp.required || inp.value.trim() !== "");
      if (show || f.classList.contains("invalid")) { f.classList.toggle("invalid", !ok); }
      f.classList.toggle("valid", ok && inp.value.trim() !== "");
      return ok;
    }
    function progress() {
      var done = req.filter(function (id) { var n = document.getElementById(id); return n.value.trim() !== "" && n.checkValidity(); }).length;
      var lit = done * 6;
      segs.forEach(function (s, i) { s.setAttribute("stroke", i < lit ? "#F2D23C" : "#5A5C62"); s.style.transitionDelay = (Math.max(0, i - (lit - 6)) * 25) + "ms"; });
    }
    fields.forEach(function (f) {
      var inp = $("input,select,textarea", f);
      inp.addEventListener("blur", function () { if (inp.value.trim() !== "" || f.classList.contains("invalid")) check(f, true); });
      inp.addEventListener("input", function () { check(f, false); progress(); });
      inp.addEventListener("change", function () { check(f, false); progress(); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = fields.filter(function (f) { return !check(f, true); });
      if (bad.length) { $("input,select,textarea", bad[0]).focus(); return; }
      var btn = $("[data-submit]", form);
      btn.classList.add("is-loading"); btn.disabled = true; $("[data-submit-label]", form).textContent = "Sending…";
      segs.forEach(function (s) { s.setAttribute("stroke", "#F2D23C"); });
      crown.style.opacity = 0; tick.style.transition = "opacity .3s ease .2s"; tick.style.opacity = 1;
      setTimeout(function () { HTMLFormElement.prototype.submit.call(form); }, reduced ? 0 : 700);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeader(); initHeroDial(); initLowRate(); initServices(); initLightbox(); initForm();
    var y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();
  });
})();
