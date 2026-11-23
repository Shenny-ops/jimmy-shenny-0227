"use strict";
document.documentElement.classList.add("js");

/* ===== 可自行修改的設定 ===== */
const GOOGLE_MAP_URL = "https://www.google.com/maps/dir/?api=1&destination=%E6%A1%83%E5%9C%92%E5%B8%82%E6%96%B0%E5%B1%8B%E5%8D%80%E7%A4%BE%E5%AD%90%E9%87%8C%E7%A4%BE%E7%A6%8F%E8%B7%AF325%E8%99%9F";          // 留空會自動用地址搜尋
const APPLE_MAP_URL = "";           // 留空會自動用地址搜尋
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSevk9-oICKqWG-lS0ljfWUIlROAPz-B_nDWbd0kDayKmC3ZQA/viewform";         // RSVP 表單完整網址：https://docs.google.com/forms/d/e/.../viewform（不能用 forms.gle 短網址）
const PHOTO_UPLOAD_SCRIPT_URL = ""; // Google Apps Script 網頁應用程式網址（結尾是 /exec），填了就能在網站直接上傳
const PHOTO_UPLOAD_FORM_URL = "https://photos.app.goo.gl/ybbu48afMHoQkgUr8";   // 照片上傳連結（Google 相簿或表單）
// RSVP 欄位 ID（格式 "entry.123456789"），name、phone、attend 必填
const FORM_ENTRY = { name: "entry.151767687", phone: "entry.836183749", email: "entry.1779917657", attend: "entry.1990709987", guests: "entry.868612213", diet: "", note: "entry.1737563846" };

const WEDDING = {
  title: "哲鳴 & 心萱 婚禮",
  address: "桃園市新屋區社子里社福路325號",
  start: "20270227T143000",
  end: "20270227T170000",
  tz: "Asia/Taipei",
  target: new Date("2027-02-27T14:30:00+08:00")
};

const $ = (s) => document.querySelector(s);

/* ===== 邀請類型：網址加 ?invite=xxx =====
   （沒加）或 ceremony：現場婚禮（RSVP 另有「線上參與」選項）
   feast：現場婚禮＋婚宴（顯示婚宴資訊、交通協調題）
   online：只邀請線上參加（顯示 Zoom、隱藏地點與 Find Us） */
const _inv = (new URLSearchParams(location.search).get("invite") || "").toLowerCase();
const INVITE = _inv === "online" || _inv === "feast" ? _inv : "ceremony";

/* Zoom 資訊：請在這裡填寫；留空的欄位會顯示「將於婚禮前提供」 */
const ZOOM = { url: "", id: "", passcode: "" };

(function applyInvite() {
  document.body.dataset.invite = INVITE;
  document.querySelectorAll("[data-only]").forEach((el) => { el.hidden = el.dataset.only !== INVITE; });
  document.querySelectorAll("[data-hide]").forEach((el) => { if (el.dataset.hide === INVITE) el.hidden = true; });
})();

function fillZoom(box) {
  box.textContent = "";
  const add = (label, val, href) => {
    const p = document.createElement("p");
    p.append(label + "：");
    if (href) { const a = document.createElement("a"); a.href = href; a.target = "_blank"; a.rel = "noopener"; a.textContent = val; p.append(a); }
    else p.append(val);
    box.appendChild(p);
  };
  if (!ZOOM.url && !ZOOM.id) {
    const p = document.createElement("p");
    p.textContent = "Zoom 連結將於婚禮前提供給你";
    box.appendChild(p);
    return;
  }
  if (ZOOM.url) add("連結 Link", ZOOM.url.replace(/^https?:\/\//, ""), ZOOM.url);
  if (ZOOM.id) add("會議 ID", ZOOM.id);
  if (ZOOM.passcode) add("密碼 Passcode", ZOOM.passcode);
}
document.querySelectorAll("[data-zoom]").forEach(fillZoom);
const zoomText = () => [ZOOM.url && "Zoom: " + ZOOM.url, ZOOM.id && "ID: " + ZOOM.id, ZOOM.passcode && "Passcode: " + ZOOM.passcode].filter(Boolean).join(" ");

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.id);
  toast.id = setTimeout(() => t.classList.remove("show"), 3200);
}

/* ===== 信封動畫（約 2 秒） ===== */
$("#open-btn").addEventListener("click", () => {
  if (window.__opened) return;
  window.__opened = true;
  $("#open-btn").disabled = true;
  $("#open-btn").style.opacity = "0";
  $("#envelope").classList.add("open");
  setTimeout(() => {
    $("#envelope-screen").classList.add("done");
    document.body.classList.remove("locked");
    window.scrollTo(0, 0);
    if (window.AOS) AOS.refresh();
  }, 1700);
});

/* ===== 倒數計時 ===== */
function tick() {
  let diff = Math.max(0, WEDDING.target - new Date());
  const d = Math.floor(diff / 864e5); diff %= 864e5;
  const h = Math.floor(diff / 36e5); diff %= 36e5;
  const m = Math.floor(diff / 6e4);
  const s = Math.floor((diff % 6e4) / 1e3);
  $("#cd-d").textContent = String(d).padStart(3, "0");
  $("#cd-h").textContent = String(h).padStart(2, "0");
  $("#cd-m").textContent = String(m).padStart(2, "0");
  $("#cd-s").textContent = String(s).padStart(2, "0");
}
tick();
setInterval(tick, 1000);

/* ===== 2027 年 2 月月曆（2/1 為星期一，共 28 天） ===== */
const CIRCLE = '<svg class="circ" viewBox="-12 -12 84 84" aria-hidden="true" focusable="false">' +
  '<path class="c1" pathLength="1" d="M31 5.5C46 3.8 57.5 15 55.8 30C54.2 45.5 41 56.5 26.5 54.2C12 52 3.8 40 6.2 26.5C8.6 13 21 5.2 35 7.6C41.5 8.8 47 12.4 50 17"/>' +
  '<path class="c2" pathLength="1" d="M30 7.5C44 6.2 55 17 53.6 30C52.2 43.5 40 53.8 27 52C14 50.2 7.4 39.5 9 27.5"/>' +
  '<path class="star" d="M62 -7Q62 -2 67 -2Q62 -2 62 3Q62 -2 57 -2Q62 -2 62 -7Z"/>' +
  '<path class="star" d="M-5 54.5Q-5 58 -1.5 58Q-5 58 -5 61.5Q-5 58 -8.5 58Q-5 58 -5 54.5Z"/></svg>';

(function buildCalendar() {
  const grid = $("#cal-grid");
  const first = new Date(2027, 1, 1).getDay();
  const days = new Date(2027, 2, 0).getDate();
  let html = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((w) => `<div class="dow">${w}</div>`).join("");
  html += '<div></div>'.repeat(first);
  for (let i = 1; i <= days; i++) {
    html += i === 27
      ? `<div class="d wedding" aria-label="2月27日 婚禮">${CIRCLE}<span>${i}</span></div>`
      : `<div class="d"><span>${i}</span></div>`;
  }
  grid.innerHTML = html;
})();

/* ===== 地圖導航 ===== */
const q = encodeURIComponent(WEDDING.address);
$("#btn-gmap").href = GOOGLE_MAP_URL || `https://www.google.com/maps/search/?api=1&query=${q}`;
$("#btn-amap").href = APPLE_MAP_URL || `https://maps.apple.com/?q=${q}`;

/* ===== 加入行事曆 ===== */
const CAL_DESC = [
  INVITE === "online" ? "線上婚禮（Zoom），婚禮演講 14:30" : "婚禮演講 14:30，13:30 開放入場",
  INVITE === "feast" ? "婚宴 17:00 入場（竹北春耕）" : "",
  INVITE === "online" ? zoomText() : ""
].filter(Boolean).join("\n");
$("#btn-google-cal").href =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  `&text=${encodeURIComponent(WEDDING.title)}` +
  `&dates=${WEDDING.start}/${WEDDING.end}&ctz=${WEDDING.tz}` +
  (INVITE === "online" ? "" : `&location=${q}`) + `&details=${encodeURIComponent(CAL_DESC)}`;

$("#btn-ical").addEventListener("click", () => {
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Jimmy and Shenny//Wedding//ZH", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:wedding-20270227@jimmy-shenny",
    "DTSTAMP:20261101T000000Z",
    `DTSTART;TZID=${WEDDING.tz}:${WEDDING.start}`,
    `DTEND;TZID=${WEDDING.tz}:${WEDDING.end}`,
    `SUMMARY:${WEDDING.title}`,
    ...(INVITE === "online" ? [] : [`LOCATION:${WEDDING.address}`]),
    "DESCRIPTION:" + CAL_DESC.replace(/\n/g, "\\n"),
    "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:明天是哲鳴 & 心萱的婚禮", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "jimmy-shenny-wedding.ics" });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

/* ===== RSVP 行李吊牌（確認內容 → 送進 Google 表單） ===== */
const JOIN_OPTS = {
  ceremony: [
    { v: "onsite", en: "Joyfully Accept", zh: "欣然出席（現場）", note: "現場出席" },
    { v: "online", en: "Join Online", zh: "線上參與婚禮", note: "線上參與" },
    { v: "decline", en: "Regretfully Decline", zh: "遺憾無法出席" }
  ],
  feast: [
    { v: "both", en: "Wedding & Banquet", zh: "可以出席婚禮&家宴", note: "出席婚禮＋家宴" },
    { v: "onsite", en: "Wedding Only", zh: "可以出席婚禮", note: "只出席婚禮" },
    { v: "online", en: "Join Online", zh: "參與線上婚禮", note: "線上參與" },
    { v: "decline", en: "Regretfully Decline", zh: "無法出席" }
  ],
  online: [
    { v: "online", en: "Join Online", zh: "欣然線上參與", note: "線上參與" },
    { v: "decline", en: "Regretfully Decline", zh: "遺憾無法出席" }
  ]
};
const RSVP_SUB = {
  ceremony: "誠摯地邀請你來參加我們的婚禮！請填寫下列表單。",
  feast: "誠摯地邀請你來參加我們的婚禮！請填寫下列表單。",
  online: "因為現場座位有限，我們很想誠摯地邀請你線上參加我們的婚禮！請填寫下列表單。"
};

(function initRsvp() {
  const form = $("#rsvp-form");
  if (!form) return;
  const opts = JOIN_OPTS[INVITE];
  const max = 6;
  const st = { join: "", ride: "", count: 1 };
  const yes = $("#yes-only"), compFld = $("#comp-fld"), countFld = $("#count-fld"), rideFld = $("#ride-fld");
  const review = $("#rsvp-review"), done = $("#rsvp-done");
  const optOf = (v) => opts.find((o) => o.v === v);
  $("#rsvp-sub").textContent = RSVP_SUB[INVITE];
  if (INVITE === "feast") $("#notes-zh").textContent = "想和我們說的話（飲食需求）";

  /* 出席選項 */
  const box = $("#join-opts");
  opts.forEach((o) => {
    const lab = document.createElement("label");
    lab.className = "opt" + (o.v === "decline" ? " opt-decline" : "");
    const inp = document.createElement("input");
    inp.type = "radio"; inp.name = "join"; inp.value = o.v;
    const b = document.createElement("b"); b.textContent = o.en;
    const sp = document.createElement("span"); sp.textContent = o.zh;
    lab.append(inp, b, sp);
    box.appendChild(lab);
  });

  /* 吊牌垂落動畫 */
  const stage = $("#tag-stage");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es, o) => {
      es.forEach((e) => { if (e.isIntersecting) { stage.classList.add("in"); o.disconnect(); } });
    }, { threshold: 0.12 }).observe(stage);
  } else {
    stage.classList.add("in");
  }

  const setErr = (k, msg) => {
    const p = form.querySelector(`[data-for="${k}"]`);
    if (p) p.textContent = msg || "";
  };
  const markOn = (name) => {
    form.querySelectorAll(`input[name="${name}"]`).forEach((r) => r.parentElement.classList.toggle("on", r.checked));
  };
  const attending = () => st.join && st.join !== "decline";
  const inPerson = () => st.join === "both" || st.join === "onsite";
  const refresh = () => {
    yes.hidden = !attending();
    countFld.hidden = !inPerson();
    rideFld.hidden = !(INVITE === "feast" && st.join === "both");
    compFld.hidden = !(inPerson() && st.count > 1);
  };

  form.addEventListener("change", (e) => {
    if (e.target.name === "join") { st.join = e.target.value; markOn("join"); refresh(); setErr("join", ""); }
    if (e.target.name === "ride") { st.ride = e.target.value; markOn("ride"); setErr("ride", ""); }
  });
  $("#rsvp-name").addEventListener("input", () => setErr("name", ""));

  const setCount = (n) => {
    st.count = Math.max(1, Math.min(max, n));
    $("#g-count").textContent = st.count;
    if (typeof refresh === "function") refresh();
  };
  $("#g-minus").addEventListener("click", () => setCount(st.count - 1));
  $("#g-plus").addEventListener("click", () => setCount(st.count + 1));

  const data = () => ({
    name: $("#rsvp-name").value.trim(),
    join: st.join,
    label: st.join && st.join !== "decline" ? optOf(st.join).note : "",
    count: inPerson() ? st.count : (st.join === "online" ? 1 : 0),
    ride: rideFld.hidden ? "" : st.ride,
    comp: compFld.hidden ? "" : $("#rsvp-comp").value.trim(),
    contact: attending() ? $("#rsvp-contact").value.trim() : "",
    note: $("#rsvp-note").value.trim()
  });

  function validate() {
    const v = data();
    let first = null;
    ["name", "join", "ride"].forEach((k) => setErr(k, ""));
    if (!v.name) { setErr("name", "請填寫姓名 Please enter your name"); first = first || $("#rsvp-name"); }
    if (!v.join) { setErr("join", "請選擇是否出席 Please choose one"); first = first || form.querySelector(".opts"); }
    if (!rideFld.hidden && !v.ride) { setErr("ride", "請選擇 Please choose one"); first = first || $("#ride-chips"); }
    if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
    return !first;
  }

  const show = (which) => {
    form.hidden = which !== "form";
    review.hidden = which !== "review";
    done.hidden = which !== "done";
    done.classList.toggle("show", which === "done");
    stage.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    const v = data();
    const o = optOf(v.join);
    const rows = [["NAME 姓名", v.name], ["RSVP 是否出席", o.en + " " + o.zh]];
    if (v.join === "both" || v.join === "onsite") rows.push(["GUESTS 出席人數", String(v.count)]);
    if (v.comp) rows.push(["COMPANIONS 同行者", v.comp]);
    if (v.ride) rows.push(["TRANSPORT 交通協調", v.ride]);
    if (v.contact) rows.push(["CONTACT 聯絡方式", v.contact]);
    if (v.note) rows.push(["NOTES 想和我們說的話", v.note]);
    const dl = $("#review-list");
    dl.textContent = "";
    rows.forEach(([k, val]) => {
      const dt = document.createElement("dt"); dt.textContent = k;
      const dd = document.createElement("dd"); dd.textContent = val;
      dl.append(dt, dd);
    });
    $("#send-err").textContent = "";
    show("review");
  });

  $("#btn-edit").addEventListener("click", () => show("form"));

  $("#btn-send").addEventListener("click", async () => {
    const err = $("#send-err");
    if (!GOOGLE_FORM_URL || !FORM_ENTRY.name || !FORM_ENTRY.phone || !FORM_ENTRY.attend) {
      err.textContent = "RSVP 表單尚未設定，請在 script.js 填入 GOOGLE_FORM_URL 與 FORM_ENTRY";
      return;
    }
    const v = data();
    const going = v.join !== "decline";
    const body = new URLSearchParams();
    body.append(FORM_ENTRY.name, v.name);
    body.append(FORM_ENTRY.phone, v.contact || "（未填）");
    /* 表單的「是否出席」選項維持「出席／不克出席」；細節寫在備註欄 */
    body.append(FORM_ENTRY.attend, going ? "出席" : "不克出席");
    if (going && FORM_ENTRY.guests) body.append(FORM_ENTRY.guests, String(v.count));
    const parts = [];
    if (going) parts.push("出席方式：" + v.label);
    if (v.comp) parts.push("同行者：" + v.comp);
    if (v.ride) parts.push("交通協調：" + v.ride);
    parts.push("邀請類型：" + INVITE);
    if (v.note) parts.push(v.note);
    if (FORM_ENTRY.note) body.append(FORM_ENTRY.note, parts.join("｜"));

    const btn = $("#btn-send");
    btn.disabled = true;
    btn.textContent = "SENDING…";
    err.textContent = "";
    try {
      const action = GOOGLE_FORM_URL.split("?")[0].replace(/\/viewform.*$/, "") + "/formResponse";
      await fetch(action, { method: "POST", mode: "no-cors", body });
      $("#done-stamp").textContent = going ? "RSVP CONFIRMED" : "RSVP RECEIVED";
      $("#done-title").textContent = going ? "Your tag is checked in!" : "Thank you for letting us know";
      $("#done-text").textContent = going ? "Thank you for being part of our journey. We can't wait to celebrate with you!" : "We'll miss you on our big day, and we'll carry your blessings with us.";
      $("#done-zh").textContent = !going ? "謝謝你的回覆，我們會把你的祝福放在心裡。" : v.join === "online" ? "謝謝你，我們線上見！" : "謝謝你，婚禮當天見！";
      $("#done-zoom").hidden = v.join !== "online";
      show("done");
    } catch (e2) {
      err.textContent = "送出失敗，請檢查網路後再試一次";
    }
    btn.disabled = false;
    btn.textContent = "CONFIRM · 確認送出";
  });

  $("#btn-again").addEventListener("click", () => {
    form.reset();
    st.join = ""; st.ride = ""; setCount(1);
    form.querySelectorAll(".on").forEach((n) => n.classList.remove("on"));
    refresh();
    show("form");
  });
})();

/* ===== 賓客照片上傳（直接上傳到 Google 雲端；未設定時退回表單） ===== */
async function compressImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.82).split(",")[1];
  } finally {
    URL.revokeObjectURL(url);
  }
}

$("#upload-btn").addEventListener("click", () => {
  if (PHOTO_UPLOAD_SCRIPT_URL) return $("#photo-input").click();
  if (PHOTO_UPLOAD_FORM_URL) return window.open(PHOTO_UPLOAD_FORM_URL, "_blank", "noopener");
  toast("照片上傳尚未設定，請在 script.js 填入 PHOTO_UPLOAD_SCRIPT_URL");
});

$("#photo-input").addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  const btn = $("#upload-btn");
  const label = btn.textContent;
  btn.disabled = true;
  let ok = 0;
  for (let i = 0; i < files.length; i++) {
    btn.textContent = `上傳中 ${i + 1} / ${files.length}…`;
    try {
      const data = await compressImage(files[i]);
      const res = await fetch(PHOTO_UPLOAD_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ name: files[i].name.replace(/\.[^.]+$/, "") + ".jpg", data })
      });
      const json = await res.json();
      if (json.ok) ok++;
    } catch (err) { /* 略過失敗的單張 */ }
  }
  btn.disabled = false;
  btn.textContent = label;
  e.target.value = "";
  toast(ok === files.length ? `已上傳 ${ok} 張，謝謝你！` : `成功 ${ok} / ${files.length} 張，失敗的請再試一次`);
});

/* ===== 相簿 / 動畫套件 ===== */
document.querySelectorAll(".polaroid img").forEach((img) => {
  img.addEventListener("error", () => { img.removeAttribute("src"); }, { once: true });
});
/* 相簿：循環輪播（滑到最後一張再往後會回到第一張） */
const galleryLinks = Array.from(document.querySelectorAll("#photo-swiper .swiper-slide a.glightbox"));
const galleryHrefs = galleryLinks.map((a) => a.getAttribute("href"));
if (window.Swiper) {
  const gallerySwiper = new Swiper("#photo-swiper", {
    slidesPerView: "auto", centeredSlides: true, spaceBetween: 16, grabCursor: true, loop: true, touchStartPreventDefault: false, touchAngle: 30, threshold: 6, touchReleaseOnEdges: true,
    initialSlide: 0, loopAdditionalSlides: 3, observer: true, observeParents: true,
    pagination: { el: ".swiper-pagination", clickable: true, dynamicBullets: true },
    navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    breakpoints: { 700: { slidesPerView: 2, centeredSlides: false }, 1000: { slidesPerView: 3, centeredSlides: false } }
  });

  /* 一律從第一張（photo2）開始：初始化後與頁面載入完成後各校正一次 */
  gallerySwiper.slideToLoop(0, 0);
  window.addEventListener("load", () => { gallerySwiper.update(); gallerySwiper.slideToLoop(0, 0); });
}
/* 點擊放大：循環時 Swiper 會複製投影片，所以用原本那一份清單建立燈箱，再依網址找出第幾張 */
if (window.GLightbox) {
  const lightbox = GLightbox({
    elements: galleryHrefs.map((href) => ({ href, type: "image" })),
    touchNavigation: true, loop: true
  });
  document.querySelector("#photo-swiper").addEventListener("click", (e) => {
    const a = e.target.closest("a.glightbox");
    if (!a) return;
    e.preventDefault();
    const idx = galleryHrefs.indexOf(a.getAttribute("href"));
    lightbox.openAt(idx < 0 ? 0 : idx);
  });
}
if (window.AOS) AOS.init({ duration: 800, once: true, offset: 60 });

/* ===== 交通資訊手風琴：預設收合，同時只展開一項 ===== */
document.querySelectorAll(".acc-head").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;
    const willOpen = !item.classList.contains("open");
    document.querySelectorAll(".acc-item").forEach((it) => {
      it.classList.remove("open");
      it.querySelector(".acc-head").setAttribute("aria-expanded", "false");
      it.querySelector(".acc-hint b").textContent = "點擊展開";
    });
    if (willOpen) {
      item.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
      item.querySelector(".acc-hint b").textContent = "收合";
    }
  });
});

/* ===== 月曆：手繪圈選進場時畫出來 ===== */
(function () {
  const cal = document.querySelector(".cal");
  if (!cal) return;
  if (!("IntersectionObserver" in window)) { cal.classList.add("drawn"); return; }
  new IntersectionObserver((es, o) => {
    es.forEach((e) => { if (e.isIntersecting) { cal.classList.add("drawn"); o.disconnect(); } });
  }, { threshold: 0.35 }).observe(cal);
})();

/* ===== 明信片上傳區：整塊照片空格都可點擊 ===== */
(function () {
  const zone = document.querySelector("#drop-zone");
  const btn = document.querySelector("#upload-btn");
  if (!zone || !btn) return;
  zone.addEventListener("click", (e) => {
    if (e.target === btn || btn.contains(e.target) || btn.disabled) return;
    btn.click();
  });
})();

/* ===== 背景音樂：點「開啟邀請函」後播放；右下角可暫停／播放 ===== */
(function bgMusic() {
  const audio = document.getElementById("bgm"), btn = document.getElementById("music-btn"), open = document.getElementById("open-btn");
  if (!audio || !btn) return;
  let ready = false;
  const sync = () => btn.classList.toggle("on", !audio.paused);
  audio.addEventListener("canplay", () => { ready = true; btn.hidden = false; });
  audio.addEventListener("play", sync); audio.addEventListener("pause", sync);
  audio.addEventListener("error", () => { btn.hidden = true; });
  audio.load();
  audio.volume = 0.4;
  let userPaused = false;
  if (open) open.addEventListener("click", () => { if (!userPaused) audio.play().catch(() => {}); });
  btn.addEventListener("click", () => {
    if (audio.paused) { userPaused = false; audio.play().catch(() => {}); }
    else { userPaused = true; audio.pause(); }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) audio.pause(); else if (!userPaused && ready && window.__opened) audio.play().catch(() => {}); });
})();
