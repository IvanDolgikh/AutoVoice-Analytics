<script setup>
import { ref, reactive, computed } from 'vue'
import { useAppStore } from '../../stores/appStore.js'

const { state, roleLabel, toggleDarkMode } = useAppStore()

const activeTab = ref('info')
const tabs = [
  { key: 'info',     label: 'Личные данные',  icon: 'pi-user' },
  { key: 'stats',    label: 'Моя статистика', icon: 'pi-chart-bar' },
  { key: 'settings', label: 'Настройки',       icon: 'pi-cog' },
  { key: 'security', label: 'Безопасность',    icon: 'pi-shield' },
]

// ── Personal info ─────────────────────────────────────────────────────────────
const editMode = ref(false)
const profile = reactive({
  firstName: '',
  lastName:  '',
  middleName:'',
  email:     'admin@changan-dealer.ru',
  phone:     '',
  dept:      'Отдел продаж',
  position:  'Директор по качеству',
  salon:     'Автосалон Окружная',
  startDate: '2026-06-08',
  avatar:    'A',
})
const profileSaved = ref(false)
function saveProfile() {
  editMode.value = false
  profileSaved.value = true
  setTimeout(() => profileSaved.value = false, 2500)
}

// ── My stats ──────────────────────────────────────────────────────────────────
const myStats = [
  { label: 'Проверено звонков',  value: '1 847', icon: 'pi-phone',      color: '#0b5e7e' },
  { label: 'Средний балл команды', value: '76%', icon: 'pi-star',       color: '#7c3aed' },
  { label: 'Сессий coaching',    value: '14',    icon: 'pi-calendar',   color: '#16a34a' },
  { label: 'Целей выполнено',    value: '3/8',   icon: 'pi-flag',       color: '#d97706' },
]

const activityLog = [
  { date: '16.06.2026', action: 'Запущена групповая проверка «Отдел продаж»',       icon: 'pi-play',         color: '#0b5e7e' },
  { date: '15.06.2026', action: 'Создана coaching-сессия с Лебедевым П.Р.',         icon: 'pi-calendar-plus',color: '#16a34a' },
  { date: '14.06.2026', action: 'Добавлена цель «Тест-драйв — предложил ≥ 60%»',   icon: 'pi-flag',         color: '#d97706' },
  { date: '13.06.2026', action: 'Сформирован балльный отчёт за май 2026',           icon: 'pi-file-export',  color: '#7c3aed' },
  { date: '12.06.2026', action: 'Обновлён сценарий «Первичное обращение»',          icon: 'pi-list-check',   color: '#0891b2' },
  { date: '10.06.2026', action: 'Проведена coaching-сессия с Каримовым И.И.',       icon: 'pi-check-circle', color: '#16a34a' },
]

// ── Settings ──────────────────────────────────────────────────────────────────
const notifSettings = reactive({
  thresholdAlert:   true,
  checkComplete:    true,
  coachingReminder: true,
  goalDeadline:     true,
  weeklyDigest:     false,
  emailNotif:       false,
})
const uiSettings = reactive({
  language:     'ru',
  dateFormat:   'DD.MM.YYYY',
  defaultPage:  'stat',
  tablePageSize: 20,
})

const pageOptions    = [
  { label: 'Статистика', value: 'stat' },
  { label: 'Звонки',     value: 'calls' },
  { label: 'Отчёты',     value: 'reports' },
]
const pageSizeOptions = [10, 20, 50, 100]

// ── Security ──────────────────────────────────────────────────────────────────
const pwForm = reactive({ current: '', next: '', confirm: '' })
const pwVisible = reactive({ current: false, next: false, confirm: false })
const pwSaved = ref(false)
const pwError = ref('')

function savePassword() {
  pwError.value = ''
  if (!pwForm.current) { pwError.value = 'Введите текущий пароль'; return }
  if (pwForm.next.length < 8) { pwError.value = 'Новый пароль должен содержать не менее 8 символов'; return }
  if (pwForm.next !== pwForm.confirm) { pwError.value = 'Пароли не совпадают'; return }
  Object.assign(pwForm, { current: '', next: '', confirm: '' })
  pwSaved.value = true
  setTimeout(() => pwSaved.value = false, 3000)
}

const sessions = [
  { device: 'Chrome / Windows 11',  location: 'Тюмень, Россия', time: 'Сейчас',           current: true },
  { device: 'Safari / iPhone 15',   location: 'Тюмень, Россия', time: '16.06.2026, 09:41', current: false },
  { device: 'Chrome / Windows 10',  location: 'Москва, Россия', time: '14.06.2026, 17:22', current: false },
]

const experience = computed(() => {
  const ms = new Date() - new Date(profile.startDate)
  const totalMonths = Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24 * 30.44)))
  if (totalMonths < 12) return `${totalMonths} мес.`
  const y = Math.floor(totalMonths / 12)
  const m = totalMonths % 12
  return m > 0 ? `${y} г. ${m} мес.` : `${y} г.`
})
</script>

<template>
  <div class="av-page profile-page">

    <!-- Profile header card -->
    <div class="profile-hero av-card">
      <!-- Blue banner -->
      <div class="hero-banner"></div>

      <!-- Content sits fully below the banner -->
      <div class="hero-content">
        <!-- Left: avatar + name -->
        <div class="hero-left">
          <div class="hero-avatar">{{ profile.avatar || 'A' }}</div>
          <div class="hero-info">
            <div class="hero-name">
              {{ [profile.lastName, profile.firstName, profile.middleName].filter(Boolean).join(' ') || 'admin' }}
            </div>
            <div class="hero-role-row">
              <span class="role-badge">{{ roleLabel }}</span>
              <span class="hero-dept">{{ profile.dept }} · {{ profile.salon }}</span>
            </div>
            <div class="hero-meta">
              <span><i class="pi pi-envelope"></i> {{ profile.email }}</span>
              <span v-if="profile.phone"><i class="pi pi-phone"></i> {{ profile.phone }}</span>
              <span><i class="pi pi-clock"></i> В системе: {{ experience }}</span>
            </div>
          </div>
        </div>

        <!-- Right: quick stats -->
        <div class="hero-stats">
          <div v-for="s in myStats" :key="s.label" class="qs-item">
            <div class="qs-icon" :style="{ background: s.color+'18', color: s.color }">
              <i :class="['pi', s.icon]"></i>
            </div>
            <div class="qs-val">{{ s.value }}</div>
            <div class="qs-lbl">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab navigation -->
    <div class="prof-tabs">
      <button
        v-for="t in tabs" :key="t.key"
        class="prof-tab" :class="{ active: activeTab === t.key }"
        @click="activeTab = t.key"
      >
        <i :class="['pi', t.icon]"></i> {{ t.label }}
      </button>
    </div>

    <!-- ① ЛИЧНЫЕ ДАННЫЕ -->
    <div v-if="activeTab === 'info'" class="tab-content">
      <div class="av-card section-card">
        <div class="section-head">
          <span class="section-title"><i class="pi pi-user"></i> Персональные данные</span>
          <button class="edit-btn" @click="editMode = !editMode">
            <i :class="['pi', editMode ? 'pi-times' : 'pi-pencil']"></i>
            {{ editMode ? 'Отмена' : 'Редактировать' }}
          </button>
        </div>

        <transition name="fade-saved">
          <div v-if="profileSaved" class="save-notice"><i class="pi pi-check-circle"></i> Изменения сохранены</div>
        </transition>

        <div class="info-grid">
          <div class="info-field">
            <label>Фамилия</label>
            <input v-if="editMode" v-model="profile.lastName"   class="f-input" />
            <span v-else class="f-val">{{ profile.lastName }}</span>
          </div>
          <div class="info-field">
            <label>Имя</label>
            <input v-if="editMode" v-model="profile.firstName"  class="f-input" />
            <span v-else class="f-val">{{ profile.firstName }}</span>
          </div>
          <div class="info-field">
            <label>Отчество</label>
            <input v-if="editMode" v-model="profile.middleName" class="f-input" />
            <span v-else class="f-val">{{ profile.middleName }}</span>
          </div>
          <div class="info-field">
            <label>Email</label>
            <input v-if="editMode" v-model="profile.email"      class="f-input" type="email" />
            <span v-else class="f-val">{{ profile.email }}</span>
          </div>
          <div class="info-field">
            <label>Телефон</label>
            <input v-if="editMode" v-model="profile.phone"      class="f-input" />
            <span v-else class="f-val">{{ profile.phone }}</span>
          </div>
          <div class="info-field">
            <label>Должность</label>
            <input v-if="editMode" v-model="profile.position"   class="f-input" />
            <span v-else class="f-val">{{ profile.position }}</span>
          </div>
          <div class="info-field">
            <label>Подразделение</label>
            <input v-if="editMode" v-model="profile.dept"       class="f-input" />
            <span v-else class="f-val">{{ profile.dept }}</span>
          </div>
          <div class="info-field">
            <label>Салон</label>
            <input v-if="editMode" v-model="profile.salon"      class="f-input" />
            <span v-else class="f-val">{{ profile.salon }}</span>
          </div>
          <div class="info-field">
            <label>Дата начала работы</label>
            <input v-if="editMode" v-model="profile.startDate"  class="f-input" type="date" />
            <span v-else class="f-val">{{ new Date(profile.startDate).toLocaleDateString('ru-RU') }}</span>
          </div>
          <div class="info-field">
            <label>Роль в системе</label>
            <span class="f-val"><span class="role-chip">{{ roleLabel }}</span></span>
          </div>
        </div>

        <div v-if="editMode" class="section-footer">
          <button class="btn-save" @click="saveProfile"><i class="pi pi-check"></i> Сохранить изменения</button>
          <button class="btn-cancel" @click="editMode = false">Отмена</button>
        </div>
      </div>
    </div>

    <!-- ② СТАТИСТИКА -->
    <div v-if="activeTab === 'stats'" class="tab-content">
      <div class="stats-grid">
        <div v-for="s in myStats" :key="s.label" class="stat-big av-card">
          <div class="sb-icon" :style="{ background: s.color+'18', color: s.color }"><i :class="['pi', s.icon]"></i></div>
          <div class="sb-val">{{ s.value }}</div>
          <div class="sb-lbl">{{ s.label }}</div>
        </div>
      </div>

      <div class="av-card section-card">
        <div class="section-title"><i class="pi pi-history"></i> Журнал активности</div>
        <div class="activity-list">
          <div v-for="(a, i) in activityLog" :key="i" class="act-item">
            <div class="act-line" v-if="i < activityLog.length - 1"></div>
            <div class="act-dot" :style="{ background: a.color }">
              <i :class="['pi', a.icon]"></i>
            </div>
            <div class="act-body">
              <div class="act-text">{{ a.action }}</div>
              <div class="act-date">{{ a.date }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ③ НАСТРОЙКИ -->
    <div v-if="activeTab === 'settings'" class="tab-content settings-cols">

      <div class="av-card section-card">
        <div class="section-title"><i class="pi pi-bell"></i> Уведомления</div>
        <div class="toggle-list">
          <div class="toggle-item">
            <div class="toggle-info">
              <div class="toggle-label">Нарушение порогового значения</div>
              <div class="toggle-sub">Уведомлять, когда балл сотрудника падает ниже порога</div>
            </div>
            <button class="toggle-btn" :class="{ on: notifSettings.thresholdAlert }" @click="notifSettings.thresholdAlert = !notifSettings.thresholdAlert">
              <span class="toggle-thumb"></span>
            </button>
          </div>
          <div class="toggle-item">
            <div class="toggle-info">
              <div class="toggle-label">Завершение групповой проверки</div>
              <div class="toggle-sub">Уведомлять о завершении автоматической проверки</div>
            </div>
            <button class="toggle-btn" :class="{ on: notifSettings.checkComplete }" @click="notifSettings.checkComplete = !notifSettings.checkComplete">
              <span class="toggle-thumb"></span>
            </button>
          </div>
          <div class="toggle-item">
            <div class="toggle-info">
              <div class="toggle-label">Напоминание о coaching-сессии</div>
              <div class="toggle-sub">За 24 часа до запланированной сессии</div>
            </div>
            <button class="toggle-btn" :class="{ on: notifSettings.coachingReminder }" @click="notifSettings.coachingReminder = !notifSettings.coachingReminder">
              <span class="toggle-thumb"></span>
            </button>
          </div>
          <div class="toggle-item">
            <div class="toggle-info">
              <div class="toggle-label">Дедлайн целей</div>
              <div class="toggle-sub">За 7 дней до истечения срока цели</div>
            </div>
            <button class="toggle-btn" :class="{ on: notifSettings.goalDeadline }" @click="notifSettings.goalDeadline = !notifSettings.goalDeadline">
              <span class="toggle-thumb"></span>
            </button>
          </div>
          <div class="toggle-item">
            <div class="toggle-info">
              <div class="toggle-label">Еженедельный дайджест</div>
              <div class="toggle-sub">Сводка показателей каждый понедельник</div>
            </div>
            <button class="toggle-btn" :class="{ on: notifSettings.weeklyDigest }" @click="notifSettings.weeklyDigest = !notifSettings.weeklyDigest">
              <span class="toggle-thumb"></span>
            </button>
          </div>
          <div class="toggle-item">
            <div class="toggle-info">
              <div class="toggle-label">Email-уведомления</div>
              <div class="toggle-sub">Дублировать уведомления на {{ profile.email }}</div>
            </div>
            <button class="toggle-btn" :class="{ on: notifSettings.emailNotif }" @click="notifSettings.emailNotif = !notifSettings.emailNotif">
              <span class="toggle-thumb"></span>
            </button>
          </div>
        </div>
      </div>

      <div class="av-card section-card">
        <div class="section-title"><i class="pi pi-sliders-h"></i> Интерфейс</div>
        <div class="ui-settings-list">
          <div class="ui-row">
            <div class="ui-lbl">Тёмная тема</div>
            <button class="toggle-btn" :class="{ on: state.darkMode }" @click="toggleDarkMode">
              <span class="toggle-thumb"></span>
            </button>
          </div>
          <div class="ui-row">
            <div class="ui-lbl">Стартовая страница</div>
            <select v-model="uiSettings.defaultPage" class="f-input sm">
              <option v-for="p in pageOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
          </div>
          <div class="ui-row">
            <div class="ui-lbl">Строк в таблице</div>
            <select v-model="uiSettings.tablePageSize" class="f-input sm">
              <option v-for="n in pageSizeOptions" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
          <div class="ui-row">
            <div class="ui-lbl">Формат даты</div>
            <select v-model="uiSettings.dateFormat" class="f-input sm">
              <option value="DD.MM.YYYY">ДД.ММ.ГГГГ</option>
              <option value="YYYY-MM-DD">ГГГГ-ММ-ДД</option>
            </select>
          </div>
        </div>
      </div>

    </div>

    <!-- ④ БЕЗОПАСНОСТЬ -->
    <div v-if="activeTab === 'security'" class="tab-content security-cols">

      <div class="av-card section-card">
        <div class="section-title"><i class="pi pi-lock"></i> Смена пароля</div>

        <transition name="fade-saved">
          <div v-if="pwSaved" class="save-notice"><i class="pi pi-check-circle"></i> Пароль успешно изменён</div>
        </transition>
        <div v-if="pwError" class="error-notice"><i class="pi pi-exclamation-triangle"></i> {{ pwError }}</div>

        <div class="pw-fields">
          <div class="info-field">
            <label>Текущий пароль</label>
            <div class="pw-wrap">
              <input v-model="pwForm.current" :type="pwVisible.current ? 'text' : 'password'" class="f-input" placeholder="••••••••" />
              <button class="pw-eye" @click="pwVisible.current = !pwVisible.current">
                <i :class="['pi', pwVisible.current ? 'pi-eye-slash' : 'pi-eye']"></i>
              </button>
            </div>
          </div>
          <div class="info-field">
            <label>Новый пароль</label>
            <div class="pw-wrap">
              <input v-model="pwForm.next" :type="pwVisible.next ? 'text' : 'password'" class="f-input" placeholder="Минимум 8 символов" />
              <button class="pw-eye" @click="pwVisible.next = !pwVisible.next">
                <i :class="['pi', pwVisible.next ? 'pi-eye-slash' : 'pi-eye']"></i>
              </button>
            </div>
            <!-- Strength indicator -->
            <div class="pw-strength" v-if="pwForm.next">
              <div class="pw-bar" :class="pwForm.next.length >= 12 ? 'strong' : pwForm.next.length >= 8 ? 'medium' : 'weak'">
                <div class="pw-fill" :style="{ width: Math.min(100, pwForm.next.length * 8) + '%' }"></div>
              </div>
              <span class="pw-hint">{{ pwForm.next.length >= 12 ? 'Надёжный' : pwForm.next.length >= 8 ? 'Приемлемый' : 'Слабый' }}</span>
            </div>
          </div>
          <div class="info-field">
            <label>Подтверждение пароля</label>
            <div class="pw-wrap">
              <input v-model="pwForm.confirm" :type="pwVisible.confirm ? 'text' : 'password'" class="f-input" placeholder="Повторите пароль" />
              <button class="pw-eye" @click="pwVisible.confirm = !pwVisible.confirm">
                <i :class="['pi', pwVisible.confirm ? 'pi-eye-slash' : 'pi-eye']"></i>
              </button>
            </div>
            <span v-if="pwForm.confirm && pwForm.next !== pwForm.confirm" class="mismatch">Пароли не совпадают</span>
          </div>
        </div>
        <button class="btn-save mt" @click="savePassword"><i class="pi pi-check"></i> Сохранить пароль</button>
      </div>

      <div class="av-card section-card">
        <div class="section-title"><i class="pi pi-desktop"></i> Активные сессии</div>
        <div class="sessions-list">
          <div v-for="s in sessions" :key="s.device" class="session-item" :class="{ current: s.current }">
            <div class="sess-icon" :class="{ current: s.current }">
              <i :class="['pi', s.device.includes('iPhone') || s.device.includes('iPad') ? 'pi-mobile' : 'pi-desktop']"></i>
            </div>
            <div class="sess-body">
              <div class="sess-device">{{ s.device }} <span v-if="s.current" class="curr-chip">Текущая</span></div>
              <div class="sess-meta"><i class="pi pi-map-marker"></i> {{ s.location }} · {{ s.time }}</div>
            </div>
            <button v-if="!s.current" class="sess-kill" title="Завершить сессию"><i class="pi pi-sign-out"></i></button>
          </div>
        </div>
        <button class="btn-danger mt" style="margin-top:14px">
          <i class="pi pi-ban"></i> Завершить все остальные сессии
        </button>
      </div>

    </div>

  </div>
</template>

<style scoped>
.profile-page { display: flex; flex-direction: column; gap: 20px; }

/* Hero */
.profile-hero { overflow: hidden; padding: 0; }

.hero-banner {
  height: 96px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%);
}

.hero-content {
  display: flex; align-items: center; justify-content: space-between;
  gap: 24px; padding: 0 24px 20px; flex-wrap: wrap;
  background: var(--surface);
}

.hero-left {
  display: flex; align-items: flex-start; gap: 18px; flex: 1; min-width: 260px;
}

.hero-avatar {
  width: 76px; height: 76px; border-radius: 18px; flex-shrink: 0;
  background: var(--brand); color: white; font-size: 24px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border: 4px solid var(--surface);
  box-shadow: 0 4px 16px rgba(11,94,126,0.25);
  margin-top: -38px;
}

.hero-info { padding-top: 8px; }
.hero-name { font-size: 18px; font-weight: 700; color: var(--text); line-height: 1.3; }
.hero-role-row { display: flex; align-items: center; gap: 10px; margin-top: 5px; flex-wrap: wrap; }
.role-badge { background: var(--brand); color: white; font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 20px; }
.hero-dept { font-size: 12px; color: var(--text-muted); }
.hero-meta { display: flex; gap: 16px; margin-top: 8px; font-size: 12px; color: var(--text-muted); flex-wrap: wrap; }
.hero-meta i { margin-right: 4px; font-size: 11px; }

.hero-stats { display: flex; gap: 20px; flex-wrap: wrap; padding-top: 14px; }
.qs-item { display: flex; flex-direction: column; align-items: center; gap: 5px; text-align: center; min-width: 76px; }
.qs-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 15px; }
.qs-val { font-size: 17px; font-weight: 700; color: var(--text); }
.qs-lbl { font-size: 10px; color: var(--text-muted); line-height: 1.3; }

/* Tabs */
.prof-tabs { display: flex; gap: 2px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 4px; width: fit-content; }
.prof-tab {
  display: flex; align-items: center; gap: 7px; padding: 8px 18px;
  border-radius: 9px; border: none; background: none;
  font-size: 13px; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: 0.15s;
}
.prof-tab.active { background: var(--brand); color: white; font-weight: 600; }
.prof-tab:hover:not(.active) { background: var(--surface-alt); color: var(--text); }

/* Tab content */
.tab-content { display: flex; flex-direction: column; gap: 18px; }
.section-card { padding: 22px 24px; }
.section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.section-title { font-size: 13px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; margin-bottom: 18px; }
.section-title i { color: var(--brand); }
.section-footer { display: flex; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); }

.edit-btn {
  display: flex; align-items: center; gap: 6px; padding: 7px 14px;
  border: 1px solid var(--border); border-radius: 9px; background: var(--surface-alt);
  color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.15s;
}
.edit-btn:hover { border-color: var(--brand); color: var(--brand); background: var(--brand-light); }

/* Info grid */
.info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px 24px; }
.info-field { display: flex; flex-direction: column; gap: 5px; }
.info-field label { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.f-val { font-size: 13px; color: var(--text); font-weight: 500; padding: 2px 0; }
.f-input { padding: 8px 11px; border: 1px solid var(--border); border-radius: 9px; font-size: 13px; background: var(--surface-alt); color: var(--text); outline: none; }
.f-input:focus { border-color: var(--accent); }
.f-input.sm { padding: 6px 10px; font-size: 12px; }
.role-chip { background: var(--brand-light); color: var(--brand); font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 20px; }

.btn-save { display: flex; align-items: center; gap: 7px; padding: 9px 20px; background: var(--brand); color: white; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-save:hover { background: var(--brand-dark); }
.btn-save.mt { margin-top: 16px; }
.btn-cancel { padding: 9px 16px; background: var(--surface-alt); color: var(--text-muted); border: 1px solid var(--border); border-radius: 9px; font-size: 13px; cursor: pointer; }
.btn-danger { display: flex; align-items: center; gap: 7px; padding: 8px 16px; background: #fee2e2; color: #dc2626; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-danger:hover { background: #fca5a5; }

.save-notice { display: flex; align-items: center; gap: 8px; background: #dcfce7; color: #15803d; border-radius: 9px; padding: 10px 14px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
.error-notice { display: flex; align-items: center; gap: 8px; background: #fee2e2; color: #dc2626; border-radius: 9px; padding: 10px 14px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-big { padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; }
.sb-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.sb-val { font-size: 24px; font-weight: 700; color: var(--text); }
.sb-lbl { font-size: 11px; color: var(--text-muted); }

/* Activity */
.activity-list { display: flex; flex-direction: column; gap: 0; position: relative; padding-left: 20px; }
.act-item { display: flex; gap: 14px; align-items: flex-start; position: relative; padding-bottom: 18px; }
.act-item:last-child { padding-bottom: 0; }
.act-line { position: absolute; left: 11px; top: 28px; bottom: 0; width: 2px; background: var(--border); z-index: 0; }
.act-dot {
  width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; z-index: 1;
  display: flex; align-items: center; justify-content: center; font-size: 11px; color: white;
  margin-left: -20px;
}
.act-body { flex: 1; }
.act-text { font-size: 13px; color: var(--text); line-height: 1.4; }
.act-date { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

/* Settings */
.settings-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.toggle-list { display: flex; flex-direction: column; gap: 0; }
.toggle-item { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--border); }
.toggle-item:last-child { border-bottom: none; }
.toggle-label { font-size: 13px; font-weight: 600; color: var(--text); }
.toggle-sub   { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

.toggle-btn {
  width: 40px; height: 22px; border-radius: 11px; border: none; cursor: pointer;
  background: var(--border); position: relative; transition: background 0.2s; flex-shrink: 0;
}
.toggle-btn.on { background: var(--brand); }
.toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 16px; height: 16px; border-radius: 50%; background: white;
  transition: transform 0.2s; display: block;
}
.toggle-btn.on .toggle-thumb { transform: translateX(18px); }

.ui-settings-list { display: flex; flex-direction: column; gap: 16px; }
.ui-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.ui-lbl { font-size: 13px; font-weight: 600; color: var(--text); }

/* Security */
.security-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.pw-fields { display: flex; flex-direction: column; gap: 14px; }
.pw-wrap { position: relative; }
.pw-wrap .f-input { width: 100%; padding-right: 38px; }
.pw-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px; }
.pw-strength { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.pw-bar { flex: 1; height: 4px; border-radius: 2px; background: var(--border); overflow: hidden; }
.pw-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
.pw-bar.weak   .pw-fill { background: #ef4444; }
.pw-bar.medium .pw-fill { background: #f59e0b; }
.pw-bar.strong .pw-fill { background: #16a34a; }
.pw-hint { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
.mismatch { font-size: 11px; color: #dc2626; margin-top: 4px; display: block; }

.sessions-list { display: flex; flex-direction: column; gap: 10px; }
.session-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 10px; background: var(--surface-alt); border: 1px solid var(--border); }
.session-item.current { border-color: var(--brand); background: var(--brand-light); }
.sess-icon { width: 34px; height: 34px; border-radius: 9px; background: var(--border); color: var(--text-muted); display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
.sess-icon.current { background: var(--brand); color: white; }
.sess-body { flex: 1; }
.sess-device { font-size: 12px; font-weight: 600; color: var(--text); display: flex; align-items: center; gap: 8px; }
.curr-chip { background: var(--brand); color: white; font-size: 9px; font-weight: 700; padding: 1px 7px; border-radius: 10px; }
.sess-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.sess-meta i { margin-right: 3px; font-size: 10px; }
.sess-kill { background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 14px; padding: 4px; border-radius: 6px; transition: 0.12s; }
.sess-kill:hover { background: #fee2e2; color: #dc2626; }

.fade-saved-enter-active { transition: all 0.3s; }
.fade-saved-leave-active { transition: all 0.3s; }
.fade-saved-enter-from, .fade-saved-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 900px) {
  .settings-cols, .security-cols { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
