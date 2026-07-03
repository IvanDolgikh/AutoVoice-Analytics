<script setup>
import { ref, computed, reactive } from 'vue'

// ── Department tabs ───────────────────────────────────────────────────────────
const deptTabs = [
  { key: null,        label: 'Все',         icon: 'pi-th-large' },
  { key: 'operators', label: 'Операторы',   icon: 'pi-headphones' },
  { key: 'sales',     label: 'Продажи',     icon: 'pi-car' },
  { key: 'service',   label: 'Сервис',      icon: 'pi-wrench' }
]
const activeDept  = ref(null)
const searchQuery = ref('')

// ── Criteria pool ─────────────────────────────────────────────────────────────
const allCriteria = [
  { key: 'greeting',    label: 'Приветствие' },
  { key: 'name',        label: 'Обращение по имени' },
  { key: 'needs',       label: 'Выявление потребности' },
  { key: 'deadline',    label: 'Срок покупки' },
  { key: 'testdrive',   label: 'Тест-драйв' },
  { key: 'urgency',     label: 'Создание срочности' },
  { key: 'contact',     label: 'Взял контакт' },
  { key: 'nextcontact', label: 'Следующий контакт' },
  { key: 'docs',        label: 'Документы' },
  { key: 'worklist',    label: 'Перечень работ' },
  { key: 'transfer',    label: 'Конверсия переключений' },
  { key: 'booking',     label: 'Запись на сервис' }
]

// ── Scenarios ─────────────────────────────────────────────────────────────────
const scenarios = reactive([
  {
    id: 1, dept: 'operators', priority: 'high',
    icon: 'pi-chart-line',
    title: 'Отдел операторов — конверсия переключений',
    desc: 'Конверсия: сколько получилось переключить, сколько нет. Оценивается вежливость, скорость ответа и успешность перевода на нужного специалиста.',
    active: true, schedule: 'daily',
    threshold: 70,
    lastRun: '29.06.2026 08:01',
    callsChecked: 48, avgScore: 82, flagged: 6,
    spark: [78, 80, 75, 83, 85, 82, 82],
    history: [
      { date: '29.06', calls: 48, avg: 82, flagged: 6 },
      { date: '28.06', calls: 51, avg: 85, flagged: 4 },
      { date: '27.06', calls: 44, avg: 80, flagged: 7 },
      { date: '26.06', calls: 46, avg: 75, flagged: 9 },
      { date: '25.06', calls: 50, avg: 83, flagged: 5 }
    ],
    criteria: ['greeting', 'name', 'transfer'],
    expanded: false
  },
  {
    id: 2, dept: 'operators', priority: 'medium',
    icon: 'pi-phone',
    title: 'Отдел операторов — качество обработки',
    desc: 'Оценка качества обработки входящих звонков: приветствие по скрипту, обращение по имени, вежливость завершения разговора.',
    active: true, schedule: 'daily',
    threshold: 65,
    lastRun: '29.06.2026 08:03',
    callsChecked: 61, avgScore: 76, flagged: 11,
    spark: [72, 74, 71, 78, 77, 76, 76],
    history: [
      { date: '29.06', calls: 61, avg: 76, flagged: 11 },
      { date: '28.06', calls: 58, avg: 78, flagged: 9  },
      { date: '27.06', calls: 63, avg: 71, flagged: 14 },
      { date: '26.06', calls: 60, avg: 74, flagged: 12 },
      { date: '25.06', calls: 55, avg: 72, flagged: 13 }
    ],
    criteria: ['greeting', 'name'],
    expanded: false
  },
  {
    id: 3, dept: 'sales', priority: 'high',
    icon: 'pi-car',
    title: 'Отдел продаж — полный скрипт',
    desc: 'Полная оценка работы менеджеров по скрипту Changan: приветствие, выявление потребности, тест-драйв, создание срочности, контакт и планирование следующего шага.',
    active: true, schedule: 'daily',
    threshold: 75,
    lastRun: '29.06.2026 09:01',
    callsChecked: 34, avgScore: 79, flagged: 5,
    spark: [74, 77, 80, 78, 81, 79, 79],
    history: [
      { date: '29.06', calls: 34, avg: 79, flagged: 5 },
      { date: '28.06', calls: 37, avg: 81, flagged: 4 },
      { date: '27.06', calls: 31, avg: 78, flagged: 6 },
      { date: '26.06', calls: 33, avg: 77, flagged: 6 },
      { date: '25.06', calls: 36, avg: 74, flagged: 7 }
    ],
    criteria: ['greeting', 'name', 'needs', 'deadline', 'testdrive', 'urgency', 'contact', 'nextcontact'],
    expanded: false
  },
  {
    id: 4, dept: 'service', priority: 'high',
    icon: 'pi-wrench',
    title: 'Отдел сервиса — отработка записей',
    desc: 'Оценка обработки первичных обращений: конверсия к записи, вежливость, уточнение потребности в виде и сроках обслуживания.',
    active: true, schedule: 'weekly',
    threshold: 60,
    lastRun: '28.06.2026 09:02',
    callsChecked: 27, avgScore: 68, flagged: 8,
    spark: [65, 70, 63, 68, 71, 69, 68],
    history: [
      { date: '28.06', calls: 27, avg: 68, flagged: 8 },
      { date: '21.06', calls: 29, avg: 71, flagged: 6 },
      { date: '14.06', calls: 25, avg: 63, flagged: 9 },
      { date: '07.06', calls: 31, avg: 70, flagged: 7 },
      { date: '31.05', calls: 28, avg: 65, flagged: 9 }
    ],
    criteria: ['greeting', 'name', 'needs', 'booking'],
    expanded: false
  },
  {
    id: 5, dept: 'service', priority: 'low',
    icon: 'pi-file-edit',
    title: 'Отдел сервиса — документы и перечень работ',
    desc: 'Оценка: насколько специалист напоминает клиенту о необходимых документах и озвучивает полный перечень предстоящих работ.',
    active: false, schedule: 'manual',
    threshold: 60,
    lastRun: '14.06.2026 10:00',
    callsChecked: 0, avgScore: 0, flagged: 0,
    spark: [55, 58, 0, 0, 0, 0, 0],
    history: [
      { date: '14.06', calls: 18, avg: 58, flagged: 7 },
      { date: '07.06', calls: 21, avg: 55, flagged: 9 }
    ],
    criteria: ['docs', 'worklist'],
    expanded: false
  },
  {
    id: 6, dept: 'service', priority: 'medium',
    icon: 'pi-check-circle',
    title: 'Отдел сервиса — успешные и неуспешные записи',
    desc: 'Классификация итогов звонков на сервис: успешная/неуспешная запись. Анализ причин отказов и разработка рекомендаций.',
    active: true, schedule: 'daily',
    threshold: 50,
    lastRun: '29.06.2026 10:01',
    callsChecked: 19, avgScore: 71, flagged: 4,
    spark: [67, 70, 73, 71, 69, 72, 71],
    history: [
      { date: '29.06', calls: 19, avg: 71, flagged: 4 },
      { date: '28.06', calls: 22, avg: 73, flagged: 3 },
      { date: '27.06', calls: 20, avg: 69, flagged: 5 },
      { date: '26.06', calls: 18, avg: 70, flagged: 4 },
      { date: '25.06', calls: 21, avg: 67, flagged: 6 }
    ],
    criteria: ['booking', 'needs'],
    expanded: false
  },
  {
    id: 7, dept: 'service', priority: 'medium',
    icon: 'pi-chart-bar',
    title: 'Эффективность исходящих звонков сервис',
    desc: 'Анализ эффективности инициативных звонков по записи на ТО и ремонт. Конверсия, причины отказов, сравнение по операторам.',
    active: true, schedule: 'weekly',
    threshold: 55,
    lastRun: '23.06.2026 11:03',
    callsChecked: 23, avgScore: 63, flagged: 7,
    spark: [60, 63, 58, 65, 63, 61, 63],
    history: [
      { date: '23.06', calls: 23, avg: 63, flagged: 7 },
      { date: '16.06', calls: 26, avg: 61, flagged: 8 },
      { date: '09.06', calls: 24, avg: 65, flagged: 6 },
      { date: '02.06', calls: 28, avg: 58, flagged: 9 },
      { date: '26.05', calls: 20, avg: 60, flagged: 8 }
    ],
    criteria: ['booking', 'contact', 'nextcontact'],
    expanded: false
  }
])

// ── Filtering ─────────────────────────────────────────────────────────────────
const filtered = computed(() => {
  let list = scenarios
  if (activeDept.value) list = list.filter(s => s.dept === activeDept.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(s => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q))
  }
  return list
})

// ── Global stats ──────────────────────────────────────────────────────────────
const globalStats = computed(() => {
  const active   = scenarios.filter(s => s.active)
  const inactive = scenarios.filter(s => !s.active)
  const totalCalls   = active.reduce((s, sc) => s + sc.callsChecked, 0)
  const totalFlagged = active.reduce((s, sc) => s + sc.flagged, 0)
  const withScore    = active.filter(sc => sc.avgScore > 0)
  const avgScore     = withScore.length ? Math.round(withScore.reduce((s, sc) => s + sc.avgScore, 0) / withScore.length) : 0
  return { active: active.length, inactive: inactive.length, totalCalls, totalFlagged, avgScore }
})

// ── Helpers ───────────────────────────────────────────────────────────────────
const deptInfo = {
  operators: { label: 'Операторы', color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd' },
  sales:     { label: 'Продажи',   color: '#0b5e7e', bg: '#e3f2f9', border: '#93c5dc' },
  service:   { label: 'Сервис',    color: '#c2410c', bg: '#fff1ed', border: '#fdba74' }
}
const priorityInfo = {
  high:   { label: 'Высокий',  color: '#dc2626', bg: '#fee2e2' },
  medium: { label: 'Средний',  color: '#d97706', bg: '#fef3c7' },
  low:    { label: 'Низкий',   color: '#16a34a', bg: '#dcfce7' }
}
const scheduleLabels = {
  daily:  'Ежедневно в 09:00',
  weekly: 'Еженедельно, пн 09:00',
  manual: 'Не запланировано'
}

function criteriaLabel(key) {
  return allCriteria.find(c => c.key === key)?.label ?? key
}

function sparkPath(data) {
  const valid = data.filter(v => v > 0)
  if (valid.length < 2) return ''
  const w = 90, h = 30
  const min = Math.max(0, Math.min(...valid) - 8)
  const max = Math.min(100, Math.max(...valid) + 8)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = v === 0 ? h : h - ((v - min) / (max - min)) * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return 'M ' + pts.join(' L ')
}

function scoreClass(v) {
  return v >= 75 ? 'high' : v >= 55 ? 'mid' : 'low'
}

function toggleActive(sc) { sc.active = !sc.active }
function toggleExpand(sc) { sc.expanded = !sc.expanded }

function runNow(sc) {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  sc.lastRun = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

function toggleScenarioCriteria(sc, key) {
  const idx = sc.criteria.indexOf(key)
  if (idx > -1) sc.criteria.splice(idx, 1)
  else sc.criteria.push(key)
}

// ── Create panel ──────────────────────────────────────────────────────────────
const showCreate = ref(false)
const newSc = reactive({
  title: '', dept: 'sales', priority: 'medium',
  schedule: 'daily', threshold: 70, criteria: []
})

function toggleNewCriteria(key) {
  const idx = newSc.criteria.indexOf(key)
  if (idx > -1) newSc.criteria.splice(idx, 1)
  else newSc.criteria.push(key)
}

function saveNew() {
  if (!newSc.title.trim()) return
  scenarios.push({
    id: Date.now(),
    dept: newSc.dept, priority: newSc.priority,
    icon: 'pi-plus-circle',
    title: newSc.title,
    desc: 'Новый сценарий проверки. Настройте критерии и запустите.',
    active: false, schedule: newSc.schedule,
    threshold: newSc.threshold,
    lastRun: '—', callsChecked: 0, avgScore: 0, flagged: 0,
    spark: [0, 0, 0, 0, 0, 0, 0], history: [],
    criteria: [...newSc.criteria], expanded: false
  })
  showCreate.value = false
  Object.assign(newSc, { title: '', dept: 'sales', priority: 'medium', schedule: 'daily', threshold: 70, criteria: [] })
}
</script>

<template>
  <div class="av-page sc-page">

    <!-- ── Header ── -->
    <div class="sc-header">
      <div class="sc-header-left">
        <div class="sc-title">Сценарии проверки</div>
        <div class="sc-sub">Настройте, запустите и отслеживайте сценарии анализа звонков</div>
      </div>
      <div class="sc-global-stats">
        <div class="gstat">
          <span class="gstat-val">{{ globalStats.active }}</span>
          <span class="gstat-lbl">Активных</span>
        </div>
        <div class="gstat-div"></div>
        <div class="gstat">
          <span class="gstat-val" style="color:var(--text-muted)">{{ globalStats.inactive }}</span>
          <span class="gstat-lbl">Неактивных</span>
        </div>
        <div class="gstat-div"></div>
        <div class="gstat">
          <span class="gstat-val" style="color:var(--brand)">{{ globalStats.totalCalls }}</span>
          <span class="gstat-lbl">Звонков сегодня</span>
        </div>
        <div class="gstat-div"></div>
        <div class="gstat">
          <span class="gstat-val" :class="scoreClass(globalStats.avgScore)">{{ globalStats.avgScore }}%</span>
          <span class="gstat-lbl">Средний балл</span>
        </div>
        <div class="gstat-div"></div>
        <div class="gstat">
          <span class="gstat-val" style="color:#dc2626">{{ globalStats.totalFlagged }}</span>
          <span class="gstat-lbl">Нарушений</span>
        </div>
      </div>
      <button class="create-btn" @click="showCreate = true">
        <i class="pi pi-plus"></i> Создать сценарий
      </button>
    </div>

    <!-- ── Filter bar ── -->
    <div class="sc-filterbar">
      <div class="dept-tabs">
        <button
          v-for="tab in deptTabs" :key="tab.key"
          class="dept-tab"
          :class="{ active: activeDept === tab.key }"
          @click="activeDept = tab.key"
        >
          <i :class="['pi', tab.icon]"></i>
          {{ tab.label }}
          <span v-if="tab.key" class="dept-count">
            {{ scenarios.filter(s => s.dept === tab.key).length }}
          </span>
          <span v-else class="dept-count">{{ scenarios.length }}</span>
        </button>
      </div>
      <div class="sc-search">
        <i class="pi pi-search sc-search-icon"></i>
        <input v-model="searchQuery" placeholder="Поиск по сценариям..." class="sc-search-input" />
      </div>
    </div>

    <!-- ── No results ── -->
    <div v-if="!filtered.length" class="sc-empty">
      <i class="pi pi-inbox" style="font-size:28px;opacity:0.3;"></i>
      <span>Сценарии не найдены</span>
    </div>

    <!-- ── Scenario cards ── -->
    <div class="sc-list">
      <div
        v-for="sc in filtered"
        :key="sc.id"
        class="sc-card"
        :class="{ inactive: !sc.active, expanded: sc.expanded }"
        :style="{ '--dept-color': deptInfo[sc.dept].color, '--dept-border': deptInfo[sc.dept].border }"
      >
        <!-- Main row -->
        <div class="sc-main">

          <!-- Icon -->
          <div class="sc-icon" :style="{ background: deptInfo[sc.dept].bg, color: deptInfo[sc.dept].color }">
            <i :class="['pi', sc.icon]"></i>
          </div>

          <!-- Content -->
          <div class="sc-content">

            <!-- Title row -->
            <div class="sc-title-row">
              <span class="sc-name">{{ sc.title }}</span>
              <span class="dept-badge" :style="{ background: deptInfo[sc.dept].bg, color: deptInfo[sc.dept].color, borderColor: deptInfo[sc.dept].border }">
                {{ deptInfo[sc.dept].label }}
              </span>
              <span class="priority-badge" :style="{ background: priorityInfo[sc.priority].bg, color: priorityInfo[sc.priority].color }">
                {{ priorityInfo[sc.priority].label }}
              </span>
            </div>

            <!-- Description -->
            <div class="sc-desc">{{ sc.desc }}</div>

            <!-- Stats strip -->
            <div class="sc-stats-strip">
              <div class="sc-stat">
                <i class="pi pi-clock"></i>
                <span>{{ sc.lastRun }}</span>
              </div>
              <div class="sc-stat-sep"></div>
              <div class="sc-stat">
                <i class="pi pi-phone"></i>
                <span>{{ sc.callsChecked }} звонков</span>
              </div>
              <div class="sc-stat-sep"></div>
              <div class="sc-stat">
                <i class="pi pi-star"></i>
                <span :class="['sc-score', scoreClass(sc.avgScore)]">
                  {{ sc.avgScore > 0 ? sc.avgScore + '%' : '—' }}
                </span>
              </div>
              <div class="sc-stat-sep"></div>
              <div class="sc-stat">
                <i class="pi pi-exclamation-triangle" style="color:#dc2626;"></i>
                <span style="color:#dc2626;font-weight:600;">{{ sc.flagged }} нарушений</span>
              </div>
              <div class="sc-stat-sep"></div>
              <div class="sc-stat">
                <i class="pi pi-calendar"></i>
                <span>{{ scheduleLabels[sc.schedule] }}</span>
              </div>
            </div>

            <!-- Criteria chips -->
            <div class="sc-criteria-row">
              <span
                v-for="key in sc.criteria" :key="key"
                class="sc-crit-chip"
              >{{ criteriaLabel(key) }}</span>
            </div>

          </div>

          <!-- Right: sparkline + toggle + actions -->
          <div class="sc-right">

            <!-- Sparkline -->
            <div class="sc-spark-wrap">
              <div class="sc-spark-label">7 дней</div>
              <svg width="90" height="30" class="sc-spark">
                <path
                  :d="sparkPath(sc.spark)"
                  fill="none"
                  :stroke="sc.active ? deptInfo[sc.dept].color : '#94a3b8'"
                  stroke-width="2"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                />
              </svg>
              <div class="sc-spark-range" v-if="sc.spark.some(v=>v>0)">
                <span>{{ Math.min(...sc.spark.filter(v=>v>0)) }}%</span>
                <span>{{ Math.max(...sc.spark) }}%</span>
              </div>
            </div>

            <!-- Active toggle -->
            <div class="sc-toggle-wrap" @click.stop="toggleActive(sc)">
              <div class="sc-toggle" :class="{ on: sc.active }">
                <div class="sc-toggle-knob"></div>
              </div>
              <span class="sc-toggle-label">{{ sc.active ? 'Активен' : 'Выкл.' }}</span>
            </div>

          </div>

        </div>

        <!-- Actions row -->
        <div class="sc-actions">
          <button class="sc-btn primary" @click="runNow(sc)" :disabled="!sc.active">
            <i class="pi pi-play"></i> Запустить
          </button>
          <button class="sc-btn" @click="toggleExpand(sc)">
            <i class="pi" :class="sc.expanded ? 'pi-chevron-up' : 'pi-sliders-h'"></i>
            {{ sc.expanded ? 'Свернуть' : 'Настроить' }}
          </button>
          <button class="sc-btn" :class="sc.active ? 'warn' : 'success'" @click="toggleActive(sc)">
            <i class="pi" :class="sc.active ? 'pi-ban' : 'pi-power-off'"></i>
            {{ sc.active ? 'В архив' : 'Активировать' }}
          </button>
          <div class="sc-threshold-inline">
            <i class="pi pi-filter" style="font-size:11px;"></i>
            Порог:
            <span class="threshold-val" :class="scoreClass(sc.threshold)">{{ sc.threshold }}%</span>
          </div>
        </div>

        <!-- Expanded panel -->
        <transition name="slide">
          <div v-if="sc.expanded" class="sc-expand">

            <div class="expand-grid">

              <!-- Criteria editor -->
              <div class="expand-block">
                <div class="expand-block-title"><i class="pi pi-list-check"></i> Критерии проверки</div>
                <div class="criteria-grid">
                  <label
                    v-for="crit in allCriteria" :key="crit.key"
                    class="crit-toggle"
                    :class="{ checked: sc.criteria.includes(crit.key) }"
                    @click="toggleScenarioCriteria(sc, crit.key)"
                  >
                    <span class="crit-check">
                      <i class="pi" :class="sc.criteria.includes(crit.key) ? 'pi-check' : 'pi-plus'"></i>
                    </span>
                    {{ crit.label }}
                  </label>
                </div>
              </div>

              <!-- Settings -->
              <div class="expand-block">
                <div class="expand-block-title"><i class="pi pi-cog"></i> Настройки</div>
                <div class="settings-list">
                  <div class="setting-row">
                    <span class="setting-label">Порог срабатывания</span>
                    <div class="threshold-control">
                      <input
                        type="range" min="30" max="95" step="5"
                        v-model.number="sc.threshold"
                        class="threshold-slider"
                      />
                      <span class="threshold-val" :class="scoreClass(sc.threshold)">{{ sc.threshold }}%</span>
                    </div>
                  </div>
                  <div class="setting-row">
                    <span class="setting-label">Расписание</span>
                    <div class="schedule-btns">
                      <button
                        v-for="(lbl, key) in scheduleLabels" :key="key"
                        class="sch-btn"
                        :class="{ active: sc.schedule === key }"
                        @click="sc.schedule = key"
                      >{{ lbl }}</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Run history -->
              <div class="expand-block full-width">
                <div class="expand-block-title"><i class="pi pi-history"></i> История запусков</div>
                <table class="history-table" v-if="sc.history.length">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Звонков</th>
                      <th>Средний балл</th>
                      <th>Нарушений</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="h in sc.history" :key="h.date">
                      <td>{{ h.date }}</td>
                      <td>{{ h.calls }}</td>
                      <td>
                        <span class="hist-score" :class="scoreClass(h.avg)">{{ h.avg }}%</span>
                      </td>
                      <td>
                        <span class="hist-flag" v-if="h.flagged > 0">
                          <i class="pi pi-exclamation-triangle"></i> {{ h.flagged }}
                        </span>
                        <span v-else style="color:var(--text-muted)">—</span>
                      </td>
                      <td>
                        <span class="hist-status" :class="h.avg >= sc.threshold ? 'ok' : 'fail'">
                          {{ h.avg >= sc.threshold ? 'Норма' : 'Ниже порога' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-else class="hist-empty">Запусков пока не было</div>
              </div>

            </div>

          </div>
        </transition>

      </div>
    </div>

    <!-- ── Create panel overlay ── -->
    <transition name="drawer">
      <div v-if="showCreate" class="drawer-overlay" @click.self="showCreate = false">
        <div class="drawer">
          <div class="drawer-header">
            <div class="drawer-title"><i class="pi pi-plus-circle"></i> Создать сценарий</div>
            <button class="drawer-close" @click="showCreate = false"><i class="pi pi-times"></i></button>
          </div>

          <div class="drawer-body">

            <div class="form-group">
              <label class="form-label">Название сценария</label>
              <input v-model="newSc.title" class="form-input" placeholder="Например: Отдел продаж — скрипт 2025" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Отдел</label>
                <div class="radio-group">
                  <label v-for="(info, key) in deptInfo" :key="key" class="radio-opt" :class="{ active: newSc.dept === key }" @click="newSc.dept = key">
                    <span :style="{ color: info.color }">{{ info.label }}</span>
                  </label>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Приоритет</label>
                <div class="radio-group">
                  <label v-for="(info, key) in priorityInfo" :key="key" class="radio-opt" :class="{ active: newSc.priority === key }" @click="newSc.priority = key">
                    <span :style="{ color: info.color }">{{ info.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Критерии проверки</label>
              <div class="criteria-grid">
                <label
                  v-for="crit in allCriteria" :key="crit.key"
                  class="crit-toggle"
                  :class="{ checked: newSc.criteria.includes(crit.key) }"
                  @click="toggleNewCriteria(crit.key)"
                >
                  <span class="crit-check">
                    <i class="pi" :class="newSc.criteria.includes(crit.key) ? 'pi-check' : 'pi-plus'"></i>
                  </span>
                  {{ crit.label }}
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Порог срабатывания: <strong>{{ newSc.threshold }}%</strong></label>
              <input type="range" min="30" max="95" step="5" v-model.number="newSc.threshold" class="threshold-slider" style="width:100%;"/>
              <div class="threshold-hints"><span>30%</span><span>62%</span><span>95%</span></div>
            </div>

            <div class="form-group">
              <label class="form-label">Расписание</label>
              <div class="schedule-btns">
                <button v-for="(lbl, key) in scheduleLabels" :key="key" class="sch-btn" :class="{ active: newSc.schedule === key }" @click="newSc.schedule = key">
                  {{ lbl }}
                </button>
              </div>
            </div>

          </div>

          <div class="drawer-footer">
            <button class="sc-btn" @click="showCreate = false">Отмена</button>
            <button class="sc-btn primary" :disabled="!newSc.title.trim()" @click="saveNew">
              <i class="pi pi-check"></i> Создать
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.sc-page { display: flex; flex-direction: column; gap: 16px; }

/* ── Header ── */
.sc-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 16px;
}
.sc-title { font-size: 18px; font-weight: 700; color: var(--text); }
.sc-sub   { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

.sc-global-stats {
  display: flex; align-items: center; gap: 0;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 10px 20px; gap: 20px;
  box-shadow: var(--shadow-sm);
}
.gstat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.gstat-val { font-size: 18px; font-weight: 700; color: var(--text); line-height: 1; }
.gstat-val.high { color: #16a34a; }
.gstat-val.mid  { color: #d97706; }
.gstat-val.low  { color: #dc2626; }
.gstat-lbl { font-size: 10px; color: var(--text-muted); white-space: nowrap; }
.gstat-div { width: 1px; height: 32px; background: var(--border); }

.create-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 18px; border-radius: 10px;
  background: var(--brand); color: white;
  border: none; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: 0.15s;
  white-space: nowrap;
}
.create-btn:hover { background: var(--brand-dark); }

/* ── Filter bar ── */
.sc-filterbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.dept-tabs { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 4px; }
.dept-tab {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 7px; font-size: 12px; font-weight: 500;
  border: none; background: transparent; color: var(--text-muted); cursor: pointer; transition: 0.15s;
}
.dept-tab.active { background: var(--brand); color: white; }
.dept-tab:not(.active):hover { background: var(--surface-alt); color: var(--text); }
.dept-count {
  background: var(--border); color: var(--text-muted);
  font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 20px;
}
.dept-tab.active .dept-count { background: rgba(255,255,255,0.2); color: white; }

.sc-search { position: relative; }
.sc-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 12px; color: var(--text-muted); pointer-events: none; }
.sc-search-input {
  padding: 8px 12px 8px 32px; border: 1px solid var(--border); border-radius: 9px;
  font-size: 13px; color: var(--text); background: var(--surface); outline: none; width: 220px;
}
.sc-search-input:focus { border-color: var(--accent); }

/* ── Empty state ── */
.sc-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px; color: var(--text-muted); }

/* ── Card ── */
.sc-card {
  background: var(--surface); border-radius: var(--radius);
  border: 1px solid var(--border);
  border-left: 4px solid var(--dept-color, var(--brand));
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.15s;
  overflow: hidden;
}
.sc-card:hover { box-shadow: var(--shadow-md); }
.sc-card.inactive { border-left-color: #94a3b8; opacity: 0.85; }

.sc-main { display: flex; gap: 14px; align-items: flex-start; padding: 16px 18px 0; }

.sc-icon {
  width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}

.sc-content { flex: 1; min-width: 0; }

.sc-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 5px; }
.sc-name { font-size: 14px; font-weight: 700; color: var(--text); }

.dept-badge, .priority-badge {
  font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
  border: 1px solid transparent; white-space: nowrap;
}
.dept-badge { border-width: 1px; }

.sc-desc { font-size: 12px; color: var(--text-muted); line-height: 1.5; margin-bottom: 8px; }

.sc-stats-strip {
  display: flex; align-items: center; flex-wrap: wrap; gap: 0;
  background: var(--surface-alt); border-radius: 8px;
  padding: 7px 12px; margin-bottom: 8px;
}
.sc-stat { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-muted); padding: 0 10px; }
.sc-stat:first-child { padding-left: 0; }
.sc-stat i { font-size: 10px; }
.sc-stat-sep { width: 1px; height: 14px; background: var(--border); }
.sc-score { font-weight: 700; }
.sc-score.high { color: #16a34a; }
.sc-score.mid  { color: #d97706; }
.sc-score.low  { color: #dc2626; }

.sc-criteria-row { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 4px; }
.sc-crit-chip {
  font-size: 10px; font-weight: 500; padding: 3px 8px; border-radius: 20px;
  background: var(--brand-light); color: var(--brand); border: 1px solid var(--border);
}

/* Right panel */
.sc-right { display: flex; flex-direction: column; align-items: center; gap: 10px; flex-shrink: 0; padding-top: 4px; }

.sc-spark-wrap { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.sc-spark-label { font-size: 9px; color: var(--text-muted); text-align: center; }
.sc-spark { display: block; }
.sc-spark-range { display: flex; justify-content: space-between; width: 90px; font-size: 9px; color: var(--text-muted); }

.sc-toggle-wrap { display: flex; align-items: center; gap: 6px; cursor: pointer; }
.sc-toggle {
  width: 36px; height: 20px; border-radius: 10px; background: #cbd5e1;
  position: relative; transition: background 0.2s; flex-shrink: 0;
}
.sc-toggle.on { background: var(--brand); }
.sc-toggle-knob {
  position: absolute; top: 2px; left: 2px;
  width: 16px; height: 16px; border-radius: 50%; background: white;
  transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.sc-toggle.on .sc-toggle-knob { transform: translateX(16px); }
.sc-toggle-label { font-size: 11px; font-weight: 600; color: var(--text-muted); white-space: nowrap; }

/* Actions row */
.sc-actions { display: flex; align-items: center; gap: 8px; padding: 10px 18px 12px; flex-wrap: wrap; }
.sc-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 14px; border-radius: 8px;
  font-size: 12px; font-weight: 500; cursor: pointer; transition: 0.15s;
  border: 1px solid var(--border); background: var(--surface-alt); color: var(--text);
}
.sc-btn:hover { background: var(--border); }
.sc-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.sc-btn.primary { background: var(--brand); color: white; border-color: var(--brand); }
.sc-btn.primary:hover:not(:disabled) { background: var(--brand-dark); }
.sc-btn.warn { background: #fff1ed; color: #c2410c; border-color: #fdba74; }
.sc-btn.warn:hover { background: #fee2e2; }
.sc-btn.success { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
.sc-btn.success:hover { background: #dcfce7; }

.sc-threshold-inline {
  margin-left: auto; display: flex; align-items: center; gap: 5px;
  font-size: 11px; color: var(--text-muted);
}
.threshold-val { font-weight: 700; }
.threshold-val.high { color: #16a34a; }
.threshold-val.mid  { color: #d97706; }
.threshold-val.low  { color: #dc2626; }

/* ── Expanded panel ── */
.sc-expand {
  border-top: 1px solid var(--border);
  background: var(--surface-alt);
  padding: 16px 18px;
}
.expand-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
}
.expand-block { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px; }
.expand-block.full-width { grid-column: 1 / -1; }
.expand-block-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }

.criteria-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.crit-toggle {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 500;
  border: 1px solid var(--border); background: var(--surface-alt); color: var(--text-muted);
  cursor: pointer; transition: 0.15s; user-select: none;
}
.crit-toggle.checked { background: var(--brand-light); border-color: var(--brand); color: var(--brand); }
.crit-check { width: 16px; height: 16px; border-radius: 4px; border: 1px solid currentColor; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.crit-check i { font-size: 8px; }

.settings-list { display: flex; flex-direction: column; gap: 14px; }
.setting-row { display: flex; flex-direction: column; gap: 6px; }
.setting-label { font-size: 11px; font-weight: 600; color: var(--text-muted); }
.threshold-control { display: flex; align-items: center; gap: 10px; }
.threshold-slider { flex: 1; accent-color: var(--brand); }
.schedule-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.sch-btn {
  font-size: 11px; font-weight: 500; padding: 5px 10px; border-radius: 7px;
  border: 1px solid var(--border); background: var(--surface-alt); color: var(--text-muted); cursor: pointer;
}
.sch-btn.active { background: var(--brand-light); border-color: var(--brand); color: var(--brand); font-weight: 700; }

/* History table */
.history-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.history-table thead th {
  padding: 7px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.04em; color: var(--text-muted); border-bottom: 1px solid var(--border);
  text-align: left; background: var(--surface-alt);
}
.history-table tbody td { padding: 8px 12px; border-bottom: 1px solid var(--border); }
.history-table tbody tr:last-child td { border-bottom: none; }
.hist-score { font-weight: 700; padding: 2px 6px; border-radius: 6px; }
.hist-score.high { background: #dcfce7; color: #16a34a; }
.hist-score.mid  { background: #fef3c7; color: #d97706; }
.hist-score.low  { background: #fee2e2; color: #dc2626; }
.hist-flag { color: #dc2626; display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 11px; }
.hist-flag i { font-size: 10px; }
.hist-status { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px; }
.hist-status.ok   { background: #dcfce7; color: #16a34a; }
.hist-status.fail { background: #fee2e2; color: #dc2626; }
.hist-empty { color: var(--text-muted); font-size: 12px; padding: 12px 0; }

/* ── Drawer ── */
.drawer-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 1000;
  display: flex; justify-content: flex-end;
}
.drawer {
  width: 480px; max-width: 95vw; background: var(--surface);
  height: 100vh; display: flex; flex-direction: column;
  box-shadow: -4px 0 24px rgba(0,0,0,0.12);
}
.drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.drawer-title { font-size: 15px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; }
.drawer-title i { color: var(--brand); }
.drawer-close { background: none; border: none; font-size: 14px; color: var(--text-muted); cursor: pointer; padding: 4px; }
.drawer-body { flex: 1; overflow-y: auto; padding: 18px 20px; display: flex; flex-direction: column; gap: 16px; }
.drawer-footer { padding: 14px 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; flex-shrink: 0; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
.form-input {
  padding: 9px 12px; border: 1px solid var(--border); border-radius: 9px;
  font-size: 13px; color: var(--text); background: var(--surface-alt); outline: none;
}
.form-input:focus { border-color: var(--accent); }

.radio-group { display: flex; gap: 6px; flex-wrap: wrap; }
.radio-opt {
  padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border);
  font-size: 12px; font-weight: 500; cursor: pointer; background: var(--surface-alt);
  transition: 0.12s;
}
.radio-opt.active { border-color: var(--brand); background: var(--brand-light); }

.threshold-hints { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); margin-top: 2px; }

/* ── Transitions ── */
.slide-enter-active, .slide-leave-active { transition: max-height 0.25s ease, opacity 0.2s; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; }
.slide-enter-to, .slide-leave-from { max-height: 800px; opacity: 1; }

.drawer-enter-active, .drawer-leave-active { transition: opacity 0.2s; }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform 0.25s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer { transform: translateX(100%); }
.drawer-leave-to .drawer { transform: translateX(100%); }
</style>
