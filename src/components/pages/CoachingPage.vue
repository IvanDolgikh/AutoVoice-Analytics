<script setup>
import { ref, reactive, computed } from 'vue'

const showForm = ref(false)
const activeSession = ref(null)

const employees = [
  'Перминов А.А.', 'Артемович Д.С.', 'Суздальцев К.С.', 'Яхонтов Р.А.', 'Абдуллин И.И.',
  'Белов Д.С.', 'Морозов Р.А.', 'Соколов К.С.', 'Каримов И.И.', 'Григорьев А.В.',
  'Лебедев П.Р.', 'Новиков О.А.'
]

const sessions = reactive([
  { id:1, employee:'Лебедев П.Р.',    coach:'Суворов М.К.', date:'2026-05-20', status:'done',      scoreBefore:54, scoreAfter:61, topic:'Создание срочности, взятие контакта', notes:'Провели разбор 3 звонков. Менеджер осознал проблему с окончанием звонка без договорённостей. Назначена следующая сессия через 2 недели.', focus:['Создание срочности','Взял контакт','Следующий контакт'] },
  { id:2, employee:'Григорьев А.В.',  coach:'Суворов М.К.', date:'2026-05-28', status:'done',      scoreBefore:62, scoreAfter:68, topic:'Тест-драйв, срок покупки', notes:'Обсудили важность предложения тест-драйва. Провели ролевую игру. Показатели улучшились.', focus:['Тест-драйв','Срок покупки'] },
  { id:3, employee:'Каримов И.И.',    coach:'Суворов М.К.', date:'2026-06-05', status:'done',      scoreBefore:69, scoreAfter:74, topic:'Имя клиента, потребность', notes:'Сессия прошла продуктивно. Менеджер понял важность персонализации.', focus:['Имя клиента','Потребность'] },
  { id:4, employee:'Лебедев П.Р.',    coach:'Суворов М.К.', date:'2026-06-15', status:'planned',   scoreBefore:61, scoreAfter:null, topic:'Следующий контакт, создание срочности', notes:'', focus:['Следующий контакт','Создание срочности'] },
  { id:5, employee:'Новиков О.А.',    coach:'Суворов М.К.', date:'2026-06-18', status:'planned',   scoreBefore:77, scoreAfter:null, topic:'Общий разбор адаптации', notes:'', focus:['Приветствие','Потребность'] },
  { id:6, employee:'Суздальцев К.С.', coach:'Суворов М.К.', date:'2026-06-22', status:'planned',   scoreBefore:69, scoreAfter:null, topic:'Взятие контакта и срок покупки', notes:'', focus:['Взял контакт','Срок покупки'] },
])

const newSession = reactive({ employee: '', coach: 'Суворов М.К.', date: '', topic: '', focus: [] })

const statusFilter = ref('all')
const filters = [
  { key:'all',     label:'Все' },
  { key:'planned', label:'Запланированы' },
  { key:'done',    label:'Проведены' },
]

const filtered = computed(() =>
  statusFilter.value === 'all' ? sessions : sessions.filter(s => s.status === statusFilter.value)
)

const stats = computed(() => ({
  total:   sessions.length,
  done:    sessions.filter(s=>s.status==='done').length,
  planned: sessions.filter(s=>s.status==='planned').length,
  avgGain: (() => {
    const done = sessions.filter(s=>s.scoreAfter)
    if (!done.length) return 0
    return (done.reduce((a,s) => a + (s.scoreAfter - s.scoreBefore), 0) / done.length).toFixed(1)
  })()
}))

function statusLabel(s) { return { done:'Проведена', planned:'Запланирована', cancelled:'Отменена' }[s] || s }
function statusClass(s) { return { done:'s-done', planned:'s-plan', cancelled:'s-cancel' }[s] || '' }
function gain(s) { if (!s.scoreAfter) return null; return s.scoreAfter - s.scoreBefore }
function gainClass(s) { const g = gain(s); if (!g) return ''; return g > 0 ? 'pos' : 'neg' }

function addSession() {
  if (!newSession.employee || !newSession.date) return
  sessions.push({
    id: Date.now(), employee: newSession.employee, coach: newSession.coach,
    date: newSession.date, status: 'planned', scoreBefore: 70, scoreAfter: null,
    topic: newSession.topic, notes: '', focus: newSession.focus.slice()
  })
  Object.assign(newSession, { employee:'', date:'', topic:'', focus:[] })
  showForm.value = false
}
function removeSession(s) { const i = sessions.indexOf(s); if (i>-1) sessions.splice(i,1) }
function completeSession(s) { s.status = 'done'; s.scoreAfter = s.scoreBefore + 7 }

const criteriaOptions = ['Потребность','Приветствие','Имя клиента','Срок покупки','Тест-драйв','Создание срочности','Взял контакт','Следующий контакт']
</script>

<template>
  <div class="av-page">

    <div class="page-head">
      <div>
        <h1 class="page-title"><i class="pi pi-calendar"></i> Coaching-журнал</h1>
        <p class="page-sub">Управление индивидуальными сессиями развития сотрудников</p>
      </div>
      <button class="add-btn" @click="showForm = !showForm">
        <i class="pi pi-plus"></i> Новая сессия
      </button>
    </div>

    <!-- Stats row -->
    <div class="stats-row">
      <div class="st-card">
        <div class="st-icon blue"><i class="pi pi-calendar"></i></div>
        <div><div class="st-val">{{ stats.total }}</div><div class="st-lbl">Всего сессий</div></div>
      </div>
      <div class="st-card">
        <div class="st-icon green"><i class="pi pi-check-circle"></i></div>
        <div><div class="st-val">{{ stats.done }}</div><div class="st-lbl">Проведено</div></div>
      </div>
      <div class="st-card">
        <div class="st-icon orange"><i class="pi pi-clock"></i></div>
        <div><div class="st-val">{{ stats.planned }}</div><div class="st-lbl">Запланировано</div></div>
      </div>
      <div class="st-card">
        <div class="st-icon brand"><i class="pi pi-trending-up"></i></div>
        <div><div class="st-val">+{{ stats.avgGain }}</div><div class="st-lbl">Средний прирост балла</div></div>
      </div>
    </div>

    <!-- Add form -->
    <transition name="slide-down">
      <div v-if="showForm" class="add-form av-card">
        <div class="form-head">Новая coaching-сессия</div>
        <div class="form-row">
          <div class="form-group">
            <label>Сотрудник</label>
            <select v-model="newSession.employee" class="f-input">
              <option value="">— выберите —</option>
              <option v-for="e in employees" :key="e" :value="e">{{ e }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Коуч / руководитель</label>
            <input v-model="newSession.coach" class="f-input" placeholder="ФИО коуча">
          </div>
          <div class="form-group sm">
            <label>Дата сессии</label>
            <input v-model="newSession.date" class="f-input" type="date">
          </div>
          <div class="form-group">
            <label>Тема сессии</label>
            <input v-model="newSession.topic" class="f-input" placeholder="Что разберём">
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-save" @click="addSession">Создать</button>
          <button class="btn-cancel" @click="showForm=false">Отмена</button>
        </div>
      </div>
    </transition>

    <!-- Filters -->
    <div class="filter-row">
      <button v-for="f in filters" :key="f.key" class="f-btn" :class="{ active: statusFilter===f.key }" @click="statusFilter=f.key">
        {{ f.label }}
      </button>
    </div>

    <!-- Sessions -->
    <div class="sessions-list">
      <div v-for="s in filtered" :key="s.id" class="session-card av-card" :class="s.status">

        <div class="sc-left">
          <div class="sc-avatar">{{ s.employee.split(' ')[0][0] }}{{ s.employee.split(' ')[1]?.[0] || '' }}</div>
        </div>

        <div class="sc-body">
          <div class="sc-top">
            <div class="sc-name">{{ s.employee }}</div>
            <span class="sc-status" :class="statusClass(s.status)">{{ statusLabel(s.status) }}</span>
          </div>

          <div class="sc-meta">
            <span><i class="pi pi-calendar"></i> {{ s.date }}</span>
            <span><i class="pi pi-user"></i> {{ s.coach }}</span>
            <span v-if="s.topic"><i class="pi pi-bookmark"></i> {{ s.topic }}</span>
          </div>

          <!-- Score comparison -->
          <div class="sc-scores">
            <div class="score-block before">
              <div class="score-lbl">До</div>
              <div class="score-num">{{ s.scoreBefore }}%</div>
            </div>
            <div class="score-arrow" v-if="s.scoreAfter">
              <i class="pi pi-arrow-right"></i>
              <span class="gain" :class="gainClass(s)">
                {{ gain(s) > 0 ? '+' : '' }}{{ gain(s) }}%
              </span>
            </div>
            <div class="score-arrow no-data" v-else>
              <i class="pi pi-arrow-right"></i>
              <span>—</span>
            </div>
            <div class="score-block after" :class="{ empty: !s.scoreAfter }">
              <div class="score-lbl">После</div>
              <div class="score-num">{{ s.scoreAfter ? s.scoreAfter + '%' : '?' }}</div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="s.notes" class="sc-notes">{{ s.notes }}</div>

          <!-- Focus areas -->
          <div v-if="s.focus?.length" class="sc-focus">
            <span v-for="f in s.focus" :key="f" class="focus-tag">{{ f }}</span>
          </div>
        </div>

        <div class="sc-actions">
          <button v-if="s.status==='planned'" class="action-btn complete" @click="completeSession(s)" title="Отметить проведённой">
            <i class="pi pi-check"></i>
          </button>
          <button class="action-btn del" @click="removeSession(s)" title="Удалить">
            <i class="pi pi-trash"></i>
          </button>
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

.stats-row { display: flex; gap: 14px; margin-bottom: 20px; }
.st-card {
  flex: 1; display: flex; align-items: center; gap: 14px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 14px 18px;
}
.st-icon {
  width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.st-icon.blue  { background: #e3f2f9; color: #0b5e7e; }
.st-icon.green { background: #dcfce7; color: #16a34a; }
.st-icon.orange{ background: #fef3c7; color: #b45309; }
.st-icon.brand { background: var(--brand-light); color: var(--brand); }
.st-val { font-size: 22px; font-weight: 700; color: var(--text); }
.st-lbl { font-size: 11px; color: var(--text-muted); }

.add-form { padding: 20px; margin-bottom: 20px; }
.form-head { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 14px; }
.form-row { display: flex; gap: 12px; flex-wrap: wrap; }
.form-group { flex: 1; min-width: 160px; display: flex; flex-direction: column; gap: 5px; }
.form-group.sm { flex: 0 0 140px; }
.form-group label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.f-input { padding: 8px 11px; border: 1px solid var(--border); border-radius: 9px; font-size: 13px; background: var(--surface-alt); color: var(--text); outline: none; }
.f-input:focus { border-color: var(--accent); }
.form-actions { display: flex; gap: 10px; margin-top: 14px; }
.btn-save { padding: 8px 20px; background: var(--brand); color: white; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-save:hover { background: var(--brand-dark); }
.btn-cancel { padding: 8px 16px; background: var(--surface-alt); color: var(--text-muted); border: 1px solid var(--border); border-radius: 9px; font-size: 13px; cursor: pointer; }

.filter-row { display: flex; gap: 6px; margin-bottom: 18px; }
.f-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border); background: var(--surface); color: var(--text-muted); font-size: 12px; cursor: pointer; transition: 0.12s; }
.f-btn.active { background: var(--brand); color: white; border-color: var(--brand); }

.sessions-list { display: flex; flex-direction: column; gap: 12px; }

.session-card {
  display: flex; gap: 16px; align-items: flex-start; padding: 18px;
  transition: box-shadow 0.15s; position: relative;
}
.session-card.done    { border-left: 3px solid #16a34a; }
.session-card.planned { border-left: 3px solid #f59e0b; }
.session-card.cancelled { border-left: 3px solid #dc2626; }
.session-card:hover { box-shadow: var(--shadow-md); }

.sc-left { flex-shrink: 0; }
.sc-avatar {
  width: 42px; height: 42px; border-radius: 12px; background: var(--brand-light);
  color: var(--brand); font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

.sc-body { flex: 1; min-width: 0; }
.sc-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.sc-name { font-size: 14px; font-weight: 700; color: var(--text); }
.sc-status { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
.s-done   { background: #dcfce7; color: #15803d; }
.s-plan   { background: #fef3c7; color: #b45309; }
.s-cancel { background: #fee2e2; color: #dc2626; }

.sc-meta { display: flex; gap: 16px; font-size: 11px; color: var(--text-muted); margin-bottom: 12px; flex-wrap: wrap; }
.sc-meta i { margin-right: 3px; font-size: 10px; }

.sc-scores { display: flex; align-items: center; gap: 16px; margin-bottom: 10px; }
.score-block { text-align: center; }
.score-lbl { font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
.score-num { font-size: 22px; font-weight: 700; color: var(--text); }
.score-block.before .score-num { color: var(--text-muted); }
.score-block.after  .score-num { color: #16a34a; }
.score-block.empty  .score-num { color: var(--border); }
.score-arrow { display: flex; flex-direction: column; align-items: center; gap: 2px; color: var(--text-muted); font-size: 12px; }
.score-arrow.no-data { opacity: 0.4; }
.gain { font-size: 12px; font-weight: 700; }
.gain.pos { color: #16a34a; }
.gain.neg { color: #dc2626; }

.sc-notes { font-size: 12px; color: var(--text-muted); line-height: 1.5; background: var(--surface-alt); border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }

.sc-focus { display: flex; gap: 6px; flex-wrap: wrap; }
.focus-tag { font-size: 11px; padding: 2px 9px; background: var(--brand-light); color: var(--brand); border-radius: 20px; font-weight: 500; }

.sc-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
.action-btn { width: 30px; height: 30px; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: 0.12s; }
.action-btn.complete { background: #dcfce7; color: #16a34a; }
.action-btn.complete:hover { background: #16a34a; color: white; }
.action-btn.del { background: var(--surface-alt); color: var(--text-muted); }
.action-btn.del:hover { background: #fee2e2; color: #dc2626; }

.slide-down-enter-active { transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1); }
.slide-down-leave-active { transition: all 0.15s; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
