/* Marie Brache — portfolio behaviour. Content lives in works-data.js. */
(function () {
  "use strict";
  var WORKS = (window.WORKS || []).slice();
  document.documentElement.classList.add("js");

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function byCat(cat) {
    return WORKS.filter(function (w) { return w.category === cat; })
      .sort(function (a, b) { return b.sort - a.sort; });
  }
  // "All" view alternates design and illustration so the gallery has rhythm
  function allInterleaved() {
    var d = byCat("Professional art"), i = byCat("Personal art"), out = [];
    for (var n = 0; n < Math.max(d.length, i.length); n++) {
      if (d[n]) out.push(d[n]);
      if (i[n]) out.push(i[n]);
    }
    return out;
  }
  function metaText(w) { return w.year ? w.category + ", " + w.year : w.category; }

  function card(w) {
    var img = w.images[0];
    var thumb = "assets/img/thumbs/" + w.slug + ".jpg";
    var frame = el("div", { class: "frame" + (w.fit === "contain" ? " contain" : "") }, [
      el("img", { src: thumb, alt: img.alt, loading: "lazy", width: img.w, height: img.h })
    ]);
    var cap = el("div", { class: "cap" }, [
      el("span", { class: "title cursor-item", text: w.title }),
      el("span", { class: "meta", text: metaText(w) })
    ]);
    return el("a", { class: "card", href: "work.html?id=" + encodeURIComponent(w.slug) }, [frame, cap]);
  }

  /* ---------- home: featured ---------- */
  var featured = document.querySelector("[data-featured]");
  if (featured) {
    allInterleaved().filter(function (w) { return w.featured; })
      .forEach(function (w) { featured.appendChild(card(w)); });
  }
  var total = document.querySelector("[data-total]");
  if (total) total.textContent = WORKS.length;

  /* ---------- works gallery with filters ---------- */
  var gallery = document.querySelector("[data-gallery]");
  if (gallery) {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    buttons.forEach(function (b) {
      var f = b.getAttribute("data-filter");
      var n = f === "all" ? WORKS.length : byCat(f).length;
      b.querySelector(".count").textContent = "(" + n + ")";
    });
    function show(filter) {
      var list = filter === "all" ? allInterleaved() : byCat(filter);
      gallery.innerHTML = "";
      list.forEach(function (w) { gallery.appendChild(card(w)); });
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === filter));
      });
    }
    function fromHash() {
      var h = decodeURIComponent(location.hash.replace("#", "")).toLowerCase();
      return h === "professional" ? "Professional art" : h === "personal" ? "Personal art" : "all";
    }
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-filter");
        history.replaceState(null, "", f === "all" ? location.pathname : "#" + f.split(" ")[0].toLowerCase());
        show(f);
      });
    });
    show(fromHash());
  }

  /* ---------- single work ---------- */
  var holder = document.querySelector("[data-work]");
  if (holder) {
    var id = new URLSearchParams(location.search).get("id");
    var w = WORKS.filter(function (x) { return x.slug === id; })[0];
    if (!w) {
      holder.appendChild(el("p", { text: "That project couldn’t be found. Browse all works instead." }));
      holder.appendChild(el("p", {}, [el("a", { href: "works.html", text: "See all works" })]));
    } else {
      document.title = w.title + " | Marie Brache";
      var first = w.images[0];
      var stageImg = el("img", { src: first.src, alt: first.alt, width: first.w, height: first.h });
      var stage = el("div", { class: "stage" }, [stageImg]);
      var viewer = el("div", { class: "viewer" }, [stage]);
      if (w.images.length > 1) {
        var thumbs = el("div", { class: "thumbs", role: "group", "aria-label": "Pages and views" });
        w.images.forEach(function (im, i) {
          var b = el("button", { type: "button", "aria-label": "Show image " + (i + 1) + " of " + w.images.length,
                                 "aria-current": String(i === 0) },
                     [el("img", { src: im.src, alt: "", loading: "lazy" })]);
          b.addEventListener("click", function () {
            stageImg.src = im.src; stageImg.alt = im.alt;
            stageImg.width = im.w; stageImg.height = im.h;
            Array.prototype.forEach.call(thumbs.children, function (t, j) { t.setAttribute("aria-current", String(j === i)); });
          });
          thumbs.appendChild(b);
        });
        viewer.appendChild(thumbs);
      }
      var facts = el("dl", { class: "facts" });
      [["Completed", w.year], ["Format", w.category === "Personal art" ? "Digital image, " + w.format : w.format],
       ["Medium", w.medium], ["Made for", w.client]].forEach(function (f) {
        if (!f[1]) return;
        facts.appendChild(el("div", {}, [el("dt", { text: f[0] }), el("dd", { text: f[1] })]));
      });
      var info = el("div", { class: "info" }, [
        el("p", { class: "kind", text: w.category }),
        el("h1", { text: w.title }),
        el("p", { text: w.description }),
        facts
      ]);
      holder.appendChild(el("div", { class: "work" }, [viewer, info]));

      var list = byCat(w.category), idx = list.indexOf(w);
      var prev = list[(idx - 1 + list.length) % list.length], next = list[(idx + 1) % list.length];
      holder.appendChild(el("nav", { class: "pager", "aria-label": "More " + w.category.toLowerCase() }, [
        el("a", { class: "prev", href: "work.html?id=" + prev.slug }, [el("span", { text: "Previous" }), el("strong", { text: prev.title })]),
        el("a", { class: "next", href: "work.html?id=" + next.slug }, [el("span", { text: "Next" }), el("strong", { text: next.title })])
      ]));
      var back = document.querySelector("[data-back]");
      if (back) back.href = "works.html#" + w.category.split(" ")[0].toLowerCase();
    }
  }

  /* ---------- home: dialogue text reveals once, like an RPG text box ---------- */
  var box = document.querySelector(".dialogue");
  if (box) {
    var line = box.querySelector(".line");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function finish() { line.classList.add("done"); box.classList.add("ready"); }
    if (reduce) { finish(); }
    else {
      var text = line.textContent;
      line.setAttribute("aria-label", text);
      line.textContent = "";
      var spans = [];
      text.split("").forEach(function (c) {
        var s = el("span", { class: "ch", "aria-hidden": "true", text: c });
        line.appendChild(s); spans.push(s);
      });
      var i = 0, timer = setInterval(function () {
        for (var k = 0; k < 2 && i < spans.length; k++, i++) spans[i].style.opacity = 1;
        if (i >= spans.length) { clearInterval(timer); finish(); }
      }, 16);
      box.addEventListener("click", function () { clearInterval(timer); finish(); });
      box.addEventListener("focusin", function () { clearInterval(timer); finish(); });
    }
  }
})();
