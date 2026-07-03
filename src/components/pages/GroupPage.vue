<script setup>
import { ref, computed, reactive } from 'vue'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import Chart from 'primevue/chart'

// ── Scenario definitions ──────────────────────────────────────────────────────
const scenarioList = [
  {
    key: 'sales',
    label: 'Отдел продаж',
    icon: 'pi-car',
    desc: 'Полная оценка по скрипту Changan: приветствие, потребность, тест-драйв, срочность, контакт и следующий шаг.',
    critKeys:   ['greeting','name','needs','deadline','testdrive','urgency','contact','nextcontact'],
    critLabels: ['Приветствие','Имя','Потребность','Срок','Тест-драйв','Срочность','Контакт','След. контакт'],
    employees: [
      { name:'Артемович Д.С.',  salon:'Окружная',     calls:3, score:92, prev:88, crit:[100,100,100, 67,100, 33,100,100],
        callRows:[{id:'A-01',date:'29.06',score:97,failed:[]},{id:'A-02',date:'28.06',score:91,failed:['urgency']},{id:'A-03',date:'27.06',score:88,failed:['deadline','urgency']}] },
      { name:'Белов Д.С.',      salon:'Федюнинского', calls:3, score:89, prev:91, crit:[100,100,100,100, 67, 33,100, 67],
        callRows:[{id:'B-01',date:'29.06',score:93,failed:[]},{id:'B-02',date:'28.06',score:89,failed:['urgency']},{id:'B-03',date:'27.06',score:85,failed:['testdrive','urgency','nextcontact']}] },
      { name:'Яхонтов Р.А.',    salon:'Окружная',     calls:2, score:84, prev:79, crit:[100,100,100,100, 50, 50,100,  0],
        callRows:[{id:'Y-01',date:'29.06',score:90,failed:['urgency']},{id:'Y-02',date:'28.06',score:78,failed:['testdrive','urgency','nextcontact']}] },
      { name:'Перминов А.А.',   salon:'Пермякова',    calls:3, score:82, prev:85, crit:[100,100,100,  0, 67,  0,100,100],
        callRows:[{id:'P-01',date:'29.06',score:89,failed:[]},{id:'P-02',date:'28.06',score:84,failed:['deadline','urgency']},{id:'P-03',date:'27.06',score:73,failed:['deadline','testdrive','urgency']}] },
      { name:'Морозов Р.А.',    salon:'Окружная',     calls:2, score:79, prev:76, crit:[100,100,100, 50, 50,  0,100,100],
        callRows:[{id:'M-01',date:'29.06',score:85,failed:['urgency']},{id:'M-02',date:'28.06',score:73,failed:['deadline','testdrive','urgency']}] },
      { name:'Соколов К.С.',    salon:'Федюнинского', calls:2, score:76, prev:78, crit:[100, 50,100, 50, 50,  0,100, 50],
        callRows:[{id:'S-01',date:'29.06',score:81,failed:['urgency','name']},{id:'S-02',date:'28.06',score:71,failed:['deadline','testdrive','urgency','nextcontact']}] },
      { name:'Абдуллин И.И.',   salon:'Пермякова',    calls:2, score:73, prev:68, crit:[100,100,100,  0,  0,  0,100, 50],
        callRows:[{id:'Ab-01',date:'29.06',score:79,failed:['urgency']},{id:'Ab-02',date:'28.06',score:67,failed:['deadline','testdrive','urgency','nextcontact']}] },
      { name:'Суздальцев К.С.', salon:'Пермякова',    calls:2, score:69, prev:72, crit:[100, 50,100,  0,  0,  0,100, 50],
        callRows:[{id:'Su-01',date:'29.06',score:73,failed:['urgency','name']},{id:'Su-02',date:'28.06',score:65,failed:['deadline','testdrive','urgency','nextcontact']}] },
      { name:'Новиков О.А.',    salon:'Федюнинского', calls:3, score:72, prev:69, crit:[100,100,100,  0, 50,  0,100, 50],
        callRows:[{id:'N-01',date:'29.06',score:78,failed:['urgency']},{id:'N-02',date:'28.06',score:71,failed:['deadline','urgency']},{id:'N-03',date:'27.06',score:67,failed:['deadline','testdrive','urgency','nextcontact']}] },
      { name:'Каримов И.И.',    salon:'Федюнинского', calls:2, score:64, prev:67, crit:[100, 50,  0,  0, 50,  0,100, 50],
        callRows:[{id:'K-01',date:'29.06',score:70,failed:['needs','urgency','name']},{id:'K-02',date:'28.06',score:58,failed:['needs','deadline','testdrive','urgency','nextcontact']}] },
      { name:'Григорьев А.В.',  salon:'Окружная',     calls:2, score:59, prev:62, crit:[100,100,  0,  0, 50,  0,100,  0],
        callRows:[{id:'G-01',date:'29.06',score:64,failed:['needs','urgency']},{id:'G-02',date:'28.06',score:54,failed:['needs','deadline','testdrive','urgency','nextcontact']}] },
      { name:'Лебедев П.Р.',    salon:'Пермякова',    calls:2, score:54, prev:57, crit:[100, 50,  0,  0, 50,  0,100,  0],
        callRows:[{id:'L-01',date:'29.06',score:58,failed:['needs','urgency','name']},{id:'L-02',date:'28.06',score:50,failed:['needs','deadline','testdrive','urgency','nextcontact','name']}] }
    ]
  },
  {
    key: 'service',
    label: 'Отдел сервиса',
    icon: 'pi-wrench',
    desc: 'Оценка входящих на сервис: приветствие, выявление потребности, конверсия к записи.',
    critKeys:   ['greeting','name','needs','booking'],
    critLabels: ['Приветствие','Имя','Потребность','Запись'],
    employees: [
      { name:'Никитина С.В.', salon:'Окружная',     calls:5, score:88, prev:82, crit:[100,100,80,80],
        callRows:[{id:'Ни-01',date:'29.06',score:95,failed:[]},{id:'Ни-02',date:'29.06',score:90,failed:[]},{id:'Ни-03',date:'28.06',score:88,failed:['booking']},{id:'Ни-04',date:'28.06',score:85,failed:['booking']},{id:'Ни-05',date:'27.06',score:82,failed:['needs','booking']}] },
      { name:'Попов А.К.',    salon:'Федюнинского', calls:4, score:79, prev:75, crit:[100, 75,75,50],
        callRows:[{id:'По-01',date:'29.06',score:88,failed:[]},{id:'По-02',date:'28.06',score:80,failed:['name']},{id:'По-03',date:'28.06',score:76,failed:['booking']},{id:'По-04',date:'27.06',score:72,failed:['name','needs','booking']}] },
      { name:'Зайцев М.П.',   salon:'Окружная',     calls:4, score:74, prev:70, crit:[100, 75,50,50],
        callRows:[{id:'За-01',date:'29.06',score:82,failed:[]},{id:'За-02',date:'28.06',score:75,failed:['needs']},{id:'За-03',date:'28.06',score:71,failed:['booking']},{id:'За-04',date:'27.06',score:68,failed:['needs','booking']}] },
      { name:'Кузьмин Е.В.',  salon:'Пермякова',    calls:3, score:69, prev:73, crit:[100, 67,67, 0],
        callRows:[{id:'Ку-01',date:'29.06',score:78,failed:['booking']},{id:'Ку-02',date:'28.06',score:67,failed:['name','booking']},{id:'Ку-03',date:'27.06',score:62,failed:['needs','booking']}] },
      { name:'Смирнов Д.Г.',  salon:'Пермякова',    calls:3, score:62, prev:58, crit:[100, 67,33, 0],
        callRows:[{id:'Сми-01',date:'29.06',score:70,failed:['needs','booking']},{id:'Сми-02',date:'28.06',score:61,failed:['name','booking']},{id:'Сми-03',date:'27.06',score:55,failed:['needs','name','booking']}] },
      { name:'Орлов В.А.',    salon:'Федюнинского', calls:3, score:57, prev:60, crit:[100, 33,33, 0],
        callRows:[{id:'Ор-01',date:'29.06',score:65,failed:['name','needs']},{id:'Ор-02',date:'28.06',score:56,failed:['name','booking']},{id:'Ор-03',date:'27.06',score:50,failed:['name','needs','booking']}] }
    ]
  },
  {
    key: 'operators',
    label: 'Отдел операторов',
    icon: 'pi-headphones',
    desc: 'Оценка операторов: соблюдение приветствия, обращение по имени, конверсия переключений.',
    critKeys:   ['greeting','name','transfer'],
    critLabels: ['Приветствие','Имя','Переключение'],
    employees: [
      { name:'Волкова Н.И.',   salon:'Окружная',     calls:8, score:91, prev:87, crit:[100,88,88],
        callRows:[{id:'В-01',date:'29.06',score:96,failed:[]},{id:'В-02',date:'29.06',score:93,failed:[]},{id:'В-03',date:'28.06',score:91,failed:['name']},{id:'В-04',date:'28.06',score:89,failed:['transfer']},{id:'В-05',date:'27.06',score:88,failed:['name']},{id:'В-06',date:'27.06',score:90,failed:[]},{id:'В-07',date:'26.06',score:91,failed:[]},{id:'В-08',date:'26.06',score:90,failed:[]}] },
      { name:'Петрова Е.А.',   salon:'Федюнинского', calls:7, score:86, prev:83, crit:[100,86,71],
        callRows:[{id:'Пе-01',date:'29.06',score:92,failed:[]},{id:'Пе-02',date:'29.06',score:88,failed:['transfer']},{id:'Пе-03',date:'28.06',score:86,failed:['name']},{id:'Пе-04',date:'28.06',score:84,failed:['transfer']},{id:'Пе-05',date:'27.06',score:83,failed:['name','transfer']},{id:'Пе-06',date:'27.06',score:85,failed:[]},{id:'Пе-07',date:'26.06',score:84,failed:[]}] },
      { name:'Козлова М.В.',   salon:'Окружная',     calls:8, score:79, prev:81, crit:[100,75,63],
        callRows:[{id:'Ко-01',date:'29.06',score:85,failed:['transfer']},{id:'Ко-02',date:'29.06',score:82,failed:['name']},{id:'Ко-03',date:'28.06',score:80,failed:['transfer']},{id:'Ко-04',date:'28.06',score:78,failed:['name','transfer']},{id:'Ко-05',date:'27.06',score:77,failed:['transfer']},{id:'Ко-06',date:'27.06',score:76,failed:['name']},{id:'Ко-07',date:'26.06',score:78,failed:[]},{id:'Ко-08',date:'26.06',score:75,failed:['name','transfer']}] },
      { name:'Сидорова Т.П.',  salon:'Пермякова',    calls:7, score:73, prev:68, crit:[100,71,43],
        callRows:[{id:'Си-01',date:'29.06',score:80,failed:['transfer']},{id:'Си-02',date:'29.06',score:76,failed:['name']},{id:'Си-03',date:'28.06',score:74,failed:['transfer']},{id:'Си-04',date:'28.06',score:71,failed:['name','transfer']},{id:'Си-05',date:'27.06',score:70,failed:['transfer']},{id:'Си-06',date:'27.06',score:68,failed:['name','transfer']},{id:'Си-07',date:'26.06',score:72,failed:['transfer']}] },
      { name:'Михайлова О.С.', salon:'Пермякова',    calls:6, score:68, prev:71, crit:[100,50,50],
        callRows:[{id:'Ми-01',date:'29.06',score:75,failed:['name','transfer']},{id:'Ми-02',date:'28.06',score:70,failed:['transfer']},{id:'Ми-03',date:'28.06',score:67,failed:['name','transfer']},{id:'Ми-04',date:'27.06',score:65,failed:['name','transfer']},{id:'Ми-05',date:'27.06',score:64,failed:['name']},{id:'Ми-06',date:'26.06',score:67,failed:['transfer']}] },
      { name:'Федотова А.В.',  salon:'Федюнинского', calls:5, score:61, prev:64, crit:[100,60,20],
        callRows:[{id:'Фе-01',date:'29.06',score:68,failed:['transfer']},{id:'Фе-02',date:'28.06',score:63,failed:['name','transfer']},{id:'Фе-03',date:'28.06',score:59,failed:['transfer']},{id:'Фе-04',date:'27.06',score:57,failed:['name','transfer']},{id:'Фе-05',date:'26.06',score:58,failed:['name','transfer']}] }
    ]
  }
]

// ── Config state ──────────────────────────────────────────────────────────────
const selectedKey = ref('sales')
const dateFrom    = ref(new Date('2026-06-01'))
const dateTo      = ref(new Date('2026-06-30'))
const salonOpts   = [
  { label: 'Все салоны', value: null },
  { label: 'Автосалон Окружная', value: 'Окружная' },
  { label: 'Автосалон Федюнинского', value: 'Федюнинского' },
  { label: 'Автосалон Пермякова', value: 'Пермякова' }
]
const salonFilter = ref(null)
const sortField   = ref('score')
const sortAsc     = ref(false)

const loading  = ref(false)
const done     = ref(false)
const expanded = reactive({})

// ── Current scenario ─────────────────────────────────────────────────────────
const scenario = computed(() => scenarioList.find(s => s.key === selectedKey.value))

const employees = computed(() => {
  let list = scenario.value?.employees ?? []
  if (salonFilter.value) list = list.filter(e => e.salon === salonFilter.value)
  return [...list].sort((a, b) => {
    const mul = sortAsc.value ? 1 : -1
    if (sortField.value === 'name') return a.name.localeCompare(b.name) * mul
    return (a[sortField.value] - b[sortField.value]) * mul
  })
})

// ── Summary stats ─────────────────────────────────────────────────────────────
const summary = computed(() => {
  const emps  = employees.value
  if (!emps.length) return null
  const totalCalls = emps.reduce((s, e) => s + e.calls, 0)
  const avgScore   = Math.round(emps.reduce((s, e) => s + e.score, 0) / emps.length)
  const avgPrev    = Math.round(emps.reduce((s, e) => s + e.prev,  0) / emps.length)
  const diff       = avgScore - avgPrev
  const ok   = emps.filter(e => e.score >= 80).length
  const warn = emps.filter(e => e.score >= 65 && e.score < 80).length
  const bad  = emps.filter(e => e.score < 65).length
  return { totalCalls, avgScore, avgPrev, diff, ok, warn, bad, total: emps.length }
})

// ── Criteria averages ─────────────────────────────────────────────────────────
const critAvgs = computed(() => {
  const emps = employees.value
  if (!emps.length) return []
  return (scenario.value?.critLabels ?? []).map((lbl, ci) => ({
    label: lbl,
    avg: Math.round(emps.reduce((s, e) => s + (e.crit[ci] ?? 0), 0) / emps.length)
  }))
})

const worstCrit = computed(() => [...critAvgs.value].sort((a, b) => a.avg - b.avg)[0])
const bestCrit  = computed(() => [...critAvgs.value].sort((a, b) => b.avg - a.avg)[0])

// ── Chart ─────────────────────────────────────────────────────────────────────
const chartData = computed(() => {
  const sorted = [...employees.value].sort((a, b) => a.score - b.score)
  return {
    labels: sorted.map(e => {
      const parts = e.name.split(' ')
      return parts[0] + ' ' + (parts[1]?.[0] ?? '') + '.'
    }),
    datasets: [{
      label: 'Средний балл %',
      data: sorted.map(e => e.score),
      backgroundColor: sorted.map(e => e.score >= 80 ? 'rgba(22,163,74,0.15)' : e.score >= 65 ? 'rgba(217,119,6,0.15)' : 'rgba(220,38,38,0.12)'),
      borderColor:     sorted.map(e => e.score >= 80 ? '#16a34a' : e.score >= 65 ? '#d97706' : '#dc2626'),
      borderWidth: 1.5, borderRadius: 4
    }]
  }
})

const chartOptions = {
  indexAxis: 'y', responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: ctx => ` ${ctx.raw}%` } }
  },
  scales: {
    x: { min: 0, max: 100, ticks: { callback: v => v + '%', font: { size: 11 }, color: '#5a7a92' }, grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false } },
    y: { ticks: { font: { size: 11 }, color: '#1a2c3e' }, grid: { display: false }, border: { display: false } }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function cellColor(pct) {
  return pct >= 80 ? { bg: '#dcfce7', color: '#16a34a' }
       : pct >= 50 ? { bg: '#fef3c7', color: '#d97706' }
       :             { bg: '#fee2e2', color: '#dc2626' }
}

function scoreClass(v) {
  return v >= 80 ? 'ok' : v >= 65 ? 'warn' : 'bad'
}

function diffClass(d) { return d > 0 ? 'up' : d < 0 ? 'dn' : 'eq' }

function sortBy(field) {
  if (sortField.value === field) sortAsc.value = !sortAsc.value
  else { sortField.value = field; sortAsc.value = false }
}

function toggleExpand(name) { expanded[name] = !expanded[name] }

function callStatusClass(score) {
  return score >= 80 ? 'ok' : score >= 65 ? 'warn' : 'bad'
}

function runCheck() {
  loading.value = true
  done.value = false
  setTimeout(() => { loading.value = false; done.value = true }, 900)
}

function exportCSV() {
  const crit = scenario.value?.critLabels ?? []
  const header = ['Сотрудник', 'Салон', 'Звонков', 'Балл', 'Пред. балл', 'Изм.', ...crit, 'Статус'].join(';')
  const rows = employees.value.map(e => {
    const status = e.score >= 80 ? 'Норма' : e.score >= 65 ? 'Замечание' : 'Нарушение'
    return [e.name, e.salon, e.calls, e.score + '%', e.prev + '%', (e.score - e.prev > 0 ? '+' : '') + (e.score - e.prev) + '%', ...e.crit.map(v => v + '%'), status].join(';')
  })
  const blob = new Blob(['﻿' + [header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = `group_check_${selectedKey.value}.csv`; a.click()
}
</script>

<template>
  <div class="av-page gp-page">

    <!-- ── Config card ── -->
    <div class="av-card config-card">
      <div class="config-top">
        <div class="config-title">
          <i class="pi pi-users"></i>
          Групповая проверка
        </div>
        <div class="config-desc" v-if="scenario">
          <span class="sdept-badge"><i :class="['pi', scenario.icon]"></i> {{ scenario.label }}</span>
          {{ scenario.desc }}
        </div>
      </div>

      <div class="config-row">
        <div class="config-field">
          <label class="cf-label">Сценарий</label>
          <Select
            v-model="selectedKey"
            :options="scenarioList"
            optionLabel="label"
            optionValue="key"
            placeholder="Выберите сценарий"
            style="width:220px;"
          />
        </div>
        <div class="config-field">
          <label class="cf-label">Период с</label>
          <DatePicker v-model="dateFrom" dateFormat="dd.mm.yy" showIcon style="width:155px;" />
        </div>
        <div class="config-field">
          <label class="cf-label">по</label>
          <DatePicker v-model="dateTo" dateFormat="dd.mm.yy" showIcon style="width:155px;" />
        </div>
        <div class="config-field">
          <label class="cf-label">Салон</label>
          <Select v-model="salonFilter" :options="salonOpts" optionLabel="label" optionValue="value" placeholder="Все" style="width:185px;" />
        </div>
        <Button
          :label="loading ? 'Проверяем...' : 'Запустить проверку'"
          icon="pi pi-play"
          :loading="loading"
          style="background:var(--brand)!important;border-color:var(--brand)!important;margin-top:18px;"
          @click="runCheck"
        />
      </div>
    </div>

    <transition name="fade">
      <div v-if="done && summary" class="results-wrap">

        <!-- ── Summary strip ── -->
        <div class="summary-strip">
          <div class="scard">
            <div class="scard-val">{{ summary.totalCalls }}</div>
            <div class="scard-lbl">Звонков проверено</div>
          </div>
          <div class="scard">
            <div class="scard-val" :class="scoreClass(summary.avgScore)">{{ summary.avgScore }}%</div>
            <div class="scard-lbl">Средний балл</div>
          </div>
          <div class="scard">
            <div class="scard-val" :class="diffClass(summary.diff)">
              <i class="pi" :class="summary.diff>0?'pi-arrow-up':summary.diff<0?'pi-arrow-down':'pi-minus'"></i>
              {{ summary.diff > 0 ? '+' : '' }}{{ summary.diff }}%
            </div>
            <div class="scard-lbl">vs прошлый период ({{ summary.avgPrev }}%)</div>
          </div>
          <div class="scard scard-dist">
            <div class="dist-row">
              <span class="dist-dot ok"></span>
              <span class="dist-count ok">{{ summary.ok }}</span>
              <span class="dist-lbl">Норма</span>
            </div>
            <div class="dist-row">
              <span class="dist-dot warn"></span>
              <span class="dist-count warn">{{ summary.warn }}</span>
              <span class="dist-lbl">Замечания</span>
            </div>
            <div class="dist-row">
              <span class="dist-dot bad"></span>
              <span class="dist-count bad">{{ summary.bad }}</span>
              <span class="dist-lbl">Нарушения</span>
            </div>
          </div>
          <div class="scard">
            <div class="scard-val">{{ summary.total }}</div>
            <div class="scard-lbl">Сотрудников</div>
          </div>
        </div>

        <!-- ── Two-column: chart + insights ── -->
        <div class="mid-row">

          <!-- Bar chart -->
          <div class="av-card chart-card">
            <div class="block-title"><i class="pi pi-chart-bar"></i> Рейтинг сотрудников</div>
            <div :style="{ height: employees.length * 36 + 40 + 'px', minHeight: '200px' }">
              <Chart type="bar" :data="chartData" :options="chartOptions" style="height:100%;" />
            </div>
          </div>

          <!-- Insights -->
          <div class="av-card insights-card">
            <div class="block-title"><i class="pi pi-lightbulb"></i> Инсайты</div>

            <div class="insight-item best">
              <div class="insight-icon"><i class="pi pi-trophy"></i></div>
              <div>
                <div class="insight-label">Лучший критерий</div>
                <div class="insight-val">{{ bestCrit?.label }}</div>
                <div class="insight-sub">{{ bestCrit?.avg }}% выполнения</div>
              </div>
            </div>

            <div class="insight-item worst">
              <div class="insight-icon"><i class="pi pi-exclamation-triangle"></i></div>
              <div>
                <div class="insight-label">Узкое место</div>
                <div class="insight-val">{{ worstCrit?.label }}</div>
                <div class="insight-sub">{{ worstCrit?.avg }}% выполнения</div>
              </div>
            </div>

            <div class="insight-item info">
              <div class="insight-icon"><i class="pi pi-user"></i></div>
              <div>
                <div class="insight-label">Требуют внимания</div>
                <div class="insight-val">{{ summary.bad + summary.warn }} сотр. ({{ Math.round(((summary.bad+summary.warn)/summary.total)*100) }}%)</div>
                <div class="insight-sub">Ниже целевого показателя 80%</div>
              </div>
            </div>

            <div class="insight-rec">
              <i class="pi pi-info-circle"></i>
              <span>
                Рекомендуется провести coaching-сессию по критерию
                <strong>«{{ worstCrit?.label }}»</strong>
                — он выполняется хуже всего ({{ worstCrit?.avg }}%) и влияет на итоговую конверсию.
              </span>
            </div>

            <div class="crit-avgs">
              <div class="block-sub-title">Средний % выполнения критериев</div>
              <div v-for="c in critAvgs" :key="c.label" class="crit-avg-row">
                <span class="crit-avg-lbl">{{ c.label }}</span>
                <div class="crit-avg-bar-bg">
                  <div class="crit-avg-bar-fill"
                    :style="{ width: c.avg + '%', background: cellColor(c.avg).color }"
                  ></div>
                </div>
                <span class="crit-avg-pct" :style="{ color: cellColor(c.avg).color }">{{ c.avg }}%</span>
              </div>
            </div>
          </div>

        </div>

        <!-- ── Criteria heatmap ── -->
        <div class="av-card heatmap-card">
          <div class="block-title"><i class="pi pi-table"></i> Матрица критериев</div>
          <div style="overflow-x:auto;">
            <table class="heatmap-table">
              <thead>
                <tr>
                  <th class="ht-emp-th">Сотрудник</th>
                  <th class="ht-sal-th">Салон</th>
                  <th v-for="lbl in scenario?.critLabels" :key="lbl" class="ht-crit-th">{{ lbl }}</th>
                  <th class="ht-total-th">Итог</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in employees" :key="e.name">
                  <td class="ht-emp-td">
                    <div class="emp-row">
                      <div class="emp-av">{{ e.name[0] }}</div>
                      {{ e.name }}
                    </div>
                  </td>
                  <td class="ht-sal-td">{{ e.salon }}</td>
                  <td v-for="(pct, ci) in e.crit" :key="ci" class="ht-cell">
                    <span class="ht-chip" :style="{ background: cellColor(pct).bg, color: cellColor(pct).color }">
                      {{ pct }}%
                    </span>
                  </td>
                  <td class="ht-total-td">
                    <div class="ht-total-wrap">
                      <span class="ht-total-val" :class="scoreClass(e.score)">{{ e.score }}%</span>
                      <div class="ht-bar-bg">
                        <div class="ht-bar-fill" :class="scoreClass(e.score)" :style="{ width: e.score + '%' }"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="heatmap-avg-row">
                  <td colspan="2" class="heatmap-avg-lbl"><strong>Среднее</strong></td>
                  <td v-for="c in critAvgs" :key="c.label" class="ht-cell">
                    <span class="ht-chip" :style="{ background: cellColor(c.avg).bg, color: cellColor(c.avg).color }">
                      {{ c.avg }}%
                    </span>
                  </td>
                  <td class="ht-total-td">
                    <span class="ht-total-val" :class="scoreClass(summary.avgScore)">{{ summary.avgScore }}%</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- ── Detailed table ── -->
        <div class="av-card detail-card">
          <div class="detail-head">
            <div class="block-title" style="margin-bottom:0;"><i class="pi pi-list"></i> Детальные результаты</div>
            <button class="export-btn" @click="exportCSV"><i class="pi pi-download"></i> Экспорт CSV</button>
          </div>
          <div style="overflow-x:auto;">
            <table class="detail-table">
              <thead>
                <tr>
                  <th style="width:32px;"></th>
                  <th class="sortable" @click="sortBy('name')">
                    Сотрудник <i class="pi" :class="sortField==='name'?(sortAsc?'pi-sort-up':'pi-sort-down'):'pi-sort'"></i>
                  </th>
                  <th>Салон</th>
                  <th>Звонков</th>
                  <th class="sortable" @click="sortBy('score')">
                    Балл <i class="pi" :class="sortField==='score'?(sortAsc?'pi-sort-up':'pi-sort-down'):'pi-sort'"></i>
                  </th>
                  <th class="sortable" @click="sortBy('prev')">
                    Пред. период <i class="pi" :class="sortField==='prev'?(sortAsc?'pi-sort-up':'pi-sort-down'):'pi-sort'"></i>
                  </th>
                  <th>Изменение</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="e in employees" :key="e.name">
                  <tr class="detail-row" :class="scoreClass(e.score)" @click="toggleExpand(e.name)">
                    <td class="expand-cell">
                      <i class="pi" :class="expanded[e.name] ? 'pi-chevron-down' : 'pi-chevron-right'"></i>
                    </td>
                    <td class="emp-cell">
                      <div class="emp-av sm" :class="scoreClass(e.score)">{{ e.name[0] }}</div>
                      <span>{{ e.name }}</span>
                    </td>
                    <td class="muted">{{ e.salon }}</td>
                    <td class="muted">{{ e.calls }}</td>
                    <td>
                      <div class="score-cell">
                        <span class="score-num" :class="scoreClass(e.score)">{{ e.score }}%</span>
                        <div class="score-bar-bg">
                          <div class="score-bar-fill" :class="scoreClass(e.score)" :style="{ width: e.score + '%' }"></div>
                        </div>
                      </div>
                    </td>
                    <td class="muted">{{ e.prev }}%</td>
                    <td>
                      <span class="diff-badge" :class="diffClass(e.score - e.prev)">
                        <i class="pi" :class="e.score>e.prev?'pi-arrow-up':e.score<e.prev?'pi-arrow-down':'pi-minus'"></i>
                        {{ e.score > e.prev ? '+' : '' }}{{ e.score - e.prev }}%
                      </span>
                    </td>
                    <td>
                      <span class="status-badge" :class="scoreClass(e.score)">
                        <i class="pi" :class="e.score>=80?'pi-check':e.score>=65?'pi-exclamation-triangle':'pi-times'"></i>
                        {{ e.score >= 80 ? 'Норма' : e.score >= 65 ? 'Замечание' : 'Нарушение' }}
                      </span>
                    </td>
                  </tr>

                  <!-- Expanded call rows -->
                  <transition name="slide">
                    <tr v-if="expanded[e.name]" class="expand-row">
                      <td colspan="8">
                        <div class="call-expand">
                          <div class="call-expand-title">Звонки, вошедшие в проверку</div>
                          <table class="call-table">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Дата</th>
                                <th>Балл</th>
                                <th>Нарушения</th>
                                <th>Статус</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="cr in e.callRows" :key="cr.id">
                                <td class="call-id">{{ cr.id }}</td>
                                <td class="muted">{{ cr.date }}</td>
                                <td>
                                  <span class="score-chip-sm" :class="callStatusClass(cr.score)">{{ cr.score }}%</span>
                                </td>
                                <td>
                                  <template v-if="cr.failed.length">
                                    <span v-for="f in cr.failed" :key="f" class="fail-chip">
                                      {{ scenario?.critLabels[scenario.critKeys.indexOf(f)] ?? f }}
                                    </span>
                                  </template>
                                  <span v-else class="no-fail">Нарушений нет</span>
                                </td>
                                <td>
                                  <span class="status-badge sm" :class="callStatusClass(cr.score)">
                                    {{ cr.score >= 80 ? 'Норма' : cr.score >= 65 ? 'Замечание' : 'Нарушение' }}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </transition>
                </template>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </transition>

  </div>
</template>

<style scoped>
.gp-page { display: flex; flex-direction: column; gap: 16px; }

/* ── Config ── */
.config-card { padding: 18px 22px; display: flex; flex-direction: column; gap: 14px; }
.config-top { display: flex; flex-direction: column; gap: 6px; }
.config-title { font-size: 16px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; }
.config-title i { color: var(--brand); }
.config-desc { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--text-muted); }
.sdept-badge {
  display: inline-flex; align-items: center; gap: 5px;
  background: var(--brand-light); color: var(--brand);
  border: 1px solid var(--border); border-radius: 8px;
  padding: 3px 10px; font-size: 11px; font-weight: 600; white-space: nowrap;
}
.config-row { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.config-field { display: flex; flex-direction: column; gap: 4px; }
.cf-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); }

/* ── Summary strip ── */
.summary-strip {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;
}
.scard {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 14px 18px; box-shadow: var(--shadow-sm);
}
.scard-val { font-size: 22px; font-weight: 700; color: var(--text); line-height: 1.1; }
.scard-val.ok  { color: #16a34a; }
.scard-val.warn { color: #d97706; }
.scard-val.bad  { color: #dc2626; }
.scard-val.up   { color: #16a34a; }
.scard-val.dn   { color: #dc2626; }
.scard-val.eq   { color: var(--text-muted); }
.scard-lbl { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
.scard-dist { display: flex; flex-direction: column; justify-content: center; gap: 5px; }
.dist-row { display: flex; align-items: center; gap: 7px; }
.dist-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dist-dot.ok   { background: #16a34a; }
.dist-dot.warn { background: #d97706; }
.dist-dot.bad  { background: #dc2626; }
.dist-count { font-size: 15px; font-weight: 700; min-width: 22px; }
.dist-count.ok   { color: #16a34a; }
.dist-count.warn { color: #d97706; }
.dist-count.bad  { color: #dc2626; }
.dist-lbl { font-size: 11px; color: var(--text-muted); }

/* ── Mid row ── */
.mid-row { display: grid; grid-template-columns: 1fr 360px; gap: 16px; }
.chart-card { padding: 16px 18px; }
.insights-card { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
.block-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: flex; align-items: center; gap: 7px; margin-bottom: 12px; }
.block-sub-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); margin-bottom: 8px; }

.insight-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 12px; border-radius: 10px;
}
.insight-item.best   { background: #f0fdf4; }
.insight-item.worst  { background: #fff7ed; }
.insight-item.info   { background: var(--brand-light); }
.insight-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
.insight-item.best  .insight-icon { color: #16a34a; }
.insight-item.worst .insight-icon { color: #d97706; }
.insight-item.info  .insight-icon { color: var(--brand); }
.insight-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); }
.insight-val   { font-size: 13px; font-weight: 700; color: var(--text); margin-top: 1px; }
.insight-sub   { font-size: 11px; color: var(--text-muted); }

.insight-rec {
  background: var(--surface-alt); border: 1px solid var(--border); border-radius: 8px;
  padding: 10px 12px; font-size: 11px; color: var(--text-muted); line-height: 1.5;
  display: flex; gap: 8px; align-items: flex-start;
}
.insight-rec i { color: var(--brand); margin-top: 1px; flex-shrink: 0; }

.crit-avgs { display: flex; flex-direction: column; gap: 7px; }
.crit-avg-row { display: flex; align-items: center; gap: 8px; }
.crit-avg-lbl { font-size: 11px; color: var(--text); min-width: 100px; flex-shrink: 0; }
.crit-avg-bar-bg { flex: 1; height: 6px; background: var(--border); border-radius: 99px; overflow: hidden; }
.crit-avg-bar-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
.crit-avg-pct { font-size: 11px; font-weight: 700; min-width: 34px; text-align: right; }

/* ── Heatmap ── */
.heatmap-card { padding: 16px 18px; }
.heatmap-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.heatmap-table thead th {
  padding: 8px 10px; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--text-muted); background: var(--surface-alt);
  border-bottom: 2px solid var(--border); text-align: center;
}
.ht-emp-th, .ht-sal-th { text-align: left !important; }
.heatmap-table tbody td { padding: 8px 10px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.heatmap-table tfoot td { padding: 8px 10px; background: #f0f7fb; border-top: 2px solid var(--brand); }
.ht-emp-td { min-width: 160px; }
.ht-sal-td { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
.ht-cell { text-align: center; }
.ht-chip { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 7px; }
.ht-total-td { min-width: 120px; }
.ht-total-wrap { display: flex; flex-direction: column; gap: 4px; }
.ht-total-val { font-size: 12px; font-weight: 700; }
.ht-total-val.ok   { color: #16a34a; }
.ht-total-val.warn { color: #d97706; }
.ht-total-val.bad  { color: #dc2626; }
.ht-bar-bg { height: 4px; background: var(--border); border-radius: 99px; overflow: hidden; }
.ht-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s; }
.ht-bar-fill.ok   { background: #16a34a; }
.ht-bar-fill.warn { background: #f59e0b; }
.ht-bar-fill.bad  { background: #ef4444; }
.heatmap-avg-lbl { text-align: left; }
.emp-row { display: flex; align-items: center; gap: 8px; }
.emp-av {
  width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0;
  background: var(--brand); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700;
}

/* ── Detail table ── */
.detail-card { overflow: hidden; }
.detail-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px 0; margin-bottom: 10px; }
.export-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 500;
  border: 1px solid var(--border); background: var(--surface-alt); color: var(--text);
  cursor: pointer; transition: 0.15s;
}
.export-btn:hover { background: var(--border); }

.detail-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.detail-table thead th {
  padding: 10px 12px; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--text-muted); background: var(--surface-alt);
  border-bottom: 2px solid var(--border); text-align: left; white-space: nowrap;
}
.detail-table tbody td { padding: 11px 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.sortable { cursor: pointer; user-select: none; }
.sortable:hover { color: var(--brand) !important; }
.detail-row { cursor: pointer; transition: background 0.1s; }
.detail-row:hover { background: var(--surface-alt); }
.expand-cell { width: 32px; color: var(--text-muted); font-size: 11px; }

.emp-cell { display: flex; align-items: center; gap: 8px; font-weight: 600; min-width: 160px; }
.emp-av.sm { width: 24px; height: 24px; font-size: 9px; }
.emp-av.sm.ok   { background: #16a34a; }
.emp-av.sm.warn { background: #d97706; }
.emp-av.sm.bad  { background: #dc2626; }

.muted { color: var(--text-muted); font-size: 12px; }
.score-cell { display: flex; flex-direction: column; gap: 3px; min-width: 100px; }
.score-num { font-size: 13px; font-weight: 700; }
.score-num.ok   { color: #16a34a; }
.score-num.warn { color: #d97706; }
.score-num.bad  { color: #dc2626; }
.score-bar-bg { height: 4px; background: var(--border); border-radius: 99px; overflow: hidden; width: 80px; }
.score-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s; }
.score-bar-fill.ok   { background: #16a34a; }
.score-bar-fill.warn { background: #f59e0b; }
.score-bar-fill.bad  { background: #ef4444; }

.diff-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 8px;
}
.diff-badge.up { background: #dcfce7; color: #16a34a; }
.diff-badge.dn { background: #fee2e2; color: #dc2626; }
.diff-badge.eq { background: var(--surface-alt); color: var(--text-muted); }
.diff-badge i  { font-size: 9px; }

.status-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 20px;
}
.status-badge.ok   { background: #dcfce7; color: #16a34a; }
.status-badge.warn { background: #fef3c7; color: #d97706; }
.status-badge.bad  { background: #fee2e2; color: #dc2626; }
.status-badge i    { font-size: 9px; }
.status-badge.sm   { font-size: 10px; padding: 2px 7px; }

/* Expanded call rows */
.expand-row td { padding: 0; }
.call-expand { background: var(--surface-alt); border-top: 1px solid var(--border); padding: 12px 16px 14px 48px; }
.call-expand-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px; }
.call-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.call-table th {
  padding: 6px 10px; font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.03em;
  color: var(--text-muted); border-bottom: 1px solid var(--border);
  text-align: left; background: var(--surface);
}
.call-table td { padding: 7px 10px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.call-table tr:last-child td { border-bottom: none; }
.call-id { font-family: monospace; font-size: 11px; color: var(--text-muted); }
.score-chip-sm { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
.score-chip-sm.ok   { background: #dcfce7; color: #16a34a; }
.score-chip-sm.warn { background: #fef3c7; color: #d97706; }
.score-chip-sm.bad  { background: #fee2e2; color: #dc2626; }
.fail-chip { display: inline-block; font-size: 10px; background: #fee2e2; color: #dc2626; padding: 2px 7px; border-radius: 6px; margin: 2px; }
.no-fail { font-size: 11px; color: #16a34a; }

/* ── Transitions ── */
.results-wrap { display: flex; flex-direction: column; gap: 16px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s, transform 0.2s; }
.fade-enter-from { opacity: 0; transform: translateY(8px); }

.slide-enter-active, .slide-leave-active { transition: max-height 0.2s ease, opacity 0.15s; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; }
.slide-enter-to, .slide-leave-from { max-height: 600px; opacity: 1; }

@media (max-width: 1100px) {
  .mid-row { grid-template-columns: 1fr; }
  .summary-strip { grid-template-columns: repeat(3, 1fr); }
}
</style>
