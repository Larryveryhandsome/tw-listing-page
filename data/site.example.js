/*
 * 最小範本：複製成 data/site.js，把內容換成你自己的。
 * （網頁只讀 data/site.js；這個檔案只是欄位說明，不會被載入。）
 *
 * 單位約定
 *   價格（price、purchase、salePrice…）＝萬元
 *   坪數（landPing、buildPing）＝坪，網頁會自動換算平方公尺（1 坪 = 3.305785 ㎡）
 *   路寬 roadWidth＝公尺
 *   holdingMonthly、monthlyRent＝元/月
 *   比率（loanRatio、rate）＝小數：0.7＝七成、0.0215＝年利率 2.15%
 *
 * 個資提醒：謄本、地籍圖、權狀、身分證等含個資的文件不要放進這個網站（公開網站任何人都看得到）。
 */
window.SITE = {
  siteTitle: '你的名字｜你的店名',             // 瀏覽器分頁標題
  theme: { primary: '#1f6f5c', accent: '#d9822b' }, // 主色、強調色（#RRGGBB）

  agent: {
    name: '你的名字',
    title: '經紀人',                            // 職稱：經紀人／營業員／店長…
    store: '店名',                              // 門市名稱
    company: '經紀業名稱（公司登記名稱）',      // 不動產廣告原則上要註明經紀業名稱，會顯示在每頁頁尾
    license: '',                                // 證照字號（選填）
    phone: '0900-000-000',                      // 會變成「撥打電話」按鈕
    line: 'https://line.me/R/ti/p/@example',    // LINE 官方帳號或個人加好友連結
    area: '服務區域',
    photo: 'images/agent-avatar.svg',           // 大頭照（建議放在 images/）
    intro: '一段自我介紹。',
    skills: ['專長一', '專長二'],
    hours: '',                                  // 服務時間（選填）
  },

  // 區塊開關：false 就不顯示
  sections: {
    about: true, featured: true, listings: true, entrust: true, recruit: false, contact: true,
    invest: true, report: true, nearby: true, documents: true,
    osmMap: false,                              // true＝物件頁內嵌 OpenStreetMap（需座標）
  },

  // true＝所有物件地址只顯示到路段（單一物件可用 hideAddress 覆蓋）
  privacy: { hideAddress: true },

  // 首頁「總價」篩選選項（萬，min/max 可只填一邊）
  priceRanges: [
    { label: '1,000 萬以下', max: 1000 },
    { label: '1,000 萬以上', min: 1000 },
  ],

  // 委託服務（sections.entrust）
  entrust: { title: '賣方委託流程', intro: '', steps: [{ title: '步驟名稱', desc: '說明' }] },

  // 招募專區（sections.recruit）
  recruit: { title: '找夥伴', intro: '', points: ['條件或福利'], cta: '用 LINE 詢問' },

  listings: [
    {
      id: 'my-first-listing',      // 必填：網址用 listing.html?id=my-first-listing，只能英數、-、_
      title: '物件標題',           // 必填
      type: '透天',                // 必填：透天／華廈套房／公寓／大樓／店面／建地／農地／工業地…（首頁篩選用）
      price: 1000,                 // 必填：總價（萬）
      status: '銷售中',            // 選填：銷售中／已斡旋／已成交…
      featured: false,             // true＝放在首頁「強打物件」
      area: '區域名稱',            // 首頁「區域」篩選用
      address: '某某市某某路一段', // 地址；privacy.hideAddress 為 true 時只顯示到路段
      hideAddress: true,           // 選填：這一間要不要隱藏門牌（覆蓋全站設定）
      lat: 24.000, lng: 121.000,   // 座標：Google 地圖按右鍵複製；隱藏地址時建議只留小數 3 位
      landPing: 30,                // 地坪
      buildPing: 60,               // 建坪（權狀坪數）
      unitBasis: '',               // 選填：'build' 用建坪算單價、'land' 用地坪；不填時土地類用地坪
      layout: '3房2廳2衛',
      age: 10,                     // 屋齡（年）
      floor: '1–4F／共 4F',
      parking: '自有車庫',
      zoning: '第二種住宅區',      // 使用分區
      roadWidth: 8,                // 面臨路寬（公尺）
      photos: [{ src: 'images/placeholder-house.svg', caption: '外觀' }],
      highlights: ['特色一', '特色二'],
      description: '物件說明。',
      nearby: [{ type: '學校', name: '某某國小', distance: '約 500 公尺' }],
      sections: [{ title: '道路計畫', body: '可以分行，\n每一行一段。' }],
      documents: [{ name: '格局示意圖', url: 'images/floorplan-demo.svg', note: '' }],

      // 選填：有這段才會出現「投資試算」
      invest: {
        label: '轉售試算',
        purchase: 1000,          // 購入總價（萬）
        taxFees: 30,             // 稅費規費（契稅、代書費、仲介費…，萬）
        renovation: 100,         // 裝修（萬）
        holdingMonthly: 5000,    // 每月持有成本（房屋稅、地價稅分攤、管理費、水電…，元/月，不含房貸）
        holdingMonths: 6,        // 持有月數
        loanRatio: 0.7,          // 貸款成數
        rate: 0.022,             // 年利率
        years: 30,               // 貸款年期
        salePrice: 1250,         // 預估售價（萬，不填就不算轉售報酬）
        sellCost: 40,            // 出售成本（仲介費、土增稅預估…，萬）
        monthlyRent: 30000,      // 預估月租金（元，不填就不算租金投報率）
      },
    },
  ],

  // 選填：行情報告的實價登錄比較案例，key 是物件 id
  // 資料來源請自行到內政部實價登錄查詢後填入；地址只填到路段。
  comps: {
    'my-first-listing': [
      { date: '2026-01', address: '某某市某某路一段', type: '透天', age: 12, landPing: 30, buildPing: 62, price: 1200 },
      { date: '2025-12', address: '某某市某某路一段', type: '透天', age: 15, landPing: 31, buildPing: 66, price: 900, special: true, note: '親友交易' },
    ],
  },
};
