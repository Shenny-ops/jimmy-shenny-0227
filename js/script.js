"use strict";

/* ===== 可自行修改的設定 ===== */
const GOOGLE_MAP_URL = "https://www.google.com/maps/dir/?api=1&destination=%E6%A1%83%E5%9C%92%E5%B8%82%E6%96%B0%E5%B1%8B%E5%8D%80%E7%A4%BE%E5%AD%90%E9%87%8C%E7%A4%BE%E7%A6%8F%E8%B7%AF325%E8%99%9F";          // 留空會自動用地址搜尋
const APPLE_MAP_URL = "";           // 留空會自動用地址搜尋
const GOOGLE_FORM_URL = "https://forms.gle/56Sig9MX1sSV5yY8A";         // RSVP Google Form 連結（viewform）
const PHOTO_UPLOAD_FORM_URL = "";   // 照片上傳 Google Form 連結
// 選填：Google Form 預填欄位 ID（格式 "entry.123456789"），留空則不預填
const FORM_ENTRY = { name: "", phone: "", email: "", attend: "", guests: "", diet: "", note: "" };

const WEDDING = {
  title: "Jimmy & Shenny 婚禮",
  address: "桃園市新屋區社子里社福路325號",
  start: "20270227T143000",
  end: "20270227T170000",
  tz: "Asia/Taipei",
  target: new Date("2027-02-27T14:30:00+08:00")
};

const $ = (s) => document.querySelector(s);

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.id);
  toast.id = setTimeout(() => t.classList.remove("show"), 3200);
}

/* ===== 信封動畫（約 2 秒） ===== */
$("#open-btn").addEventListener("click", () => {
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
  $("#cd-d").textContent = d;
  $("#cd-h").textContent = String(h).padStart(2, "0");
  $("#cd-m").textContent = String(m).padStart(2, "0");
  $("#cd-s").textContent = String(s).padStart(2, "0");
}
tick();
setInterval(tick, 1000);

/* ===== 2027 年 2 月月曆（2/1 為星期一，共 28 天） ===== */
(function buildCalendar() {
  const grid = $("#cal-grid");
  const first = new Date(2027, 1, 1).getDay();
  const days = new Date(2027, 2, 0).getDate();
  let html = ["日", "一", "二", "三", "四", "五", "六"].map((w) => `<div class="dow">${w}</div>`).join("");
  html += '<div></div>'.repeat(first);
  for (let i = 1; i <= days; i++) {
    html += `<div class="d${i === 27 ? " wedding" : ""}"${i === 27 ? ' aria-label="2月27日 婚禮"' : ""}>${i}</div>`;
  }
  grid.innerHTML = html;
})();

/* ===== 地圖導航 ===== */
const q = encodeURIComponent(WEDDING.address);
$("#btn-gmap").href = GOOGLE_MAP_URL || `https://www.google.com/maps/search/?api=1&query=${q}`;
$("#btn-amap").href = APPLE_MAP_URL || `https://maps.apple.com/?q=${q}`;

/* ===== 加入行事曆 ===== */
$("#btn-google-cal").href =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  `&text=${encodeURIComponent(WEDDING.title)}` +
  `&dates=${WEDDING.start}/${WEDDING.end}&ctz=${WEDDING.tz}` +
  `&location=${q}&details=${encodeURIComponent("婚禮演講 14:30，13:30 開放入場")}`;

$("#btn-ical").addEventListener("click", () => {
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Jimmy and Shenny//Wedding//ZH", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:wedding-20270227@jimmy-shenny",
    "DTSTAMP:20261101T000000Z",
    `DTSTART;TZID=${WEDDING.tz}:${WEDDING.start}`,
    `DTEND;TZID=${WEDDING.tz}:${WEDDING.end}`,
    `SUMMARY:${WEDDING.title}`,
    `LOCATION:${WEDDING.address}`,
    "DESCRIPTION:婚禮演講 14:30，13:30 開放入場",
    "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:明天是 Jimmy & Shenny 的婚禮", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "jimmy-shenny-wedding.ics" });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

/* ===== RSVP ===== */
$("#rsvp-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  if (!f.name.value.trim() || !f.phone.value.trim()) return toast("請填寫姓名與聯絡電話");
  if (!GOOGLE_FORM_URL) return toast("RSVP 表單尚未設定，請在 script.js 填入 GOOGLE_FORM_URL");
  const p = new URLSearchParams();
  Object.keys(FORM_ENTRY).forEach((k) => {
    if (!FORM_ENTRY[k]) return;
    const v = k === "attend" ? f.attend.value : f[k].value;
    p.set(FORM_ENTRY[k], v);
  });
  const url = GOOGLE_FORM_URL + (p.toString() ? (GOOGLE_FORM_URL.includes("?") ? "&" : "?") + p : "");
  window.location.href = url;
});

/* ===== 賓客照片上傳 ===== */
$("#upload-btn").addEventListener("click", () => {
  if (!PHOTO_UPLOAD_FORM_URL) return toast("照片上傳表單尚未設定，請在 script.js 填入 PHOTO_UPLOAD_FORM_URL");
  window.open(PHOTO_UPLOAD_FORM_URL, "_blank", "noopener");
});

/* ===== 相簿 / 動畫套件 ===== */
document.querySelectorAll(".polaroid img").forEach((img) => {
  img.addEventListener("error", () => { img.removeAttribute("src"); }, { once: true });
});
if (window.Swiper) {
  new Swiper("#photo-swiper", {
    slidesPerView: "auto", centeredSlides: true, spaceBetween: 16, grabCursor: true, loop: false,
    pagination: { el: ".swiper-pagination", clickable: true },
    navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    breakpoints: { 700: { slidesPerView: 2, centeredSlides: false } }
  });
}
if (window.GLightbox) GLightbox({ selector: ".glightbox", touchNavigation: true, loop: true });
if (window.AOS) AOS.init({ duration: 800, once: true, offset: 60 });
