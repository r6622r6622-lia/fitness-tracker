/* ========================================
   FitPulse v3 — app.js
   ======================================== */
(function () {
    'use strict';

    /* ---------- KEYS ---------- */
    const KEYS = {
        resist: 'fp_resist_sessions',
        cardio: 'fp_cardio_sessions',
        meals: 'fp_meals',
        goals: 'fp_goals',
        tdee: 'fp_tdee_profile',
        weekGoals: 'fp_week_goals',
        statsDisplay: 'fp_stats_display'
    };
    const load = k => JSON.parse(localStorage.getItem(k) || 'null');
    const save = (k, v) => {
        localStorage.setItem(k, JSON.stringify(v));
        syncToCloud();
    };

    /* ---------- FIREBASE SYNC ---------- */
    let _currentUser = null;
    let _syncTimer = null;

    function syncToCloud() {
        if (!_currentUser || !window.__firebase) return;
        clearTimeout(_syncTimer);
        _syncTimer = setTimeout(async () => {
            try {
                const { fbDb, doc, setDoc } = window.__firebase;
                const data = {};
                Object.entries(KEYS).forEach(([, k]) => {
                    const v = localStorage.getItem(k);
                    if (v) data[k] = v;
                });
                const indicator = document.getElementById('syncIndicator');
                if (indicator) { indicator.textContent = '☁️ 同步中...'; indicator.classList.add('show'); }
                await setDoc(doc(fbDb, 'users', _currentUser.uid), { data, updatedAt: Date.now() }, { merge: true });
                if (indicator) { indicator.textContent = '✅ 已同步'; setTimeout(() => indicator.classList.remove('show'), 1500); }
            } catch (e) {
                console.error('Sync to cloud failed:', e);
            }
        }, 1000);
    }

    async function syncFromCloud() {
        if (!_currentUser || !window.__firebase) return;
        try {
            const { fbDb, doc, getDoc } = window.__firebase;
            const snap = await getDoc(doc(fbDb, 'users', _currentUser.uid));
            if (snap.exists()) {
                const stored = snap.data().data || {};
                Object.entries(stored).forEach(([k, v]) => {
                    localStorage.setItem(k, v);
                });
                refreshAll();
            }
        } catch (e) {
            console.error('Sync from cloud failed:', e);
        }
    }

    /* ---------- EQUIPMENT → EXERCISES ---------- */
    const EQUIPMENT_EXERCISES = {
        '啞鈴': ['啞鈴臥推','啞鈴飛鳥','啞鈴肩推','啞鈴側平舉','啞鈴前平舉','啞鈴彎舉','啞鈴錘式彎舉','啞鈴三頭伸展','啞鈴划船','啞鈴深蹲','啞鈴弓步蹲','啞鈴羅馬尼亞硬舉','啞鈴聳肩','啞鈴反向飛鳥'],
        '槓鈴': ['槓鈴臥推','上斜槓鈴臥推','槓鈴肩推','槓鈴深蹲','前蹲舉','槓鈴硬舉','相撲硬舉','羅馬尼亞硬舉','槓鈴划船','槓鈴彎舉','仰臥肱三頭伸展','過頭推舉','早安運動','高翻','挺舉','抓舉'],
        '大型機械': ['腿推機','腿彎舉機','腿伸展機','坐姿胸推機','蝴蝶機夾胸','肩推機','坐姿划船機','高位下拉機','腿內收機','腿外展機','臀推機','小腿提踵機','哈克深蹲機','史密斯機臥推','史密斯機深蹲'],
        '纜繩機': ['纜繩夾胸','纜繩下壓','纜繩面拉','纜繩側平舉','纜繩彎舉','纜繩過頂伸展','低位纜繩划船','纜繩交叉','纜繩捲腹','纜繩木砍'],
        'Smith機': ['Smith 臥推','Smith 深蹲','Smith 肩推','Smith 弓步蹲','Smith 划船','Smith 臀推','Smith 小腿提踵','Smith 聳肩'],
        '壺鈴': ['壺鈴擺盪','壺鈴深蹲','壺鈴硬舉','壺鈴推舉','壺鈴風車','壺鈴土耳其起立','壺鈴高拉','壺鈴弓步蹲'],
        '彈力帶': ['彈力帶深蹲','彈力帶臀橋','彈力帶側走','彈力帶拉伸','彈力帶面拉','彈力帶肩外旋','彈力帶彎舉','彈力帶下壓'],
        '自身體重': ['伏地挺身','引體向上','雙槓撐體','仰臥起坐','捲腹','平板支撐','登山者','波比跳','深蹲跳','保加利亞分腿蹲','臀橋','超人式','側平板','倒立撐體'],
        '其他': ['TRX 划船','TRX 臥推','藥球砸地','戰繩','輪胎翻轉','雪橇推','農夫走路']
    };

    /* ---------- FOOD CATEGORIES ---------- */
    const FOOD_CATEGORIES = {
        rice: [
            { name: '白飯(1碗)', cal: 284, p: 5.4, c: 63, f: 0.4, serving: '標準飯碗平碗裝，約一個成人拳頭大小的圓球' },
            { name: '糙米飯(1碗)', cal: 292, p: 6.2, c: 61, f: 2.2, serving: '同白飯碗量，一個拳頭大小，粒粒分明鬆散堆疊' },
            { name: '紫米飯(1碗)', cal: 274, p: 6.0, c: 57, f: 1.6, serving: '與白飯同碗量，一拳大的紫色飯團' },
            { name: '燕麥飯(1碗)', cal: 278, p: 7.4, c: 55, f: 2.8, serving: '一個拳頭大小，看得到燕麥粒混在白飯中' },
            { name: '地瓜飯(1碗)', cal: 260, p: 4.6, c: 57, f: 0.6, serving: '一拳大小，白飯混橘黃色地瓜塊' },
            { name: '飯糰(1個)', cal: 310, p: 7.5, c: 58, f: 5.2, serving: '超商三角飯糰大小，約掌心長度、3根手指厚' },
            { name: '壽司(6貫)', cal: 340, p: 13, c: 54, f: 5.8, serving: '6片握壽司排成一列，每貫約大拇指長度' }
        ],
        noodle: [
            { name: '陽春麵', cal: 340, p: 10.5, c: 63, f: 4.6, serving: '一般麵碗（直徑18cm），麵條佔碗的八分滿' },
            { name: '乾拌麵', cal: 390, p: 11.5, c: 58, f: 12.5, serving: '圓盤一平盤，麵條堆成手掌攤開大小的圓餅' },
            { name: '牛肉麵', cal: 560, p: 26, c: 64, f: 18, serving: '大湯碗（直徑20cm），湯八分滿，牛肉約3片撲克牌大小' },
            { name: '義大利麵(茄汁)', cal: 470, p: 15.5, c: 68, f: 12, serving: '圓盤一盤，麵條繞叉起來約一個拳頭量' },
            { name: '炒烏龍', cal: 410, p: 12.5, c: 60, f: 13, serving: '盤裝一平盤，約攤開的兩個手掌面積' },
            { name: '米粉湯', cal: 295, p: 7.5, c: 53, f: 5.8, serving: '一般湯碗七分滿，米粉撈起約一個拳頭量' },
            { name: '冬粉(1碗)', cal: 176, p: 0.2, c: 43, f: 0.1, serving: '小碗裝，冬粉撈起來約半個拳頭，透明滑溜' }
        ],
        chicken: [
            { name: '雞胸肉(100g)', cal: 117, p: 22.4, c: 0, f: 2.5, serving: '一片約手掌大小（不含手指）、小指厚度的去皮肉片' },
            { name: '雞腿排(1片)', cal: 245, p: 21.5, c: 0, f: 17, serving: '一整支去骨雞腿攤平，像整個手掌含手指的面積' },
            { name: '雞翅(2隻)', cal: 176, p: 15.5, c: 0, f: 12.5, serving: '兩支二節翅，每支約食指到中指的長度' },
            { name: '鹽酥雞(1份)', cal: 525, p: 24, c: 32, f: 30, serving: '紙袋裝一份，約兩個拳頭堆疊的量' },
            { name: '嫩煎雞胸(超商)', cal: 125, p: 25.8, c: 0.8, f: 2.2, serving: '超商包裝一片，長度約一支筆、寬約三指並排' },
            { name: '烤雞腿便當', cal: 660, p: 31, c: 76, f: 22, serving: '標準便當盒，雞腿佔1/3面積，飯菜各佔1/3' },
            { name: '雞蛋(1顆)', cal: 78, p: 7.0, c: 0.5, f: 5.2, serving: '一顆全蛋（約55g），比大拇指指節略大的橢圓形' }
        ],
        fish: [
            { name: '鮭魚(100g)', cal: 178, p: 20.2, c: 0, f: 10.4, serving: '約半個手掌大、兩根手指厚的橘紅色魚排' },
            { name: '鯛魚片(100g)', cal: 96, p: 20.5, c: 0, f: 1.5, serving: '一片手掌大小、一根筷子粗細厚度的白肉魚片' },
            { name: '鮪魚罐頭(1罐)', cal: 118, p: 25.5, c: 0.2, f: 1.4, serving: '小圓罐（直徑8cm），打開約半碗魚肉碎' },
            { name: '蝦仁(100g)', cal: 91, p: 20.3, c: 0.5, f: 0.7, serving: '約8-10隻中蝦仁，每隻約大拇指末節大小' },
            { name: '花枝(100g)', cal: 60, p: 12.2, c: 1.2, f: 0.6, serving: '切成圈約10-12圈，每圈直徑約50元硬幣' },
            { name: '蛤蜊湯(1碗)', cal: 55, p: 7.6, c: 2.2, f: 0.8, serving: '湯碗一碗，約15-20顆蛤蜊沉在碗底' },
            { name: '烤鯖魚(1片)', cal: 215, p: 19.8, c: 0, f: 14.8, serving: '半片鯖魚，長度約手掌到手腕，寬約三指' }
        ],
        beef_pork: [
            { name: '牛小排(100g)', cal: 290, p: 17.5, c: 0, f: 24.2, serving: '約兩片撲克牌堆疊大小，帶明顯油花紋路' },
            { name: '牛腱(100g)', cal: 136, p: 26.4, c: 0, f: 3.2, serving: '切片約4-5片，每片50元硬幣大小、筷子厚' },
            { name: '豬里肌(100g)', cal: 139, p: 22.2, c: 0.2, f: 5.2, serving: '手掌大小、小指厚的粉色肉排（去骨豬排）' },
            { name: '五花肉(100g)', cal: 368, p: 14.5, c: 0, f: 34.2, serving: '約3-4片，每片食指長度，紅白相間肥瘦層次' },
            { name: '排骨便當', cal: 710, p: 27, c: 82, f: 28, serving: '標準便當盒，炸排骨佔盒1/3，約手掌（含指）大' },
            { name: '滷肉飯(1碗)', cal: 510, p: 14.5, c: 66, f: 20, serving: '小碗公裝，飯上鋪半碗的碎滷肉醬汁' },
            { name: '豬血糕(1份)', cal: 175, p: 7.8, c: 33.5, f: 1.3, serving: '一片約智慧型手機大小，厚度約食指粗' }
        ],
        leafy: [
            { name: '燙青菜(1份)', cal: 28, p: 2.2, c: 3.5, f: 0.3, serving: '小盤裝，夾起約一個拳頭可握住的菜量' },
            { name: '炒高麗菜', cal: 58, p: 1.8, c: 5.2, f: 3.5, serving: '家常盤一盤，鋪平約攤開手掌大小面積' },
            { name: '炒空心菜', cal: 52, p: 2.5, c: 2.8, f: 3.5, serving: '盤裝一份，堆起約一個拳頭高度的菜量' },
            { name: '沙拉(無醬)', cal: 32, p: 1.8, c: 5.5, f: 0.3, serving: '沙拉碗一碗，葉菜蓬鬆堆起約兩個拳頭體積' },
            { name: '凱薩沙拉', cal: 175, p: 5.8, c: 9.5, f: 13.5, serving: '大沙拉盤一份，蘿蔓葉鋪底加麵包丁和起司粉' },
            { name: '菠菜(100g)', cal: 22, p: 2.6, c: 2.7, f: 0.3, serving: '煮熟後縮成拳頭大小一團（生菜約兩大把）' },
            { name: '花椰菜(100g)', cal: 27, p: 3.7, c: 3.2, f: 0.1, serving: '約6-8小朵，堆起來一個拳頭大小' }
        ],
        root: [
            { name: '地瓜(1條)', cal: 124, p: 1.6, c: 28.6, f: 0.2, serving: '中型一條，約拳頭大小或手掌長度×兩指粗' },
            { name: '馬鈴薯(1顆)', cal: 148, p: 2.6, c: 34, f: 0.1, serving: '中型一顆，約拳頭大小、握在手中剛好' },
            { name: '南瓜(100g)', cal: 49, p: 1.7, c: 10.3, f: 0.2, serving: '切塊約4-5塊，每塊約拇指大小的厚方塊' },
            { name: '玉米(1根)', cal: 113, p: 3.7, c: 22.6, f: 1.2, serving: '一根完整帶梗玉米，約20cm（手肘到手腕距離）' },
            { name: '芋頭(100g)', cal: 113, p: 2.5, c: 25.8, f: 0.2, serving: '切塊約3-4塊，每塊約麻將牌大小' },
            { name: '紅蘿蔔(1根)', cal: 37, p: 0.8, c: 8.2, f: 0.1, serving: '中型一根，約中指到手腕的長度' },
            { name: '山藥(100g)', cal: 73, p: 1.9, c: 16.4, f: 0.1, serving: '切片約5-6片，每片10元硬幣大小、筷子厚' }
        ],
        fruit: [
            { name: '香蕉(1根)', cal: 91, p: 1.3, c: 22, f: 0.2, serving: '中型一根，約20cm長，去皮後約手掌長度' },
            { name: '蘋果(1顆)', cal: 83, p: 0.3, c: 21.5, f: 0.2, serving: '中型一顆，約拳頭大小、單手剛好握住' },
            { name: '芭樂(1顆)', cal: 77, p: 1.4, c: 17.5, f: 0.4, serving: '中型一顆，比拳頭略大，切開約4-6瓣' },
            { name: '奇異果(1顆)', cal: 52, p: 1.0, c: 11.5, f: 0.3, serving: '一顆約雞蛋大小，表皮有短毛的橢圓形' },
            { name: '葡萄(1碗)', cal: 84, p: 0.5, c: 21, f: 0.3, serving: '小碗裝約15-20顆，每顆約大拇指指甲蓋大' },
            { name: '木瓜(半顆)', cal: 57, p: 0.8, c: 13.4, f: 0.1, serving: '中型木瓜對半切，果肉約攤開手掌的面積' },
            { name: '橘子(1顆)', cal: 45, p: 0.8, c: 10.7, f: 0.1, serving: '中型一顆，握在手中約棒球大小' }
        ],
        canned: [
            { name: '鮪魚罐頭(水煮)', cal: 108, p: 24.2, c: 0.1, f: 0.8, serving: '小圓罐打開，魚肉碎撈起約高爾夫球大小' },
            { name: '玉米罐頭(半罐)', cal: 76, p: 2.4, c: 17, f: 0.5, serving: '約3大湯匙平匙，鋪在掌心大約成人掌心面積' },
            { name: '鷹嘴豆罐頭(半罐)', cal: 128, p: 6.8, c: 19.5, f: 2.2, serving: '約半碗豆子，堆起約半個拳頭體積' },
            { name: '肉醬罐頭(1罐)', cal: 195, p: 9.5, c: 19, f: 8.5, serving: '倒出約一碗公的量，濃稠可覆蓋一盤義大利麵' },
            { name: '豆腐(嫩1盒)', cal: 79, p: 7.5, c: 2.5, f: 4.2, serving: '超市盒裝一盒（約200g），約手掌大小的白色方塊' },
            { name: '即食燕麥(1包)', cal: 124, p: 3.8, c: 22, f: 2.2, serving: '單包沖泡後約小碗八分滿的糊狀' },
            { name: '蛋白棒(1條)', cal: 200, p: 20, c: 22, f: 7, serving: '一條約食指到中指長度，寬約兩指' },
            { name: '洋芋片(小包)', cal: 275, p: 3.2, c: 27, f: 17.5, serving: '超商小包裝（約60g），倒出約攤滿一個手掌的量' },
            { name: '巧克力(1條)', cal: 228, p: 3.5, c: 25, f: 13, serving: '一般巧克力棒，約食指長度、兩指寬的一條' },
            { name: '餅乾(1包)', cal: 176, p: 2.2, c: 23, f: 8.8, serving: '小包裝約4-6片，每片約50元硬幣大小' },
            { name: '堅果(一小把)', cal: 165, p: 5.2, c: 5.5, f: 14.8, serving: '約20-25顆綜合堅果，剛好一個掌心凹起能盛的量' },
            { name: '麻糬(2顆)', cal: 158, p: 2.0, c: 35, f: 0.8, serving: '兩顆小麻糬，每顆約乒乓球大小' },
            { name: '肉乾(1包)', cal: 195, p: 21.5, c: 14, f: 5.2, serving: '超商小包裝（約50g），約5-6片撲克牌大小薄片' },
            { name: '冰淇淋(1球)', cal: 148, p: 2.5, c: 17, f: 8, serving: '一球約網球大小，放在甜筒或杯中的圓球' },
            { name: '蛋糕(1片)', cal: 345, p: 5.5, c: 40, f: 18, serving: '一片三角切片，約手掌大小（不含指）、兩指高' },
            { name: '珍珠(加點)', cal: 115, p: 0.1, c: 28, f: 0.3, serving: '飲料額外加點份量，約2-3大湯匙的黑色圓珠' }
        ],
        drink: [
            { name: '牛奶(240ml)', cal: 152, p: 7.2, c: 11.5, f: 8.4, serving: '一般馬克杯一杯滿（約240ml），或超商小瓶裝' },
            { name: '豆漿(無糖)', cal: 58, p: 5.6, c: 2.8, f: 2.3, serving: '早餐店一杯（約350ml中杯），淡黃色液體' },
            { name: '乳清蛋白(1匙)', cal: 120, p: 24, c: 3, f: 1.5, serving: '附贈量匙平匙一匙，加水搖勻約300ml杯' },
            { name: '手搖全糖珍奶', cal: 550, p: 4, c: 84, f: 20, serving: '手搖杯大杯（700ml），杯底鋪滿珍珠約3cm高' },
            { name: '手搖半糖綠茶', cal: 78, p: 0, c: 19.5, f: 0, serving: '手搖杯中杯（500ml），清透黃綠色液體' },
            { name: '美式咖啡', cal: 5, p: 0.3, c: 0.5, f: 0, serving: '一般咖啡杯一杯（約240ml），純黑無奶無糖' },
            { name: '拿鐵(中杯)', cal: 148, p: 7.0, c: 11, f: 7.5, serving: '超商中杯（約360ml），咖啡色帶淺棕奶泡' },
            { name: '運動飲料(1瓶)', cal: 116, p: 0, c: 29, f: 0, serving: '一瓶580ml寶特瓶裝，常見的淡藍色透明液體' }
        ]
    };

    /* ---------- MOTIVATIONAL QUOTES ---------- */
    const DEFAULT_QUOTES = [
        '每一次訓練，都是對未來最好的投資。',
        '不是因為看到改變才堅持，而是堅持了才看到改變。',
        '身體能承受的，永遠比你想像的多。',
        '今天的汗水，是明天的自信。',
        '沒有捷徑，只有日復一日的累積。',
        '你的對手只有昨天的自己。',
        '進步不需要完美，只需要持續。',
        '最痛苦的時候，就是最接近突破的時候。'
    ];

    /* ---------- HELPERS ---------- */
    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);
    const today = () => new Date().toISOString().slice(0, 10);
    const weekStart = () => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); return d; };
    const daysBetween = (a, b) => Math.floor((new Date(a) - new Date(b)) / 864e5);

    function toast(msg, type = 'success') {
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.textContent = msg;
        $('#toastContainer').appendChild(el);
        setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2500);
    }

    /* ---------- INIT ---------- */
    document.addEventListener('DOMContentLoaded', () => {
        initThemeToggle();
        initAuth();
        initDateBanner();
        initNav();
        initTabs();
        initHistoryTabs();
        initResistance();
        initCardio();
        initDiet();
        initTDEE();
        initWeekGoals();
        initProgressRunner();
        initStatsCustom();
        initNutritionPhoto();
        initClearAll();
        refreshAll();
    });

    /* ================================
       AUTH (Firebase Google Login)
       ================================ */
    function initAuth() {
        const btn = $('#btnAuth');
        if (!btn) return;

        // Wait for Firebase module to load
        const waitForFirebase = setInterval(() => {
            if (!window.__firebase) return;
            clearInterval(waitForFirebase);

            const { fbAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = window.__firebase;

            onAuthStateChanged(fbAuth, async (user) => {
                _currentUser = user;
                if (user) {
                    const name = user.displayName || user.email || '已登入';
                    btn.textContent = `👤 ${name.length > 6 ? name.slice(0, 6) + '…' : name}`;
                    btn.classList.add('logged-in');
                    btn.title = `${user.email}\n點擊登出`;
                    await syncFromCloud();
                    toast(`歡迎回來，${user.displayName || ''}！已同步雲端資料`, 'info');
                } else {
                    btn.textContent = '🔑 登入';
                    btn.classList.remove('logged-in');
                    btn.title = '登入以同步資料';
                }
            });

            btn.addEventListener('click', async () => {
                if (_currentUser) {
                    if (confirm('確定要登出嗎？登出後資料仍保留在此裝置，但不再同步。')) {
                        await signOut(fbAuth);
                        _currentUser = null;
                        toast('已登出', 'info');
                    }
                } else {
                    try {
                        const provider = new GoogleAuthProvider();
                        await signInWithPopup(fbAuth, provider);
                    } catch (e) {
                        if (e.code !== 'auth/popup-closed-by-user') {
                            toast('登入失敗：' + e.message, 'error');
                        }
                    }
                }
            });
        }, 100);
    }

    /* ================================
       THEME TOGGLE
       ================================ */
    function initThemeToggle() {
        const saved = localStorage.getItem('fp_theme');
        if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon();

        $('#btnThemeToggle').addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('fp_theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('fp_theme', 'dark');
            }
            updateThemeIcon();
        });
    }

    function updateThemeIcon() {
        const btn = $('#btnThemeToggle');
        if (!btn) return;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const icon = btn.querySelector('.btn-nav-icon');
        const label = btn.querySelector('.btn-nav-label');
        if (icon) icon.textContent = isDark ? '☀️' : '🌙';
        if (label) label.textContent = isDark ? '淺色' : '深色';
    }

    /* ================================
       DATE BANNER
       ================================ */
    function initDateBanner() {
        const d = new Date();
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        const str = `📆 ${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日（${weekdays[d.getDay()]}）`;
        $('#dateBanner').textContent = str;
    }

    /* ================================
       NAVIGATION (5 sections)
       ================================ */
    function initNav() {
        const sections = ['weeklyOverviewSection', 'training', 'diet', 'history', 'insights'];
        const links = $$('.nav-link');
        const navbar = $('#navbar');

        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 30);
            let current = sections[0];
            for (const id of sections) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= 120) current = id;
            }
            links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
        });

        links.forEach(l => l.addEventListener('click', e => {
            e.preventDefault();
            const id = l.getAttribute('href').slice(1);
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }));
    }

    /* ================================
       TAB SWITCHING (training tabs)
       ================================ */
    function initTabs() {
        $$('.tab-btn[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                const g = btn.closest('.tab-container') || btn.parentElement;
                g.querySelectorAll('.tab-btn[data-tab]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const panel = btn.dataset.tab;
                $$('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + panel));
            });
        });
    }

    /* ================================
       HISTORY TAB SWITCHING (htab)
       ================================ */
    function initHistoryTabs() {
        $$('.tab-btn[data-htab]').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('#historyTabContainer .tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const panel = btn.dataset.htab;
                $$('.htab-panel').forEach(p => p.classList.toggle('active', p.id === panel));
            });
        });
    }

    /* ================================
       RESISTANCE TRAINING
       ================================ */
    let currentExercises = [];

    function initResistance() {
        // Set default date
        $('#resistDate').value = today();

        // RPE slider
        const rpe = $('#rpe');
        rpe.addEventListener('input', () => { $('#rpeValue').textContent = rpe.value; });

        // Equipment → exercise datalist
        const eqSel = $('#equipmentType');
        eqSel.addEventListener('change', () => {
            const dl = $('#exerciseList');
            dl.innerHTML = '';
            const exercises = EQUIPMENT_EXERCISES[eqSel.value] || [];
            exercises.forEach(e => { const o = document.createElement('option'); o.value = e; dl.appendChild(o); });
            $('#exerciseName').value = '';
        });

        // Add exercise
        $('#btnAddExercise').addEventListener('click', () => {
            const name = $('#exerciseName').value.trim();
            const sets = parseInt($('#sets').value) || 0;
            const reps = parseInt($('#reps').value) || 0;
            const weight = parseFloat($('#weight').value) || 0;
            const rpeVal = parseInt($('#rpe').value) || 7;
            if (!name) return toast('請輸入動作名稱', 'error');
            currentExercises.push({ name, sets, reps, weight, rpe: rpeVal, volume: sets * reps * weight });
            renderCurrentExercises();
            $('#exerciseName').value = '';
            toast(`已加入：${name}`);
        });

        // Save session
        $('#btnSaveResist').addEventListener('click', () => {
            if (!currentExercises.length) return toast('請先加入動作', 'error');
            const sessions = load(KEYS.resist) || [];
            const session = {
                date: $('#resistDate').value || today(),
                muscle: $('#muscleGroup').value,
                exercises: [...currentExercises],
                totalVolume: currentExercises.reduce((s, e) => s + e.volume, 0),
                avgRpe: +(currentExercises.reduce((s, e) => s + e.rpe, 0) / currentExercises.length).toFixed(1)
            };
            sessions.push(session);
            save(KEYS.resist, sessions);
            showVolumeGauge(session, sessions);
            currentExercises = [];
            renderCurrentExercises();
            refreshAll();
            toast('訓練紀錄已儲存！ 💪');
        });
    }

    function renderCurrentExercises() {
        const el = $('#currentExercises');
        el.innerHTML = currentExercises.map((e, i) =>
            `<div class="exercise-item">
                <span class="ex-name">${e.name}</span>
                <span class="ex-detail">${e.sets}×${e.reps} @ ${e.weight}kg RPE${e.rpe}</span>
                <span class="ex-volume">${e.volume.toLocaleString()} kg</span>
                <button class="btn-danger" onclick="window._removeEx(${i})">✕</button>
            </div>`
        ).join('');
    }
    window._removeEx = i => { currentExercises.splice(i, 1); renderCurrentExercises(); };

    function showVolumeGauge(session, sessions) {
        const card = $('#volumeGaugeCard');
        card.style.display = '';
        const past = sessions.slice(0, -1).filter(s => s.muscle === session.muscle);
        const avgVol = past.length ? past.reduce((s, x) => s + x.totalVolume, 0) / past.length : session.totalVolume;
        const pct = Math.min(Math.round((session.totalVolume / avgVol) * 100), 200);
        const offset = 326.73 - (326.73 * Math.min(pct, 100) / 100);
        const fill = $('#gaugeFill');
        fill.style.strokeDashoffset = offset;
        fill.style.stroke = pct >= 105 ? 'var(--success)' : pct >= 90 ? 'var(--secondary)' : 'var(--warning)';
        $('#gaugeValue').textContent = pct + '%';
        $('#infoVolume').textContent = session.totalVolume.toLocaleString() + ' kg';
        $('#infoAvgVolume').textContent = Math.round(avgVol).toLocaleString() + ' kg';
        $('#infoAvgRpe').textContent = session.avgRpe;
        const badge = $('#infoStimulus');
        if (pct >= 105) { badge.textContent = '漸進超負荷 🔥'; badge.className = 'info-value badge badge-overload'; }
        else if (pct >= 90) { badge.textContent = '維持水平 ✅'; badge.className = 'info-value badge badge-maintain'; }
        else { badge.textContent = '建議提升 ⚠️'; badge.className = 'info-value badge badge-deload'; }
        // Rest advice
        const rest = $('#restAdvice');
        const strat = $('#restStrategy');
        if (session.avgRpe >= 9) {
            rest.textContent = '本次訓練強度極高，建議至少休息 48-72 小時再訓練同肌群，重點補充蛋白質與碳水。';
            strat.innerHTML = '<span class="rest-tag sleep">💤 充足睡眠 8h</span><span class="rest-tag nutrition">🥩 蛋白質 30g+</span><span class="rest-tag stretch">🧘 伸展放鬆</span>';
        } else if (session.avgRpe >= 7) {
            rest.textContent = '中高強度訓練，建議休息 24-48 小時，安排交替訓練不同肌群。';
            strat.innerHTML = '<span class="rest-tag sleep">💤 睡眠 7-8h</span><span class="rest-tag active-recovery">🚶 輕度活動恢復</span>';
        } else {
            rest.textContent = '訓練強度適中，可安排隔日訓練。考慮漸進增加負荷。';
            strat.innerHTML = '<span class="rest-tag active-recovery">🏃 維持活動習慣</span>';
        }
    }

    /* ================================
       CARDIO TRAINING
       ================================ */
    function initCardio() {
        $('#cardioDate').value = today();

        // Intensity buttons
        $$('.intensity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.intensity-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        $('#btnSaveCardio').addEventListener('click', () => {
            const sessions = load(KEYS.cardio) || [];
            const dur = parseInt($('#cardioDuration').value) || 0;
            const hr = parseInt($('#cardioHR').value) || 140;
            const dist = parseFloat($('#cardioDistance').value) || 0;
            const intensity = document.querySelector('.intensity-btn.active')?.dataset.val || '中強度';
            if (dur < 1) return toast('請輸入有效時長', 'error');
            const session = {
                date: $('#cardioDate').value || today(),
                type: $('#cardioType').value,
                duration: dur, hr, distance: dist, intensity,
                calories: Math.round(dur * (hr - 60) * 0.05)
            };
            sessions.push(session);
            save(KEYS.cardio, sessions);
            showCardioSummary(session, sessions);
            refreshAll();
            toast('有氧紀錄已儲存！ 🏃');
        });
    }

    function showCardioSummary(session, sessions) {
        const card = $('#cardioSummaryCard');
        card.style.display = '';
        $('#csCalories').textContent = session.calories;
        // HR zone
        let zone = '-';
        if (session.hr < 110) zone = 'Zone 1 (暖身)';
        else if (session.hr < 130) zone = 'Zone 2 (燃脂)';
        else if (session.hr < 155) zone = 'Zone 3 (有氧)';
        else if (session.hr < 175) zone = 'Zone 4 (無氧)';
        else zone = 'Zone 5 (極限)';
        $('#csZone').textContent = zone;
        // Weekly total
        const ws = weekStart();
        const weekMin = sessions.filter(s => new Date(s.date) >= ws).reduce((a, s) => a + s.duration, 0);
        $('#csWeekly').textContent = weekMin;
        $('#csTarget').textContent = weekMin >= 150 ? '✅ 已達成' : `剩 ${150 - weekMin} 分鐘`;
    }

    /* ================================
       DIET
       ================================ */
    let currentFoods = [];

    function initDiet() {
        $('#dietDate').value = today();

        // Category tabs
        $$('#foodCategoryTabs .food-cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('#foodCategoryTabs .food-cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderFoodTags(btn.dataset.cat);
            });
        });
        renderFoodTags('all');

        // Photo upload
        initPhotoUpload('#uploadZone', '#photoInput', '#photoPreview', '#uploadPlaceholder');

        // Add food manually
        $('#btnAddFood').addEventListener('click', () => {
            const name = $('#foodName').value.trim();
            const cal = parseInt($('#foodCal').value) || 0;
            const p = parseFloat($('#foodProtein').value) || 0;
            const c = parseFloat($('#foodCarb').value) || 0;
            const f = parseFloat($('#foodFat').value) || 0;
            if (!name) return toast('請輸入食物名稱', 'error');
            currentFoods.push({ name, cal, p, c, f });
            renderCurrentFoods();
            $('#foodName').value = '';
            ['#foodCal', '#foodProtein', '#foodCarb', '#foodFat'].forEach(s => $(s).value = '');
            toast(`已加入：${name}`);
        });

        // Save meal
        $('#btnSaveMeal').addEventListener('click', () => {
            if (!currentFoods.length) return toast('請先加入食物', 'error');
            const meals = load(KEYS.meals) || [];
            const meal = {
                date: $('#dietDate').value || today(),
                type: $('#mealType').value,
                foods: [...currentFoods],
                totalCal: currentFoods.reduce((s, f) => s + f.cal, 0),
                totalP: +currentFoods.reduce((s, f) => s + f.p, 0).toFixed(1),
                totalC: +currentFoods.reduce((s, f) => s + f.c, 0).toFixed(1),
                totalF: +currentFoods.reduce((s, f) => s + f.f, 0).toFixed(1)
            };
            meals.push(meal);
            save(KEYS.meals, meals);
            currentFoods = [];
            renderCurrentFoods();
            refreshAll();
            toast('飲食紀錄已儲存！ 🍱');
        });

        // Goals
        const goals = load(KEYS.goals);
        if (goals) {
            $('#goalCal').value = goals.cal || 2200;
            $('#goalP').value = goals.p || 150;
            $('#goalC').value = goals.c || 250;
            $('#goalF').value = goals.f || 60;
        }
        $('#btnSaveGoals').addEventListener('click', () => {
            save(KEYS.goals, {
                cal: parseInt($('#goalCal').value) || 2200,
                p: parseInt($('#goalP').value) || 150,
                c: parseInt($('#goalC').value) || 250,
                f: parseInt($('#goalF').value) || 60
            });
            refreshAll();
            toast('每日目標已儲存！');
        });
    }

    function renderFoodTags(cat) {
        const container = $('#foodQuickTags');
        const detailBox = $('#foodServingDetail');
        if (cat === 'all') {
            container.innerHTML = '<p class="form-hint" style="margin:0;padding:8px 0">👆 請先選擇食物分類，即可快速瀏覽該類食物</p>';
            if (detailBox) detailBox.style.display = 'none';
            return;
        }
        const items = FOOD_CATEGORIES[cat] || [];
        container.innerHTML = items.map(it => {
            const d = JSON.stringify(it).replace(/'/g, "&#39;");
            return `<div class="food-card" data-food='${d}'>
                <div class="food-card-main">
                    <span class="food-card-name">${it.name}</span>
                    <span class="food-card-cal">${it.cal} kcal</span>
                </div>
                <div class="food-card-macros">
                    <span class="fc-macro fc-p">💪P ${it.p}g</span>
                    <span class="fc-macro fc-c">⚡C ${it.c}g</span>
                    <span class="fc-macro fc-f">🛡️F ${it.f}g</span>
                </div>
                <div class="food-card-serving">📏 ${it.serving || ''}</div>
                <button class="food-card-add">＋ 加入</button>
            </div>`;
        }).join('');
        container.querySelectorAll('.food-card').forEach(card => {
            card.querySelector('.food-card-add').addEventListener('click', (e) => {
                e.stopPropagation();
                const food = JSON.parse(card.dataset.food);
                currentFoods.push({ name: food.name, cal: food.cal, p: food.p, c: food.c, f: food.f });
                renderCurrentFoods();
                card.classList.add('selected');
                toast(`已加入：${food.name}`);
            });
        });
    }

    function renderCurrentFoods() {
        const el = $('#currentFoods');
        el.innerHTML = currentFoods.map((f, i) =>
            `<div class="food-item">
                <span class="fi-name">${f.name}</span>
                <span class="fi-macros">P${f.p}g C${f.c}g F${f.f}g</span>
                <span class="fi-cal">${f.cal} kcal</span>
                <button class="btn-danger" onclick="window._removeFood(${i})">✕</button>
            </div>`
        ).join('');
    }
    window._removeFood = i => { currentFoods.splice(i, 1); renderCurrentFoods(); };

    function initPhotoUpload(zoneSel, inputSel, previewSel, placeholderSel) {
        const zone = $(zoneSel), input = $(inputSel), preview = $(previewSel), ph = $(placeholderSel);
        if (!zone || !input) return;
        zone.addEventListener('click', () => input.click());
        zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('drag-over'); handleFile(e.dataTransfer.files[0]); });
        input.addEventListener('change', () => { if (input.files[0]) handleFile(input.files[0]); });
        function handleFile(file) {
            if (!file || !file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = e => {
                preview.src = e.target.result;
                preview.style.display = '';
                if (ph) ph.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    }

    /* ================================
       NUTRITION LABEL PHOTO
       ================================ */
    function initNutritionPhoto() {
        initPhotoUpload('#nutritionUploadZone', '#nutritionPhotoInput', '#nutritionPreview', '#nutritionPlaceholder');
    }

    /* ================================
       TDEE CALCULATOR
       ================================ */
    function initTDEE() {
        const profile = load(KEYS.tdee);
        if (profile) {
            if (profile.gender) $('#tdeeGender').value = profile.gender;
            if (profile.age) $('#tdeeAge').value = profile.age;
            if (profile.height) $('#tdeeHeight').value = profile.height;
            if (profile.weight) $('#tdeeWeight').value = profile.weight;
            if (profile.activity) $('#tdeeActivity').value = profile.activity;
            if (profile.goal) $('#tdeeGoal').value = profile.goal;
        }

        $('#btnToggleTDEE').addEventListener('click', () => {
            const c = $('#tdeeCollapsible');
            const arrow = $('#btnToggleTDEE .tdee-toggle-arrow');
            if (c.style.display === 'none') { c.style.display = ''; arrow.textContent = '▲'; }
            else { c.style.display = 'none'; arrow.textContent = '▼'; }
        });

        $('#btnCalcTDEE').addEventListener('click', () => {
            const gender = $('#tdeeGender').value;
            const age = parseInt($('#tdeeAge').value);
            const height = parseInt($('#tdeeHeight').value);
            const weight = parseInt($('#tdeeWeight').value);
            const activity = parseFloat($('#tdeeActivity').value);
            const goal = $('#tdeeGoal').value;

            // Mifflin-St Jeor
            let bmr = gender === 'male'
                ? 10 * weight + 6.25 * height - 5 * age + 5
                : 10 * weight + 6.25 * height - 5 * age - 161;
            const tdee = Math.round(bmr * activity);
            bmr = Math.round(bmr);

            const goalAdj = { lose_fast: -750, lose: -500, lose_slow: -250, maintain: 0, gain_slow: 250, gain: 500 };
            const target = tdee + (goalAdj[goal] || 0);
            const pGrams = Math.round(weight * 2);
            const fGrams = Math.round(target * 0.25 / 9);
            const cGrams = Math.round((target - pGrams * 4 - fGrams * 9) / 4);

            $('#tdeeBMR').textContent = bmr;
            $('#tdeeTDEE').textContent = tdee;
            $('#tdeeTarget').textContent = target;
            $('#tdeeP').textContent = pGrams;
            $('#tdeeC').textContent = Math.max(0, cGrams);
            $('#tdeeF').textContent = fGrams;
            $('#tdeeResult').style.display = '';

            save(KEYS.tdee, { gender, age, height, weight, activity, goal });
        });

        $('#btnApplyTDEE').addEventListener('click', () => {
            $('#goalCal').value = $('#tdeeTarget').textContent;
            $('#goalP').value = $('#tdeeP').textContent;
            $('#goalC').value = $('#tdeeC').textContent;
            $('#goalF').value = $('#tdeeF').textContent;
            save(KEYS.goals, {
                cal: parseInt($('#goalCal').value),
                p: parseInt($('#goalP').value),
                c: parseInt($('#goalC').value),
                f: parseInt($('#goalF').value)
            });
            refreshAll();
            toast('已套用 TDEE 計算結果為每日目標！');
        });
    }

    /* ================================
       WEEKLY GOALS
       ================================ */
    function initWeekGoals() {
        const wg = load(KEYS.weekGoals) || { trainDays: 4, cardioMin: 150, mealDays: 7, customGoal: '', motivation: '' };
        $('#wgTrainDays').value = wg.trainDays;
        $('#wgCardioMin').value = wg.cardioMin;
        $('#wgMealDays').value = wg.mealDays;
        $('#wgCustomGoal').value = wg.customGoal || '';
        $('#wgMotivation').value = wg.motivation || '';

        $('#btnEditWeekGoals').addEventListener('click', () => {
            const form = $('#weekGoalsForm');
            form.style.display = form.style.display === 'none' ? '' : 'none';
        });

        $('#btnSaveWeekGoals').addEventListener('click', () => {
            const data = {
                trainDays: parseInt($('#wgTrainDays').value) || 4,
                cardioMin: parseInt($('#wgCardioMin').value) || 150,
                mealDays: parseInt($('#wgMealDays').value) || 7,
                customGoal: $('#wgCustomGoal').value.trim(),
                motivation: $('#wgMotivation').value.trim()
            };
            save(KEYS.weekGoals, data);
            $('#weekGoalsForm').style.display = 'none';
            refreshAll();
            toast('本週目標已更新！');
        });
    }

    function refreshWeekGoals() {
        const wg = load(KEYS.weekGoals) || { trainDays: 4, cardioMin: 150, mealDays: 7, customGoal: '', motivation: '' };
        const ws = weekStart();

        // Count this week's resist + cardio sessions
        const rSessions = (load(KEYS.resist) || []).filter(s => new Date(s.date) >= ws);
        const cSessions = (load(KEYS.cardio) || []).filter(s => new Date(s.date) >= ws);

        // Unique training days
        const trainDaysSet = new Set();
        rSessions.forEach(s => trainDaysSet.add(s.date));
        cSessions.forEach(s => trainDaysSet.add(s.date));
        const trainDaysCount = trainDaysSet.size;

        // Total cardio minutes
        const cardioMinTotal = cSessions.reduce((a, s) => a + s.duration, 0);

        // Meal days
        const meals = (load(KEYS.meals) || []).filter(m => new Date(m.date) >= ws);
        const mealDaysSet = new Set(meals.map(m => m.date));
        const mealDaysCount = mealDaysSet.size;

        // Update display
        $('#wgTrainText').textContent = `訓練 ${wg.trainDays} 天`;
        $('#wgTrainStatus').textContent = `${trainDaysCount}/${wg.trainDays}`;
        $('#wgCardioText').textContent = `有氧 ${wg.cardioMin} 分鐘`;
        $('#wgCardioStatus').textContent = `${cardioMinTotal}/${wg.cardioMin}`;
        $('#wgMealText').textContent = `飲食記錄 ${wg.mealDays} 天`;
        $('#wgMealStatus').textContent = `${mealDaysCount}/${wg.mealDays}`;
        if (wg.customGoal) {
            $('#wgCustomText').textContent = wg.customGoal;
            $('#wgCustomStatus').textContent = '⭐';
        } else {
            $('#wgCustomText').textContent = '自訂目標（尚未設定）';
            $('#wgCustomStatus').textContent = '—';
        }

        // Motivational quote
        const quoteEl = $('#quoteText');
        if (wg.motivation) {
            quoteEl.textContent = wg.motivation;
        } else {
            quoteEl.textContent = DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];
        }

        // Refresh progress runner
        refreshProgressRunner(trainDaysCount, wg.trainDays, cardioMinTotal, wg.cardioMin, mealDaysCount, wg.mealDays);
    }

    /* ================================
       PROGRESS RUNNER (animated bar)
       ================================ */
    function initProgressRunner() {
        const wrap = $('#progressRunnerWrap');
        if (!wrap) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Re-trigger animation on each scroll into view
                    const fill = $('#progressRunnerFill');
                    const char = $('#progressRunnerChar');
                    const pct = parseInt($('#progressRunnerPct').textContent) || 0;
                    // Reset then animate
                    fill.style.transition = 'none';
                    char.style.transition = 'none';
                    fill.style.width = '0%';
                    char.style.left = '0%';
                    char.classList.remove('animate');
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            fill.style.transition = 'width 1.2s cubic-bezier(.4,0,.2,1)';
                            char.style.transition = 'left 1.2s cubic-bezier(.4,0,.2,1)';
                            fill.style.width = Math.min(pct, 100) + '%';
                            char.style.left = `calc(${Math.min(pct, 100)}% - 12px)`;
                            char.classList.add('animate');
                        });
                    });
                }
            });
        }, { threshold: 0.3 });
        observer.observe(wrap);
    }

    function refreshProgressRunner(trainDone, trainGoal, cardioMin, cardioGoal, mealDays, mealGoal) {
        // Average progress of the 3 measurable goals
        const pTrain = trainGoal > 0 ? Math.min(trainDone / trainGoal, 1) : 0;
        const pCardio = cardioGoal > 0 ? Math.min(cardioMin / cardioGoal, 1) : 0;
        const pMeal = mealGoal > 0 ? Math.min(mealDays / mealGoal, 1) : 0;
        const count = (trainGoal > 0 ? 1 : 0) + (cardioGoal > 0 ? 1 : 0) + (mealGoal > 0 ? 1 : 0);
        const avgPct = count ? Math.round(((pTrain + pCardio + pMeal) / count) * 100) : 0;

        $('#progressRunnerPct').textContent = avgPct;

        // Character changes at thresholds
        const char = $('#progressRunnerChar');
        if (avgPct >= 100) char.textContent = '🏆';
        else if (avgPct >= 80) char.textContent = '🔥';
        else if (avgPct >= 50) char.textContent = '💪';
        else if (avgPct >= 25) char.textContent = '🏃';
        else char.textContent = '🚶';

        // Color changes
        const fill = $('#progressRunnerFill');
        if (avgPct >= 100) fill.style.background = 'linear-gradient(90deg, var(--success), #34d399)';
        else if (avgPct >= 70) fill.style.background = 'linear-gradient(90deg, var(--primary), var(--secondary))';
        else if (avgPct >= 40) fill.style.background = 'linear-gradient(90deg, var(--secondary), #38bdf8)';
        else fill.style.background = 'linear-gradient(90deg, var(--warning), #fbbf24)';

        // Set width (will be re-animated on scroll by observer)
        fill.style.width = Math.min(avgPct, 100) + '%';
        char.style.left = `calc(${Math.min(avgPct, 100)}% - 12px)`;
    }

    /* ================================
       STATS CUSTOMIZATION
       ================================ */
    const ALL_STATS = [
        { id: 'trainCount', cat: '🏋️ 訓練', label: '訓練次數', default: true },
        { id: 'totalVolume', cat: '🏋️ 訓練', label: '總訓練量 (kg)', default: true },
        { id: 'avgRpe', cat: '🏋️ 訓練', label: '平均 RPE', default: false },
        { id: 'muscleGroups', cat: '🏋️ 訓練', label: '訓練肌群數', default: false },
        { id: 'cardioTime', cat: '🏃 有氧', label: '有氧總時間 (min)', default: true },
        { id: 'cardioCalories', cat: '🏃 有氧', label: '有氧消耗 (kcal)', default: false },
        { id: 'cardioSessions', cat: '🏃 有氧', label: '有氧次數', default: false },
        { id: 'totalCal', cat: '🍱 飲食', label: '攝取熱量 (kcal)', default: true },
        { id: 'totalProtein', cat: '🍱 飲食', label: '蛋白質 (g)', default: true },
        { id: 'totalCarb', cat: '🍱 飲食', label: '碳水化合物 (g)', default: false },
        { id: 'totalFat', cat: '🍱 飲食', label: '脂肪 (g)', default: false },
        { id: 'mealCount', cat: '🍱 飲食', label: '飲食記錄數', default: false },
        { id: 'streak', cat: '📅 綜合', label: '連續天數', default: false },
        { id: 'activeDays', cat: '📅 綜合', label: '活動天數', default: false }
    ];

    function initStatsCustom() {
        const enabled = load(KEYS.statsDisplay) || ALL_STATS.filter(s => s.default).map(s => s.id);
        // Render checkboxes grouped by category
        const group = $('#statsCheckboxGroup');
        let lastCat = '';
        group.innerHTML = ALL_STATS.map(s => {
            let prefix = '';
            if (s.cat !== lastCat) { prefix = `<div class="stats-checkbox-item cat-header">${s.cat}</div>`; lastCat = s.cat; }
            return prefix + `<label class="stats-checkbox-item"><input type="checkbox" value="${s.id}" ${enabled.includes(s.id) ? 'checked' : ''}> ${s.label}</label>`;
        }).join('');

        $('#btnEditStats').addEventListener('click', () => {
            const f = $('#statsCustomForm');
            f.style.display = f.style.display === 'none' ? '' : 'none';
        });
        $('#btnSaveStats').addEventListener('click', () => {
            const checked = [...$$('#statsCheckboxGroup input:checked')].map(cb => cb.value);
            save(KEYS.statsDisplay, checked);
            $('#statsCustomForm').style.display = 'none';
            refreshWeeklyStats();
            toast('統計項目已更新！');
        });
    }

    /* ================================
       REFRESH ALL
       ================================ */
    function refreshAll() {
        refreshWeekGoals();
        refreshHeroStats();
        refreshDayDots();
        refreshWeeklyStats();
        refreshHistory('7');
        refreshDietDashboard();
        refreshTodayMeals();
        refreshOneRM();
        refreshDietHistory('7');
        refreshFatigue();
        refreshInsights();
    }

    /* ---------- Hero Stats ---------- */
    function refreshHeroStats() {
        const r = load(KEYS.resist) || [];
        const c = load(KEYS.cardio) || [];
        const m = load(KEYS.meals) || [];
        $('#statSessions').textContent = r.length + c.length;
        $('#statMeals').textContent = m.length;

        // Streak: consecutive days with any activity going backwards from today
        const allDates = new Set([...r.map(s => s.date), ...c.map(s => s.date), ...m.map(s => s.date)]);
        let streak = 0;
        let d = new Date();
        while (true) {
            const ds = d.toISOString().slice(0, 10);
            if (allDates.has(ds)) { streak++; d.setDate(d.getDate() - 1); }
            else break;
        }
        $('#statStreak').textContent = streak;
    }

    /* ---------- Day Dots ---------- */
    function refreshDayDots() {
        const el = $('#dayDotRow');
        const ws = weekStart();
        const r = load(KEYS.resist) || [];
        const c = load(KEYS.cardio) || [];
        const m = load(KEYS.meals) || [];
        const days = ['日', '一', '二', '三', '四', '五', '六'];
        let html = '';
        for (let i = 0; i < 7; i++) {
            const d = new Date(ws);
            d.setDate(d.getDate() + i);
            const ds = d.toISOString().slice(0, 10);
            const hasTrain = r.some(s => s.date === ds) || c.some(s => s.date === ds);
            const hasMeal = m.some(s => s.date === ds);
            const isToday = ds === today();
            let cls = 'day-dot';
            if (hasTrain && hasMeal) cls += ' has-both';
            else if (hasTrain) cls += ' has-training';
            else if (hasMeal) cls += ' has-diet';
            if (isToday) cls += ' today';
            html += `<div class="${cls}"><span>${days[i]}</span><span style="font-size:.6rem">${d.getDate()}</span></div>`;
        }
        el.innerHTML = html;
    }

    /* ---------- Weekly Stats Grid ---------- */
    function refreshWeeklyStats() {
        const ws = weekStart();
        const r = (load(KEYS.resist) || []).filter(s => new Date(s.date) >= ws);
        const c = (load(KEYS.cardio) || []).filter(s => new Date(s.date) >= ws);
        const m = (load(KEYS.meals) || []).filter(s => new Date(s.date) >= ws);
        const totalVol = r.reduce((a, s) => a + s.totalVolume, 0);
        const totalCardioMin = c.reduce((a, s) => a + s.duration, 0);
        const totalCal = m.reduce((a, s) => a + s.totalCal, 0);
        const totalP = m.reduce((a, s) => a + s.totalP, 0);
        const totalC = m.reduce((a, s) => a + s.totalC, 0);
        const totalF = m.reduce((a, s) => a + s.totalF, 0);
        const avgRpe = r.length ? +(r.reduce((a, s) => a + s.avgRpe, 0) / r.length).toFixed(1) : '-';
        const muscleGroups = new Set(r.map(s => s.muscle)).size;
        const cardioCalories = c.reduce((a, s) => a + (s.calories || 0), 0);
        const allDates = new Set([...r.map(s => s.date), ...c.map(s => s.date), ...m.map(s => s.date)]);
        const activeDays = allDates.size;

        // Streak
        const allR = load(KEYS.resist) || [];
        const allC = load(KEYS.cardio) || [];
        const allM = load(KEYS.meals) || [];
        const allDatesFull = new Set([...allR.map(s => s.date), ...allC.map(s => s.date), ...allM.map(s => s.date)]);
        let streak = 0; let d = new Date();
        while (allDatesFull.has(d.toISOString().slice(0, 10))) { streak++; d.setDate(d.getDate() - 1); }

        const statsMap = {
            trainCount: { val: r.length + c.length, label: '訓練次數' },
            totalVolume: { val: totalVol.toLocaleString(), label: '總訓練量 (kg)' },
            avgRpe: { val: avgRpe, label: '平均 RPE' },
            muscleGroups: { val: muscleGroups, label: '訓練肌群數' },
            cardioTime: { val: totalCardioMin, label: '有氧總時間 (min)' },
            cardioCalories: { val: cardioCalories, label: '有氧消耗 (kcal)' },
            cardioSessions: { val: c.length, label: '有氧次數' },
            totalCal: { val: totalCal.toLocaleString(), label: '攝取熱量 (kcal)' },
            totalProtein: { val: Math.round(totalP), label: '蛋白質 (g)' },
            totalCarb: { val: Math.round(totalC), label: '碳水化合物 (g)' },
            totalFat: { val: Math.round(totalF), label: '脂肪 (g)' },
            mealCount: { val: m.length, label: '飲食記錄數' },
            streak: { val: streak, label: '連續天數' },
            activeDays: { val: activeDays, label: '活動天數' }
        };

        const enabled = load(KEYS.statsDisplay) || ALL_STATS.filter(s => s.default).map(s => s.id);
        $('#weeklyStatsGrid').innerHTML = enabled.map(id => {
            const s = statsMap[id];
            if (!s) return '';
            return `<div class="ws-item"><span class="ws-val">${s.val}</span><span class="ws-label">${s.label}</span></div>`;
        }).join('');
    }

    /* ---------- Training History ---------- */
    function refreshHistory(range) {
        const r = load(KEYS.resist) || [];
        const c = load(KEYS.cardio) || [];
        const all = [
            ...r.map(s => ({ ...s, _type: 'resist' })),
            ...c.map(s => ({ ...s, _type: 'cardio' }))
        ].sort((a, b) => b.date.localeCompare(a.date));

        const cutoff = range === 'all' ? null : new Date(Date.now() - parseInt(range) * 864e5);
        const filtered = cutoff ? all.filter(s => new Date(s.date) >= cutoff) : all;

        // Chart
        const chartEl = $('#volumeChart');
        if (filtered.length) {
            const maxVol = Math.max(...filtered.map(s => s._type === 'resist' ? s.totalVolume : s.duration * 10));
            chartEl.innerHTML = filtered.slice(0, 30).reverse().map(s => {
                const val = s._type === 'resist' ? s.totalVolume : s.duration * 10;
                const h = Math.max(4, (val / maxVol) * 180);
                const tip = s._type === 'resist' ? `${s.date} ${s.totalVolume}kg` : `${s.date} ${s.duration}min`;
                return `<div class="chart-bar ${s._type}" style="height:${h}px"><span class="bar-tip">${tip}</span></div>`;
            }).join('');
        } else {
            chartEl.innerHTML = '<p class="empty-msg" style="width:100%;text-align:center">尚無資料</p>';
        }

        // List
        const listEl = $('#historyList');
        if (!filtered.length) { listEl.innerHTML = '<p class="empty-msg">尚無訓練紀錄</p>'; return; }
        listEl.innerHTML = filtered.map(s => {
            if (s._type === 'resist') {
                const exNames = s.exercises.map(e => e.name).join(', ');
                return `<div class="history-item">
                    <span class="hi-date">${s.date}</span><span class="hi-type">💪</span>
                    <span class="hi-detail">${s.muscle} — ${exNames}</span>
                    <span class="hi-volume">${s.totalVolume.toLocaleString()} kg</span></div>`;
            } else {
                return `<div class="history-item">
                    <span class="hi-date">${s.date}</span><span class="hi-type">🏃</span>
                    <span class="hi-detail">${s.type} ${s.duration}min ${s.distance ? s.distance + 'km' : ''}</span>
                    <span class="hi-volume">${s.calories || '—'} kcal</span></div>`;
            }
        }).join('');
    }

    // History filter buttons
    document.addEventListener('click', e => {
        if (e.target.matches('#h-training .filter-btn')) {
            e.target.closest('.history-filter').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            refreshHistory(e.target.dataset.range);
        }
        if (e.target.matches('#dietHistoryFilter .filter-btn')) {
            e.target.closest('.history-filter').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            refreshDietHistory(e.target.dataset.drange);
        }
    });

    /* ---------- 1RM Tracking ---------- */
    function refreshOneRM() {
        const sessions = load(KEYS.resist) || [];
        if (!sessions.length) { $('#oneRmList').innerHTML = '<p class="empty-msg">尚無資料，開始記錄訓練後即可追蹤 1RM</p>'; return; }

        // Collect best 1RM per exercise
        const map = {}; // exerciseName -> { best1RM, weight, reps, date, history[] }
        sessions.forEach(s => {
            s.exercises.forEach(e => {
                if (e.weight <= 0 || e.reps <= 0) return;
                const oneRM = +(e.weight * (1 + e.reps / 30)).toFixed(1);
                if (!map[e.name]) map[e.name] = { best: 0, w: 0, r: 0, date: '', history: [] };
                map[e.name].history.push({ oneRM, date: s.date });
                if (oneRM > map[e.name].best) {
                    map[e.name].best = oneRM;
                    map[e.name].w = e.weight;
                    map[e.name].r = e.reps;
                    map[e.name].date = s.date;
                }
            });
        });

        const sorted = Object.entries(map).sort((a, b) => b[1].best - a[1].best);

        const el = $('#oneRmList');
        el.innerHTML = sorted.map(([name, d], i) => {
            // Trend: compare latest vs previous
            const hist = d.history.sort((a, b) => a.date.localeCompare(b.date));
            let trend = '';
            if (hist.length >= 2) {
                const last = hist[hist.length - 1].oneRM;
                const prev = hist[hist.length - 2].oneRM;
                if (last > prev) trend = '<span class="onerm-trend" style="color:var(--success)">↑</span>';
                else if (last < prev) trend = '<span class="onerm-trend" style="color:var(--danger)">↓</span>';
                else trend = '<span class="onerm-trend" style="color:var(--text-muted)">→</span>';
            }
            return `<div class="onerm-item">
                <span class="onerm-rank">${i + 1}</span>
                <div class="onerm-info">
                    <div class="onerm-name">${name}</div>
                    <div class="onerm-detail">最佳紀錄：${d.w}kg × ${d.r}次 (${d.date}) · 共 ${hist.length} 筆</div>
                </div>
                <span class="onerm-value">${d.best}<span class="onerm-unit"> kg</span>${trend}</span>
            </div>`;
        }).join('');
    }

    /* ---------- Diet History ---------- */
    function refreshDietHistory(range) {
        const meals = load(KEYS.meals) || [];
        const cutoff = range === 'all' ? null : new Date(Date.now() - parseInt(range) * 864e5);
        const filtered = cutoff ? meals.filter(m => new Date(m.date) >= cutoff) : meals;
        filtered.sort((a, b) => b.date.localeCompare(a.date));

        const el = $('#dietHistoryList');
        if (!filtered.length) { el.innerHTML = '<p class="empty-msg">尚無飲食紀錄</p>'; return; }

        // Group by date
        const grouped = {};
        filtered.forEach(m => {
            if (!grouped[m.date]) grouped[m.date] = [];
            grouped[m.date].push(m);
        });

        el.innerHTML = Object.entries(grouped).map(([date, ms]) => {
            const totalCal = ms.reduce((a, m) => a + m.totalCal, 0);
            const totalP = ms.reduce((a, m) => a + m.totalP, 0);
            const items = ms.map(m => `${m.type}: ${m.foods.map(f => f.name).join(', ')} (${m.totalCal}kcal)`).join('<br>');
            return `<div class="history-item" style="flex-direction:column;align-items:flex-start;gap:4px">
                <div style="display:flex;width:100%;justify-content:space-between">
                    <span class="hi-date" style="width:auto">${date}</span>
                    <span class="hi-volume">${totalCal} kcal · P${Math.round(totalP)}g</span>
                </div>
                <div style="font-size:.82rem;color:var(--text-dim)">${items}</div>
            </div>`;
        }).join('');
    }

    /* ---------- Diet Dashboard ---------- */
    function refreshDietDashboard() {
        const goals = load(KEYS.goals) || { cal: 2200, p: 150, c: 250, f: 60 };
        const meals = (load(KEYS.meals) || []).filter(m => m.date === today());
        const totCal = meals.reduce((a, m) => a + m.totalCal, 0);
        const totP = meals.reduce((a, m) => a + m.totalP, 0);
        const totC = meals.reduce((a, m) => a + m.totalC, 0);
        const totF = meals.reduce((a, m) => a + m.totalF, 0);

        // Calorie ring
        const calPct = Math.min(totCal / goals.cal, 1);
        const calOffset = 263.89 - 263.89 * calPct;
        const calFill = $('#calFill');
        if (calFill) { calFill.style.strokeDashoffset = calOffset; }
        $('#calValue').textContent = totCal;
        $('#calTarget').textContent = `目標: ${goals.cal} kcal`;

        // Macro bars
        const pPct = Math.min(totP / goals.p * 100, 100);
        const cPct = Math.min(totC / goals.c * 100, 100);
        const fPct = Math.min(totF / goals.f * 100, 100);
        $('#pFill').style.width = pPct + '%';
        $('#cFill').style.width = cPct + '%';
        $('#fFill').style.width = fPct + '%';
        $('#pValue').textContent = `${Math.round(totP)}g / ${goals.p}g`;
        $('#cValue').textContent = `${Math.round(totC)}g / ${goals.c}g`;
        $('#fValue').textContent = `${Math.round(totF)}g / ${goals.f}g`;

        // Diet verdict
        const verdict = $('#dietVerdict');
        const text = $('#dietVerdictText');
        if (meals.length > 0) {
            verdict.style.display = '';
            const diff = totCal - goals.cal;
            if (diff > 200) {
                verdict.className = 'diet-verdict surplus';
                text.textContent = `今日已攝取 ${totCal} kcal，超出目標 ${diff} kcal。建議下一餐選擇低熱量食物，增加蔬菜和蛋白質比例。`;
            } else if (diff < -500) {
                verdict.className = 'diet-verdict deficit';
                text.textContent = `今日目前攝取 ${totCal} kcal，距離目標還差 ${-diff} kcal。請確保攝取足夠營養，避免過度節食影響代謝。`;
            } else {
                verdict.className = 'diet-verdict balanced';
                text.textContent = `今日攝取 ${totCal} kcal，接近目標值 ${goals.cal} kcal，營養均衡良好！繼續保持 👍`;
            }
        } else {
            verdict.style.display = 'none';
        }
    }

    /* ---------- Today Meals ---------- */
    function refreshTodayMeals() {
        const meals = (load(KEYS.meals) || []).filter(m => m.date === today());
        const el = $('#todayMealList');
        if (!meals.length) { el.innerHTML = '<p class="empty-msg">今日尚無飲食紀錄</p>'; return; }
        el.innerHTML = meals.map(m =>
            `<div class="meal-entry">
                <div class="me-header"><span class="me-type">${m.type}</span><span class="me-cal">${m.totalCal} kcal</span></div>
                <div class="me-foods">${m.foods.map(f => f.name).join('、')} · P${m.totalP}g C${m.totalC}g F${m.totalF}g</div>
            </div>`
        ).join('');
    }

    /* ---------- Fatigue ---------- */
    function refreshFatigue() {
        const sessions = load(KEYS.resist) || [];
        const cardio = load(KEYS.cardio) || [];
        const recent7 = sessions.filter(s => daysBetween(today(), s.date) <= 7 && daysBetween(today(), s.date) >= 0);
        const recentCardio = cardio.filter(s => daysBetween(today(), s.date) <= 7 && daysBetween(today(), s.date) >= 0);

        let fatigueScore = 0;
        recent7.forEach(s => { fatigueScore += s.avgRpe * 3; });
        recentCardio.forEach(s => {
            const intensityMap = { '低強度': 2, '中強度': 4, '高強度': 7 };
            fatigueScore += (intensityMap[s.intensity] || 3) * (s.duration / 30);
        });
        fatigueScore = Math.min(100, Math.round(fatigueScore));

        $('#fatigueFill').style.width = fatigueScore + '%';
        const fill = $('#fatigueFill');
        if (fatigueScore > 70) fill.style.background = 'linear-gradient(90deg, var(--warning), var(--danger))';
        else if (fatigueScore > 40) fill.style.background = 'linear-gradient(90deg, var(--success), var(--warning))';
        else fill.style.background = 'linear-gradient(90deg, var(--success), var(--secondary))';

        const txt = $('#fatigueText');
        if (fatigueScore > 70) txt.textContent = `疲勞指數 ${fatigueScore}%，身體累積較多疲勞。建議安排輕度恢復日或完全休息，關注睡眠品質和營養補充。`;
        else if (fatigueScore > 40) txt.textContent = `疲勞指數 ${fatigueScore}%，訓練負荷適中。可以繼續當前計劃，注意拉伸和水分補充。`;
        else txt.textContent = `疲勞指數 ${fatigueScore}%，狀態良好！可以考慮適當增加訓練量或嘗試新的訓練動作。`;
    }

    /* ---------- Insights ---------- */
    function refreshInsights() {
        const r = load(KEYS.resist) || [];
        const c = load(KEYS.cardio) || [];
        const m = load(KEYS.meals) || [];
        const goals = load(KEYS.goals) || { cal: 2200, p: 150, c: 250, f: 60 };

        // Training insights
        const tInsights = [];
        if (!r.length && !c.length) {
            tInsights.push('目前尚無訓練紀錄，開始你的第一次訓練吧！');
        } else {
            if (r.length > 0) {
                const muscleFreq = {};
                r.forEach(s => { muscleFreq[s.muscle] = (muscleFreq[s.muscle] || 0) + 1; });
                const most = Object.entries(muscleFreq).sort((a, b) => b[1] - a[1])[0];
                const least = Object.entries(muscleFreq).sort((a, b) => a[1] - b[1])[0];
                tInsights.push(`最常訓練肌群：${most[0]}（${most[1]} 次），考慮增加其他肌群的訓練頻率。`);
                if (most[0] !== least[0]) tInsights.push(`較少訓練：${least[0]}（${least[1]} 次），建議平衡各肌群。`);
                const avgVol = Math.round(r.reduce((a, s) => a + s.totalVolume, 0) / r.length);
                tInsights.push(`每次平均訓練量：${avgVol.toLocaleString()} kg，持續漸進超負荷是增肌關鍵。`);
            }
            if (c.length > 0) {
                const weekCardio = c.filter(s => daysBetween(today(), s.date) <= 7).reduce((a, s) => a + s.duration, 0);
                tInsights.push(`本週有氧：${weekCardio} 分鐘（WHO 建議每週 150 分鐘中等強度有氧）。`);
            }
        }
        $('#trainingInsights').innerHTML = tInsights.map(t => `<li>${t}</li>`).join('');

        // Diet insights
        const dInsights = [];
        if (!m.length) {
            dInsights.push('尚無飲食紀錄，記錄飲食有助於了解營養攝取。');
        } else {
            const recent = m.filter(s => daysBetween(today(), s.date) <= 7);
            if (recent.length) {
                const avgCal = Math.round(recent.reduce((a, s) => a + s.totalCal, 0) / Math.max(1, new Set(recent.map(s => s.date)).size));
                const avgP = Math.round(recent.reduce((a, s) => a + s.totalP, 0) / Math.max(1, new Set(recent.map(s => s.date)).size));
                dInsights.push(`近 7 天平均每日攝取：${avgCal} kcal，目標 ${goals.cal} kcal。`);
                dInsights.push(`近 7 天平均蛋白質：${avgP}g/天，目標 ${goals.p}g。${avgP < goals.p * 0.8 ? '⚠️ 蛋白質偏低，建議增加。' : '✅ 蛋白質充足。'}`);
            }
            const mealTypes = {};
            m.forEach(s => { mealTypes[s.type] = (mealTypes[s.type] || 0) + 1; });
            if (!mealTypes['早餐'] || mealTypes['早餐'] < m.length * 0.2) dInsights.push('早餐記錄較少，規律早餐有助於穩定血糖和代謝。');
        }
        $('#dietInsights').innerHTML = dInsights.map(d => `<li>${d}</li>`).join('');

        // Lifestyle tips
        const tips = [
            { icon: '💤', title: '睡前放鬆儀式', desc: '每晚固定時間上床，睡前 30 分鐘關閉手機螢幕，改用暖黃燈光。可做 5 分鐘腹式呼吸：鼻子吸氣 4 秒讓肚子鼓起、嘴巴吐氣 6 秒讓肚子凹下，重複 5-8 次即可明顯放鬆。目標每晚睡滿 7-8 小時。' },
            { icon: '💧', title: '分段喝水法', desc: '準備一個 600ml 水壺，每天喝滿 3 壺（起床 1 壺、午餐前 1 壺、下午到晚餐 1 壺）。訓練時每 15 分鐘喝 3-4 口（約 150ml），訓練後 30 分鐘內再喝完 500ml。在手機設定 2 小時一次的喝水提醒。' },
            { icon: '🧘', title: '5 分鐘伸展恢復', desc: '訓練後做 5 個靜態伸展，每個動作維持 30 秒：①站立體前彎摸腳尖（後大腿）②弓箭步壓腿（髖屈肌）③手臂過頭拉對側手肘（三頭肌）④門框前手臂撐開擴胸（胸肌）⑤坐地盤腿身體前傾（臀部）。非訓練日也可做，起床後或睡前皆可。' },
            { icon: '🥩', title: '訓練後黃金補給', desc: '訓練結束後 30-60 分鐘內吃一份含 20-30g 蛋白質的點心。最簡單的選擇：超商嫩煎雞胸＋一根香蕉，或一杯乳清蛋白＋一片吐司。不方便備餐的話，兩顆茶葉蛋＋一罐豆漿也有 20g 以上蛋白質。' },
            { icon: '🚶', title: '非訓練日輕度活動', desc: '休息日不要整天坐著。飯後散步 15-20 分鐘（約走 1500-2000 步）幫助消化與血液循環。也可以做 10 分鐘的泡沫滾筒放鬆：大腿前後側各滾 1 分鐘、小腿各 1 分鐘、背部上下滾 2 分鐘，遇到特別痠的點停留 15 秒。' },
            { icon: '📱', title: '減壓微習慣', desc: '感到焦慮或壓力大時，試試「5-4-3-2-1」感官法：說出你看到的 5 樣東西、摸到的 4 樣東西、聽到的 3 種聲音、聞到的 2 種氣味、嚐到的 1 種味道。整個過程不到 2 分鐘就能把注意力從壓力拉回當下，降低皮質醇。' }
        ];
        $('#lifestyleTips').innerHTML = tips.map(t =>
            `<div class="tip-item"><span class="tip-icon">${t.icon}</span><div><div class="tip-title">${t.title}</div><div class="tip-desc">${t.desc}</div></div></div>`
        ).join('');
    }

    /* ---------- Clear All ---------- */
    function initClearAll() {
        $('#btnClearAll').addEventListener('click', async () => {
            if (!confirm('確定要清除所有紀錄嗎？此操作無法回復。')) return;
            Object.values(KEYS).forEach(k => localStorage.removeItem(k));
            // Also clear cloud data if logged in
            if (_currentUser && window.__firebase) {
                try {
                    const { fbDb, doc, setDoc } = window.__firebase;
                    await setDoc(doc(fbDb, 'users', _currentUser.uid), { data: {}, updatedAt: Date.now() });
                } catch (e) { console.error('Cloud clear failed:', e); }
            }
            toast('所有紀錄已清除', 'info');
            setTimeout(() => location.reload(), 500);
        });
    }

})();
