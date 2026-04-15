/* ========================================
   HomeScope — search_home_tools.js
   ======================================== */
(function () {
    'use strict';

    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);

    /* ========== AREA DATA (shared) ========== */
    const AREAS = {
        '台北市': {
            '中正區': 102, '大同區': 85, '中山區': 95, '松山區': 100, '大安區': 125,
            '萬華區': 72, '信義區': 108, '士林區': 82, '北投區': 72, '內湖區': 78,
            '南港區': 85, '文山區': 68
        },
        '新北市': {
            '板橋區': 62, '中和區': 56, '永和區': 63, '新莊區': 55, '三重區': 58,
            '蘆洲區': 52, '新店區': 58, '土城區': 48, '汐止區': 42, '林口區': 45,
            '淡水區': 30, '五股區': 40, '泰山區': 45, '三峽區': 38, '樹林區': 36
        }
    };

    /* Life convenience score (0-100) */
    const LIFE_SCORE = {
        '中正區':88,'大同區':75,'中山區':90,'松山區':88,'大安區':95,'萬華區':70,'信義區':92,
        '士林區':78,'北投區':68,'內湖區':80,'南港區':72,'文山區':65,
        '板橋區':85,'中和區':78,'永和區':80,'新莊區':75,'三重區':76,'蘆洲區':72,
        '新店區':73,'土城區':68,'汐止區':62,'林口區':70,'淡水區':58,'五股區':55,
        '泰山區':60,'三峽區':62,'樹林區':58
    };

    /* MRT accessibility score (0-100) */
    const MRT_SCORE = {
        '中正區':95,'大同區':80,'中山區':95,'松山區':90,'大安區':95,'萬華區':85,'信義區':88,
        '士林區':82,'北投區':75,'內湖區':78,'南港區':80,'文山區':65,
        '板橋區':88,'中和區':75,'永和區':82,'新莊區':78,'三重區':80,'蘆洲區':75,
        '新店區':72,'土城區':70,'汐止區':40,'林口區':55,'淡水區':60,'五股區':35,
        '泰山區':40,'三峽區':30,'樹林區':45
    };

    /* Renovation cost per ping by age */
    const RENO_COST = {
        '預售屋': { min: 3, max: 5, note: '輕裝潢，主要為家具家電' },
        '中古6-10': { min: 5, max: 8, note: '局部翻新，廚衛可能微調' },
        '中古11-20': { min: 8, max: 12, note: '中度翻修，部分管線更新' },
        '中古21-30': { min: 12, max: 15, note: '需更新水電管線、衛浴廚房' },
        '中古30+': { min: 15, max: 20, note: '全面翻新，含管線、防水、格局變更' }
    };

    /* Construction projects */
    const CONSTRUCTIONS = [
        { name:'捷運萬大線（第一期）', area:'中和區', type:'mrt', status:'施工中', eta:'2028', impact:'沿線預估房價上漲 5-10%，中和站周邊受惠最大。' },
        { name:'捷運萬大線（第二期）', area:'土城區', type:'mrt', status:'規劃中', eta:'2032', impact:'土城、樹林延伸段，預計帶動沿線房價。' },
        { name:'捷運環狀線北環段', area:'三重區', type:'mrt', status:'施工中', eta:'2029', impact:'串聯北環至大直，三重、蘆洲站點周邊受惠。' },
        { name:'捷運環狀線南環段', area:'文山區', type:'mrt', status:'施工中', eta:'2030', impact:'景美至動物園段，提升文山區聯外交通。' },
        { name:'社子島開發計畫', area:'士林區', type:'redevelopment', status:'規劃中', eta:'2035', impact:'大規模區段徵收與都市計畫，長期利多。' },
        { name:'塭仔圳重劃區', area:'泰山區', type:'redevelopment', status:'施工中', eta:'2028', impact:'新北最大重劃區之一，新莊泰山交界，預期房價補漲。' },
        { name:'江翠北側重劃區', area:'板橋區', type:'redevelopment', status:'已完成大部分', eta:'2026', impact:'緊鄰新板特區，新成屋大量交屋中，均價已達 65-75 萬/坪。' },
        { name:'央北重劃區', area:'新店區', type:'redevelopment', status:'交屋中', eta:'2026', impact:'小碧潭站旁，生活圈逐步成形。' },
        { name:'新莊副都心', area:'新莊區', type:'redevelopment', status:'成熟中', eta:'已完成', impact:'A3、A4站周邊商業機能到位，房價穩定上升。' },
        { name:'洲子洋重劃區', area:'五股區', type:'redevelopment', status:'交屋中', eta:'2027', impact:'大量新建案進入市場，價格約 40-48 萬/坪。' },
        { name:'南港三鐵共構（東區門戶計畫）', area:'南港區', type:'commercial', status:'進行中', eta:'2028', impact:'串聯高鐵、台鐵、捷運，商業區規劃將推升辦公與住宅需求。' },
        { name:'北大特區生活圈擴張', area:'三峽區', type:'commercial', status:'成熟中', eta:'持續中', impact:'學區與商圈完善，首購熱區，均價穩步上升。' },
        { name:'林口三井Outlet二期', area:'林口區', type:'commercial', status:'營運中', eta:'已完成', impact:'強化林口商業機能，帶動周邊消費人口。' },
        { name:'淡海輕軌第二期（藍海線）', area:'淡水區', type:'mrt', status:'施工中', eta:'2030', impact:'延伸淡海新市鎮覆蓋範圍，提升交通便利性。' }
    ];

    /* ========== INIT ========== */
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initTabs();
        initToggles();
        initMortgage();
        initCompare();
        initScore();
        initTracker();
        initConstruction();
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
        });
    }
    function updateThemeBtn() {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        $('#themeIcon').innerHTML = dark
            ? '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>'
            : '<path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>';
        $('#themeLabel').textContent = dark ? '淺色' : '深色';
    }

    /* ========== TABS ========== */
    function initTabs() {
        const allBtns = $$('[data-tool]');
        allBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.dataset.tool;
                allBtns.forEach(b => b.classList.remove('active'));
                $$(`[data-tool="${tool}"]`).forEach(b => b.classList.add('active'));
                $$('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + tool));
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
                });
            });
        });
    }

    /* ========== MORTGAGE ========== */
    function initMortgage() {
        $('#btnCalcMort').addEventListener('click', calcMortgage);
        $('#btnCalcExtra').addEventListener('click', calcExtra);
    }

    function calcMortgage() {
        const total = parseFloat($('#mortTotal').value) || 0;
        const downPct = parseFloat($('#mortDown').value) || 20;
        const rate = parseFloat($('#mortRate').value) || 2.1;
        const years = parseInt($('#mortYears').value) || 30;

        const downPayment = total * downPct / 100;
        const loan = total - downPayment;
        const monthlyRate = rate / 100 / 12;
        const months = years * 12;
        const monthly = monthlyRate > 0
            ? loan * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1)
            : loan / months;
        const totalPayment = monthly * months;
        const totalInterest = totalPayment - loan;
        const minIncome = monthly * 3;

        const result = $('#mortResult');
        result.style.display = 'grid';
        result.innerHTML = `
            <div class="mortgage-item">
                <span class="mortgage-val">${downPayment.toFixed(0)}</span>
                <span class="mortgage-label">頭期款（萬）</span>
            </div>
            <div class="mortgage-item">
                <span class="mortgage-val">${loan.toFixed(0)}</span>
                <span class="mortgage-label">貸款金額（萬）</span>
            </div>
            <div class="mortgage-item">
                <span class="mortgage-val">${monthly.toFixed(2)}</span>
                <span class="mortgage-label">每月還款（萬）</span>
            </div>
            <div class="mortgage-item">
                <span class="mortgage-val">${totalInterest.toFixed(0)}</span>
                <span class="mortgage-label">總利息支出（萬）</span>
            </div>
            <div class="mortgage-item">
                <span class="mortgage-val">${totalPayment.toFixed(0)}</span>
                <span class="mortgage-label">還款總額（萬）</span>
            </div>
            <div class="mortgage-item" style="border:1px solid rgba(37,99,235,.2);background:var(--primary-bg)">
                <span class="mortgage-val">${minIncome.toFixed(1)}</span>
                <span class="mortgage-label">建議最低月收入（萬）</span>
            </div>
        `;
        toast('房貸計算完成');
    }

    function calcExtra() {
        const total = parseFloat($('#extraTotal').value) || 0;
        const ping = parseFloat($('#extraPing').value) || 30;
        const age = $('#extraAge').value;
        const hasAgent = $$('#toggleAgent .toggle-btn.active')[0]?.dataset.val === 'yes';

        const totalNT = total * 10000; // 轉為元
        const houseValue = totalNT * 0.35; // 房屋評定現值概估為總價35%

        const items = [];

        // 代書費
        items.push({ name: '代書費（地政士）', val: 20000, note: '含過戶、設定登記等' });

        // 契稅
        const contractTax = Math.round(houseValue * 0.06);
        items.push({ name: '契稅', val: contractTax, note: `房屋評定現值（約${(houseValue/10000).toFixed(0)}萬）× 6%` });

        // 印花稅
        const stampTax = Math.round(totalNT * 0.001);
        items.push({ name: '印花稅', val: stampTax, note: '公契價格 × 0.1%' });

        // 規費
        items.push({ name: '地政規費', val: 6000, note: '過戶登記規費 + 書狀費' });

        // 火險地震險
        items.push({ name: '火險 + 地震險', val: 3000, note: '約 2,000-3,000/年（首年）' });

        // 仲介費
        if (hasAgent) {
            const agentFee = Math.round(totalNT * 0.02);
            items.push({ name: '仲介服務費（買方）', val: agentFee, note: `成交價 × 2%（可議）` });
        }

        // 裝潢
        const reno = RENO_COST[age] || RENO_COST['預售屋'];
        const renoMin = reno.min * ping * 10000;
        const renoMax = reno.max * ping * 10000;
        items.push({ name: `裝潢費用（${reno.note}）`, val: renoMin, valMax: renoMax, note: `${reno.min}-${reno.max} 萬/坪 × ${ping} 坪` });

        const totalMin = items.reduce((s, i) => s + i.val, 0);
        const totalMax = items.reduce((s, i) => s + (i.valMax || i.val), 0);

        let html = '<table class="extra-cost-table"><thead><tr><th>項目</th><th>金額</th><th>備註</th></tr></thead><tbody>';
        items.forEach(i => {
            const valStr = i.valMax
                ? `${(i.val/10000).toFixed(1)} - ${(i.valMax/10000).toFixed(1)} 萬`
                : `${(i.val/10000).toFixed(1)} 萬`;
            html += `<tr><td>${i.name}</td><td class="cost-val">${valStr}</td><td class="cost-note">${i.note}</td></tr>`;
        });
        html += '</tbody></table>';
        html += `<div class="extra-cost-total">
            <span>額外自備款合計</span>
            <span class="total-val">${(totalMin/10000).toFixed(1)} - ${(totalMax/10000).toFixed(1)} 萬</span>
        </div>`;

        const downPayment = total * 0.2; // 20% 頭期款
        html += `<div style="margin-top:12px;padding:12px;background:var(--bg-alt);border-radius:var(--radius-sm);font-size:.85rem;color:var(--text-dim);line-height:1.8">
            <strong>總自備款概估</strong>（頭期款 20% + 額外費用）：<br>
            頭期款：<strong>${downPayment.toFixed(0)} 萬</strong> + 額外費用：<strong>${(totalMin/10000).toFixed(1)} - ${(totalMax/10000).toFixed(1)} 萬</strong><br>
            = 合計約 <strong style="color:var(--accent);font-size:1rem">${(downPayment + totalMin/10000).toFixed(0)} - ${(downPayment + totalMax/10000).toFixed(0)} 萬</strong>
        </div>`;

        $('#extraResult').style.display = 'block';
        $('#extraResult').innerHTML = html;
        toast('額外費用計算完成');
    }

    /* ========== COMPARE ========== */
    function initCompare() {
        const allDistricts = [];
        Object.entries(AREAS).forEach(([city, districts]) => {
            Object.keys(districts).forEach(d => allDistricts.push({ city, district: d }));
        });

        $$('.compare-sel').forEach(sel => {
            allDistricts.forEach(d => {
                sel.innerHTML += `<option value="${d.city}-${d.district}">${d.city} ${d.district}</option>`;
            });
        });

        $('#btnCompare').addEventListener('click', () => {
            const selections = [
                $('#compA').value,
                $('#compB').value,
                $('#compC').value
            ].filter(Boolean);

            if (selections.length < 2) { toast('請至少選擇 2 個區域', 'error'); return; }

            const result = $('#compareResult');
            result.innerHTML = '';

            selections.forEach(sel => {
                const [city, dist] = sel.split('-');
                const avg = AREAS[city]?.[dist] || 0;
                const life = LIFE_SCORE[dist] || 0;
                const mrt = MRT_SCORE[dist] || 0;

                result.innerHTML += `
                    <div class="compare-card">
                        <h4>${city} ${dist}</h4>
                        <div class="compare-stat"><span class="compare-stat-label">平均單價</span><span class="compare-stat-val">${avg} 萬/坪</span></div>
                        <div class="compare-stat"><span class="compare-stat-label">預售屋均價</span><span class="compare-stat-val">${(avg * 1.25).toFixed(1)} 萬/坪</span></div>
                        <div class="compare-stat"><span class="compare-stat-label">新成屋均價</span><span class="compare-stat-val">${(avg * 1.10).toFixed(1)} 萬/坪</span></div>
                        <div class="compare-stat"><span class="compare-stat-label">中古屋均價</span><span class="compare-stat-val">${(avg * 0.75).toFixed(1)} 萬/坪</span></div>
                        <div class="compare-stat"><span class="compare-stat-label">生活機能</span><span class="compare-stat-val">${life} / 100</span></div>
                        <div class="compare-stat"><span class="compare-stat-label">捷運可及性</span><span class="compare-stat-val">${mrt} / 100</span></div>
                        <div class="compare-stat"><span class="compare-stat-label">30坪大樓概估總價</span><span class="compare-stat-val">${(avg * 30).toFixed(0)} 萬</span></div>
                    </div>
                `;
            });
            toast('比較完成');
        });
    }

    /* ========== SCORE ========== */
    function initScore() {
        $('#btnScore').addEventListener('click', () => {
            const city = $('#scoreCity').value;
            const districts = AREAS[city] || {};

            const scored = Object.entries(districts).map(([dist, avg]) => {
                const life = LIFE_SCORE[dist] || 50;
                const mrt = MRT_SCORE[dist] || 50;
                // CP = (life + mrt) / 2 * weight - price penalty
                // Higher life+mrt with lower price = better CP
                const maxPrice = city === '台北市' ? 130 : 70;
                const priceScore = Math.max(0, 100 - (avg / maxPrice * 100));
                const cp = Math.round(priceScore * 0.5 + life * 0.25 + mrt * 0.25);
                return { dist, avg, life, mrt, cp: Math.min(99, Math.max(1, cp)) };
            });

            scored.sort((a, b) => b.cp - a.cp);

            let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px">';
            scored.forEach((s, i) => {
                const offset = 301.59 - (301.59 * s.cp / 100);
                const color = s.cp >= 70 ? 'var(--success)' : s.cp >= 40 ? 'var(--warning)' : 'var(--danger)';
                html += `
                    <div class="card" style="text-align:center;padding:16px">
                        <div style="font-size:.75rem;color:var(--text-muted);margin-bottom:4px">#${i + 1}</div>
                        <div class="score-ring">
                            <svg viewBox="0 0 100 100">
                                <circle class="score-bg" cx="50" cy="50" r="48"/>
                                <circle class="score-fill" cx="50" cy="50" r="48" style="stroke:${color};stroke-dashoffset:${offset}"/>
                            </svg>
                            <div class="score-center">
                                <span class="score-num">${s.cp}</span>
                                <span class="score-label">CP值</span>
                            </div>
                        </div>
                        <h4 style="font-size:.9rem;font-weight:600;margin-bottom:6px">${s.dist}</h4>
                        <div style="font-size:.78rem;color:var(--text-dim)">
                            均價 ${s.avg} 萬/坪<br>
                            機能 ${s.life} ｜ 捷運 ${s.mrt}
                        </div>
                    </div>
                `;
            });
            html += '</div>';

            $('#scoreResult').innerHTML = html;
            toast('CP值排行計算完成');
        });
    }

    /* ========== TRACKER ========== */
    function initTracker() {
        // Populate areas
        const sel = $('#trackArea');
        Object.entries(AREAS).forEach(([city, districts]) => {
            Object.keys(districts).forEach(d => {
                sel.innerHTML += `<option value="${city}-${d}">${city} ${d}</option>`;
            });
        });

        $('#btnAddTrack').addEventListener('click', () => {
            const area = $('#trackArea').value;
            const maxPrice = parseFloat($('#trackMaxPrice').value) || 0;
            if (!area) { toast('請選擇追蹤區域', 'error'); return; }

            const tracks = JSON.parse(localStorage.getItem('hs_tracks') || '[]');
            tracks.push({ area, maxPrice, addedAt: new Date().toISOString() });
            localStorage.setItem('hs_tracks', JSON.stringify(tracks));
            renderTracks();
            toast('已加入追蹤');
        });

        renderTracks();
    }

    function renderTracks() {
        const tracks = JSON.parse(localStorage.getItem('hs_tracks') || '[]');
        const container = $('#trackList');

        if (tracks.length === 0) {
            container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg><p>尚無追蹤項目，請在上方加入。</p></div>';
            return;
        }

        container.innerHTML = tracks.map((t, i) => {
            const [city, dist] = t.area.split('-');
            const currentAvg = AREAS[city]?.[dist] || 0;
            const isBelow = currentAvg <= t.maxPrice;
            return `
                <div class="track-item">
                    <div class="track-dot ${isBelow ? 'new' : 'none'}"></div>
                    <div class="track-info">
                        <strong>${city} ${dist}</strong> — 目標 ≤ ${t.maxPrice} 萬/坪
                        <div style="font-size:.78rem;color:var(--text-muted)">目前均價 ${currentAvg} 萬/坪 ${isBelow ? '— 已達目標範圍' : ''}</div>
                    </div>
                    <span class="track-price">${currentAvg} 萬</span>
                    <button class="track-delete" data-idx="${i}" title="移除">✕</button>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.track-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const tracks = JSON.parse(localStorage.getItem('hs_tracks') || '[]');
                tracks.splice(parseInt(btn.dataset.idx), 1);
                localStorage.setItem('hs_tracks', JSON.stringify(tracks));
                renderTracks();
                toast('已移除追蹤', 'info');
            });
        });
    }

    /* ========== CONSTRUCTION ========== */
    function initConstruction() {
        const sel = $('#constArea');
        // Include ALL districts from both cities, not just those with projects
        const allDistricts = [];
        for (const [city, districts] of Object.entries(AREAS)) {
            for (const d of Object.keys(districts)) {
                allDistricts.push(d);
            }
        }
        const areasWithProjects = new Set(CONSTRUCTIONS.map(c => c.area));
        allDistricts.forEach(a => {
            const hasProject = areasWithProjects.has(a);
            sel.innerHTML += `<option value="${a}">${a}${hasProject ? '' : '（近期無重大建設）'}</option>`;
        });

        sel.addEventListener('change', renderConstructions);
        renderConstructions();
    }

    function renderConstructions() {
        const filter = $('#constArea').value;
        const filtered = filter ? CONSTRUCTIONS.filter(c => c.area === filter) : CONSTRUCTIONS;
        const container = $('#constList');

        if (filtered.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>${filter ? filter + ' 近期無重大建設資訊。' : '目前無建設資訊。'}<br><span style="font-size:.82rem;color:var(--text-muted)">代表該區域目前沒有進行中或規劃中的重大公共建設與重劃區開發，但不排除小型都更或民間建案。</span></p></div>`;
            return;
        }

        container.innerHTML = filtered.map(c => {
            const tagClass = c.type === 'mrt' ? 'tag-mrt' : c.type === 'redevelopment' ? 'tag-redevelopment' : 'tag-commercial';
            const typeName = c.type === 'mrt' ? '捷運工程' : c.type === 'redevelopment' ? '重劃/都更' : '商業開發';
            return `
                <div class="construction-item">
                    <h4>${c.name}</h4>
                    <div class="construction-meta">
                        <span class="construction-tag ${tagClass}">${typeName}</span>
                        <span>區域：${c.area}</span>
                        <span>進度：${c.status}</span>
                        <span>預計：${c.eta}</span>
                    </div>
                    <div class="construction-impact">${c.impact}</div>
                </div>
            `;
        }).join('');
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
