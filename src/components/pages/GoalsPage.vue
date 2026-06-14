<script setup>
import { ref, reactive, computed } from 'vue'

const showForm = ref(false)
const newGoal = reactive({ title: '', metric: '', target: '', current: '', deadline: '', dept: 'sales' })

const depts = [
  { key: 'sales',    label: 'Отдел продаж' },
  { key: 'service',  label: 'Сервис' },
  { key: 'all',      label: 'Вся команда' },
]

const filterDept = ref('all')

const goals = reactive([
  { id:1, title:'Средний балл команды',        metric:'score',    target:85,  current:79,  unit:'%',  deadline:'2026-06-30', dept:'all',     status:'at_risk',   created:'2026-06-01' },
  { id:2, title:'Приветствие — представился',  metric:'greet',    target:95,  current:91,  unit:'%',  deadline:'2026-06-30', dept:'sales',   status:'on_track',  created:'2026-06-01' },
  { id:3, title:'Тест-драйв — предложил',      metric:'testdrive',target:60,  current:40,  unit:'%',  deadline:'2026-06-30', dept:'sales',   status:'at_risk',   created:'2026-06-01' },
  { id:4, title:'Взял контакт',                metric:'contact',  target:75,  current:57,  unit:'%',  deadline:'2026-06-30', dept:'sales',   status:'at_risk',   created:'2026-06-01' },
  { id:5, title:'Создание срочности',          metric:'urgency',  target:40,  current:23,  unit:'%',  deadline:'2026-07-31', dept:'sales',   status:'at_risk',   created:'2026-06-05' },
  { id:6, title:'Имя клиента — узнал',         metric:'name',     target:80,  current:67,  unit:'%',  deadline:'2026-06-30', dept:'all',     status:'on_track',  created:'2026-06-01' },
  { id:7, title:'Следующий контакт',           metric:'next',     target:80,  current:68,  unit:'%',  deadline:'2026-06-30', dept:'service', status:'on_track',  created:'2026-06-01' },
  { id:8, title:'Срок покупки — уточнил',      metric:'timing',   target:50,  current:31,  unit:'%',  deadline:'2026-07-31', dept:'sales',   status:'at_risk',   created:'2026-06-05' },
])

const filtered = computed(() =>
  filterDept.value === 'all' ? goals : goals.filter(g => g.dept === filterDept.value || g.dept === 'all')
)

const summary = computed(() => ({
  total:    goals.length,
  on_track: goals.filter(g => g.status === 'on_track').length,
  at_risk:  goals.filter(g => g.status === 'at_risk').length,
  achieved: goals.filter(g => g.status === 'achieved').length,
}))

function progress(g) { return Math.min(100, Math.round((g.current / g.target) * 100)) }
function progressClass(g) {
  const p = progress(g)
  if (p >= 100) return 'achieved'
  if (p >= 75)  return 'good'
  if (p >= 50)  return 'warn'
  return 'bad'
}
function statusLabel(s) {
  return { on_track: 'В плане', at_risk: 'Риск', achieved: 'Достигнута' }[s] || s
}
function statusClass(s) {
  return { on_track: 'status-ok', at_risk: 'status-risk', achieved: 'status-done' }[s] || ''
}
function daysLeft(deadline) {
  const diff = Math.ceil((new Date(deadline) - new Date()) / 86400000)
  if (diff < 0) return 'Просрочена'
  if (diff === 0) return 'Сегодня'
  return `${diff} дн.`
}

function addGoal() {
  if (!newGoal.title || !newGoal.target) return
  goals.push({
    id: Date.now(), title: newGoal.title, metric: 'custom',
    target: +newGoal.target, current: +(newGoal.current || 0),
    unit: '%', deadline: newGoal.deadline || '2026-07-31',
    dept: newGoal.dept, status: 'on_track', created: new Date().toISOString().slice(0,10)
  })
  Object.assign(newGoal, { title:'', metric:'', target:'', current:'', deadline:'', dept:'sales' })
  showForm.value = false
}
function removeGoal(g) { const i = goals.indexOf(g); if (i>-1) goals.splice(i,1) }
</script>

<template>
  <div class="av-page">

    <div class="page-head">
      <div>
        <h1 class="page-title"><i class="pi pi-flag"></i> Цели и KPI</h1>
        <p class="page-sub">Отслеживайте выполнение целей по критериям оценки звонков</p>
      </div>
      <button class="add-btn" @click="showForm = !showForm">
        <i class="pi pi-plus"></i> Добавить цель
      </button>
    </div>

    <!-- Summary -->
    <div class="summary-row">
      <div class="sum-card">
        <div class="sum-val">{{ summary.total }}</div>
        <div class="sum-lbl">Всего целей</div>
      </div>
      <div class="sum-card ok">
        <div class="sum-val">{{ summary.on_track }}</div>
        <div class="sum-lbl">В плане</div>
      </div>
      <div class="sum-card risk">
        <div class="sum-val">{{ summary.at_risk }}</div>
        <div class="sum-lbl">Под риском</div>
      </div>
      <div class="sum-card done">
        <div class="sum-val">{{ summary.achieved }}</div>
        <div class="sum-lbl">Достигнуто</div>
      </div>
    </div>

    <!-- Add form -->
    <transition name="slide-down">
      <div v-if="showForm" class="add-form av-card">
        <div class="form-head">Новая цель</div>
        <div class="form-row">
          <div class="form-group">
            <label>Название цели</label>
            <input v-model="newGoal.title" class="f-input" placeholder="Например: Средний балл 90%">
          </div>
          <div class="form-group sm">
            <label>Целевое значение (%)</label>
            <input v-model="newGoal.target" class="f-input" type="number" placeholder="85">
          </div>
          <div class="form-group sm">
            <label>Текущее значение (%)</label>
            <input v-model="newGoal.current" class="f-input" type="number" placeholder="70">
          </div>
          <div class="form-group sm">
            <label>Срок</label>
            <input v-model="newGoal.deadline" class="f-input" type="date">
          </div>
          <div class="form-group sm">
            <label>Отдел</label>
            <select v-model="newGoal.dept" class="f-input">
              <option v-for="d in depts" :key="d.key" :value="d.key">{{ d.label }}</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-save" @click="addGoal">Сохранить</button>
          <button class="btn-cancel" @click="showForm=false">Отмена</button>
        </div>
      </div>
    </transition>

    <!-- Filter -->
    <div class="filter-row">
      <button v-for="d in [{key:'all',label:'Все отделы'}, ...depts]" :key="d.key"
        class="dept-btn" :class="{ active: filterDept === d.key }" @click="filterDept = d.key">
        {{ d.label }}
      </button>
    </div>

    <!-- Goals grid -->
    <div class="goals-grid">
      <div v-for="g in filtered" :key="g.id" class="goal-card av-card" :class="g.status">
        <div class="goal-top">
          <div class="goal-title">{{ g.title }}</div>
          <div class="goal-actions">
            <span class="status-badge" :class="statusClass(g.status)">{{ statusLabel(g.status) }}</span>
            <button class="del-btn" @click="removeGoal(g)"><i class="pi pi-trash"></i></button>
          </div>
        </div>

        <div class="goal-nums">
          <div class="goal-current">{{ g.current }}{{ g.unit }}</div>
          <div class="goal-sep">→</div>
          <div class="goal-target">{{ g.target }}{{ g.unit }}</div>
        </div>

        <div class="goal-bar-wrap">
          <div class="goal-bar-bg">
            <div class="goal-bar-fill" :class="progressClass(g)" :style="{ width: progress(g) + '%' }"></div>
          </div>
          <span class="goal-pct">{{ progress(g) }}%</span>
        </div>

        <div class="goal-meta">
          <span><i class="pi pi-calendar"></i> до {{ g.deadline }}</span>
          <span class="days-left" :class="{ urgent: daysLeft(g.deadline) !== 'Просрочена' && parseInt(daysLeft(g.deadline)) < 10 }">
            {{ daysLeft(g.deadline) }}
          </span>
          <span><i class="pi pi-users"></i> {{ depts.find(d=>d.key===g.dept)?.label || g.dept }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.page-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 10px; }
.page-title i { color: var(--brand); }
.page-sub { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

.add-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 18px; background: var(--brand); color: white;
  border: none; border-radius: 10px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: 0.15s; flex-shrink: 0;
}
.add-btn:hover { background: var(--brand-dark); }

.summary-row { display: flex; gap: 14px; margin-bottom: 20px; }
.sum-card {
  flex: 1; background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 14px 18px; text-align: center;
  border-top: 3px solid var(--border);
}
.sum-card.ok   { border-top-color: #16a34a; }
.sum-card.risk { border-top-color: #f59e0b; }
.sum-card.done { border-top-color: var(--brand); }
.sum-val { font-size: 28px; font-weight: 700; color: var(--text); }
.sum-lbl { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

.add-form { padding: 20px; margin-bottom: 20px; }
.form-head { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 14px; }
.form-row { display: flex; gap: 12px; flex-wrap: wrap; }
.form-group { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 160px; }
.form-group.sm { flex: 0 0 130px; min-width: 120px; }
.form-group label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.f-input { padding: 8px 11px; border: 1px solid var(--border); border-radius: 9px; font-size: 13px; background: var(--surface-alt); color: var(--text); outline: none; }
.f-input:focus { border-color: var(--accent); }
.form-actions { display: flex; gap: 10px; margin-top: 14px; }
.btn-save { padding: 8px 20px; background: var(--brand); color: white; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-save:hover { background: var(--brand-dark); }
.btn-cancel { padding: 8px 16px; background: var(--surface-alt); color: var(--text-muted); border: 1px solid var(--border); border-radius: 9px; font-size: 13px; cursor: pointer; }

.filter-row { display: flex; gap: 6px; margin-bottom: 18px; flex-wrap: wrap; }
.dept-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border); background: var(--surface); color: var(--text-muted); font-size: 12px; cursor: pointer; transition: 0.12s; }
.dept-btn.active { background: var(--brand); color: white; border-color: var(--brand); }

.goals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }

.goal-card { padding: 18px; position: relative; transition: box-shadow 0.15s; }
.goal-card:hover { box-shadow: var(--shadow-md); }
.goal-card.at_risk { border-left: 3px solid #f59e0b; }
.goal-card.on_track { border-left: 3px solid #16a34a; }
.goal-card.achieved { border-left: 3px solid var(--brand); }

.goal-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
.goal-title { font-size: 13px; font-weight: 700; color: var(--text); line-height: 1.4; }
.goal-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

.status-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
.status-ok   { background: #dcfce7; color: #15803d; }
.status-risk { background: #fef3c7; color: #b45309; }
.status-done { background: var(--brand-light); color: var(--brand); }

.del-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 11px; opacity: 0.5; transition: 0.12s; }
.del-btn:hover { opacity: 1; color: #dc2626; }

.goal-nums { display: flex; align-items: baseline; gap: 8px; margin-bottom: 10px; }
.goal-current { font-size: 26px; font-weight: 700; color: var(--text); }
.goal-sep { color: var(--text-muted); }
.goal-target { font-size: 16px; color: var(--text-muted); }

.goal-bar-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.goal-bar-bg { flex: 1; height: 7px; background: var(--border); border-radius: 99px; overflow: hidden; }
.goal-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
.goal-bar-fill.achieved, .goal-bar-fill.good { background: #16a34a; }
.goal-bar-fill.warn { background: #f59e0b; }
.goal-bar-fill.bad  { background: #ef4444; }
.goal-pct { font-size: 12px; font-weight: 700; color: var(--text-muted); min-width: 32px; text-align: right; }

.goal-meta { display: flex; align-items: center; gap: 12px; font-size: 11px; color: var(--text-muted); flex-wrap: wrap; }
.goal-meta i { font-size: 10px; margin-right: 3px; }
.days-left { font-weight: 600; }
.days-left.urgent { color: #dc2626; }

.slide-down-enter-active { transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1); }
.slide-down-leave-active { transition: all 0.15s; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
