<script setup>
import { ref, computed } from 'vue'
import { useAppStore, getCriteriaPct, getTeamAvgCriteriaPct, managerTeam, criteria, criteriaPct } from '../../stores/appStore.js'
import Chart from 'primevue/chart'

const { state, topEmployees, allEmployeesRanked, calls, myEmployeeName } = useAppStore()

// ── Spark helper ──────────────────────────────────────────────────────────────
function sparkPath(vals, w = 110, h = 38) {
  const mn = Math.min(...vals), mx = Math.max(...vals), rng = mx - mn || 1
  return 'M' + vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * w
    const y = h - ((v - mn) / rng) * (h - 6) - 3
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' L')
}

function pctColor(p) { return p >= 70 ? 'good' : p >= 40 ? 'warn' : 'bad' }
function pctTextClass(p) { return p >= 70 ? 'good-text' : p >= 40 ? 'warn-text' : 'bad-text' }
const medalEmoji = r => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : ''

// ── Shared radar options ──────────────────────────────────────────────────────
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

// ════════════════════════════════════════════════════════════════════════════
// EMPLOYEE VIEW
// ════════════════════════════════════════════════════════════════════════════
const myEntry = computed(() => allEmployeesRanked.value.find(e => e.isMe) || { rank: 0, score: 0, percent: 0, name: '' })

const myCritPct    = computed(() => myEmployeeName.value ? getCriteriaPct(myEmployeeName.value) : [])
const teamAvgCritPct = computed(() => getTeamAvgCriteriaPct())

const empRadarData = computed(() => ({
  labels: criteria,
  datasets: [
    {
      label: 'Мой результат',
      data: myCritPct.value,
      borderColor: '#0b5e7e', backgroundColor: 'rgba(11,94,126,0.15)',
      pointBackgroundColor: '#0b5e7e', pointRadius: 4, borderWidth: 2
    },
    {
      label: 'Среднее по команде',
      data: teamAvgCritPct.value,
      borderColor: '#16a34a', borderDash: [5, 4],
      backgroundColor: 'rgba(22,163,74,0.04)', pointRadius: 3, borderWidth: 1.5
    }
  ]
}))

const empWeakCriteria = computed(() =>
  criteria
    .map((name, i) => ({ name, my: myCritPct.value[i] || 0, avg: teamAvgCritPct.value[i] || 0 }))
    .filter(c => c.my < 80)
    .sort((a, b) => a.my - b.my)
    .slice(0, 3)
)

const empKpis = computed(() => [
  { value: myEntry.value.score + '/13', label: 'Мой балл',         icon: 'pi-star',                  color: '#7c3aed' },
  { value: String(calls.value.length),  label: 'Мои звонки',       icon: 'pi-phone',                 color: '#0b5e7e' },
  { value: '#' + myEntry.value.rank,    label: 'Место в рейтинге', icon: 'pi-trophy',                color: '#d97706' },
  { value: myEntry.value.percent + '%', label: 'Выполнение плана', icon: 'pi-chart-bar',             color: '#16a34a' }
])

// ════════════════════════════════════════════════════════════════════════════
// MANAGER VIEW
// ════════════════════════════════════════════════════════════════════════════
const teamRanked = computed(() =>
  allEmployeesRanked.value.filter(e => managerTeam.includes(e.name))
)

const teamAvgScore = computed(() => {
  if (!teamRanked.value.length) return '0.0'
  const s = teamRanked.value.map(e => e.score)
  return (s.reduce((a, b) => a + b, 0) / s.length).toFixed(1)
})

const teamBest      = computed(() => teamRanked.value[0] || { name: '', score: 0 })
const teamAttention = computed(() => teamRanked.value.filter(e => e.percent < 70))
const teamAvgTeamCritPct = computed(() => getTeamAvgCriteriaPct(managerTeam))

const mgrBarData = computed(() => {
  const sorted = [...teamRanked.value].sort((a, b) => b.score - a.score)
  return {
    labels: sorted.map(e => {
      const p = e.name.split(' ')
      return (p[0] || '') + (p[1] ? ' ' + p[1][0] + '.' : '')
    }),
    datasets: [{
      label: 'Балл',
      data: sorted.map(e => e.score),
      backgroundColor: sorted.map(e =>
        e.percent >= 70 ? '#0b5e7e' : e.percent >= 55 ? '#f59e0b' : '#ef4444'
      ),
      borderRadius: 6, borderSkipped: false, barThickness: 22
    }]
  }
})

const mgrBarOptions = {
  indexAxis: 'y',
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: ctx => ` ${ctx.raw}/13 · ${((ctx.raw / 13) * 100).toFixed(0)}%` } }
  },
  scales: {
    x: { min: 0, max: 13, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 }, color: '#5a7a92' }, border: { display: false } },
    y: { ticks: { font: { size: 12, weight: '600' }, color: '#5a7a92' }, grid: { display: false }, border: { display: false } }
  }
}

const mgrTeamRadarData = computed(() => ({
  labels: criteria,
  datasets: [
    {
      label: 'Команда %',
      data: teamAvgTeamCritPct.value,
      borderColor: '#0b5e7e', backgroundColor: 'rgba(11,94,126,0.12)',
      pointBackgroundColor: '#0b5e7e', pointRadius: 4, borderWidth: 2
    },
    {
      label: 'Цель 80%',
      data: criteria.map(() => 80),
      borderColor: '#16a34a', borderDash: [5, 4],
      backgroundColor: 'rgba(22,163,74,0.04)', pointRadius: 0, borderWidth: 1.5
    }
  ]
}))

const mgrWeakCriteria = computed(() =>
  criteria
    .map((name, i) => ({ name, pct: teamAvgTeamCritPct.value[i] || 0 }))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3)
)

const mgrKpis = computed(() => [
  { value: teamAvgScore.value + '/13',          label: 'Ср. балл команды',    icon: 'pi-star',                  color: '#7c3aed' },
  { value: String(calls.value.length),           label: 'Звонков за период',   icon: 'pi-phone',                 color: '#0b5e7e' },
  { value: teamBest.value.score + '/13',         label: 'Лучший результат',    icon: 'pi-trophy',                color: '#16a34a' },
  { value: String(teamAttention.value.length),   label: 'Требуют внимания',    icon: 'pi-exclamation-triangle',  color: '#dc2626' }
])

// ════════════════════════════════════════════════════════════════════════════
// DIRECTOR VIEW (unchanged)
// ════════════════════════════════════════════════════════════════════════════
const showComparison = ref(false)
const prevKpis = [
  { value: '134', label: 'Всего звонков',    color: '#0b5e7e', spark: [12,18,14,22,16,19,20] },
  { value: '98',  label: 'Входящих',         color: '#16a34a', spark: [10,14,10,17,12,16,14] },
  { value: '36',  label: 'Исходящих',        color: '#d97706', spark: [2,4,4,5,4,3,7]       },
  { value: '7.6', label: 'Средний балл / 13',color: '#7c3aed', spark: [7.2,7.8,7.5,7.9,7.6,7.8,7.6] }
]

const kpis = [
  { value: '152', label: 'Всего звонков',    icon: 'pi-phone',            color: '#0b5e7e', trend: +12.4, spark: [18,22,15,28,20,25,24] },
  { value: '112', label: 'Входящих',         icon: 'pi-arrow-circle-down',color: '#16a34a', trend: +8.9,  spark: [14,17,11,21,15,19,15] },
  { value: '40',  label: 'Исходящих',        icon: 'pi-arrow-circle-up',  color: '#d97706', trend: +22.5, spark: [4,5,4,7,5,6,9]       },
  { value: '7.9', label: 'Средний балл / 13',icon: 'pi-star',             color: '#7c3aed', trend: +0.3,  trendAbs: true, spark: [7.5,8.1,7.8,8.2,7.9,8.0,7.9] }
]

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

const lineData = {
  labels: ['Январь','Февраль','Март','Апрель'],
  datasets: [
    {
      label: 'Средний балл', data: [6.2,7.1,8.0,7.6],
      borderColor: '#0b5e7e', backgroundColor: 'rgba(11,94,126,0.07)',
      fill: true, tension: 0.45,
      pointBackgroundColor: '#fff', pointBorderColor: '#0b5e7e', pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7
    },
    { label: 'Цель', data: [8,8,8,8], borderColor: '#16a34a', borderDash: [6,4], borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0 }
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

const scoreDistData = {
  labels: ['0–4 балла','5–8 баллов','9–11 баллов','12–13 баллов'],
  datasets: [{ label: 'Звонков', data: [8,42,71,31], backgroundColor: ['#ef4444','#f59e0b','#16a34a','#0b5e7e'], borderRadius: 6, borderSkipped: false, barThickness: 24 }]
}
const scoreDistOptions = {
  indexAxis: 'y', responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw} звонков · ${[5,28,47,20][ctx.dataIndex]}%` } } },
  scales: {
    x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 }, color: '#5a7a92' }, border: { display: false } },
    y: { ticks: { font: { size: 12, weight: '600' }, color: '#5a7a92' }, grid: { display: false }, border: { display: false } }
  }
}

const funnelData = {
  labels: ['Входящих звонков','Выявление потребности','Тест-драйв предложен','Договорённость о визите'],
  datasets: [{ label: 'Звонков', data: [112,89,45,28], backgroundColor: ['#0b5e7e','#1b7ea3','#2eaed4','#93d4e9'], borderRadius: 6, borderSkipped: false, barThickness: 24 }]
}
const funnelOptions = {
  indexAxis: 'y', responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw} зв. · ${[100,79,40,25][ctx.dataIndex]}% от входящих` } } },
  scales: {
    x: { max: 130, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 }, color: '#5a7a92' }, border: { display: false } },
    y: { ticks: { font: { size: 11 }, color: '#5a7a92' }, grid: { display: false }, border: { display: false } }
  }
}

const radarData = {
  labels: criteria,
  datasets: [
    {
      label: 'Факт %', data: criteriaPct,
      borderColor: '#0b5e7e', backgroundColor: 'rgba(11,94,126,0.12)',
      pointBackgroundColor: '#0b5e7e', pointRadius: 4, borderWidth: 2
    },
    {
      label: 'Цель %', data: [80,80,80,80,80,80,80,80],
      borderColor: '#16a34a', borderDash: [5,4], backgroundColor: 'rgba(22,163,74,0.04)',
      pointRadius: 0, borderWidth: 1.5
    }
  ]
}

const attention = [
  { name: 'Лебедев П.Р.',   score: 7, pct: 53.8, delta: -1, calls: 14 },
  { name: 'Григорьев А.В.', score: 8, pct: 61.5, delta: -2, calls: 11 },
  { name: 'Каримов И.И.',   score: 9, pct: 69.2, delta:  0, calls: 9  }
]

const hmHours = ['9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']
const hmDays  = ['Пн','Вт','Ср','Чт','Пт','Сб']
const hmData  = [
  [2,5,8,6,3,7,9,4,2,1],[3,7,6,8,5,9,7,6,3,2],[1,4,9,7,4,6,8,5,2,1],
  [4,6,7,9,6,8,6,7,4,2],[2,5,8,6,5,7,9,5,3,1],[0,1,3,2,1,0,1,2,1,0]
]
function hmColor(v) {
  return ['#f0f4f8','#d5e8f2','#9ecde5','#5aaed4','#2989b7','#0b5e7e'][Math.min(Math.floor(v/2),5)]
}
</script>

<template>
  <div class="av-page stat-page">

    <!-- ══════════════════════════════════════════════════════════════════════
         EMPLOYEE DASHBOARD
    ══════════════════════════════════════════════════════════════════════════ -->
    <template v-if="state.currentRole === 'employee'">

      <div class="role-header">
        <div>
          <h2 class="role-title"><i class="pi pi-chart-bar"></i> Мой дашборд</h2>
          <span class="role-sub">Февраль 2025 · Личная статистика</span>
        </div>
        <div class="role-badge emp">Сотрудник</div>
      </div>

      <!-- KPI cards -->
      <div class="kpi-row">
        <div v-for="kpi in empKpis" :key="kpi.label" class="kpi-card av-card">
          <div class="kpi-top">
            <div class="kpi-icon" :style="{ background: kpi.color + '18', color: kpi.color }">
              <i :class="['pi', kpi.icon]"></i>
            </div>
          </div>
          <div class="kpi-value" :style="{ color: kpi.color }">{{ kpi.value }}</div>
          <div class="kpi-label">{{ kpi.label }}</div>
        </div>
      </div>

      <!-- Radar + Leaderboard -->
      <div class="av-grid av-grid-2">
        <div class="av-card">
          <div class="av-card-header"><i class="pi pi-check-circle"></i> Мои критерии vs команда</div>
          <div class="av-card-body" style="height:260px;">
            <Chart type="radar" :data="empRadarData" :options="radarOptions" style="height:100%;" />
          </div>
        </div>

        <div class="av-card">
          <div class="av-card-header"><i class="pi pi-trophy"></i> Рейтинг команды</div>
          <div class="av-card-body pt-0">
            <div v-for="emp in allEmployeesRanked" :key="emp.name"
                 class="rank-row" :class="{ 'rank-me': emp.isMe }">
              <span class="rank-num">{{ medalEmoji(emp.rank) || ('#' + emp.rank) }}</span>
              <div class="rank-info">
                <span class="rank-name">{{ emp.name }}<span v-if="emp.isMe" class="me-tag">Я</span></span>
                <div class="av-progress" style="height:4px;margin-top:3px;">
                  <div class="av-progress-fill" :class="pctColor(emp.percent)" :style="{ width: emp.percent+'%' }"></div>
                </div>
              </div>
              <div class="rank-right">
                <span class="rank-score">{{ emp.score }}<span class="rank-max">/13</span></span>
                <span class="rank-pct" :class="pctTextClass(emp.percent)">{{ emp.percent }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weak criteria tips -->
      <div class="av-card" v-if="empWeakCriteria.length">
        <div class="av-card-header"><i class="pi pi-lightbulb" style="color:#d97706;"></i> Зоны роста</div>
        <div class="av-card-body">
          <div class="tip-grid">
            <div v-for="c in empWeakCriteria" :key="c.name" class="tip-card">
              <div class="tip-crit">{{ c.name }}</div>
              <div class="tip-bars">
                <div class="tip-bar-wrap">
                  <span class="tip-bar-label">Я</span>
                  <div class="av-progress tip-bar">
                    <div class="av-progress-fill" :class="pctColor(c.my)" :style="{ width: c.my + '%' }"></div>
                  </div>
                  <span class="tip-bar-val" :class="pctTextClass(c.my)">{{ c.my }}%</span>
                </div>
                <div class="tip-bar-wrap">
                  <span class="tip-bar-label">Команда</span>
                  <div class="av-progress tip-bar">
                    <div class="av-progress-fill good" :style="{ width: c.avg + '%' }"></div>
                  </div>
                  <span class="tip-bar-val good-text">{{ c.avg }}%</span>
                </div>
              </div>
              <div class="tip-action">
                <i class="pi pi-info-circle"></i>
                {{ c.my === 0 ? 'Критерий не выполнен ни разу — обсудите с руководителем' : 'Обратите внимание на этот критерий в следующих звонках' }}
              </div>
            </div>
          </div>
        </div>
      </div>

    </template>

    <!-- ══════════════════════════════════════════════════════════════════════
         MANAGER DASHBOARD
    ══════════════════════════════════════════════════════════════════════════ -->
    <template v-else-if="state.currentRole === 'manager'">

      <div class="role-header">
        <div>
          <h2 class="role-title"><i class="pi pi-users"></i> Дашборд команды</h2>
          <span class="role-sub">Февраль 2025 · {{ teamRanked.length }} сотрудников</span>
        </div>
        <div class="role-badge mgr">Руководитель</div>
      </div>

      <!-- Team KPI cards -->
      <div class="kpi-row">
        <div v-for="kpi in mgrKpis" :key="kpi.label" class="kpi-card av-card">
          <div class="kpi-top">
            <div class="kpi-icon" :style="{ background: kpi.color + '18', color: kpi.color }">
              <i :class="['pi', kpi.icon]"></i>
            </div>
          </div>
          <div class="kpi-value" :style="{ color: kpi.color }">{{ kpi.value }}</div>
          <div class="kpi-label">{{ kpi.label }}</div>
        </div>
      </div>

      <!-- Team bar chart + Radar -->
      <div class="av-grid av-grid-2">
        <div class="av-card">
          <div class="av-card-header"><i class="pi pi-chart-bar"></i> Баллы сотрудников команды</div>
          <div class="av-card-body" style="height:220px;">
            <Chart type="bar" :data="mgrBarData" :options="mgrBarOptions" style="height:100%;" />
          </div>
          <div class="chart-legend-row">
            <span class="cl-dot" style="background:#0b5e7e;"></span><span class="cl-label">≥ 70%</span>
            <span class="cl-dot" style="background:#f59e0b;margin-left:12px;"></span><span class="cl-label">55–69%</span>
            <span class="cl-dot" style="background:#ef4444;margin-left:12px;"></span><span class="cl-label">&lt; 55%</span>
          </div>
        </div>

        <div class="av-card">
          <div class="av-card-header"><i class="pi pi-check-circle"></i> Критерии команды</div>
          <div class="av-card-body" style="height:220px;">
            <Chart type="radar" :data="mgrTeamRadarData" :options="radarOptions" style="height:100%;" />
          </div>
        </div>
      </div>

      <!-- Attention + Weak criteria -->
      <div class="av-grid av-grid-2">
        <div class="av-card">
          <div class="av-card-header" style="color:#b45309;">
            <i class="pi pi-exclamation-triangle" style="color:#f59e0b;"></i>
            Требуют внимания
            <span class="attention-hint">ниже 70%</span>
          </div>
          <div class="av-card-body pt-0">
            <div v-for="emp in teamAttention" :key="emp.name" class="att-row">
              <div class="att-avatar">{{ emp.name[0] }}</div>
              <div class="att-info">
                <div class="att-name">{{ emp.name }}</div>
                <div class="av-progress" style="height:5px;margin-top:4px;width:100%;">
                  <div class="av-progress-fill" :class="pctColor(emp.percent)" :style="{ width: emp.percent+'%' }"></div>
                </div>
              </div>
              <div class="att-right">
                <span class="att-score">{{ emp.score }}/13</span>
                <span class="att-pct" :class="pctTextClass(emp.percent)">{{ emp.percent }}%</span>
              </div>
            </div>
            <div class="att-tip">
              <i class="pi pi-info-circle"></i>
              Запланируйте разбор звонков с отстающими сотрудниками
            </div>
          </div>
        </div>

        <div class="av-card">
          <div class="av-card-header" style="color:#7c3aed;">
            <i class="pi pi-list-check" style="color:#7c3aed;"></i>
            Приоритеты обучения
          </div>
          <div class="av-card-body pt-0">
            <p style="font-size:12px;color:var(--text-muted);margin:0 0 12px;">
              Критерии с наиболее низким средним по команде — требуют проработки:
            </p>
            <div v-for="(c, i) in mgrWeakCriteria" :key="c.name" class="priority-row">
              <span class="priority-num">{{ i + 1 }}</span>
              <div class="priority-info">
                <div class="priority-name">{{ c.name }}</div>
                <div class="av-progress" style="height:6px;margin-top:4px;">
                  <div class="av-progress-fill" :class="pctColor(c.pct)" :style="{ width: c.pct + '%' }"></div>
                </div>
              </div>
              <span class="priority-pct" :class="pctTextClass(c.pct)">{{ c.pct }}%</span>
            </div>
            <div class="mgr-tip">
              <i class="pi pi-lightbulb"></i>
              Сфокусируйте coaching-сессии на этих критериях для быстрого роста команды
            </div>
          </div>
        </div>
      </div>

      <!-- Full team table -->
      <div class="av-card">
        <div class="av-card-header"><i class="pi pi-list"></i> Детальная таблица команды</div>
        <div class="av-card-body" style="overflow-x:auto;">
          <table class="team-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Сотрудник</th>
                <th>Балл</th>
                <th>Выполнение</th>
                <th>Потребн.</th>
                <th>Привет.</th>
                <th>Имя</th>
                <th>Срок</th>
                <th>Тест-д.</th>
                <th>Срочн.</th>
                <th>Контакт</th>
                <th>Сл.контакт</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(emp, i) in teamRanked" :key="emp.name">
                <td class="tt-rank">{{ i + 1 }}</td>
                <td class="tt-name">{{ emp.name }}</td>
                <td class="tt-score" :class="pctTextClass(emp.percent)">{{ emp.score }}/13</td>
                <td>
                  <div class="av-progress" style="height:5px;min-width:60px;">
                    <div class="av-progress-fill" :class="pctColor(emp.percent)" :style="{ width: emp.percent+'%' }"></div>
                  </div>
                  <span style="font-size:10px;color:var(--text-muted);">{{ emp.percent }}%</span>
                </td>
                <td v-for="c in getCriteriaPct(emp.name)" :key="c" class="tt-crit" :class="c===100?'crit-ok':c===0?'crit-bad':'crit-warn'">
                  {{ c }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>

    <!-- ══════════════════════════════════════════════════════════════════════
         DIRECTOR DASHBOARD (full view)
    ══════════════════════════════════════════════════════════════════════════ -->
    <template v-else>

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

      <!-- Top-5 + Attention -->
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
                <span class="att-pct" :class="emp.pct < 60 ? 'bad-text' : 'warn-text'">{{ emp.pct }}%</span>
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

      <!-- Score dist + Funnel + Donut -->
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

      <!-- Line + Radar -->
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

      <!-- Heatmap -->
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

    </template>

  </div>
</template>

<style scoped>
.stat-page { display: flex; flex-direction: column; gap: 20px; }
.pt-0 { padding-top: 8px !important; }

/* ── Role header ── */
.role-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.role-title { font-size: 18px; font-weight: 700; color: var(--text); margin: 0 0 4px; display: flex; align-items: center; gap: 8px; }
.role-title i { color: var(--brand); }
.role-sub { font-size: 12px; color: var(--text-muted); }
.role-badge { padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.03em; }
.role-badge.emp { background: #ede9fe; color: #6d28d9; }
.role-badge.mgr { background: #dbeafe; color: #1d4ed8; }

/* ── KPI cards ── */
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
.kpi-label { font-size: 11px; color: var(--text-muted); margin-top: 2px; margin-bottom: 14px; }
.sparkline { display: block; margin: 0 -18px; width: calc(100% + 36px); height: 38px; }
.kpi-sub { font-size: 10px; color: var(--text-muted); padding: 4px 0 12px; opacity: 0.7; }

/* ── Period bar ── */
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
.att-delta { display: flex; align-items: center; gap: 2px; font-size: 11px; font-weight: 600; }
.att-delta.neg { color: #dc2626; }
.att-delta.pos { color: #16a34a; }
.att-delta.neu { color: var(--text-muted); }
.att-calls { font-size: 10px; color: var(--text-muted); }
.att-tip, .mgr-tip {
  margin-top: 10px; padding: 8px 10px; background: #fefce8;
  border-radius: 8px; font-size: 11px; color: #a16207; display: flex; align-items: center; gap: 6px;
}
.mgr-tip { background: #f0fdf4; color: #166534; }

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

/* ── Color helpers ── */
.good-text { color: #16a34a; }
.warn-text { color: #d97706; }
.bad-text  { color: #dc2626; }

/* ── Employee leaderboard ── */
.rank-row { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid var(--border); border-radius: 0; transition: background 0.1s; }
.rank-row:last-child { border-bottom: none; }
.rank-row.rank-me { background: #eff6ff; border-radius: 8px; padding: 7px 8px; margin: 0 -8px; border-bottom: none; outline: 1.5px solid #bfdbfe; }
.rank-num { font-size: 12px; font-weight: 700; color: var(--text-muted); width: 28px; text-align: center; flex-shrink: 0; }
.rank-info { flex: 1; min-width: 0; }
.rank-name { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px; }
.me-tag { font-size: 9px; font-weight: 700; background: #3b82f6; color: #fff; padding: 1px 6px; border-radius: 10px; flex-shrink: 0; }
.rank-right { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
.rank-score { font-size: 13px; font-weight: 700; color: var(--brand); }
.rank-max { font-size: 11px; font-weight: 400; color: var(--text-muted); }
.rank-pct { font-size: 10px; }

/* ── Employee tips ── */
.tip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.tip-card { border: 1px solid var(--border); border-radius: 10px; padding: 12px; background: var(--bg); }
.tip-crit { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 10px; }
.tip-bars { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
.tip-bar-wrap { display: flex; align-items: center; gap: 6px; }
.tip-bar-label { font-size: 10px; color: var(--text-muted); width: 50px; flex-shrink: 0; }
.tip-bar { flex: 1; height: 6px; }
.tip-bar-val { font-size: 11px; font-weight: 700; width: 34px; text-align: right; }
.tip-action { font-size: 11px; color: var(--text-muted); background: #fef9c3; border-radius: 6px; padding: 6px 8px; display: flex; align-items: flex-start; gap: 5px; line-height: 1.4; }
.tip-action i { flex-shrink: 0; color: #a16207; margin-top: 1px; }

/* ── Manager chart legend ── */
.chart-legend-row { display: flex; align-items: center; gap: 4px; padding: 8px 16px 12px; font-size: 11px; color: var(--text-muted); }
.cl-dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
.cl-label { }

/* ── Manager priorities ── */
.priority-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); }
.priority-row:last-child { border-bottom: none; }
.priority-num { width: 22px; height: 22px; border-radius: 50%; background: #f1f5f9; color: var(--text-muted); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.priority-info { flex: 1; min-width: 0; }
.priority-name { font-size: 12px; font-weight: 600; color: var(--text); }
.priority-pct { font-size: 13px; font-weight: 700; flex-shrink: 0; }

/* ── Manager team table ── */
.team-table { width: 100%; border-collapse: collapse; font-size: 12px; white-space: nowrap; }
.team-table th { padding: 6px 10px; text-align: left; font-size: 10px; font-weight: 600; color: var(--text-muted); border-bottom: 2px solid var(--border); background: var(--bg); }
.team-table td { padding: 7px 10px; border-bottom: 1px solid var(--border); }
.team-table tr:last-child td { border-bottom: none; }
.tt-rank { font-weight: 700; color: var(--text-muted); }
.tt-name { font-weight: 500; }
.tt-score { font-weight: 700; }
.tt-crit { font-size: 11px; font-weight: 600; text-align: center; }
.crit-ok   { color: #16a34a; }
.crit-warn { color: #d97706; }
.crit-bad  { color: #dc2626; }

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
