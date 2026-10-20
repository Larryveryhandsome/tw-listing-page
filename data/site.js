/*
 * 示範資料：人名、店名、電話、地址、價格、成交紀錄全部是假的。
 * 換成你自己的資料前，先看 data/site.example.js 的欄位說明，以及 README 的「上架前個資與法規檢查表」。
 *
 * 單位：價格＝萬元；坪數＝坪；路寬＝公尺；holdingMonthly／monthlyRent＝元/月；比率用小數（0.75＝七成五）。
 */
window.SITE = {
  // ---------- 網站 ----------
  siteTitle: '王小明｜示範不動產',
  theme: { primary: '#1f6f5c', accent: '#d9822b' },

  // ---------- 經紀人 ----------
  agent: {
    name: '王小明',
    title: '示範經紀人',
    store: '示範不動產 示範店',
    company: '示範不動產經紀有限公司',            // 經紀業名稱：廣告原則上要註明
    license: '（示範）經紀人證書字號 000000',
    phone: '0900-000-001',
    line: 'https://line.me/R/ti/p/@example',
    area: '示範市',
    photo: 'images/agent-avatar.svg',
    intro: '在示範市服務第 8 年，專注透天、店面與土地。每一間物件都先做行情報告再開價，讓買賣雙方都看得到數字。',
    skills: ['透天與店面買賣', '建地、農地評估', '投資試算與租售規劃', '實價登錄行情分析'],
    hours: '每日 09:00–21:00（帶看請先預約）',
  },

  // ---------- 區塊開關：false 就不顯示 ----------
  sections: {
    about: true,       // 認識我
    featured: true,    // 強打物件
    listings: true,    // 精選物件（含篩選）
    entrust: true,     // 委託服務
    recruit: true,     // 招募專區
    contact: true,     // 聯絡
    // 物件頁
    invest: true,      // 投資試算（物件有 invest 才會出現）
    report: true,      // 行情報告連結（有 comps 才會出現）
    nearby: true,      // 周邊生活機能
    documents: true,   // 文件下載
    osmMap: false,     // OpenStreetMap 內嵌地圖（會向 openstreetmap.org 載入圖磚）
  },

  // ---------- 隱私：true＝地址只顯示到路段 ----------
  privacy: { hideAddress: true },

  // ---------- 首頁篩選的總價區間（萬） ----------
  priceRanges: [
    { label: '800 萬以下', max: 800 },
    { label: '800–1,500 萬', min: 800, max: 1500 },
    { label: '1,500–3,000 萬', min: 1500, max: 3000 },
    { label: '3,000 萬以上', min: 3000 },
  ],

  // ---------- 委託服務 ----------
  entrust: {
    title: '賣方委託流程',
    intro: '想知道房子現在能賣多少？先聊聊，不用先簽約。',
    steps: [
      { title: '免費諮詢', desc: '了解屋況、產權與您的時程。' },
      { title: '行情報告', desc: '整理近期實價登錄，給出建議開價區間。' },
      { title: '簽訂委託', desc: '說明委託類型、服務報酬與權利義務。' },
      { title: '行銷曝光', desc: '拍照、物件頁、社群與網路平台同步曝光。' },
      { title: '帶看議價', desc: '每次帶看回報，出價透明。' },
      { title: '簽約交屋', desc: '配合地政士辦理簽約、用印、完稅、交屋。' },
    ],
  },

  // ---------- 招募專區 ----------
  recruit: {
    title: '找夥伴',
    intro: '想進不動產業、但不知道從哪開始？歡迎來店裡聊聊。',
    points: ['新人師徒制帶看', '完整教育訓練與考照輔導', '數位工具與物件頁模板'],
    cta: '用 LINE 詢問招募',
  },

  // ---------- 物件 ----------
  listings: [
    {
      id: 'demo-townhouse',
      title: '中正路一段 臨路採光透天',
      type: '透天',
      status: '銷售中',
      featured: true,
      area: '中正區',
      address: '示範市中正路一段100號',
      lat: 24.148, lng: 120.674,
      price: 1680,
      landPing: 32.5,
      buildPing: 68.4,
      layout: '4房2廳4衛',
      age: 15,
      floor: '1–4F／共 4F',
      parking: '自有車庫 1 位',
      zoning: '第二種住宅區',
      roadWidth: 12,
      photos: [
        { src: 'images/placeholder-house.svg', caption: '外觀（示意圖）' },
        { src: 'images/placeholder-interior.svg', caption: '客廳（示意圖）' },
        { src: 'images/placeholder-street.svg', caption: '門前道路（示意圖）' },
      ],
      highlights: ['面寬約 5 米、前後採光', '12 米路，車庫好停', '步行可到示範國小、示範市場', '屋況良好，可直接入住'],
      description: '四樓透天，一樓車庫加孝親房，二到四樓每層兩房。屋主自住保養，原則上可依現況交屋。',
      nearby: [
        { type: '學校', name: '示範國小', distance: '約 450 公尺' },
        { type: '市場', name: '示範市場', distance: '約 600 公尺' },
        { type: '車站', name: '示範車站', distance: '約 1.8 公里' },
        { type: '醫院', name: '示範醫院', distance: '約 2.2 公里' },
        { type: '公園', name: '示範公園', distance: '約 300 公尺' },
      ],
      sections: [
        { title: '屋況說明', body: '外牆於近年整修。\n頂樓無增建。\n實際屋況以現場與不動產說明書為準。' },
      ],
      documents: [
        { name: '格局示意圖（示範）', url: 'images/floorplan-demo.svg', note: 'SVG' },
      ],
      invest: {
        label: '整理後轉售試算',
        purchase: 1680, taxFees: 45, renovation: 180,
        holdingMonthly: 6000, holdingMonths: 8,
        loanRatio: 0.75, rate: 0.0218, years: 30,
        salePrice: 2080, sellCost: 60,
        monthlyRent: 38000,
      },
    },
    {
      id: 'demo-studio',
      title: '民生路二段 電梯華廈套房',
      type: '華廈套房',
      status: '銷售中',
      featured: true,
      area: '北區',
      address: '示範市民生路二段50號5樓',
      lat: 24.153, lng: 120.681,
      price: 528,
      buildPing: 22.3,
      layout: '1房1廳1衛',
      age: 28,
      floor: '5F／共 7F',
      parking: '無',
      zoning: '商業區',
      roadWidth: 15,
      photos: [
        { src: 'images/placeholder-apartment.svg', caption: '大樓外觀（示意圖）' },
        { src: 'images/placeholder-interior.svg', caption: '室內（示意圖）' },
      ],
      highlights: ['電梯大樓、有管理', '近示範車站，出租需求穩', '小總價，首購或包租都適合'],
      description: '權狀含公設約 22 坪，目前空屋，方便看屋。',
      nearby: [
        { type: '車站', name: '示範車站', distance: '約 500 公尺' },
        { type: '市場', name: '示範夜市', distance: '約 350 公尺' },
        { type: '醫院', name: '示範診所', distance: '約 200 公尺' },
      ],
      sections: [],
      documents: [],
      invest: {
        label: '包租試算',
        purchase: 528, taxFees: 15, renovation: 40,
        holdingMonthly: 2500, holdingMonths: 24,
        loanRatio: 0.7, rate: 0.0225, years: 30,
        salePrice: 640, sellCost: 18,
        monthlyRent: 13500,
      },
    },
    {
      id: 'demo-shop',
      title: '中山路三段 三角窗店面',
      type: '店面',
      status: '銷售中',
      featured: false,
      area: '中山區',
      address: '示範市中山路三段8號',
      hideAddress: false, // 這間示範「顯示完整地址」（真實物件要先取得屋主同意）
      lat: 24.141, lng: 120.669,
      price: 3280,
      landPing: 28,
      buildPing: 72.6,
      layout: '店面＋2樓辦公',
      age: 35,
      floor: '1–3F／共 3F',
      parking: '無（門前可臨停）',
      zoning: '商業區',
      roadWidth: 20,
      photos: [
        { src: 'images/placeholder-shop.svg', caption: '店面外觀（示意圖）' },
        { src: 'images/placeholder-street.svg', caption: '路口（示意圖）' },
      ],
      highlights: ['20 米大路三角窗', '人車流量大', '目前出租中，可帶租約'],
      description: '一樓店面出租中（租約與租金以實際契約為準），二、三樓可自用。',
      nearby: [
        { type: '車站', name: '示範車站', distance: '約 900 公尺' },
        { type: '學校', name: '示範國中', distance: '約 700 公尺' },
      ],
      sections: [],
      documents: [],
    },
    {
      id: 'demo-buildland',
      title: '文化街旁 方正住宅建地',
      type: '建地',
      status: '銷售中',
      featured: false,
      area: '東區',
      address: '示範市文化街旁',
      lat: 24.162, lng: 120.692,
      price: 960,
      landPing: 60.5,
      zoning: '第一種住宅區',
      roadWidth: 8,
      photos: [
        { src: 'images/placeholder-land.svg', caption: '基地現況（示意圖）' },
      ],
      highlights: ['地形方正，面寬約 10 米', '臨 8 米計畫道路', '可自建或合建'],
      description: '住宅區建地，周邊已有新建透天社區。建蔽率、容積率以主管機關公告為準。',
      nearby: [
        { type: '學校', name: '示範國小', distance: '約 1.2 公里' },
        { type: '市場', name: '示範超市', distance: '約 800 公尺' },
      ],
      sections: [
        { title: '道路計畫', body: '基地前方為 8 米都市計畫道路，目前已開闢。\n東側另有 6 米計畫道路尚未開闢，開闢時程以主管機關公告為準。' },
        { title: '建築規劃參考', body: '原則上可規劃 2 戶三層透天（示意，實際以建築師評估為準）。' },
      ],
      documents: [],
    },
    {
      id: 'demo-farmland',
      title: '田園路 臨路農地',
      type: '農地',
      status: '銷售中',
      featured: false,
      area: '郊區',
      address: '示範市田園路旁',
      lat: 24.181, lng: 120.711,
      price: 1350,
      landPing: 450,
      zoning: '一般農業區 農牧用地',
      roadWidth: 6,
      photos: [
        { src: 'images/placeholder-farm.svg', caption: '農地現況（示意圖）' },
      ],
      highlights: ['臨 6 米路', '有水圳灌溉', '地形完整'],
      description: '目前種植水稻。農地買賣與農舍申請條件請洽地政士或主管機關確認。',
      nearby: [
        { type: '車站', name: '示範交流道', distance: '約 3 公里' },
      ],
      sections: [],
      documents: [],
    },
    {
      id: 'demo-factory',
      title: '工業一路 廠房＋工業地',
      type: '工業地',
      status: '銷售中',
      featured: false,
      area: '工業區',
      address: '示範市工業一路20號',
      lat: 24.127, lng: 120.652,
      price: 5200,
      landPing: 380,
      buildPing: 210,
      unitBasis: 'land', // 工業地習慣用地坪算單價
      age: 18,
      floor: '1F（挑高約 8 米）',
      parking: '大車可進出',
      zoning: '乙種工業區',
      roadWidth: 15,
      photos: [
        { src: 'images/placeholder-factory.svg', caption: '廠房外觀（示意圖）' },
      ],
      highlights: ['15 米路，貨櫃車可進出', '鋼構廠房含辦公室', '近示範交流道'],
      description: '目前空廠，可立即使用。用途與登記以主管機關規定為準。',
      nearby: [
        { type: '車站', name: '示範交流道', distance: '約 1.5 公里' },
      ],
      sections: [],
      documents: [],
    },
  ],

  // ---------- 實價登錄比較案例（key＝物件 id） ----------
  // 資料來源：內政部不動產交易實價查詢服務網，由使用者自行查詢後填入（這裡全部是假資料）。
  // 地址只填到路段；special: true 是特殊交易（親友交易、含增建、瑕疵……），note 寫原因。
  comps: {
    'demo-townhouse': [
      { date: '2026-06', address: '示範市中正路一段', type: '透天', age: 12, landPing: 30.1, buildPing: 62.0, price: 1450 },
      { date: '2026-05', address: '示範市中正路二段', type: '透天', age: 18, landPing: 33.0, buildPing: 70.5, price: 1480 },
      { date: '2026-05', address: '示範市自強街', type: '透天', age: 25, landPing: 28.4, buildPing: 58.3, price: 1080 },
      { date: '2026-04', address: '示範市中正路一段', type: '透天', age: 8, landPing: 31.2, buildPing: 66.0, price: 1620 },
      { date: '2026-04', address: '示範市光明街', type: '透天', age: 30, landPing: 27.0, buildPing: 55.0, price: 960 },
      { date: '2026-03', address: '示範市中正路三段', type: '透天', age: 14, landPing: 34.5, buildPing: 72.0, price: 1590 },
      { date: '2026-03', address: '示範市自強街', type: '透天', age: 20, landPing: 30.8, buildPing: 64.8, price: 1300 },
      { date: '2026-03', address: '示範市中正路二段', type: '透天', age: 15, landPing: 32.0, buildPing: 68.0, price: 980, special: true, note: '親友交易' },
      { date: '2026-02', address: '示範市民族路一段', type: '透天', age: 10, landPing: 32.6, buildPing: 69.2, price: 1610 },
      { date: '2026-02', address: '示範市中正路二段', type: '透天', age: 16, landPing: 29.9, buildPing: 61.5, price: 1330 },
      { date: '2026-01', address: '示範市光明街', type: '透天', age: 22, landPing: 29.0, buildPing: 60.0, price: 1170 },
      { date: '2026-01', address: '示範市民族路一段', type: '透天', age: 19, landPing: 33.5, buildPing: 90.0, price: 1500, special: true, note: '含增建（頂樓加蓋）' },
      { date: '2025-12', address: '示範市民族路一段', type: '透天', age: 5, landPing: 35.0, buildPing: 75.0, price: 1900 },
      { date: '2025-12', address: '示範市中正路一段', type: '透天', age: 13, landPing: 31.5, buildPing: 67.0, price: 1510 },
      { date: '2025-11', address: '示範市自強街', type: '透天', age: 27, landPing: 27.8, buildPing: 57.0, price: 1030 },
      { date: '2025-11', address: '示範市中正路三段', type: '透天', age: 11, landPing: 33.2, buildPing: 70.0, price: 1600 },
      { date: '2025-10', address: '示範市光明街', type: '透天', age: 9, landPing: 30.0, buildPing: 65.0, price: 1890, special: true, note: '總價含裝潢家具' },
    ],
    'demo-studio': [
      { date: '2026-06', address: '示範市民生路二段', type: '華廈', age: 27, buildPing: 21.5, price: 455 },
      { date: '2026-05', address: '示範市民生路二段', type: '華廈', age: 29, buildPing: 23.0, price: 470 },
      { date: '2026-05', address: '示範市建國路', type: '華廈', age: 25, buildPing: 19.8, price: 438 },
      { date: '2026-04', address: '示範市民生路一段', type: '華廈', age: 30, buildPing: 24.6, price: 470 },
      { date: '2026-04', address: '示範市建國路', type: '華廈', age: 22, buildPing: 20.5, price: 476 },
      { date: '2026-03', address: '示範市復興街', type: '華廈', age: 33, buildPing: 18.9, price: 342 },
      { date: '2026-03', address: '示範市民生路二段', type: '華廈', age: 28, buildPing: 22.0, price: 466 },
      { date: '2026-02', address: '示範市建國路', type: '華廈', age: 24, buildPing: 21.2, price: 470 },
      { date: '2026-02', address: '示範市復興街', type: '華廈', age: 31, buildPing: 25.0, price: 455 },
      { date: '2026-02', address: '示範市民生路二段', type: '華廈', age: 28, buildPing: 22.6, price: 330, special: true, note: '親友交易' },
      { date: '2026-01', address: '示範市民生路一段', type: '華廈', age: 26, buildPing: 20.0, price: 430 },
      { date: '2026-01', address: '示範市民生路二段', type: '華廈', age: 28, buildPing: 23.5, price: 505 },
      { date: '2025-12', address: '示範市建國路', type: '華廈', age: 20, buildPing: 22.4, price: 530 },
      { date: '2025-12', address: '示範市復興街', type: '華廈', age: 32, buildPing: 19.0, price: 360 },
      { date: '2025-11', address: '示範市民生路二段', type: '華廈', age: 27, buildPing: 21.8, price: 470 },
      { date: '2025-11', address: '示範市建國路', type: '華廈', age: 25, buildPing: 20.2, price: 310, special: true, note: '瑕疵物件（漏水）' },
    ],
    'demo-buildland': [
      { date: '2026-06', address: '示範市文化街', type: '建地', landPing: 55.0, price: 830 },
      { date: '2026-04', address: '示範市文化街', type: '建地', landPing: 72.3, price: 1050 },
      { date: '2026-03', address: '示範市新生路', type: '建地', landPing: 48.0, price: 760 },
      { date: '2026-01', address: '示範市新生路', type: '建地', landPing: 66.0, price: 920 },
      { date: '2025-11', address: '示範市文化街', type: '建地', landPing: 58.2, price: 600, special: true, note: '持分買賣' },
      { date: '2025-09', address: '示範市新生路', type: '建地', landPing: 61.0, price: 880 },
      { date: '2025-07', address: '示範市文化街', type: '建地', landPing: 50.5, price: 740 },
    ],
  },
};
