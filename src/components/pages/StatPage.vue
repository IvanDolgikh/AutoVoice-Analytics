<script setup>
import { ref } from 'vue'
import { useAppStore, criteriaPct } from '../../stores/appStore.js'
import Chart from 'primevue/chart'

const { topEmployees } = useAppStore()

// ── Period comparison toggle ──────────────────────────────────────────────────
const showComparison = ref(false)
const prevKpis = [
  { value: '134', prev: true, label: 'Всего звонков',    color: '#0b5e7e', spark: [12,18,14,22,16,19,20] },
  { value: '98',  prev: true, label: 'Входящих',         color: '#16a34a', spark: [10,14,10,17,12,16,14] },
  { value: '36',  prev: true, label: 'Исходящих',        color: '#d97706', spark: [2,4,4,5,4,3,7]       },
  { value: '7.6', prev: true, label: 'Средний балл / 13',color: '#7c3aed', spark: [7.2,7.8,7.5,7.9,7.6,7.8,7.6] }
]

// ── KPI sparklines (SVG — слишком малы для Chart.js canvas) ──────────────────
const kpis = [
  { value: '152', label: 'Всего звонков',    icon: 'pi-phone',            color: '#0b5e7e', trend: +12.4, spark: [18,22,15,28,20,25,24] },
  { value: '112', label: 'Входящих',         icon: 'pi-arrow-circle-down',color: '#16a34a', trend: +8.9,  spark: [14,17,11,21,15,19,15] },
  { value: '40',  label: 'Исходящих',        icon: 'pi-arrow-circle-up',  color: '#d97706', trend: +22.5, spark: [4,5,4,7,5,6,9]       },
  { value: '7.9', label: 'Средний балл / 13',icon: 'pi-star',             color: '#7c3aed', trend: +0.3,  trendAbs: true, spark: [7.5,8.1,7.8,8.2,7.9,8.0,7.9] }
]

function sparkPath(vals, w = 110, h = 38) {
  const mn = Math.min(...vals), mx = Math.max(...vals), rng = mx - mn || 1
  return 'M' + vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w
    const y = h - ((v - mn) / rng) * (h - 6) - 3
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' L')
}

// ── Chart.js — Doughnut ───────────────────────────────────────────────────────
const donutData = {
  labels: ['Входящие', 'Исходящие'],
  datasets: [{ data: [112, 40], backgroundColor: ['#0b5e7e','#e2ecf5'], borderColor: ['#0a5270','#c5d8e8'], borderWidth: 1, hoverOffset: 6 }]
}
const donutOptions = {
  cutout: '74%',
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} зв. (${((ctx.raw/152)*100).toFixed(0)}%)` } }
  }
}

// ── Chart.js — Line (динамика качества) ──────────────────────────────────────
const lineData = {
  labels: ['Январь','Февраль','Март','Апрель'],
  datasets: [
    {
      label: 'Средний балл', data: [6.2,7.1,8.0,7.6],
      borderColor: '#0b5e7e', backgroundColor: 'rgba(11,94,126,0.07)',
      fill: true, tension: 0.45,
      pointBackgroundColor: '#fff', pointBorderColor: '#0b5e7e', pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7
    },
    {
      label: 'Цель', data: [8,8,8,8],
      borderColor: '#16a34a', borderDash: [6,4], borderWidth: 1.5,
      pointRadius: 0, fill: false, tension: 0
    }
  ]
}
const lineOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'top', align: 'end', labels: { font: { size: 11 }, boxWidth: 12, padding: 12, color: '#5a7a92' } },
    tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.raw} / 13` } }
  },
  scales: {
    y: { min: 4, max: 13, ticks: { stepSize: 2, font: { size: 11 }, color: '#5a7a92' }, grid: { color: 'rgba(0,0,0,0.05)' }, border: { display: false } },
    x: { ticks: { font: { size: 11 }, color: '#5a7a92' }, grid: { display: false }, border: { display: false } }
  }
}

// ── Chart.js — Horizontal Bar (распределение баллов) ─────────────────────────
const scoreDistData = {
  labels: ['0–4 балла', '5–8 баллов', '9–11 баллов', '12–13 баллов'],
  datasets: [{
    label: 'Звонков',
    data: [8, 42, 71, 31],
    backgroundColor: ['#ef4444','#f59e0b','#16a34a','#0b5e7e'],
    borderRadius: 6,
    borderSkipped: false,
    barThickness: 24
  }]
}
const scoreDistOptions = {
  indexAxis: 'y',
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: ctx => ` ${ctx.raw} звонков · ${[5,28,47,20][ctx.dataIndex]}%` } }
  },
  scales: {
    x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 }, color: '#5a7a92' }, border: { display: false } },
    y: { ticks: { font: { size: 12, weight: '600' }, color: '#5a7a92' }, grid: { display: false }, border: { display: false } }
  }
}

// ── Chart.js — Horizontal Bar (воронка конверсии) ────────────────────────────
const funnelData = {
  labels: ['Входящих звонков','Выявление потребности','Тест-драйв предложен','Договорённость о визите'],
  datasets: [{
    label: 'Звонков',
    data: [112, 89, 45, 28],
    backgroundColor: ['#0b5e7e','#1b7ea3','#2eaed4','#93d4e9'],
    borderRadius: 6,
    borderSkipped: false,
    barThickness: 24
  }]
}
const funnelOptions = {
  indexAxis: 'y',
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: ctx => ` ${ctx.raw} зв. · ${[100,79,40,25][ctx.dataIndex]}% от входящих` } }
  },
  scales: {
    x: { max: 130, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 }, color: '#5a7a92' }, border: { display: false } },
    y: { ticks: { font: { size: 11 }, color: '#5a7a92' }, grid: { display: false }, border: { display: false } }
  }
}

// ── Chart.js — Radar (выполнение критериев) ───────────────────────────────────
const radarData = {
  labels: ['Потребность','Приветствие','Имя клиента','Срок покупки','Тест-драйв','Срочность','Контакт','След. контакт'],
  datasets: [
    {
      label: 'Факт %',
      data: criteriaPct,
      borderColor: '#0b5e7e',
      backgroundColor: 'rgba(11,94,126,0.12)',
      pointBackgroundColor: '#0b5e7e',
      pointRadius: 4,
      borderWidth: 2
    },
    {
      label: 'Цель %',
      data: [80,80,80,80,80,80,80,80],
      borderColor: '#16a34a',
      borderDash: [5,4],
      backgroundColor: 'rgba(22,163,74,0.04)',
      pointRadius: 0,
      borderWidth: 1.5
    }
  ]
}
const radarOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'top', align: 'end', labels: { font: { size: 11 }, boxWidth: 12, padding: 10, color: '#5a7a92' } },
    tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}%` } }
  },
  scales: {
    r: {
      min: 0, max: 100,
      ticks: { stepSize: 25, font: { size: 10 }, color: '#5a7a92', backdropColor: 'transparent' },
      grid: { color: 'rgba(0,0,0,0.06)' },
      pointLabels: { font: { size: 10 }, color: '#5a7a92' },
      angleLines: { color: 'rgba(0,0,0,0.06)' }
    }
  }
}

// ── Attention zone ────────────────────────────────────────────────────────────
const attention = [
  { name: 'Лебедев П.Р.',   score: 7, pct: 53.8, delta: -1, calls: 14 },
  { name: 'Григорьев А.В.', score: 8, pct: 61.5, delta: -2, calls: 11 },
  { name: 'Каримов И.И.',   score: 9, pct: 69.2, delta:  0, calls: 9  }
]

// ── Activity heatmap (CSS — нет аналога в Chart.js без плагинов) ──────────────
const hmHours = ['9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']
const hmDays  = ['Пн','Вт','Ср','Чт','Пт','Сб']
const hmData  = [
  [2,5,8,6,3,7,9,4,2,1],
  [3,7,6,8,5,9,7,6,3,2],
  [1,4,9,7,4,6,8,5,2,1],
  [4,6,7,9,6,8,6,7,4,2],
  [2,5,8,6,5,7,9,5,3,1],
  [0,1,3,2,1,0,1,2,1,0]
]
function hmColor(v) {
  return ['#f0f4f8','#d5e8f2','#9ecde5','#5aaed4','#2989b7','#0b5e7e'][Math.min(Math.floor(v/2),5)]
}

function pctColor(p) { return p >= 70 ? 'good' : p >= 40 ? 'warn' : 'bad' }
</script>

<template>
  <div class="av-page stat-page">

    <!-- ① KPI cards ───────────────────────────────────────────────────────── -->
    <div class="period-bar">
      <span class="period-label"><i class="pi pi-calendar"></i> Февраль 2025</span>
      <button class="compare-btn" :class="{ active: showComparison }" @click="showComparison = !showComparison">
        <i class="pi pi-sliders-h"></i>
        {{ showComparison ? 'Скрыть сравнение' : 'Сравнить с прошлым периодом' }}
      </button>
    </div>

    <div class="kpi-row">
      <div v-for="(kpi, idx) in kpis" :key="kpi.label" class="kpi-card av-card">
        <div class="kpi-top">
          <div class="kpi-icon" :style="{ background: kpi.color + '18', color: kpi.color }">
            <i :class="['pi', kpi.icon]"></i>
          </div>
          <div class="kpi-trend" :class="kpi.trend >= 0 ? 'up' : 'down'">
            <i :class="['pi', kpi.trend >= 0 ? 'pi-arrow-up-right' : 'pi-arrow-down-right']"></i>
            {{ kpi.trend >= 0 ? '+' : '' }}{{ kpi.trendAbs ? kpi.trend + ' б.' : kpi.trend + '%' }}
          </div>
        </div>
        <div class="kpi-value" :style="{ color: kpi.color }">{{ kpi.value }}</div>
        <div class="kpi-label">{{ kpi.label }}</div>
        <svg class="sparkline" viewBox="0 0 110 38" preserveAspectRatio="none">
          <defs>
            <linearGradient :id="'sg'+idx" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" :stop-color="kpi.color" stop-opacity="0.18"/>
              <stop offset="100%" :stop-color="kpi.color" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path :d="sparkPath(kpi.spark)+' L110,38 L0,38 Z'" :fill="`url(#sg${idx})`"/>
          <path :d="sparkPath(kpi.spark)" :stroke="kpi.color" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <circle :cx="110" :cy="(()=>{ const v=kpi.spark,mn=Math.min(...v),mx=Math.max(...v),rng=mx-mn||1; return(38-((v[v.length-1]-mn)/rng)*32-3).toFixed(1) })()" r="2.5" :fill="kpi.color"/>
        </svg>
        <div class="kpi-sub">vs прошлый период</div>
      </div>
    </div>

    <!-- Period comparison row -->
    <transition name="slide-down">
      <div v-if="showComparison" class="kpi-row prev-row">
        <div v-for="(kpi, i) in prevKpis" :key="kpi.label" class="kpi-card av-card prev-card">
          <div class="prev-badge">Январь 2025</div>
          <div class="kpi-value" :style="{ color: kpi.color, fontSize:'1.5rem' }">{{ kpi.value }}</div>
          <div class="kpi-label">{{ kpi.label }}</div>
          <svg class="sparkline" viewBox="0 0 110 38" preserveAspectRatio="none">
            <path :d="sparkPath(kpi.spark)" :stroke="kpi.color" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 2" opacity="0.6"/>
          </svg>
          <div class="kpi-delta">
            <i class="pi" :class="(+kpis[i].value - +kpi.value) >= 0 ? 'pi-arrow-up-right' : 'pi-arrow-down-right'"
               :style="{ color: (+kpis[i].value - +kpi.value) >= 0 ? '#16a34a' : '#dc2626' }"></i>
            {{ (+kpis[i].value - +kpi.value) >= 0 ? '+' : '' }}{{ (+kpis[i].value - +kpi.value).toFixed(1) }}
            vs текущий
          </div>
        </div>
      </div>
    </transition>

    <!-- ② Top-5 + Needs attention ─────────────────────────────────────────── -->
    <div class="av-grid av-grid-2">
      <div class="av-card">
        <div class="av-card-header"><i class="pi pi-trophy"></i> Топ‑5 сотрудников</div>
        <div class="av-card-body pt-0">
          <div v-for="(emp, idx) in topEmployees" :key="emp.name" class="top-row">
            <span class="top-rank">#{{ idx+1 }}</span>
            <div class="top-info">
              <span class="top-name">{{ emp.name }}</span>
              <div class="av-progress" style="height:5px;margin-top:4px;">
                <div class="av-progress-fill good" :style="{ width: emp.percent+'%' }"></div>
              </div>
            </div>
            <div class="top-right">
              <span class="top-score">{{ emp.score }}<span style="font-weight:400;color:var(--text-muted)">/13</span></span>
              <span class="top-pct">{{ emp.percent }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="av-card">
        <div class="av-card-header" style="color:#b45309;">
          <i class="pi pi-exclamation-triangle" style="color:#f59e0b;"></i>
          Зона внимания
          <span class="attention-hint">ниже 70%</span>
        </div>
        <div class="av-card-body pt-0">
          <div v-for="emp in attention" :key="emp.name" class="att-row">
            <div class="att-avatar">{{ emp.name[0] }}</div>
            <div class="att-info">
              <div class="att-name">{{ emp.name }}</div>
              <div class="av-progress" style="height:5px;margin-top:4px;width:100%;">
                <div class="av-progress-fill" :class="pctColor(emp.pct)" :style="{ width: emp.pct+'%' }"></div>
              </div>
            </div>
            <div class="att-right">
              <span class="att-score">{{ emp.score }}/13</span>
              <span class="att-pct" :class="emp.pct < 60 ? 'bad' : 'warn'">{{ emp.pct }}%</span>
              <span class="att-delta" :class="emp.delta<0?'neg':emp.delta>0?'pos':'neu'">
                <i :class="['pi', emp.delta<0?'pi-trending-down':emp.delta>0?'pi-trending-up':'pi-minus']"></i>
                {{ emp.delta!==0?(emp.delta>0?'+':'')+emp.delta:'—' }}
              </span>
              <span class="att-calls">{{ emp.calls }} зв.</span>
            </div>
          </div>
          <div class="att-tip">
            <i class="pi pi-info-circle"></i>
            Рекомендуется провести разбор звонков с этими сотрудниками
          </div>
        </div>
      </div>
    </div>

    <!-- ③ Score dist + Funnel + Doughnut ──────────────────────────────────── -->
    <div class="triple-row">
      <div class="av-card">
        <div class="av-card-header"><i class="pi pi-chart-bar"></i> Распределение баллов</div>
        <div class="av-card-body" style="height:200px;">
          <Chart type="bar" :data="scoreDistData" :options="scoreDistOptions" style="height:100%;" />
        </div>
      </div>

      <div class="av-card">
        <div class="av-card-header"><i class="pi pi-filter"></i> Воронка конверсии</div>
        <div class="av-card-body" style="height:200px;">
          <Chart type="bar" :data="funnelData" :options="funnelOptions" style="height:100%;" />
        </div>
      </div>

      <div class="av-card">
        <div class="av-card-header"><i class="pi pi-chart-pie"></i> Типы звонков</div>
        <div class="av-card-body donut-wrap">
          <Chart type="doughnut" :data="donutData" :options="donutOptions" style="width:160px;height:160px;" />
          <div class="donut-stats">
            <div class="ds-row"><span class="ds-dot" style="background:#0b5e7e"></span><span class="ds-label">Входящие</span><span class="ds-val">112</span><span class="ds-pct">74%</span></div>
            <div class="ds-row"><span class="ds-dot" style="background:#e2ecf5;border:1px solid #c5d8e8;"></span><span class="ds-label">Исходящие</span><span class="ds-val">40</span><span class="ds-pct">26%</span></div>
            <div class="ds-divider"></div>
            <div class="ds-row" style="font-weight:600;"><span class="ds-label" style="color:var(--text)">Всего</span><span class="ds-val" style="color:var(--text)">152</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ④ Line chart + Radar ──────────────────────────────────────────────── -->
    <div class="av-grid av-grid-2">
      <div class="av-card">
        <div class="av-card-header"><i class="pi pi-chart-line"></i> Динамика качества</div>
        <div class="av-card-body" style="height:200px;">
          <Chart type="line" :data="lineData" :options="lineOptions" style="height:100%;" />
        </div>
      </div>

      <div class="av-card">
        <div class="av-card-header"><i class="pi pi-check-circle"></i> Выполнение критериев</div>
        <div class="av-card-body" style="height:200px;">
          <Chart type="radar" :data="radarData" :options="radarOptions" style="height:100%;" />
        </div>
      </div>
    </div>

    <!-- ⑤ Heatmap ─────────────────────────────────────────────────────────── -->
    <div class="av-card">
      <div class="av-card-header">
        <i class="pi pi-calendar"></i> Активность звонков по времени
        <span class="hm-legend-wrap">
          <span style="font-size:11px;color:var(--text-muted);font-weight:400;">мало</span>
          <span v-for="n in 6" :key="n" class="hm-legend-cell" :style="{ background: hmColor((n-1)*2) }"></span>
          <span style="font-size:11px;color:var(--text-muted);font-weight:400;">много</span>
        </span>
      </div>
      <div class="av-card-body">
        <div class="heatmap-wrap">
          <div class="hm-y-labels">
            <span v-for="d in hmDays" :key="d" class="hm-y-label">{{ d }}</span>
          </div>
          <div class="hm-grid-wrap">
            <div class="hm-x-labels">
              <span v-for="h in hmHours" :key="h" class="hm-x-label">{{ h }}</span>
            </div>
            <div class="hm-grid">
              <div v-for="(row, di) in hmData" :key="di" class="hm-row">
                <div v-for="(val, hi) in row" :key="hi" class="hm-cell"
                  :style="{ background: hmColor(val) }"
                  :title="`${hmDays[di]} ${hmHours[hi]}: ${val} звонков`">
                  <span v-if="val>0" class="hm-val">{{ val }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.stat-page { display: flex; flex-direction: column; gap: 20px; }
.pt-0 { padding-top: 8px !important; }

/* ── KPI ── */
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.kpi-card { padding: 18px 18px 0; overflow: hidden; }
.kpi-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.kpi-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.kpi-icon i { font-size: 17px; }
.kpi-trend { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 600; padding: 3px 7px; border-radius: 20px; }
.kpi-trend.up   { background: #dcfce7; color: #16a34a; }
.kpi-trend.down { background: #fee2e2; color: #dc2626; }
.kpi-trend i { font-size: 10px; }
.kpi-value { font-size: 2rem; font-weight: 700; line-height: 1.1; }
.kpi-label { font-size: 11px; color: var(--text-muted); margin-top: 2px; margin-bottom: 10px; }
.sparkline { display: block; margin: 0 -18px; width: calc(100% + 36px); height: 38px; }
.kpi-sub { font-size: 10px; color: var(--text-muted); padding: 4px 0 12px; opacity: 0.7; }

.period-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.period-label { font-size: 12px; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
.compare-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border);
  background: var(--surface); color: var(--text-muted); font-size: 12px; font-weight: 500;
  cursor: pointer; transition: 0.15s;
}
.compare-btn:hover, .compare-btn.active { background: var(--brand-light); color: var(--brand); border-color: var(--brand); }

.prev-row { margin-top: 10px; }
.prev-card { opacity: 0.82; border-style: dashed; position: relative; }
.prev-badge {
  position: absolute; top: 8px; right: 10px;
  font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--text-muted); background: var(--surface-alt); padding: 2px 7px; border-radius: 8px;
}
.kpi-delta { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; padding: 4px 0 12px; }
.kpi-delta .pi { font-size: 11px; }

.slide-down-enter-active { transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1); }
.slide-down-leave-active { transition: all 0.15s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }

/* ── Top-5 ── */
.top-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); }
.top-row:last-child { border-bottom: none; }
.top-rank { font-size: 11px; font-weight: 700; color: var(--text-muted); width: 20px; flex-shrink: 0; }
.top-info { flex: 1; min-width: 0; }
.top-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.top-right { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
.top-score { font-size: 14px; font-weight: 700; color: var(--brand); }
.top-pct { font-size: 10px; color: var(--text-muted); }

/* ── Attention ── */
.attention-hint { margin-left: 6px; font-size: 10px; font-weight: 400; background: #fef3c7; color: #b45309; padding: 2px 7px; border-radius: 20px; }
.att-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); }
.att-row:last-child { border-bottom: none; }
.att-avatar { width: 30px; height: 30px; border-radius: 8px; background: #fef3c7; color: #b45309; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.att-info { flex: 1; min-width: 0; }
.att-name { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.att-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.att-score { font-size: 12px; font-weight: 600; color: var(--text-muted); }
.att-pct { font-size: 12px; font-weight: 700; }
.att-pct.bad  { color: #dc2626; }
.att-pct.warn { color: #d97706; }
.att-delta { display: flex; align-items: center; gap: 2px; font-size: 11px; font-weight: 600; }
.att-delta.neg { color: #dc2626; }
.att-delta.pos { color: #16a34a; }
.att-delta.neu { color: var(--text-muted); }
.att-calls { font-size: 10px; color: var(--text-muted); }
.att-tip { margin-top: 10px; padding: 8px 10px; background: #fefce8; border-radius: 8px; font-size: 11px; color: #a16207; display: flex; align-items: center; gap: 6px; }

/* ── Triple row ── */
.triple-row { display: grid; grid-template-columns: 1fr 1fr 0.7fr; gap: 16px; }

/* ── Donut ── */
.donut-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; padding-top: 4px; }
.donut-stats { width: 100%; }
.ds-row { display: flex; align-items: center; gap: 6px; padding: 5px 0; font-size: 12px; }
.ds-dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
.ds-label { flex: 1; color: var(--text-muted); }
.ds-val { font-weight: 600; color: var(--text); }
.ds-pct { font-size: 11px; color: var(--text-muted); min-width: 30px; text-align: right; }
.ds-divider { border-top: 1px solid var(--border); margin: 4px 0; }

/* ── Criteria progress bars ── */
.criteria-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px solid var(--border); }
.criteria-row:last-child { border-bottom: none; }
.criteria-name { font-size: 12px; color: var(--text); flex: 1; }
.criteria-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.criteria-pct { font-size: 12px; font-weight: 700; min-width: 36px; text-align: right; }
.good-text { color: #16a34a; }
.warn-text { color: #d97706; }
.bad-text  { color: #dc2626; }

/* ── Heatmap ── */
.hm-legend-wrap { display: flex; align-items: center; gap: 4px; margin-left: auto; font-size: 11px; }
.hm-legend-cell { width: 14px; height: 14px; border-radius: 3px; display: inline-block; }
.heatmap-wrap { display: flex; gap: 8px; overflow-x: auto; }
.hm-y-labels { display: flex; flex-direction: column; justify-content: space-around; padding-top: 20px; }
.hm-y-label { font-size: 11px; color: var(--text-muted); text-align: right; height: 28px; display: flex; align-items: center; }
.hm-grid-wrap { flex: 1; min-width: 0; }
.hm-x-labels { display: flex; gap: 4px; margin-bottom: 4px; }
.hm-x-label { flex: 1; font-size: 10px; color: var(--text-muted); text-align: center; min-width: 36px; }
.hm-grid { display: flex; flex-direction: column; gap: 4px; }
.hm-row { display: flex; gap: 4px; }
.hm-cell { flex: 1; min-width: 36px; height: 28px; border-radius: 5px; display: flex; align-items: center; justify-content: center; cursor: default; transition: opacity 0.1s; }
.hm-cell:hover { opacity: 0.82; outline: 2px solid rgba(11,94,126,0.4); }
.hm-val { font-size: 10px; font-weight: 600; color: rgba(0,0,0,0.45); }

@media (max-width: 1100px) {
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .triple-row { grid-template-columns: 1fr 1fr; }
  .triple-row > .av-card:last-child { grid-column: 1 / -1; }
}
@media (max-width: 640px) {
  .kpi-row { grid-template-columns: 1fr 1fr; }
  .triple-row { grid-template-columns: 1fr; }
}
</style>
