# Jimmy & Shenny 婚禮電子喜帖

2027.02.27（六）｜新竹市東區中華路二段1號2樓｜證婚 09:30、入場 09:00

## 專案結構

```
/
├── index.html
├── css/style.css
├── js/script.js
├── assets/
│   ├── images/   ← 放 hero.jpg、photo1.jpg ~ photo6.jpg
│   ├── textures/
│   ├── icons/
│   └── music/
├── favicon.ico   ← 自行放入
├── robots.txt
├── sitemap.xml   ← 發布後把網址改成你的
└── README.md
```

## 放入照片

- `assets/images/hero.jpg`：首頁全螢幕背景（建議直式 1080×1920 或橫式 1920×1280）
- `assets/images/photo1.jpg` ~ `photo6.jpg`：相簿（建議 4:5 直式，每張 500KB 以下）
- 程式使用相對路徑，GitHub Pages 的子路徑（`帳號.github.io/倉庫名/`）也能正常顯示。

## 發布到 GitHub Pages

1. 登入 GitHub，點右上角 **+ → New repository**，名稱例如 `wedding`，選 **Public**，建立。
2. 點 **uploading an existing file**，把整個專案內容（含 `assets` 資料夾）拖進去，按 **Commit changes**。
3. 進入 **Settings → Pages**。
4. **Source** 選 *Deploy from a branch*，**Branch** 選 `main`、資料夾選 `/ (root)`，按 **Save**。
5. 等 1～2 分鐘，頁面上方會出現網址：`https://你的帳號.github.io/wedding/`。
6. 把網址貼進 `sitemap.xml`，並用手機實測。
7. 之後修改檔案，Commit 後約 1 分鐘自動更新。

## Google Forms：RSVP 設定

1. 開啟 [forms.google.com](https://forms.google.com)，建立空白表單，標題「Jimmy & Shenny 婚禮 RSVP」。
2. 新增題目：姓名（簡答）、聯絡電話（簡答）、Email（簡答）、是否出席（單選：出席／不克出席）、出席人數（下拉：1～6）、飲食需求（簡答）、備註（段落）。
3. 右上角 **傳送 → 連結圖示**，勾選「縮短網址」可選，複製連結。
4. 貼到 `js/script.js`：
   ```js
   const GOOGLE_FORM_URL = "https://forms.gle/xxxxxxxx";
   ```
5. 網站上的 RSVP 按「送出回覆」後會導向此表單。
6. 查看回覆：表單的 **回覆** 分頁，可點綠色圖示連結到 Google 試算表。

### 選填：自動預填欄位

1. 表單右上角 **⋮ → 取得預先填入的連結**，每題隨意填一個值，按「取得連結」。
2. 複製出的網址裡會有 `entry.123456789=...`，這就是欄位 ID。
3. 把 `GOOGLE_FORM_URL` 改成不含 `?` 後面參數的 `.../viewform` 網址，再填入 `FORM_ENTRY`：
   ```js
   const FORM_ENTRY = { name: "entry.111", phone: "entry.222", email: "entry.333",
                        attend: "entry.444", guests: "entry.555", diet: "entry.666", note: "entry.777" };
   ```
4. 單選與下拉的值必須和表單選項文字完全一致（例如「出席」、「不克出席」、「1」）。

## Google Drive：賓客照片上傳設定

1. 在 Google Forms 建立新表單「Share Your Memories」。
2. 新增題目 → 類型選 **檔案上傳**，依提示按「繼續」。系統會在你的 Google Drive 自動建立存放資料夾。
3. 設定：允許的檔案類型選「圖片」，檔案數量上限（如 10），單檔大小上限（如 100 MB）。
4. 可另加「你的名字」「想說的話」兩題（簡答）。
5. 注意：檔案上傳題要求賓客登入 Google 帳號；請在說明中提醒。
6. 複製表單連結，貼到 `js/script.js`：
   ```js
   const PHOTO_UPLOAD_FORM_URL = "https://forms.gle/yyyyyyyy";
   ```
7. 照片會集中存在你 Drive 的「（表單名稱）（File responses）」資料夾，婚後可整份下載。
8. 想讓賓客用手機掃碼上傳：用任何 QR Code 產生器把該連結做成圖片，印在桌卡上。

## 常見修改

| 想改的地方 | 位置 |
|---|---|
| 導航連結 | `js/script.js` 的 `GOOGLE_MAP_URL`、`APPLE_MAP_URL`（留空會自動用地址搜尋） |
| 婚禮時間 | `js/script.js` 的 `WEDDING` 物件 |
| 配色 | `css/style.css` 最上方 `:root` |
| 相簿張數 | `index.html` 複製一個 `swiper-slide` 區塊 |
