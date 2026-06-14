<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

const open = ref(false)
const filter = ref('all')

const notifications = reactive([
  { id:1, type:'danger',  icon:'pi-exclamation-triangle', title:'Нарушение порога',    body:'Лебедев П.Р. — средний балл 54% (порог 65%)',              time:'5 мин',  read:false, cat:'alert' },
  { id:2, type:'success', icon:'pi-check-circle',         title:'Проверка завершена',   body:'Сценарий "Отдел продаж" — 34 звонка, средний балл 79%',     time:'23 мин', read:false, cat:'system' },
  { id:3, type:'warning', icon:'pi-chart-line',           title:'Падение показателей',  body:'Средний балл команды: 76% (−3% за неделю)',                 time:'1 ч',    read:false, cat:'alert' },
  { id:4, type:'info',    icon:'pi-user',                 title:'Первые звонки',        body:'Новиков О.А. завершил первые 5 звонков — средний балл 72%', time:'2 ч',    read:true,  cat:'info' },
  { id:5, type:'brand',   icon:'pi-trophy',               title:'Цель достигнута!',     body:'Приветствие: 91% — цель 90% выполнена командой',            time:'4 ч',    read:true,  cat:'system' },
  { id:6, type:'danger',  icon:'pi-phone',                title:'Серия нарушений',      body:'Григорьев А.В. — 3 звонка подряд ниже порога 65%',         time:'5 ч',    read:true,  cat:'alert' },
  { id:7, type:'warning', icon:'pi-calendar',             title:'Напоминание',          body:'Coaching-сессия с Лебедевым П.Р. запланирована на завтра',  time:'6 ч',    read:true,  cat:'info' },
])

const cats = [
  { key:'all',    label:'Все' },
  { key:'alert',  label:'Нарушения' },
  { key:'system', label:'Система' },
  { key:'info',   label:'Информация' },
]

const filtered = computed(() =>
  filter.value === 'all' ? notifications : notifications.filter(n => n.cat === filter.value)
)
const unread = computed(() => notifications.filter(n => !n.read).length)

function markRead(n) { n.read = true }
function markAllRead() { notifications.forEach(n => n.read = true) }
function remove(n) { const i = notifications.indexOf(n); if (i>-1) notifications.splice(i,1) }

function toggle() { open.value = !open.value; if (open.value) setTimeout(markAllRead, 2500) }

function outside(e) { if (!e.target.closest('.nc-wrap')) open.value = false }
onMounted(() => document.addEventListener('click', outside))
onUnmounted(() => document.removeEventListener('click', outside))

const typeColors = { danger:'#dc2626', success:'#16a34a', warning:'#d97706', info:'#0b5e7e', brand:'#7c3aed' }
const typeBgs    = { danger:'#fee2e2', success:'#dcfce7', warning:'#fef3c7', info:'#e3f2f9',  brand:'#ede9fe' }
</script>

<template>
  <div class="nc-wrap">
    <button class="nc-bell" @click.stop="toggle" :class="{ active: open }">
      <i class="pi pi-bell"></i>
      <span v-if="unread > 0" class="nc-badge">{{ unread }}</span>
    </button>

    <transition name="nc-drop">
      <div v-if="open" class="nc-panel" @click.stop>
        <div class="nc-head">
          <span class="nc-title">Уведомления</span>
          <button v-if="unread > 0" class="nc-read-all" @click="markAllRead">Прочитать все</button>
        </div>

        <div class="nc-cats">
          <button v-for="c in cats" :key="c.key" class="nc-cat" :class="{active: filter===c.key}" @click="filter=c.key">
            {{ c.label }}
            <span v-if="c.key==='all'" class="nc-cat-cnt">{{ notifications.length }}</span>
          </button>
        </div>

        <div class="nc-list">
          <div v-if="!filtered.length" class="nc-empty"><i class="pi pi-inbox"></i> Нет уведомлений</div>
          <div v-for="n in filtered" :key="n.id" class="nc-item" :class="{ unread: !n.read }" @click="markRead(n)">
            <div class="nc-icon" :style="{ background: typeBgs[n.type], color: typeColors[n.type] }">
              <i :class="['pi', n.icon]"></i>
            </div>
            <div class="nc-body">
              <div class="nc-item-title">{{ n.title }}</div>
              <div class="nc-item-body">{{ n.body }}</div>
              <div class="nc-item-time">{{ n.time }} назад</div>
            </div>
            <button class="nc-del" @click.stop="remove(n)"><i class="pi pi-times"></i></button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.nc-wrap { position: relative; }

.nc-bell {
  width: 36px; height: 36px; border-radius: 9px;
  background: var(--surface-alt); border: 1px solid var(--border);
  color: var(--text-muted); font-size: 15px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  position: relative; transition: 0.15s;
}
.nc-bell:hover, .nc-bell.active { background: var(--brand-light); color: var(--brand); border-color: var(--brand); }
.nc-badge {
  position: absolute; top: -4px; right: -4px;
  min-width: 16px; height: 16px; border-radius: 8px; padding: 0 4px;
  background: #dc2626; color: white; font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--surface);
}

.nc-panel {
  position: absolute; top: calc(100% + 10px); right: 0;
  width: 340px; background: var(--surface);
  border: 1px solid var(--border); border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.14); z-index: 500;
  overflow: hidden;
}

.nc-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px 10px; border-bottom: 1px solid var(--border);
}
.nc-title { font-size: 13px; font-weight: 700; color: var(--text); }
.nc-read-all { background: none; border: none; font-size: 11px; color: var(--brand); cursor: pointer; font-weight: 600; }
.nc-read-all:hover { text-decoration: underline; }

.nc-cats { display: flex; gap: 4px; padding: 8px 12px; border-bottom: 1px solid var(--border); }
.nc-cat {
  font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 20px;
  border: 1px solid var(--border); background: none; color: var(--text-muted); cursor: pointer;
  display: flex; align-items: center; gap: 4px; transition: 0.12s;
}
.nc-cat.active { background: var(--brand); color: white; border-color: var(--brand); }
.nc-cat-cnt { background: rgba(0,0,0,0.1); border-radius: 10px; padding: 0 5px; font-size: 10px; }
.nc-cat.active .nc-cat-cnt { background: rgba(255,255,255,0.2); }

.nc-list { max-height: 320px; overflow-y: auto; }
.nc-empty { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 28px; color: var(--text-muted); font-size: 12px; }

.nc-item {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 11px 14px; cursor: pointer; transition: background 0.12s;
  border-bottom: 1px solid var(--border); position: relative;
}
.nc-item:last-child { border-bottom: none; }
.nc-item:hover { background: var(--surface-alt); }
.nc-item.unread { background: var(--brand-light); }
.nc-item.unread::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--brand); }

.nc-icon {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 13px;
  margin-top: 1px;
}
.nc-body { flex: 1; min-width: 0; }
.nc-item-title { font-size: 12px; font-weight: 700; color: var(--text); line-height: 1.3; }
.nc-item-body  { font-size: 11px; color: var(--text-muted); line-height: 1.4; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nc-item-time  { font-size: 10px; color: var(--text-muted); margin-top: 3px; }

.nc-del {
  background: none; border: none; cursor: pointer; padding: 2px;
  color: var(--text-muted); font-size: 10px; opacity: 0; transition: 0.12s; flex-shrink: 0;
}
.nc-item:hover .nc-del { opacity: 0.7; }
.nc-del:hover { opacity: 1 !important; color: #dc2626; }

.nc-drop-enter-active { transition: opacity 0.18s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1); }
.nc-drop-leave-active { transition: opacity 0.14s, transform 0.14s; }
.nc-drop-enter-from, .nc-drop-leave-to { opacity: 0; transform: translateY(-8px) scale(0.97); }
</style>
