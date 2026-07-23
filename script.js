(function () {
  "use strict";

  /* ── Türkçe karakter haritası ── */
  var TR = ["ü","Ü","ş","Ş","ğ","Ğ","ı","İ","ö","Ö","ç","Ç"];
  var TR_SET = {};
  TR.forEach(function (c) { TR_SET[c] = true; });

  var $ = function (id) { return document.getElementById(id); };
  var input = $("input"), output = $("output");
  var dirSel = $("dirSel"), fmtSel = $("fmtSel"), scopeSel = $("scopeSel"), lowerChk = $("lowerChk");

  /* ── TEMA ── */
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem("theme");
    if (saved) root.setAttribute("data-theme", saved);
    else if (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) root.setAttribute("data-theme", "dark");
  } catch (e) {}
  function syncThemeIcon() {
    $("themeBtn").innerHTML = root.getAttribute("data-theme") === "dark"
      ? '<i class="fa fa-sun"></i>' : '<i class="fa fa-moon"></i>';
  }
  syncThemeIcon();
  $("themeBtn").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    syncThemeIcon();
  });

  /* ── TOAST ── */
  function alertMsg(message, type) {
    var box = document.createElement("div");
    box.className = "alert-box " + (type === "warn" ? "warn" : "copy");
    box.innerHTML = '<div class="alertContent"><div class="alertIcon"><i class="fa ' +
      (type === "warn" ? "fa-triangle-exclamation" : "fa-circle-check") +
      '"></i></div><div class="alertMessage">' + message + "</div></div>";
    $("alertBox").appendChild(box);
    requestAnimationFrame(function () { box.classList.add("show"); });
    setTimeout(function () {
      box.classList.remove("show");
      setTimeout(function () { box.remove(); }, 350);
    }, 2200);
  }

  /* ── KOPYALAMA ── */
  function copyText(text) {
    if (!text) return Promise.reject(new Error("empty"));
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) {}
      ta.remove();
      ok ? res() : rej(new Error("fail"));
    });
  }

  /* ── HEX yardımcıları ── */
  function hex4(n) {
    var h = n.toString(16).toUpperCase();
    while (h.length < 4) h = "0" + h;
    return lowerChk.checked ? h.toLowerCase() : h;
  }
  function hex6(n) {
    var h = n.toString(16).toUpperCase();
    while (h.length < 6) h = "0" + h;
    return lowerChk.checked ? h.toLowerCase() : h;
  }

  function escapeUnit(code, fmt) {
    switch (fmt) {
      case "css":   return "\\" + hex6(code);
      case "htmlx": return "&#x" + (lowerChk.checked ? code.toString(16) : code.toString(16).toUpperCase()) + ";";
      case "htmld": return "&#" + code + ";";
      default:      return "\\u" + hex4(code);
    }
  }

  function shouldEscape(ch, scope) {
    var code = ch.charCodeAt(0);
    if (scope === "tr") return TR_SET[ch] === true;
    if (code > 127) return true;
    if (scope === "strict") return ch === "\\" || ch === '"' || ch === "'" || ch === "\n" || ch === "\r" || ch === "\t";
    return false;
  }

  var STRICT_SHORT = { "\\": "\\\\", '"': '\\"', "'": "\\'", "\n": "\\n", "\r": "\\r", "\t": "\\t" };

  /* ── KODLAMA ── */
  function encode(text) {
    var fmt = fmtSel.value, scope = scopeSel.value, out = "", n = 0;

    if (fmt === "pct") {
      for (var k = 0; k < text.length; k++) {
        var c = text[k];
        if (!shouldEscape(c, scope)) { out += c; continue; }
        // tam kod noktasını al (emoji vb. için)
        var cp = text.codePointAt(k), seg = String.fromCodePoint(cp);
        if (seg.length === 2) k++;
        out += encodeURIComponent(seg).toUpperCase();
        n++;
      }
      return { text: out, count: n };
    }

    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (!shouldEscape(ch, scope)) { out += ch; continue; }
      if (scope === "strict" && STRICT_SHORT[ch] && fmt === "js") { out += STRICT_SHORT[ch]; n++; continue; }
      var code = ch.charCodeAt(0);
      if (fmt !== "js" && code >= 0xD800 && code <= 0xDBFF && i + 1 < text.length) {
        // CSS/HTML tam kod noktasını tek kaçışla yazar
        var full = text.codePointAt(i);
        out += escapeUnit(full, fmt); i++; n++; continue;
      }
      out += escapeUnit(code, fmt);
      n++;
    }
    return { text: out, count: n };
  }

  /* ── ÇÖZME ── */
  var DEC_RE = /\\u\{([0-9a-fA-F]{1,6})\}|\\u([0-9a-fA-F]{4})|\\x([0-9a-fA-F]{2})|\\([0-9a-fA-F]{1,6})[ ]?|&#x([0-9a-fA-F]+);|&#(\d+);|%[0-9a-fA-F]{2}(?:%[0-9a-fA-F]{2})*|\\n|\\r|\\t|\\\\|\\"|\\'/g;

  function decode(text) {
    var n = 0;
    var out = text.replace(DEC_RE, function (m, uBrace, u4, x2, cssHex, hx, dec) {
      n++;
      try {
        if (m === "\\n") return "\n";
        if (m === "\\r") return "\r";
        if (m === "\\t") return "\t";
        if (m === "\\\\") return "\\";
        if (m === '\\"') return '"';
        if (m === "\\'") return "'";
        if (m[0] === "%") return decodeURIComponent(m);
        var cp = uBrace ? parseInt(uBrace, 16)
               : u4     ? parseInt(u4, 16)
               : x2     ? parseInt(x2, 16)
               : cssHex ? parseInt(cssHex, 16)
               : hx     ? parseInt(hx, 16)
               :          parseInt(dec, 10);
        if (isNaN(cp) || cp < 0 || cp > 0x10FFFF) { n--; return m; }
        if (cp >= 0xD800 && cp <= 0xDFFF) return String.fromCharCode(cp); // vekil, çift birleşsin
        return String.fromCodePoint(cp);
      } catch (e) { n--; return m; }
    });
    return { text: out, count: n };
  }

  /* ── UTF-8 bayt sayacı ── */
  function byteLen(s) {
    if (window.TextEncoder) return new TextEncoder().encode(s).length;
    return unescape(encodeURIComponent(s)).length;
  }

  /* ── ANA DÖNÜŞÜM ── */
  function run() {
    var src = input.value;
    var isEnc = dirSel.value === "enc";
    var res = isEnc ? encode(src) : decode(src);

    output.value = res.text;

    $("inLabel").textContent  = isEnc ? "Metin" : "Kaçış kodu";
    $("outLabel").textContent = isEnc ? "Kaçış kodu" : "Metin";
    input.placeholder = isEnc
      ? "Buraya yazın veya yapıştırın\nörn: Şeftali ağacı ışıldıyor"
      : "Kaçış kodunu yapıştırın\nörn: \\u015Eeftali a\\u011Fac\\u0131";

    $("inChars").textContent = src.length;
    $("inLines").textContent = src ? src.split("\n").length : 1;
    $("inBytes").textContent = byteLen(src);
    $("outChars").textContent = res.text.length;
    $("outConv").textContent = res.count;
    $("outRatio").textContent = src.length
      ? Math.round(((res.text.length - src.length) / src.length) * 100) + "%" : "0%";
    $("statCount").textContent = res.count;

    // biçim seçeneği yön ile uyumsuzsa görsel olarak sönükleştir
    fmtSel.disabled = !isEnc;
    scopeSel.disabled = !isEnc;
    fmtSel.style.opacity = scopeSel.style.opacity = isEnc ? "1" : ".5";
  }

  ["input", "change"].forEach(function (ev) { input.addEventListener(ev, run); });
  input.addEventListener("paste", function () { setTimeout(run, 0); });
  [dirSel, fmtSel, scopeSel, lowerChk].forEach(function (el) { el.addEventListener("change", run); });

  // Tab tuşu textarea içinde girinti bıraksın
  input.addEventListener("keydown", function (e) {
    if (e.key !== "Tab" || e.shiftKey) return;
    e.preventDefault();
    var s = this.selectionStart, en = this.selectionEnd;
    this.value = this.value.slice(0, s) + "\t" + this.value.slice(en);
    this.selectionStart = this.selectionEnd = s + 1;
    run();
  });

  /* ── BUTONLAR ── */
  function flashOk(btn) {
    var old = btn.innerHTML;
    btn.classList.add("ok");
    btn.innerHTML = '<i class="fa fa-check"></i>';
    setTimeout(function () { btn.classList.remove("ok"); btn.innerHTML = old; }, 1200);
  }

  $("copyBtn").addEventListener("click", function () {
    var btn = this;
    if (!output.value) { alertMsg("Kopyalanacak sonuç yok", "warn"); return; }
    copyText(output.value).then(function () {
      flashOk(btn);
      alertMsg("Sonuç panoya kopyalandı");
    }).catch(function () { alertMsg("Kopyalanamadı, elle seçin", "warn"); });
  });

  $("dlBtn").addEventListener("click", function () {
    if (!output.value) { alertMsg("İndirilecek sonuç yok", "warn"); return; }
    var blob = new Blob([output.value], { type: "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = dirSel.value === "enc" ? "escaped.txt" : "decoded.txt";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    alertMsg("Dosya indirildi");
  });

  $("pasteBtn").addEventListener("click", function () {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      input.focus(); alertMsg("Tarayıcı izin vermiyor, Ctrl+V kullanın", "warn"); return;
    }
    navigator.clipboard.readText().then(function (t) {
      input.value = t; run(); alertMsg("Panodan yapıştırıldı");
    }).catch(function () {
      input.focus(); alertMsg("Pano okunamadı, Ctrl+V kullanın", "warn");
    });
  });

  $("clearBtn").addEventListener("click", function () {
    input.value = ""; run(); input.focus(); alertMsg("Alan temizlendi");
  });

  $("swapBtn").addEventListener("click", function () {
    if (!output.value) { alertMsg("Taşınacak sonuç yok", "warn"); return; }
    input.value = output.value;
    dirSel.value = dirSel.value === "enc" ? "dec" : "enc";
    run();
    alertMsg("Sonuç girişe taşındı, yön değişti");
  });

  $("sampleBtn").addEventListener("click", function () {
    dirSel.value = "enc";
    input.value = 'const mesaj = "Şeftali ağacı ışıldıyor: İĞÜÖÇŞ / iğüöçş";';
    run();
  });

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "C" || e.key === "c")) {
      e.preventDefault();
      $("copyBtn").click();
    }
  });

  /* ── HARİTA KARTLARI ── */
  var grid = $("mapGrid");
  TR.forEach(function (ch) {
    var card = document.createElement("div");
    card.className = "map-card";
    card.tabIndex = 0;
    card.innerHTML = '<span class="ch">' + ch + '</span><span class="esc"></span>';
    card.addEventListener("click", function () {
      var code = card.querySelector(".esc").textContent;
      copyText(code).then(function () {
        card.classList.add("copied");
        setTimeout(function () { card.classList.remove("copied"); }, 900);
        alertMsg(ch + " → " + code + " kopyalandı");
      }).catch(function () { alertMsg("Kopyalanamadı", "warn"); });
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.click(); }
    });
    grid.appendChild(card);
  });

  function refreshMap() {
    var cards = grid.querySelectorAll(".map-card");
    for (var i = 0; i < TR.length; i++) {
      var ch = TR[i], code;
      if (fmtSel.value === "pct") code = encodeURIComponent(ch).toUpperCase();
      else code = escapeUnit(ch.charCodeAt(0), fmtSel.value);
      cards[i].querySelector(".esc").textContent = code;
    }
  }
  [fmtSel, lowerChk].forEach(function (el) { el.addEventListener("change", refreshMap); });

  refreshMap();
  run();
})();
