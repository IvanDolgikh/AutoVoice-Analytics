<script setup>
import { ref, computed } from 'vue'

const activeTab = ref('leaderboard')

const employees = [
  { name:'Белов Д.С.',        score:92, prev:88, calls:47, badge:'gold',   trend:'up',   delta:4,  dept:'Продажи' },
  { name:'Артемович Д.С.',    score:92, prev:91, calls:43, badge:'gold',   trend:'up',   delta:1,  dept:'Продажи' },
  { name:'Перминов А.А.',     score:85, prev:86, calls:51, badge:'silver', trend:'down', delta:-1, dept:'Продажи' },
  { name:'Яхонтов Р.А.',      score:85, prev:82, calls:39, badge:'silver', trend:'up',   delta:3,  dept:'Сервис' },
  { name:'Морозов Р.А.',      score:85, prev:84, calls:44, badge:'silver', trend:'up',   delta:1,  dept:'Продажи' },
  { name:'Абдуллин И.И.',     score:77, prev:75, calls:38, badge:'bronze', trend:'up',   delta:2,  dept:'Сервис' },
  { name:'Соколов К.С.',      score:77, prev:79, calls:42, badge:'bronze', trend:'down', delta:-2, dept:'Продажи' },
  { name:'Новиков О.А.',      score:77, prev:68, calls:35, badge:'bronze', trend:'up',   delta:9,  dept:'Продажи' },
  { name:'Каримов И.И.',      score:69, prev:70, calls:40, badge:'none',   trend:'down', delta:-1, dept:'Сервис' },
  { name:'Суздальцев К.С.',   score:69, prev:68, calls:37, badge:'none',   trend:'up',   delta:1,  dept:'Продажи' },
  { name:'Григорьев А.В.',    score:62, prev:60, calls:41, badge:'none',   trend:'up',   delta:2,  dept:'Продажи' },
  { name:'Лебедев П.Р.',      score:54, prev:50, calls:33, badge:'none',   trend:'up',   delta:4,  dept:'Продажи' },
]

const sorted = computed(() => [...employees].sort((a,b) => b.score - a.score))

const achievementDefs = [
  { id:'top3',      label:'Топ-3',         icon:'pi-trophy',        color:'#d97706', desc:'Вошёл в тройку лидеров' },
  { id:'perfect',   label:'Идеальный',     icon:'pi-star-fill',     color:'#7c3aed', desc:'Балл 90%+ за месяц' },
  { id:'growth',    label:'Рост месяца',   icon:'pi-trending-up',   color:'#16a34a', desc:'Максимальный прирост' },
  { id:'calls50',   label:'50 звонков',    icon:'pi-phone',         color:'#0b5e7e', desc:'50+ звонков за месяц' },
  { id:'streak',    label:'Серия 5',       icon:'pi-bolt',          color:'#f59e0b', desc:'5 звонков подряд 80%+' },
  { id:'greeting',  label:'Мастер привет.', icon:'pi-thumbs-up',   color:'#0891b2', desc:'Приветствие 100%' },
]

const empAchievements = {
  'Белов Д.С.':       ['top3','perfect','greeting'],
  'Артемович Д.С.':   ['top3','perfect','calls50'],
  'Перминов А.А.':    ['top3','calls50','greeting'],
  'Яхонтов Р.А.':     ['streak','greeting'],
  'Морозов Р.А.':     ['streak'],
  'Абдуллин И.И.':    [],
  'Соколов К.С.':     ['calls50'],
  'Новиков О.А.':     ['growth'],
  'Каримов И.И.':     [],
  'Суздальцев К.С.':  [],
  'Григорьев А.В.':   [],
  'Лебедев П.Р.':     ['growth'],
}

function trendClass(e) { return e.trend === 'up' ? 'trend-up' : 'trend-down' }
function trendIcon(e)  { return e.trend === 'up' ? 'pi-arrow-up' : 'pi-arrow-down' }
function badgeColor(b) { return { gold:'#d97706', silver:'#6b7280', bronze:'#92400e', none:'var(--border)' }[b] }
function badgeBg(b)    { return { gold:'#fef3c7', silver:'#f3f4f6', bronze:'#fef3c7', none:'var(--surface-alt)' }[b] }
function initials(n)   { const p = n.split(' '); return (p[0][0]||'')+(p[1]?.[0]||'') }

const podium = computed(() => sorted.value.slice(0,3))

const selectedEmp = ref(null)
function openAch(emp) { selectedEmp.value = selectedEmp.value?.name === emp.name ? null : emp }
function getAch(name) { return (empAchievements[name] || []).map(id => achievementDefs.find(a=>a.id===id)).filter(Boolean) }
</script>

<template>
  <div class="av-page">

    <div class="page-head">
      <div>
        <h1 class="page-title"><i class="pi pi-trophy"></i> Рейтинг и достижения</h1>
        <p class="page-sub">Лидерборд, бейджи и признание лучших сотрудников за месяц</p>
      </div>
      <div class="tab-switch">
        <button class="tab-btn" :class="{ active: activeTab==='leaderboard' }" @click="activeTab='leaderboard'">
          <i class="pi pi-list"></i> Рейтинг
        </button>
        <button class="tab-btn" :class="{ active: activeTab==='achievements' }" @click="activeTab='achievements'">
          <i class="pi pi-star"></i> Достижения
        </button>
      </div>
    </div>

    <!-- PODIUM -->
    <div v-if="activeTab==='leaderboard'">
      <div class="podium-row">
        <!-- 2nd place -->
        <div class="podium-item pos2">
          <div class="pod-avatar">{{ initials(podium[1].name) }}</div>
          <div class="pod-name">{{ podium[1].name }}</div>
          <div class="pod-score">{{ podium[1].score }}%</div>
          <div class="pod-place p2">2</div>
        </div>
        <!-- 1st place -->
        <div class="podium-item pos1">
          <div class="pod-crown"><i class="pi pi-crown"></i></div>
          <div class="pod-avatar big">{{ initials(podium[0].name) }}</div>
          <div class="pod-name">{{ podium[0].name }}</div>
          <div class="pod-score big">{{ podium[0].score }}%</div>
          <div class="pod-place p1">1</div>
        </div>
        <!-- 3rd place -->
        <div class="podium-item pos3">
          <div class="pod-avatar">{{ initials(podium[2].name) }}</div>
          <div class="pod-name">{{ podium[2].name }}</div>
          <div class="pod-score">{{ podium[2].score }}%</div>
          <div class="pod-place p3">3</div>
        </div>
      </div>

      <!-- Full leaderboard -->
      <div class="leader-table av-card">
        <div class="lt-head">
          <span class="col-pos">#</span>
          <span class="col-name">Сотрудник</span>
          <span class="col-dept">Отдел</span>
          <span class="col-score">Балл</span>
          <span class="col-trend">Динамика</span>
          <span class="col-calls">Звонков</span>
          <span class="col-badge">Бейдж</span>
        </div>
        <div
          v-for="(emp, i) in sorted" :key="emp.name"
          class="lt-row"
          :class="{ highlight: i < 3 }"
          @click="openAch(emp)"
        >
          <span class="col-pos pos-num">
            <span v-if="i===0" class="medal gold">🥇</span>
            <span v-else-if="i===1" class="medal">🥈</span>
            <span v-else-if="i===2" class="medal">🥉</span>
            <span v-else>{{ i+1 }}</span>
          </span>
          <span class="col-name emp-name">
            <span class="emp-av">{{ initials(emp.name) }}</span>
            {{ emp.name }}
          </span>
          <span class="col-dept emp-dept">{{ emp.dept }}</span>
          <span class="col-score">
            <div class="score-bar-wrap">
              <div class="score-bar-bg">
                <div class="score-bar-fill" :style="{ width: emp.score + '%', background: emp.score >= 80 ? '#16a34a' : emp.score >= 65 ? '#f59e0b' : '#ef4444' }"></div>
              </div>
              <span class="score-num">{{ emp.score }}%</span>
            </div>
          </span>
          <span class="col-trend">
            <span class="trend-chip" :class="trendClass(emp)">
              <i :class="['pi', trendIcon(emp)]"></i>
              {{ emp.delta > 0 ? '+' : '' }}{{ emp.delta }}%
            </span>
          </span>
          <span class="col-calls call-cnt">{{ emp.calls }}</span>
          <span class="col-badge">
            <span v-if="emp.badge !== 'none'" class="badge-chip" :style="{ background: badgeBg(emp.badge), color: badgeColor(emp.badge) }">
              {{ {gold:'Золото',silver:'Серебро',bronze:'Бронза'}[emp.badge] }}
            </span>
            <span v-else class="badge-none">—</span>
          </span>
        </div>
      </div>
    </div>

    <!-- ACHIEVEMENTS TAB -->
    <div v-if="activeTab==='achievements'">
      <div class="ach-legend av-card">
        <div class="ach-legend-title">Виды достижений</div>
        <div class="ach-defs-row">
          <div v-for="a in achievementDefs" :key="a.id" class="ach-def-item">
            <div class="ach-icon" :style="{ background: a.color+'22', color: a.color }">
              <i :class="['pi', a.icon]"></i>
            </div>
            <div class="ach-def-label">{{ a.label }}</div>
            <div class="ach-def-desc">{{ a.desc }}</div>
          </div>
        </div>
      </div>

      <div class="ach-grid">
        <div v-for="emp in sorted" :key="emp.name" class="ach-card av-card">
          <div class="ach-card-head">
            <div class="ach-emp-av">{{ initials(emp.name) }}</div>
            <div>
              <div class="ach-emp-name">{{ emp.name }}</div>
              <div class="ach-emp-score">{{ emp.score }}%</div>
            </div>
          </div>
          <div class="ach-badges-row" v-if="getAch(emp.name).length">
            <div v-for="a in getAch(emp.name)" :key="a.id" class="ach-badge" :style="{ background: a.color+'18', borderColor: a.color+'44' }" :title="a.desc">
              <i :class="['pi', a.icon]" :style="{ color: a.color }"></i>
              <span>{{ a.label }}</span>
            </div>
          </div>
          <div v-else class="ach-empty">Пока нет достижений</div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.page-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-size: 20px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 10px; }
.page-title i { color: #d97706; }
.page-sub { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

.tab-switch { display: flex; background: var(--surface-alt); border-radius: 10px; padding: 3px; border: 1px solid var(--border); }
.tab-btn { display: flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 8px; border: none; background: none; color: var(--text-muted); font-size: 13px; font-weight: 500; cursor: pointer; transition: 0.15s; }
.tab-btn.active { background: var(--surface); color: var(--brand); box-shadow: 0 1px 4px rgba(0,0,0,0.08); font-weight: 600; }

/* Podium */
.podium-row {
  display: flex; justify-content: center; align-items: flex-end; gap: 0;
  margin-bottom: 28px; background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px; padding: 24px 20px 0; min-height: 180px;
}
.podium-item { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; max-width: 160px; }
.pod-crown { font-size: 22px; color: #d97706; margin-bottom: -4px; }
.pod-avatar {
  width: 48px; height: 48px; border-radius: 14px;
  background: var(--brand-light); color: var(--brand);
  font-size: 15px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--border);
}
.pod-avatar.big { width: 60px; height: 60px; font-size: 18px; border-color: #d97706; }
.pod-name { font-size: 12px; font-weight: 600; color: var(--text); text-align: center; line-height: 1.3; }
.pod-score { font-size: 18px; font-weight: 700; color: var(--text); }
.pod-score.big { font-size: 22px; color: #d97706; }
.pod-place {
  width: 100%; text-align: center; font-size: 13px; font-weight: 800;
  padding: 6px 0; border-radius: 8px 8px 0 0; margin-top: 6px;
}
.p1 { background: #d97706; color: white; height: 60px; display:flex;align-items:center;justify-content:center;font-size:20px; }
.p2 { background: #9ca3af; color: white; height: 44px; display:flex;align-items:center;justify-content:center;font-size:16px; }
.p3 { background: #b45309; color: white; height: 32px; display:flex;align-items:center;justify-content:center;font-size:14px; }

/* Leaderboard table */
.leader-table { overflow: hidden; }
.lt-head {
  display: grid; grid-template-columns: 44px 1fr 100px 180px 100px 80px 90px;
  padding: 10px 16px; background: var(--surface-alt);
  border-bottom: 1px solid var(--border);
  font-size: 10px; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.05em;
}
.lt-row {
  display: grid; grid-template-columns: 44px 1fr 100px 180px 100px 80px 90px;
  padding: 11px 16px; border-bottom: 1px solid var(--border);
  align-items: center; cursor: pointer; transition: background 0.12s;
}
.lt-row:last-child { border-bottom: none; }
.lt-row:hover { background: var(--surface-alt); }
.lt-row.highlight { background: linear-gradient(90deg, rgba(11,94,126,0.04), transparent); }

.pos-num { font-size: 12px; color: var(--text-muted); font-weight: 600; }
.medal { font-size: 18px; }
.emp-name { display: flex; align-items: center; gap: 9px; font-size: 13px; font-weight: 600; color: var(--text); }
.emp-av {
  width: 28px; height: 28px; border-radius: 8px; background: var(--brand-light);
  color: var(--brand); font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.emp-dept { font-size: 11px; color: var(--text-muted); }

.score-bar-wrap { display: flex; align-items: center; gap: 8px; }
.score-bar-bg { flex: 1; height: 6px; background: var(--border); border-radius: 99px; overflow: hidden; min-width: 80px; }
.score-bar-fill { height: 100%; border-radius: 99px; }
.score-num { font-size: 12px; font-weight: 700; color: var(--text); min-width: 36px; }

.trend-chip { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
.trend-up   { background: #dcfce7; color: #15803d; }
.trend-down { background: #fee2e2; color: #dc2626; }
.trend-chip .pi { font-size: 9px; }

.call-cnt { font-size: 13px; font-weight: 600; color: var(--text); }
.badge-chip { font-size: 10px; font-weight: 700; padding: 2px 10px; border-radius: 10px; }
.badge-none { color: var(--text-muted); }

/* Achievements tab */
.ach-legend { padding: 18px 20px; margin-bottom: 20px; }
.ach-legend-title { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 14px; }
.ach-defs-row { display: flex; gap: 12px; flex-wrap: wrap; }
.ach-def-item { display: flex; align-items: center; gap: 10px; background: var(--surface-alt); border-radius: 10px; padding: 8px 12px; min-width: 180px; }
.ach-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.ach-def-label { font-size: 12px; font-weight: 700; color: var(--text); }
.ach-def-desc  { font-size: 10px; color: var(--text-muted); }

.ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 14px; }
.ach-card { padding: 16px; }
.ach-card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.ach-emp-av { width: 38px; height: 38px; border-radius: 10px; background: var(--brand-light); color: var(--brand); font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.ach-emp-name  { font-size: 13px; font-weight: 700; color: var(--text); }
.ach-emp-score { font-size: 11px; color: var(--text-muted); }
.ach-badges-row { display: flex; flex-wrap: wrap; gap: 6px; }
.ach-badge {
  display: inline-flex; align-items: center; gap: 5px;
  border: 1px solid; border-radius: 8px; padding: 4px 9px;
  font-size: 11px; font-weight: 600; color: var(--text);
}
.ach-badge .pi { font-size: 12px; }
.ach-empty { font-size: 11px; color: var(--text-muted); font-style: italic; }
</style>
