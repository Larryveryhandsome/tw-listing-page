# tw-listing-page｜房仲物件介紹頁模板

房仲想要一個「自己的」物件網站，通常只有兩條路：花錢請人做，或是只能貼平台連結。
這個模板讓你**只改一個資料檔**（`data/site.js`），就得到一個可以直接放上 GitHub Pages 的網站：

- **經紀人首頁**：認識我、強打物件、精選物件（可依類型／區域／總價篩選）、委託服務流程、招募專區、LINE／電話聯絡
- **物件頁**：相簿、基本資訊（坪⇄㎡ 自動換算、單價自動算）、特色、位置（地址可只顯示到路段）、Google 地圖導航、周邊生活機能、道路計畫等說明、文件下載、廣告說明
- **投資試算**：購入、稅費、裝修、持有成本、貸款 → 自備款、月付、毛利、報酬率、年化報酬、租金投報率，數字可以現場改
- **行情報告**：本案開價單價 vs 實價登錄成交（長條圖、屋齡×單價散佈圖）、中位數／四分位／本案落點百分位、議價空間估算，可切換排除特殊交易

免安裝、免伺服器、不載入任何外部套件：雙擊 `index.html` 就能看。

示範網站：<https://larryveryhandsome.github.io/tw-listing-page/>

---

## 適合誰

- 想要**個人品牌頁**、把 LINE 和物件集中在一個網址的經紀人、營業員
- 想把**投資物件**的試算攤開給客戶看的房仲、投資客
- 想用**實價登錄**說服屋主調價的開發人員（行情報告可以直接列印成 PDF）

---

## 5 分鐘開始

1. 下載這個專案（綠色 **Code** 按鈕 → **Download ZIP**），解壓縮。
2. 雙擊 **`index.html`**，先看示範網站長怎樣（**人名、電話、地址、價格全部是假的**）。
3. 用記事本或 VS Code 打開 **`data/site.js`**，把經紀人資料、物件、比較案例換成你自己的。
   每個欄位的意思寫在 **`data/site.example.js`** 的註解裡。
4. 存檔，重新整理網頁。沒出現的話按 F12 看 Console，會列出哪一間物件缺了什麼欄位。
5. 照片放進 `images/`（建議先縮到寬 1600 像素以內，並清除 EXIF 定位資訊），在物件的 `photos` 填路徑。

### 放上 GitHub Pages（免費網址）

1. 註冊／登入 GitHub，按右上角 **+ → New repository**，名稱例如 `my-listings`，選 **Public**，建立。
2. 在新 repository 頁面按 **uploading an existing file**，把整個資料夾的檔案拖進去，按 **Commit changes**。
3. 到 **Settings → Pages**，Source 選 **Deploy from a branch**，Branch 選 **main**、資料夾 **/(root)**，按 **Save**。
4. 等 1～2 分鐘，網址會是 `https://你的帳號.github.io/my-listings/`。
5. 之後改 `data/site.js` 再上傳一次就會更新。物件頁網址是 `listing.html?id=物件id`，可以直接貼到 LINE。

---

## 資料欄位

完整說明見 `data/site.example.js`。單位：**價格＝萬元、面積＝坪、路寬＝公尺、月費與租金＝元/月、比率＝小數**。

| 欄位 | 說明 |
|---|---|
| `agent` | 經紀人：`name`、`title`、`store`、`company`（經紀業名稱，顯示在頁尾）、`license`、`phone`、`line`、`area`、`photo`、`intro`、`skills` |
| `sections` | 區塊開關：`about`、`featured`、`listings`、`entrust`、`recruit`、`contact`、`invest`、`report`、`nearby`、`documents`、`osmMap`；`false` 就不顯示 |
| `privacy.hideAddress` | `true`＝所有物件地址只顯示到路段（單一物件可用 `hideAddress` 覆蓋） |
| `priceRanges` | 首頁總價篩選選項，`{ label, min, max }`（下限含、上限不含） |
| `entrust` / `recruit` | 委託流程步驟、招募說明 |
| `theme` | `primary` 主色、`accent` 強調色（`#RRGGBB`） |
| `listings[].id` | **必填**，網址用，只能英數、`-`、`_` |
| `listings[].title` / `type` / `price` | **必填**：標題、類型（透天／華廈套房／店面／建地／農地／工業地…）、總價（萬） |
| `listings[].area` | 區域（首頁篩選用） |
| `listings[].address`、`lat`、`lng` | 地址與座標（座標在 Google 地圖按右鍵即可複製） |
| `listings[].landPing`、`buildPing` | 地坪、建坪；`unitBasis` 可指定單價用 `'land'` 或 `'build'` 計算 |
| `listings[].layout`、`age`、`floor`、`parking`、`zoning`、`roadWidth` | 格局、屋齡、樓層、車位、使用分區、面臨路寬 |
| `listings[].photos` | `[{ src, caption }]` |
| `listings[].highlights`、`description` | 特色條列、說明 |
| `listings[].nearby` | `[{ type, name, distance }]`，例如學校／市場／車站／醫院 |
| `listings[].sections` | 自由段落 `[{ title, body }]`，例如道路計畫；`body` 換行會分段 |
| `listings[].documents` | 文件下載 `[{ name, url, note }]`（**不要放含個資的文件**，見下方檢查表） |
| `listings[].invest` | 有這段才顯示投資試算（欄位見下一節） |
| `comps[物件id]` | 實價登錄比較案例 `[{ date, address, type, age, landPing, buildPing, price, special, note }]` |

---

## 投資試算怎麼算

輸入（`invest`）：購入總價 `purchase`、稅費規費 `taxFees`、裝修 `renovation`、每月持有成本 `holdingMonthly`（元，不含房貸）、持有月數 `holdingMonths`、貸款成數 `loanRatio`、年利率 `rate`、年期 `years`、預估售價 `salePrice`、出售成本 `sellCost`、預估月租金 `monthlyRent`。

- 貸款＝購入總價 × 貸款成數；自備款＝購入總價 − 貸款
- 月付（本息平均攤還）＝ 貸款 × r ÷ (1 − (1 + r)^−n)，r＝年利率 ÷ 12、n＝年期 × 12
  （例：1,000 萬、2%、30 年 ≈ 每月 36,962 元）
- 總成本＝購入＋稅費＋裝修＋持有成本（月 × 月數）＋持有期間的貸款利息
- 自有資金＝自備款＋稅費＋裝修＋持有成本＋持有期間所繳的房貸
- 毛利＝預估售價 − 出售成本 − 總成本
- 報酬率＝毛利 ÷ 自有資金；年化報酬＝(1 + 報酬率)^(12 ÷ 持有月數) − 1
- 租金毛投報率＝月租 × 12 ÷ (購入＋稅費＋裝修)；淨投報率再扣掉每月持有成本
- 轉售試算沒有把持有期間的租金收入算進去；土地增值稅、所得稅（房地合一稅）請自行估入出售成本

**試算僅供參考**，實際稅費、利率、成數與售價以實際情況為準。

## 行情報告怎麼算

- 單價＝總價 ÷ 坪數（萬/坪）。建物用建坪，建地／農地／工業地用地坪（可用 `unitBasis` 改）
- 中位數、四分位：線性內插（和 Excel `QUARTILE.INC` 相同）
- 本案落點百分位：成交單價低於本案開價單價的比例（相同的算一半）
- **議價空間＝(開價單價 − 成交中位數) ÷ 開價單價**；負數代表開價低於成交中位數
- 標成 `special: true` 的特殊交易（親友交易、含增建、瑕疵、持分…）可以一鍵排除；散佈圖上用不同顏色
- 有屋齡時散佈圖用「屋齡 × 單價」，土地沒有屋齡時改用「成交時間 × 單價」
- 圖表是 JavaScript 直接畫成 SVG，不連任何外部服務

比較案例請自行到[內政部不動產交易實價查詢服務網](https://lvr.land.moi.gov.tw/)查詢後填入；網頁上會標示「資料來源：內政部實價登錄（經紀人自行整理）」。

---

## 上架前個資與法規檢查表

以下為一般性提醒，原則上仍以主管機關最新規定與個案情況為準；有疑問請洽公會、地政士或律師。

**個資與隱私**

- [ ] 要公開完整門牌嗎？原則上應先取得屋主同意；未同意就保持 `hideAddress: true`（只顯示到路段）
- [ ] 隱藏門牌時，網頁上的地圖連結與內嵌地圖會自動把座標模糊到小數 3 位（約 100 公尺）；**但 `data/site.js` 本身是公開檔案**，任何人都能讀到你填的 `address` 和 `lat`／`lng`。要隱藏的物件，請 `address` 只寫到路段、座標也只留小數 3 位（Console 會提醒）
- [ ] **不要把謄本、地籍圖、權狀、身分證、印鑑證明、買賣契約等含個資的文件放進這個網站**——放上 GitHub Pages 就是任何人都能下載，刪掉後也可能留在 git 歷史紀錄裡
- [ ] 照片沒有拍到屋主或住戶的臉、姓名、信件、車牌、家中證件；上傳前清除 EXIF（含 GPS 定位）
- [ ] 頁面上只留經紀人自己的聯絡方式，不放屋主電話或其他人的個資

**廣告與交易資訊**

- [ ] 依《不動產經紀業管理條例》，經紀業的廣告原則上應註明經紀業名稱：填好 `agent.company`（每頁頁尾與物件頁說明都會顯示）
- [ ] 廣告內容應與事實相符：坪數、屋齡、使用分區、車位、道路寬度等以權狀、謄本與不動產說明書核對過；不確定的寫「約」或「以現況為準」
- [ ] 未經查證的用語（例如「保證增值」「穩賺」「一定可蓋」）不要用；投資試算與行情報告保留「僅供參考」標示
- [ ] 已成交或下架的物件記得把 `status` 改掉或移除，避免繼續刊登
- [ ] 引用實價登錄要註明來源；比較案例地址只填到路段，不要拼出別人的門牌

---

## 需要哪些金鑰？

**不需要。** 不用註冊任何帳號、不用 API 金鑰。唯一會連外部的是選用功能 `sections.osmMap`（內嵌 OpenStreetMap，預設關閉，也不需要金鑰）。

## 給開發者

```
index.html            首頁（經紀人入口）
listing.html          物件頁 ?id=xxx
report.html           行情報告 ?id=xxx
css/style.css         樣式（手機 375px 不橫向捲動、深色模式、列印）
data/site.js          網站資料（示範資料，全部是假的）
data/site.example.js  最小範本＋每個欄位的註解
images/               示意圖（SVG，自己畫的，沒有照片）
js/core.js            核心純函式：坪⇄㎡、單價、價格格式、房貸、投資試算、統計、
                      實價登錄篩選、議價空間、地址遮蔽、Google 地圖連結、資料檢查、HTML 跳脫
js/charts.js          SVG 圖表產生器（輸出字串，方便測試）
js/app-common.js      共用畫面（頁首、頁尾、物件卡片、主題色）
js/app-index.js       首頁畫面
js/app-listing.js     物件頁畫面（含投資試算互動）
js/app-report.js      行情報告畫面
tests/                單元測試（node:test，不用裝任何套件）
```

```bash
npm test
```

- `js/core.js`、`js/charts.js` 是 UMD：瀏覽器是 `window.ListingCore`／`window.ListingCharts`，Node 可直接 `require`
- 資料用 `<script src="data/site.js">` 載入（不用 fetch），所以 `file://` 直接開也能動
- 所有資料插入畫面前都經過 HTML 跳脫；連結只允許 `http(s)`、`tel:` 與相對路徑
- 測試會載入 `data/site.js` 檢查每一間示範物件、驗證房貸公式，並掃描專案裡不能出現 email 與二進位檔
- `sections.osmMap: true` 時物件頁會內嵌 OpenStreetMap（地圖資料 © OpenStreetMap contributors），這是唯一會向外部網站載入內容的功能，預設關閉

## 注意事項

- 示範資料的人名、店名、電話、地址、價格與成交紀錄全部是虛構的；座標只是隨便挑的位置。
- 試算與行情原則上僅供參考，不構成投資建議；物件資訊以現況及不動產說明書為準。

## 已知問題

- 換成自己的物件要手動改 data/site.js，沒有填表產生器。暫無計畫做填表產生器。
- 開頁時 console 會有 warning：示範物件的地址被隱藏，因為 data/site.js 的 address 寫到門牌（個資保護檢查，屬刻意設計，不是錯誤）。
- 上架前請對照 README 的「上架前個資與法規檢查表」（經紀業必載事項、屋主同意）。
- 只實測 Chromium（桌機與 375 寬）。

完整的發布前檢查（八道閘門）見 [RELEASE_CHECK.md](RELEASE_CHECK.md)。

## 授權

[Apache License 2.0](LICENSE)


---

## 🛠️ 需要客製化？

這個工具是開源的，可以免費使用。如果你想要：

- 改成符合你們公司的流程、欄位或品牌
- 串接你現在在用的系統（LINE、Google 表單、POS、會計軟體……）
- 幫你安裝、架站、教學，或長期維護

歡迎加 LINE 跟我們聊。我們會依需求的範圍與複雜度報價，原則上以實際報價單為準。

<a href="https://line.me/ti/p/xzHT2IywOM"><img src="https://scdn.line-apps.com/n/line_add_friends/btn/zh-Hant.png" alt="加入好友" height="36"></a>

- 💬 LINE：[林其衞](https://line.me/ti/p/xzHT2IywOM)（請註明「房仲物件介紹頁 客製化」）
- 🏢 留白事務所：網頁設計、AI 自動化、房仲遠端助理
- 👤 作者：[留白事務所](https://github.com/Larryveryhandsome)
