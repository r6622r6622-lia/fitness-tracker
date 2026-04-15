/* ========================================
   HomeScope — search_home.js
   ======================================== */
(function () {
    'use strict';

    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);

    /* ========== AREA DATA ========== */
    const AREAS = {
        '台北市': {
            '中正區': { subs: ['城中','站前','南門','螢橋','古亭','水源'], center: [25.0320, 121.5180], avg: 102, bounds: [[25.023,121.505],[25.023,121.530],[25.040,121.530],[25.045,121.521],[25.040,121.505]] },
            '大同區': { subs: ['大稻埕','圓環','雙連','民權西路','蘭州'], center: [25.0636, 121.5130], avg: 85, bounds: [[25.053,121.505],[25.053,121.523],[25.075,121.523],[25.075,121.505]] },
            '中山區': { subs: ['中山站','林森北路','大直','美麗華','松江南京','晴光'], center: [25.0640, 121.5330], avg: 95, bounds: [[25.045,121.521],[25.040,121.530],[25.053,121.555],[25.078,121.555],[25.078,121.523],[25.053,121.523]] },
            '松山區': { subs: ['民生社區','南京復興','小巨蛋','中崙','饒河','松山車站'], center: [25.0600, 121.5580], avg: 100, bounds: [[25.047,121.555],[25.047,121.575],[25.065,121.575],[25.065,121.555]] },
            '大安區': { subs: ['忠孝東區','敦南','仁愛圓環','信義安和','師大','六張犁','瑞安'], center: [25.0267, 121.5430], avg: 125, bounds: [[25.013,121.525],[25.013,121.560],[25.040,121.560],[25.040,121.530],[25.023,121.530]] },
            '萬華區': { subs: ['西門町','龍山寺','東園','南機場','青年公園','華中'], center: [25.0350, 121.4980], avg: 72, bounds: [[25.020,121.487],[25.020,121.510],[25.045,121.510],[25.045,121.487]] },
            '信義區': { subs: ['信義計畫區','101世貿','永春','吳興街','象山','松德','三犁'], center: [25.0330, 121.5680], avg: 108, bounds: [[25.013,121.560],[25.013,121.590],[25.047,121.590],[25.047,121.560]] },
            '士林區': { subs: ['士林夜市','芝山','天母東路','天母西路','社子','蘭雅','陽明山'], center: [25.0930, 121.5250], avg: 82, bounds: [[25.078,121.505],[25.078,121.555],[25.115,121.555],[25.115,121.505]] },
            '北投區': { subs: ['石牌','榮總','唭哩岸','北投市區','北投溫泉','關渡','復興崗'], center: [25.1320, 121.5010], avg: 72, bounds: [[25.108,121.475],[25.108,121.530],[25.155,121.530],[25.155,121.475]] },
            '內湖區': { subs: ['內科園區','西湖','文德','碧湖','葫洲','東湖','康寧'], center: [25.0830, 121.5880], avg: 78, bounds: [[25.065,121.572],[25.065,121.620],[25.100,121.620],[25.100,121.572]] },
            '南港區': { subs: ['南港車站','經貿園區','中南','三重里','舊莊','南港軟體園區'], center: [25.0550, 121.6060], avg: 85, bounds: [[25.038,121.590],[25.038,121.630],[25.065,121.630],[25.065,121.590]] },
            '文山區': { subs: ['景美','萬隆','興隆','木柵','政大','辛亥','考試院'], center: [24.9930, 121.5550], avg: 68, bounds: [[24.975,121.535],[24.975,121.590],[25.013,121.590],[25.013,121.535]] }
        },
        '新北市': {
            '板橋區': { subs: ['新板特區','江翠北重劃區','府中','海山','亞東醫院','浮洲','後埔','埔墘'], center: [25.0145, 121.4590], avg: 62, bounds: [[24.995,121.435],[24.995,121.478],[25.030,121.478],[25.030,121.435]] },
            '中和區': { subs: ['景安','南勢角','中和環球','連城路','員山','圓通寺','中和工業區'], center: [24.9990, 121.4940], avg: 56, bounds: [[24.978,121.478],[24.978,121.520],[25.010,121.520],[25.010,121.478]] },
            '永和區': { subs: ['頂溪','永安市場','樂華','福和','秀朗','仁愛公園','竹林路'], center: [25.0090, 121.5130], avg: 63, bounds: [[24.998,121.502],[24.998,121.525],[25.020,121.525],[25.020,121.502]] },
            '新莊區': { subs: ['新莊副都心','頭前重劃區','幸福路','新莊廟街','丹鳳','輔大','中港','迴龍'], center: [25.0360, 121.4320], avg: 55, bounds: [[25.020,121.405],[25.020,121.460],[25.058,121.460],[25.058,121.405]] },
            '三重區': { subs: ['三重站','二重疏洪道','菜寮','先嗇宮','三和路','光華','正義北路','中央路'], center: [25.0620, 121.4870], avg: 58, bounds: [[25.040,121.468],[25.040,121.505],[25.078,121.505],[25.078,121.468]] },
            '蘆洲區': { subs: ['南瑤子','灰磘','蘆洲南側','蘆洲北側','徐匯中學','重陽重劃區','長榮路'], center: [25.0850, 121.4730], avg: 52, bounds: [[25.075,121.458],[25.075,121.490],[25.098,121.490],[25.098,121.458]] },
            '新店區': { subs: ['大坪林','七張','新店市區','安坑','小碧潭','十四張','央北重劃區','中興路'], center: [24.9680, 121.5380], avg: 58, bounds: [[24.940,121.510],[24.940,121.560],[24.990,121.560],[24.990,121.510]] },
            '土城區': { subs: ['土城站','金城路','頂埔','永寧','海山','清水','學府路','日和'], center: [24.9720, 121.4430], avg: 48, bounds: [[24.950,121.420],[24.950,121.465],[24.992,121.465],[24.992,121.420]] },
            '汐止區': { subs: ['汐止車站','汐科','遠雄','社后','樟樹灣','橫科','白雲'], center: [25.0680, 121.6480], avg: 42, bounds: [[25.050,121.625],[25.050,121.680],[25.090,121.680],[25.090,121.625]] },
            '林口區': { subs: ['林口新市鎮','A9站','工一重劃區','林口舊市區','長庚','文化三路','扶輪公園'], center: [25.0770, 121.3740], avg: 45, bounds: [[25.058,121.350],[25.058,121.400],[25.095,121.400],[25.095,121.350]] },
            '淡水區': { subs: ['紅樹林','竹圍','淡水市區','淡水老街','沙崙','淡海新市鎮','新市一路'], center: [25.1690, 121.4410], avg: 30, bounds: [[25.140,121.415],[25.140,121.470],[25.195,121.470],[25.195,121.415]] },
            '五股區': { subs: ['洲子洋重劃區','成泰路','五股工業區','觀音坑','五股坑'], center: [25.0830, 121.4380], avg: 40, bounds: [[25.070,121.418],[25.070,121.458],[25.098,121.458],[25.098,121.418]] },
            '泰山區': { subs: ['塭仔圳重劃區','明志科大','泰山市區','十八甲','貴子坑'], center: [25.0580, 121.4230], avg: 45, bounds: [[25.043,121.405],[25.043,121.440],[25.070,121.440],[25.070,121.405]] },
            '三峽區': { subs: ['北大特區','三峽老街','龍埔','三峽市區','橫溪'], center: [24.9340, 121.3690], avg: 38, bounds: [[24.910,121.340],[24.910,121.395],[24.955,121.395],[24.955,121.340]] },
            '樹林區': { subs: ['樹林車站','山佳','柑園','三多','保安','備內'], center: [24.9900, 121.4170], avg: 36, bounds: [[24.970,121.395],[24.970,121.438],[25.010,121.438],[25.010,121.395]] }
        }
    };

    /* MRT Stations (major) */
    const MRT_STATIONS = [
        { name:'台北車站', lat:25.0478, lng:121.5170, lines:['紅','藍'] },
        { name:'中山', lat:25.0530, lng:121.5210, lines:['紅','綠'] },
        { name:'忠孝復興', lat:25.0416, lng:121.5435, lines:['藍','棕'] },
        { name:'忠孝新生', lat:25.0420, lng:121.5324, lines:['藍','橘'] },
        { name:'古亭', lat:25.0263, lng:121.5228, lines:['綠','橘'] },
        { name:'西門', lat:25.0421, lng:121.5083, lines:['藍','綠'] },
        { name:'東門', lat:25.0339, lng:121.5289, lines:['紅','橘'] },
        { name:'大安', lat:25.0330, lng:121.5435, lines:['紅','棕'] },
        { name:'南京復興', lat:25.0522, lng:121.5449, lines:['綠','棕'] },
        { name:'松江南京', lat:25.0519, lng:121.5328, lines:['綠','橘'] },
        { name:'民權西路', lat:25.0628, lng:121.5193, lines:['紅','橘'] },
        { name:'板橋', lat:25.0145, lng:121.4626, lines:['藍'] },
        { name:'新埔', lat:25.0244, lng:121.4685, lines:['藍'] },
        { name:'永安市場', lat:25.0105, lng:121.5121, lines:['橘'] },
        { name:'景安', lat:24.9938, lng:121.5047, lines:['橘'] },
        { name:'新莊', lat:25.0364, lng:121.4321, lines:['橘'] },
        { name:'頭前庄', lat:25.0425, lng:121.4416, lines:['橘'] },
        { name:'三重', lat:25.0611, lng:121.4849, lines:['橘'] },
        { name:'蘆洲', lat:25.0917, lng:121.4637, lines:['橘'] },
        { name:'徐匯中學', lat:25.0837, lng:121.4730, lines:['橘'] },
        { name:'大坪林', lat:24.9824, lng:121.5415, lines:['綠'] },
        { name:'七張', lat:24.9756, lng:121.5430, lines:['綠'] },
        { name:'小碧潭', lat:24.9750, lng:121.5290, lines:['綠'] },
        { name:'信義安和', lat:25.0330, lng:121.5530, lines:['紅'] },
        { name:'象山', lat:25.0330, lng:121.5700, lines:['紅'] },
        { name:'士林', lat:25.0930, lng:121.5260, lines:['紅'] },
        { name:'芝山', lat:25.0998, lng:121.5265, lines:['紅'] },
        { name:'石牌', lat:25.1125, lng:121.5163, lines:['紅'] },
        { name:'北投', lat:25.1315, lng:121.4993, lines:['紅'] },
        { name:'南港', lat:25.0530, lng:121.6068, lines:['藍'] },
        { name:'內湖', lat:25.0840, lng:121.5888, lines:['棕'] },
        { name:'土城', lat:24.9729, lng:121.4430, lines:['藍'] },
        { name:'頂埔', lat:24.9600, lng:121.4204, lines:['藍'] },
        { name:'亞東醫院', lat:24.9980, lng:121.4520, lines:['藍'] },
        { name:'府中', lat:25.0082, lng:121.4599, lines:['藍'] },
        { name:'汐止', lat:25.0631, lng:121.6393, lines:[] },
        { name:'林口A9', lat:25.0701, lng:121.3747, lines:['機捷'] }
    ];

    /* Highway Interchanges */
    const HIGHWAYS = [
        { name:'圓山交流道', lat:25.0710, lng:121.5240 },
        { name:'內湖交流道', lat:25.0770, lng:121.5760 },
        { name:'堤頂交流道', lat:25.0689, lng:121.5580 },
        { name:'環北交流道', lat:25.0100, lng:121.4600 },
        { name:'中和交流道', lat:24.9950, lng:121.4830 },
        { name:'新莊交流道', lat:25.0380, lng:121.4120 },
        { name:'五股交流道', lat:25.0830, lng:121.4350 },
        { name:'汐止交流道', lat:25.0600, lng:121.6400 },
        { name:'安坑交流道', lat:24.9700, lng:121.5150 },
        { name:'土城交流道', lat:24.9700, lng:121.4300 },
        { name:'樹林交流道', lat:24.9900, lng:121.4050 },
        { name:'林口交流道', lat:25.0700, lng:121.3700 },
        { name:'三重交流道', lat:25.0630, lng:121.4750 }
    ];

    /* Business Districts */
    const BIZ_DISTRICTS = [
        { name:'信義商圈', lat:25.0360, lng:121.5660 },
        { name:'西門商圈', lat:25.0420, lng:121.5080 },
        { name:'東區商圈', lat:25.0410, lng:121.5500 },
        { name:'士林夜市', lat:25.0880, lng:121.5240 },
        { name:'師大商圈', lat:25.0260, lng:121.5290 },
        { name:'公館商圈', lat:25.0140, lng:121.5340 },
        { name:'天母商圈', lat:25.1130, lng:121.5250 },
        { name:'板橋新板', lat:25.0150, lng:121.4630 },
        { name:'新莊幸福路', lat:25.0360, lng:121.4350 },
        { name:'三重正義北路', lat:25.0630, lng:121.4850 },
        { name:'蘆洲長榮路', lat:25.0880, lng:121.4720 },
        { name:'中和環球', lat:25.0000, lng:121.4930 },
        { name:'永和樂華', lat:25.0100, lng:121.5080 },
        { name:'林口三井Outlet', lat:25.0650, lng:121.3720 }
    ];

    /* Suggest data */
    const FAMILY_SUGGEST = {
        single:   { label:'單身(1人)', layout:'1房1廳1衛', minPing:12, maxPing:18, detail:'客廳4 + 臥4 + 衛1 + 廚2 + 走道1' },
        couple:   { label:'情侶/夫妻(2人)', layout:'2房1廳1衛', minPing:18, maxPing:24, detail:'客廳5 + 主臥4 + 書房3 + 衛1.5 + 廚2.5 + 走道2' },
        small:    { label:'小家庭-1孩(3人)', layout:'2-3房2廳2衛', minPing:24, maxPing:30, detail:'客餐7 + 主臥5 + 次臥3 + 衛×2=3 + 廚3 + 走道3' },
        standard: { label:'標準家庭-2孩(4人)', layout:'3房2廳2衛', minPing:30, maxPing:38, detail:'客餐8 + 主臥5 + 次臥×2=7 + 衛3 + 廚3 + 走道4' },
        extended: { label:'三代同堂(5-6人)', layout:'4房2廳2衛', minPing:38, maxPing:50, detail:'客餐9 + 主臥5 + 次臥×3=11 + 衛3 + 廚3 + 走道5 + 儲2' }
    };

    const COMMON_RATIO = {
        '公寓':   { '10以內': 0.10, '10-20': 0.10, '20以上': 0.10 },
        '華廈':   { '10以內': 0.25, '10-20': 0.22, '20以上': 0.18 },
        '大樓':   { '10以內': 0.33, '10-20': 0.30, '20以上': 0.25 },
        '預售屋': { '10以內': 0.35, '10-20': 0.35, '20以上': 0.35 }
    };

    /* Demo price data for charts */
    function generateTrendData(basePrice) {
        const quarters = [];
        const now = new Date();
        for (let i = 19; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i * 3, 1);
            const y = d.getFullYear();
            const q = Math.floor(d.getMonth() / 3) + 1;
            const variation = (Math.random() - 0.35) * 4;
            const trend = (19 - i) * 0.6;
            quarters.push({
                label: `${y}Q${q}`,
                unit: +(basePrice + trend + variation).toFixed(1),
                total: +((basePrice + trend + variation) * 28).toFixed(0)
            });
        }
        return quarters;
    }

    function generateAgeData(basePrice) {
        return {
            '預售屋': { unit: +(basePrice * 1.25).toFixed(1), total: +(basePrice * 1.25 * 30).toFixed(0) },
            '新成屋': { unit: +(basePrice * 1.10).toFixed(1), total: +(basePrice * 1.10 * 28).toFixed(0) },
            '中古6-10年': { unit: +(basePrice * 0.95).toFixed(1), total: +(basePrice * 0.95 * 26).toFixed(0) },
            '中古11-20年': { unit: +(basePrice * 0.82).toFixed(1), total: +(basePrice * 0.82 * 25).toFixed(0) },
            '中古21-30年': { unit: +(basePrice * 0.70).toFixed(1), total: +(basePrice * 0.70 * 24).toFixed(0) },
            '中古31-40年': { unit: +(basePrice * 0.60).toFixed(1), total: +(basePrice * 0.60 * 22).toFixed(0) },
            '中古40年以上': { unit: +(basePrice * 0.52).toFixed(1), total: +(basePrice * 0.52 * 20).toFixed(0) }
        };
    }

    /* ========== STATE ========== */
    let map, trendChart, ageChart;
    let currentSearch = {};
    let searchMode = 'area'; // 'area' | 'address'

    /* ========== NIMBY / SPECIAL DATA ========== */
    const NIMBY_TYPES = [
        { id:'temple', name:'宮廟', icon:'🏛', risk:'medium', desc:'噪音（法會、誦經）、燒金紙空氣品質、節慶活動交通壅塞，周邊房價約降 3-8%。' },
        { id:'gas', name:'加油站', icon:'⛽', risk:'high', desc:'油氣味、地下油槽土壤污染風險、消防安全顧慮，周邊約降 5-10%。' },
        { id:'funeral', name:'殯葬業/靈骨塔', icon:'⚰️', risk:'high', desc:'心理因素為主，嚴重影響轉手性，周邊房價約降 10-20%。' },
        { id:'tower', name:'高壓電塔/變電所', icon:'⚡', risk:'high', desc:'電磁波疑慮、視覺壓迫、噪音，距 50 公尺內約降 8-15%。' },
        { id:'highway', name:'高架橋/快速道路', icon:'🛣️', risk:'medium', desc:'噪音與振動、空氣品質較差、視覺遮蔽，前排約降 5-12%。' },
        { id:'factory', name:'工廠/鐵皮屋', icon:'🏭', risk:'medium', desc:'噪音、粉塵、貨車出入頻繁，影響居住品質。' },
        { id:'market', name:'傳統市場', icon:'🏪', risk:'low', desc:'清晨噪音、環境衛生，但生活機能佳，影響較兩面。' },
        { id:'nightclub', name:'宮廟陣頭/KTV/夜店', icon:'🎤', risk:'medium', desc:'夜間噪音、出入份子複雜，社區安寧受影響。' },
        { id:'cemetery', name:'公墓/墓地', icon:'🪦', risk:'high', desc:'心理嫌惡因素，視野內可見者約降 10-20%。' },
        { id:'waste', name:'垃圾處理場/焚化爐', icon:'♻️', risk:'high', desc:'異味、空氣品質、清運車輛噪音，周邊約降 8-15%。' }
    ];

    const SPECIAL_CONDITIONS = [
        { id:'murder', name:'凶宅', icon:'💀', severity:'critical', desc:'發生非自然死亡事件之房屋，房價約降 20-40%，銀行貸款成數可能受限。查詢方式：台灣凶宅網、向管委會/鄰居側面了解。' },
        { id:'seasand', name:'海砂屋', icon:'🧱', severity:'critical', desc:'混凝土氯離子含量超標，結構有崩壞風險。可能被列為拆除重建對象，銀行多不承貸。查詢：建物謄本、氯離子檢測報告。' },
        { id:'radiation', name:'輻射屋', icon:'☢️', severity:'critical', desc:'建材含輻射鋼筋（多為1982-1984年間建造），有健康疑慮。行政院原能會有列管清冊。' },
        { id:'superficies', name:'地上權住宅', icon:'📋', severity:'warning', desc:'僅有建物使用權，無土地所有權，使用期限到期後須拆除歸還。貸款成數較低（約5-6成），轉手困難度高。' },
        { id:'foreclosure', name:'法拍屋', icon:'⚖️', severity:'warning', desc:'法院拍賣取得，價格通常低於市價 7-8 成。風險：無法內部看屋、可能有占用問題、點交/不點交差異大。' },
        { id:'hillside', name:'位於山坡地/順向坡', icon:'⛰️', severity:'warning', desc:'經政府列管之危險山坡地社區，有地質災害風險。暴雨期間可能有土石流疑慮。查詢：經濟部中央地質調查所。' },
        { id:'flood', name:'易淹水區域', icon:'🌊', severity:'warning', desc:'歷年有淹水紀錄之區域，梅雨季與颱風季需注意。查詢：水利署淹水潛勢圖。' },
        { id:'illegal', name:'違建/增建', icon:'🚧', severity:'warning', desc:'頂樓加蓋、陽台外推、夾層等違建，可能被舉報拆除。影響建物安全與保險理賠。' }
    ];

    /* ========== INIT ========== */
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initNav();
        initSelectors();
        initChips();
        initToggles();
        initCollapsible();
        initSuggest();
        initSearchMode();
        initSearch();
        initMap();
        initCharts();
        doSearch();
    });

    /* ========== THEME ========== */
    function initTheme() {
        const saved = localStorage.getItem('hs_theme');
        if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeBtn();
        $('#btnTheme').addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('hs_theme', 'light'); }
            else { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('hs_theme', 'dark'); }
            updateThemeBtn();
            if (map) setTimeout(() => map.invalidateSize(), 300);
        });
    }
    function updateThemeBtn() {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        $('#themeIcon').innerHTML = dark
            ? '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>'
            : '<path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>';
        $('#themeLabel').textContent = dark ? '淺色' : '深色';
    }

    /* ========== NAV ========== */
    function initNav() {
        window.addEventListener('scroll', () => {
            $('#navbar').classList.toggle('scrolled', window.scrollY > 20);
            const sections = ['searchSection', 'mapSection', 'chartSection'];
            let current = sections[0];
            for (const id of sections) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= 100) current = id;
            }
            $$('.nav-tab[data-nav]').forEach(t => t.classList.toggle('active', t.getAttribute('href') === '#' + current));
        });
        $$('.nav-tab[data-nav]').forEach(t => t.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById(t.getAttribute('href').slice(1))?.scrollIntoView({ behavior: 'smooth' });
        }));
    }

    /* ========== SELECTORS ========== */
    function initSelectors() {
        const cityEl = $('#selCity');
        const distEl = $('#selDistrict');
        const subEl = $('#selSubArea');

        function populateDistricts() {
            const city = cityEl.value;
            const districts = AREAS[city] || {};
            distEl.innerHTML = '<option value="">-- 請選擇 --</option>';
            Object.keys(districts).forEach(d => {
                distEl.innerHTML += `<option value="${d}">${d}</option>`;
            });
            subEl.innerHTML = '<option value="">-- 全部 --</option>';
        }

        function populateSubs() {
            const city = cityEl.value;
            const dist = distEl.value;
            subEl.innerHTML = '<option value="">-- 全部 --</option>';
            if (dist && AREAS[city] && AREAS[city][dist]) {
                AREAS[city][dist].subs.forEach(s => {
                    subEl.innerHTML += `<option value="${s}">${s}</option>`;
                });
            }
        }

        cityEl.addEventListener('change', populateDistricts);
        distEl.addEventListener('change', populateSubs);
        populateDistricts();
    }

    /* ========== CHIPS ========== */
    function initChips() {
        $$('.chip-group').forEach(group => {
            group.querySelectorAll('.chip').forEach(chip => {
                chip.addEventListener('click', () => chip.classList.toggle('active'));
            });
        });
    }

    /* ========== TOGGLES ========== */
    function initToggles() {
        $$('.toggle-group').forEach(group => {
            group.querySelectorAll('.toggle-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    // chart updates
                    if (group.id === 'toggleTrend') updateTrendChart();
                    if (group.id === 'toggleAge') updateAgeChart();
                });
            });
        });
    }

    /* ========== COLLAPSIBLE ========== */
    function initCollapsible() {
        $('#triggerSuggest').addEventListener('click', () => {
            const t = $('#triggerSuggest');
            const c = $('#contentSuggest');
            t.classList.toggle('open');
            c.classList.toggle('open');
        });
    }

    /* ========== SUGGEST ========== */
    function initSuggest() {
        $('#btnCalcSuggest').addEventListener('click', () => {
            const family = FAMILY_SUGGEST[$('#selFamily').value];
            const houseType = $('#selSuggestType').value;
            const age = $('#selSuggestAge').value;
            const ratio = COMMON_RATIO[houseType]?.[age] || 0.30;

            const bMin = Math.round(family.minPing / (1 - ratio));
            const bMax = Math.round(family.maxPing / (1 - ratio));

            const result = $('#suggestResult');
            result.style.display = 'block';
            result.innerHTML = `
                <strong>${family.label}</strong> — 建議格局：${family.layout}<br>
                <br>
                建議室內坪數：<strong>${family.minPing} - ${family.maxPing} 坪</strong><br>
                空間拆解：${family.detail}<br>
                <br>
                房型：<strong>${houseType}</strong>｜屋齡區間：<strong>${age}</strong>｜公設比：<strong>${(ratio * 100).toFixed(0)}%</strong><br>
                <br>
                <span class="formula">建坪 = 室內坪 &divide; (1 - 公設比)</span><br>
                <span class="formula">${bMin} = ${family.minPing} &divide; ${(1 - ratio).toFixed(2)}</span><br>
                <br>
                建議權狀建坪：<strong style="color:var(--accent);font-size:1.1rem">${bMin} - ${bMax} 坪</strong>
            `;

            // Auto-fill search
            $('#pingMin').value = bMin;
            $('#pingMax').value = bMax;
            toast('已套用建議坪數到搜尋條件', 'success');
        });
    }

    /* ========== SEARCH MODE ========== */
    function initSearchMode() {
        const toggleGroup = $('#toggleSearchMode');
        if (!toggleGroup) return;
        toggleGroup.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                toggleGroup.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                searchMode = btn.dataset.val;
                $('#modeArea').style.display = searchMode === 'area' ? '' : 'none';
                $('#modeAddress').style.display = searchMode === 'address' ? '' : 'none';
            });
        });
        // Init addr parking toggle
        const addrPark = $('#toggleAddrParking');
        if (addrPark) {
            addrPark.querySelectorAll('.toggle-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    addrPark.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        }
    }

    /* ========== SEARCH ========== */
    function initSearch() {
        $('#btnSearch').addEventListener('click', doSearch);
    }

    function doSearch() {
        if (searchMode === 'address') {
            doAddressSearch();
            return;
        }
        // Area mode
        const city = $('#selCity').value;
        const dist = $('#selDistrict').value;
        const sub = $('#selSubArea').value;
        const types = [...$$('#chipHouseType .chip.active')].map(c => c.dataset.val);
        const ages = [...$$('#chipAge .chip.active')].map(c => c.dataset.val);
        const parking = $$('#toggleParking .toggle-btn.active')[0]?.dataset.val || '不限';

        currentSearch = { city, dist, sub, types, ages, parking };

        // Hide address section
        const addrSec = $('#addressSection');
        if (addrSec) addrSec.style.display = 'none';

        // Update map
        updateMapView(city, dist);
        // Update charts
        const base = dist && AREAS[city]?.[dist] ? AREAS[city][dist].avg : 70;
        currentSearch.trendData = generateTrendData(base);
        currentSearch.ageData = generateAgeData(base);
        updateTrendChart();
        updateAgeChart();

        toast(`已搜尋：${city} ${dist || '全區'} ${sub || ''}`, 'info');
    }

    /* ========== ADDRESS SEARCH ========== */
    function parseAddress(addr) {
        addr = addr.trim();
        let city = '', district = '';
        for (const c of Object.keys(AREAS)) {
            if (addr.includes(c)) { city = c; break; }
        }
        if (!city) {
            // Try to infer from district name
            for (const [c, dists] of Object.entries(AREAS)) {
                for (const d of Object.keys(dists)) {
                    if (addr.includes(d)) { city = c; district = d; break; }
                }
                if (city) break;
            }
        } else {
            for (const d of Object.keys(AREAS[city])) {
                if (addr.includes(d)) { district = d; break; }
            }
        }
        return { city, district };
    }

    function doAddressSearch() {
        const addr = ($('#inputAddress')?.value || '').trim();
        if (!addr) { toast('請輸入門牌地址', 'warning'); return; }

        const parsed = parseAddress(addr);
        if (!parsed.city || !parsed.district) {
            toast('無法識別地址對應的行政區，請確認格式', 'warning');
            return;
        }

        const city = parsed.city;
        const dist = parsed.district;
        const houseType = $('#addrHouseType').value;
        const age = parseInt($('#addrAge').value) || 10;
        const ping = parseFloat($('#addrPing').value) || 30;
        const floor = parseInt($('#addrFloor').value) || 5;
        const parking = $$('#toggleAddrParking .toggle-btn.active')[0]?.dataset.val || '無';
        const layout = $('#addrLayout').value || '';

        const distData = AREAS[city][dist];
        const basePrice = distData.avg;

        // Age multiplier
        let ageMul = 1.0;
        if (age <= 0) ageMul = 1.25;
        else if (age <= 5) ageMul = 1.10;
        else if (age <= 10) ageMul = 0.95;
        else if (age <= 20) ageMul = 0.82;
        else if (age <= 30) ageMul = 0.70;
        else if (age <= 40) ageMul = 0.60;
        else ageMul = 0.52;

        // Type multiplier
        let typeMul = 1.0;
        if (houseType === '公寓') typeMul = 0.85;
        else if (houseType === '華廈') typeMul = 0.92;
        else if (houseType === '套房') typeMul = 0.88;
        else if (houseType === '透天') typeMul = 1.05;

        const estUnitPrice = +(basePrice * ageMul * typeMul).toFixed(1);
        const estTotalPrice = +(estUnitPrice * ping).toFixed(0);

        // Update map
        updateMapView(city, dist);

        // Update charts
        currentSearch = { city, dist, sub: '', types: [houseType], ages: [], parking };
        currentSearch.trendData = generateTrendData(basePrice);
        currentSearch.ageData = generateAgeData(basePrice);
        updateTrendChart();
        updateAgeChart();

        // Show address section
        const addrSec = $('#addressSection');
        addrSec.style.display = '';

        // Render comparable
        renderAddressComparable(addr, city, dist, distData, {
            houseType, age, ping, floor, parking, layout, estUnitPrice, estTotalPrice
        });

        // Render NIMBY
        renderNimby(city, dist, addr);

        // Render special conditions
        renderSpecialConditions(age, houseType);

        addrSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        toast(`已分析：${addr}`, 'info');
    }

    function renderAddressComparable(addr, city, dist, distData, info) {
        const container = $('#addrComparable');
        const ageLabel = info.age <= 0 ? '預售屋' : info.age <= 5 ? '新成屋' : `屋齡 ${info.age} 年`;
        const priceColor = info.estUnitPrice >= 100 ? 'var(--danger)' : info.estUnitPrice >= 60 ? 'var(--warning)' : 'var(--success)';
        const diffPct = (((info.estUnitPrice / distData.avg) - 1) * 100).toFixed(1);
        const diffLabel = diffPct > 0 ? `高於區域均價 ${diffPct}%` : diffPct < 0 ? `低於區域均價 ${Math.abs(diffPct)}%` : '與區域均價持平';

        container.innerHTML = `
            <h3 class="card-title">同類型區域行情分析</h3>
            <p style="font-size:.82rem;color:var(--text-dim);margin-bottom:12px">
                <strong>${addr}</strong>｜${info.houseType}｜${ageLabel}｜${info.ping} 坪${info.layout ? '｜' + info.layout : ''}${info.floor ? '｜' + info.floor + 'F' : ''}${info.parking === '有' ? '｜含車位' : ''}
            </p>
            <div class="addr-comparable-grid">
                <div class="addr-stat">
                    <span class="stat-val" style="color:${priceColor}">${info.estUnitPrice}</span>
                    <span class="stat-label">估算單價（萬/坪）</span>
                </div>
                <div class="addr-stat">
                    <span class="stat-val">${info.estTotalPrice}</span>
                    <span class="stat-label">估算總價（萬）</span>
                </div>
                <div class="addr-stat">
                    <span class="stat-val">${distData.avg}</span>
                    <span class="stat-label">${dist} 區域均價（萬/坪）</span>
                </div>
                <div class="addr-stat">
                    <span class="stat-val" style="color:${diffPct >= 0 ? 'var(--danger)' : 'var(--success)'}">${diffLabel}</span>
                    <span class="stat-label">與區域均價比較</span>
                </div>
            </div>
            <div style="margin-top:16px">
                <h4 style="font-size:.88rem;font-weight:600;margin-bottom:8px">所屬生活圈</h4>
                <div class="addr-tag-list">
                    ${distData.subs.map(s => `<span class="addr-tag tag-info">${s}</span>`).join('')}
                </div>
            </div>
        `;
    }

    function renderNimby(city, dist, addr) {
        const container = $('#addrNimbyList');
        // Simulate NIMBY detection based on district characteristics
        const nimbyMap = {
            '萬華區': ['temple','market','nightclub'],
            '大同區': ['temple','market','factory'],
            '中正區': ['highway'],
            '信義區': ['highway'],
            '松山區': ['highway'],
            '中山區': ['nightclub'],
            '三重區': ['factory','temple','highway'],
            '蘆洲區': ['temple','factory'],
            '新莊區': ['factory','temple'],
            '中和區': ['factory','highway'],
            '土城區': ['factory','cemetery'],
            '樹林區': ['factory','cemetery'],
            '五股區': ['factory','waste'],
            '泰山區': ['factory'],
            '汐止區': ['highway'],
            '林口區': ['highway'],
            '淡水區': ['highway'],
            '板橋區': ['highway','temple'],
            '永和區': ['market'],
            '新店區': ['hillside','highway'],
            '內湖區': ['highway'],
            '文山區': ['hillside'],
            '北投區': ['temple'],
            '士林區': ['temple','market'],
            '南港區': ['factory','highway'],
            '大安區': [],
            '三峽區': ['hillside']
        };

        const detected = (nimbyMap[dist] || []).map(id => NIMBY_TYPES.find(n => n.id === id)).filter(Boolean);

        if (detected.length === 0) {
            container.innerHTML = `
                <div class="nimby-item">
                    <div class="nimby-icon" style="background:rgba(5,150,105,.1)">✅</div>
                    <div class="nimby-body">
                        <div class="nimby-name" style="color:var(--success)">未偵測到明顯鄰避設施</div>
                        <div class="nimby-desc">該區域周邊環境相對單純，但仍建議實地查看確認。</div>
                    </div>
                </div>`;
            return;
        }

        container.innerHTML = detected.map(n => {
            const riskColor = n.risk === 'high' ? 'var(--danger)' : n.risk === 'medium' ? 'var(--warning)' : 'var(--text-dim)';
            const riskBg = n.risk === 'high' ? 'rgba(220,38,38,.1)' : n.risk === 'medium' ? 'rgba(217,119,6,.1)' : 'rgba(148,163,184,.1)';
            const riskLabel = n.risk === 'high' ? '高風險' : n.risk === 'medium' ? '中風險' : '低風險';
            return `
                <div class="nimby-item">
                    <div class="nimby-icon" style="background:${riskBg};font-size:16px">${n.icon}</div>
                    <div class="nimby-body">
                        <div class="nimby-name">${n.name} <span class="addr-tag ${n.risk === 'high' ? 'tag-danger' : n.risk === 'medium' ? 'tag-warning' : 'tag-safe'}" style="font-size:.72rem;padding:2px 8px">${riskLabel}</span></div>
                        <div class="nimby-desc">${n.desc}</div>
                    </div>
                </div>`;
        }).join('');
    }

    function renderSpecialConditions(age, houseType) {
        const container = $('#addrSpecialList');
        // Determine which conditions to flag based on property characteristics
        const flags = [];

        // Old buildings: check sea-sand, radiation
        if (age >= 35 && age <= 45) {
            flags.push('radiation');
        }
        if (age >= 30) {
            flags.push('seasand');
        }
        if (age >= 25) {
            flags.push('illegal');
        }

        // Always show general awareness items
        const awareness = ['murder', 'superficies', 'foreclosure', 'flood', 'hillside'];

        const allFlags = [...new Set([...flags, ...awareness])];
        const items = allFlags.map(id => SPECIAL_CONDITIONS.find(s => s.id === id)).filter(Boolean);

        container.innerHTML = `
            <p style="font-size:.78rem;color:var(--text-muted);margin-bottom:12px">以下為該房型（${houseType}，屋齡 ${age} 年）應注意的特殊狀況檢查清單：</p>
            ${items.map(s => {
                const isPrimary = flags.includes(s.id);
                const sevColor = s.severity === 'critical' ? 'var(--danger)' : 'var(--warning)';
                const sevBg = s.severity === 'critical' ? 'rgba(220,38,38,.1)' : 'rgba(217,119,6,.1)';
                const sevTag = s.severity === 'critical' ? 'tag-danger' : 'tag-warning';
                const sevLabel = s.severity === 'critical' ? '嚴重' : '注意';
                return `
                    <div class="special-item" ${isPrimary ? `style="border-left:3px solid ${sevColor}"` : ''}>
                        <div class="special-icon" style="background:${sevBg};font-size:16px">${s.icon}</div>
                        <div class="special-body">
                            <div class="special-name">${s.name} <span class="addr-tag ${sevTag}" style="font-size:.72rem;padding:2px 8px">${sevLabel}</span>${isPrimary ? ' <span class="addr-tag tag-danger" style="font-size:.72rem;padding:2px 8px">此屋齡需特別留意</span>' : ''}</div>
                            <div class="special-desc">${s.desc}</div>
                        </div>
                    </div>`;
            }).join('')}
        `;
    }

    /* ========== MAP ========== */
    function initMap() {
        map = L.map('map', { zoomControl: true }).setView([25.035, 121.52], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 18
        }).addTo(map);

        // MRT stations
        MRT_STATIONS.forEach(s => {
            if (s.lines.length === 0) return;
            const color = s.lines.includes('紅') ? '#e3002c' : s.lines.includes('藍') ? '#0070bd' : s.lines.includes('綠') ? '#008659' : s.lines.includes('橘') ? '#f8981d' : s.lines.includes('棕') ? '#c48c31' : '#666';
            L.circleMarker([s.lat, s.lng], { radius: 5, color: color, fillColor: color, fillOpacity: 0.8, weight: 1 })
                .bindTooltip(s.name, { permanent: false, direction: 'top', className: 'map-tip' })
                .addTo(map);
        });

        // Highway interchanges
        HIGHWAYS.forEach(h => {
            L.circleMarker([h.lat, h.lng], { radius: 4, color: '#666', fillColor: '#666', fillOpacity: 0.6, weight: 1 })
                .bindTooltip(h.name, { permanent: false, direction: 'top' })
                .addTo(map);
        });

        // Business districts
        BIZ_DISTRICTS.forEach(b => {
            L.circleMarker([b.lat, b.lng], { radius: 6, color: '#9333ea', fillColor: '#9333ea', fillOpacity: 0.3, weight: 2 })
                .bindTooltip(b.name, { permanent: false, direction: 'top' })
                .addTo(map);
        });
    }

    function updateMapView(city, dist) {
        // Clear old district markers
        map.eachLayer(layer => {
            if (layer._isDistrictMarker) map.removeLayer(layer);
        });

        const districts = AREAS[city] || {};
        if (dist && districts[dist]) {
            const d = districts[dist];
            map.setView(d.center, 14);
            addDistrictMarker(dist, d);
        } else {
            const first = Object.values(districts)[0];
            if (first) map.setView(first.center, city === '台北市' ? 12 : 11);
            Object.entries(districts).forEach(([name, d]) => addDistrictMarker(name, d));
        }
    }

    function addDistrictMarker(name, d) {
        const color = d.avg >= 100 ? '#dc2626' : d.avg >= 60 ? '#f59e0b' : '#22c55e';
        const opacity = d.avg >= 100 ? 0.35 : d.avg >= 60 ? 0.3 : 0.25;

        if (d.bounds && d.bounds.length >= 3) {
            const polygon = L.polygon(d.bounds, {
                color: color,
                fillColor: color,
                fillOpacity: opacity,
                weight: 2
            }).addTo(map);
            polygon._isDistrictMarker = true;

            polygon.bindPopup(`
                <div style="font-family:var(--font);font-size:13px;line-height:1.6">
                    <strong style="font-size:14px">${name}</strong><br>
                    平均單價：<strong style="color:${color}">${d.avg} 萬/坪</strong><br>
                    生活圈：${d.subs.join('、')}
                </div>
            `);
        }

        const label = L.divIcon({
            className: 'district-label',
            html: `<div style="font-size:11px;font-weight:700;color:${color};text-shadow:0 0 3px #fff,0 0 3px #fff;white-space:nowrap;text-align:center">${name}<br>${d.avg}萬</div>`,
            iconSize: [80, 30],
            iconAnchor: [40, 15]
        });
        const marker = L.marker(d.center, { icon: label, interactive: false }).addTo(map);
        marker._isDistrictMarker = true;
    }

    /* ========== CHARTS ========== */
    function initCharts() {
        const ctx1 = $('#chartTrend').getContext('2d');
        trendChart = new Chart(ctx1, {
            type: 'line',
            data: { labels: [], datasets: [] },
            options: chartOptions('萬/坪')
        });

        const ctx2 = $('#chartAge').getContext('2d');
        ageChart = new Chart(ctx2, {
            type: 'bar',
            data: { labels: [], datasets: [] },
            options: chartOptions('萬/坪')
        });
    }

    function chartOptions(unit) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: true, position: 'top', labels: { font: { size: 12, family: 'Inter' }, usePointStyle: true, pointStyle: 'circle' } },
                tooltip: {
                    backgroundColor: 'rgba(15,23,42,.9)',
                    titleFont: { size: 12, family: 'Inter' },
                    bodyFont: { size: 11, family: 'Inter' },
                    callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y} ${unit}` }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 10, family: 'Inter' }, color: '#94a3b8' } },
                y: { grid: { color: 'rgba(148,163,184,.15)' }, ticks: { font: { size: 10, family: 'Inter' }, color: '#94a3b8', callback: v => v + ' ' + unit } }
            }
        };
    }

    function updateTrendChart() {
        if (!currentSearch.trendData) return;
        const mode = $$('#toggleTrend .toggle-btn.active')[0]?.dataset.val || 'unit';
        const data = currentSearch.trendData;
        const dist = currentSearch.dist || '全區';

        trendChart.data.labels = data.map(d => d.label);
        trendChart.data.datasets = [{
            label: `${dist} 平均${mode === 'unit' ? '單價(萬/坪)' : '總價(萬)'}`,
            data: data.map(d => mode === 'unit' ? d.unit : d.total),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37,99,235,.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 6
        }];
        trendChart.options.scales.y.ticks.callback = v => v + (mode === 'unit' ? ' 萬/坪' : ' 萬');
        trendChart.update();
    }

    function updateAgeChart() {
        if (!currentSearch.ageData) return;
        const mode = $$('#toggleAge .toggle-btn.active')[0]?.dataset.val || 'unit';
        const ageData = currentSearch.ageData;

        const labels = Object.keys(ageData);
        const values = labels.map(l => mode === 'unit' ? ageData[l].unit : ageData[l].total);
        const colors = ['#6366f1','#2563eb','#0ea5e9','#059669','#d97706','#ea580c','#dc2626'];

        ageChart.data.labels = labels;
        ageChart.data.datasets = [{
            label: `近3個月平均${mode === 'unit' ? '單價(萬/坪)' : '總價(萬)'}`,
            data: values,
            backgroundColor: colors.map(c => c + '33'),
            borderColor: colors,
            borderWidth: 1.5,
            borderRadius: 6
        }];
        ageChart.options.scales.y.ticks.callback = v => v + (mode === 'unit' ? ' 萬/坪' : ' 萬');
        ageChart.update();
    }

    /* ========== TOAST ========== */
    function toast(msg, type = 'success') {
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.textContent = msg;
        $('#toastContainer').appendChild(el);
        setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2500);
    }

})();
