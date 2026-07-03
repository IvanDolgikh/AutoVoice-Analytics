<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useAppStore } from '../../stores/appStore.js'
import Select from 'primevue/select'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'

const { calls } = useAppStore()

// ── Filters ───────────────────────────────────────────────────────────────────
const dateFrom    = ref(new Date('2026-06-01'))
const dateTo      = ref(new Date('2026-06-30'))
const salonFilter = ref(null)
const typeFilter  = ref(null)
const selectedCall = ref(null)
const activeTab    = ref('transcript')

// ── Audio player (simulated) ──────────────────────────────────────────────────
const playingId   = ref(null)
const playSpeed   = ref(1)
const playerTicks = ref({})   // callId → elapsed seconds

let _timer = null
function _tick() {
  if (playingId.value == null) return
  const id = playingId.value
  const dur = 180
  playerTicks.value = { ...playerTicks.value, [id]: Math.min(dur, (playerTicks.value[id] || 0) + playSpeed.value) }
  if ((playerTicks.value[id] || 0) >= dur) { playingId.value = null; clearInterval(_timer); _timer = null }
}
function togglePlay(id) {
  if (playingId.value === id) {
    playingId.value = null; clearInterval(_timer); _timer = null
  } else {
    playingId.value = id
    clearInterval(_timer)
    _timer = setInterval(_tick, 1000)
  }
}
function playerProgress(id) { return Math.min(1, (playerTicks.value[id] || 0) / 180) }
function playerPos(id)      { return playerTicks.value[id] || 0 }
function seekWave(e, id) {
  const rect = e.currentTarget.getBoundingClientRect()
  const pct  = (e.clientX - rect.left) / rect.width
  playerTicks.value = { ...playerTicks.value, [id]: Math.round(pct * 180) }
}
function formatTime(s) {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2,'0')}`
}
const _waveCache = {}
function waveformBars(id) {
  if (!_waveCache[id]) {
    const seed = id * 7
    _waveCache[id] = Array.from({ length: 40 }, (_, i) => 6 + Math.abs(Math.sin((i + seed) * 0.7) * 24) + Math.abs(Math.sin((i + seed) * 1.3) * 10))
  }
  return _waveCache[id]
}
function isViolationBar(barIdx) { return [10,11,12,24,25].includes(barIdx) }
onUnmounted(() => clearInterval(_timer))

const salonOptions = [
  { label: 'Все салоны', value: null },
  { label: 'Автосалон Окружная', value: 'Автосалон Окружная' },
  { label: 'Автосалон Федюнинского', value: 'Автосалон Федюнинского' },
  { label: 'Автосалон Пермякова', value: 'Автосалон Пермякова' }
]
const typeOptions = [
  { label: 'Все типы', value: null },
  { label: 'Входящий', value: 'Входящий' },
  { label: 'Исходящий', value: 'Исходящий' }
]

// ── Criteria tags ─────────────────────────────────────────────────────────────
const criteriaList = [
  { key: 'greeting',    label: 'Приветствие' },
  { key: 'needs',       label: 'Выявление потребности' },
  { key: 'name',        label: 'Обращение по имени' },
  { key: 'deadline',    label: 'Срок покупки' },
  { key: 'testdrive',   label: 'Тест-драйв' },
  { key: 'urgency',     label: 'Срочность' },
  { key: 'contact',     label: 'Сбор контакта' },
  { key: 'nextcontact', label: 'След. контакт' }
]
const activeFilters = ref(new Set())

function toggleFilter(key) {
  const s = new Set(activeFilters.value)
  s.has(key) ? s.delete(key) : s.add(key)
  activeFilters.value = s
}

// Deterministic criteria pass/fail per call
function callCriteria(call) {
  const s = call.score, id = call.id
  return {
    greeting:    s >= 7,
    needs:       s >= 8 || id % 3 !== 2,
    name:        s >= 9 || id % 4 !== 0,
    deadline:    s >= 10,
    testdrive:   s >= 9,
    urgency:     s >= 11,
    contact:     s >= 8,
    nextcontact: s >= 12
  }
}

// ── Filtered calls ────────────────────────────────────────────────────────────
const filteredCalls = computed(() => {
  return calls.value.filter(c => {
    if (salonFilter.value && c.salon !== salonFilter.value) return false
    if (typeFilter.value  && c.type  !== typeFilter.value)  return false
    if (activeFilters.value.size > 0) {
      const cr = callCriteria(c)
      for (const key of activeFilters.value) {
        if (!cr[key]) return false
      }
    }
    return true
  })
})

const stats = computed(() => {
  const fc = filteredCalls.value
  return {
    total:    fc.length,
    incoming: fc.filter(c => c.type === 'Входящий').length,
    outgoing: fc.filter(c => c.type === 'Исходящий').length,
    avg:      fc.length ? (fc.reduce((s, c) => s + c.score, 0) / fc.length).toFixed(1) : '—'
  }
})

// ── Call durations (deterministic) ────────────────────────────────────────────
const durations = ['2:14','4:37','1:58','7:23','3:41','5:02','6:18','2:55','4:11','1:43','3:28','5:47']

function getDuration(call) {
  return durations[(call.id - 1) % durations.length]
}

function scoreClass(score) {
  return score >= 10 ? 'score-high' : score >= 7 ? 'score-mid' : 'score-low'
}

// ── Select / expand call ──────────────────────────────────────────────────────
function selectCall(call) {
  selectedCall.value = selectedCall.value?.id === call.id ? null : call
  activeTab.value = 'transcript'
}

// ── Realistic dialogs ─────────────────────────────────────────────────────────
const dialogues = {
  'Артемович Д.С.': {
    duration: '7:23',
    transcript: [
      { time: '00:03', sp: 'М', text: 'Добрый день, дилерский центр Changan, меня зовут Дмитрий. Чем могу помочь?' },
      { time: '00:07', sp: 'К', text: 'Здравствуйте. Я хотел бы узнать подробнее про Changan CS75 Plus, видел вашу рекламу.' },
      { time: '00:13', sp: 'М', text: 'Отлично! Как вас зовут, чтобы мне было удобнее обращаться?' },
      { time: '00:16', sp: 'К', text: 'Александр.' },
      { time: '00:17', sp: 'М', text: 'Александр, очень приятно! Скажите, для каких целей подбираете автомобиль — городские поездки, семья, загородные маршруты?' },
      { time: '00:25', sp: 'К', text: 'В основном город, иногда на дачу. Семья — жена и двое детей.' },
      { time: '00:31', sp: 'М', text: 'Понятно, тогда CS75 Plus — идеальный вариант. Просторный второй ряд, 550 литров багажника, полный привод доступен. Александр, вы уже примерно определились, когда планируете покупку?' },
      { time: '00:45', sp: 'К', text: 'Думаю, в течение месяца-двух.' },
      { time: '00:48', sp: 'М', text: 'Хорошо. Тогда скажу честно — сейчас очень удачный момент. У нас до конца февраля действует акция: скидка до 150 000 рублей на текущий модельный год. После 28-го числа цены поднимаются. Александр, предлагаю записать вас на тест-драйв — 30 минут, и вы сами всё почувствуете. Как смотрите?' },
      { time: '01:09', sp: 'К', text: 'Ну да, наверное стоит попробовать. А когда можно?' },
      { time: '01:12', sp: 'М', text: 'Ближайшие даты есть. Оставьте, пожалуйста, номер телефона — я запишу и пришлю подтверждение.' },
      { time: '01:18', sp: 'К', text: 'Конечно, записывайте: 8-912-345-67-89.' },
      { time: '01:25', sp: 'М', text: 'Записал, спасибо! Вам удобнее послезавтра в 15:00 или в пятницу в 11:00?' },
      { time: '01:31', sp: 'К', text: 'Послезавтра в 15:00 подойдёт.' },
      { time: '01:33', sp: 'М', text: 'Прекрасно, фиксирую. Александр, утром в день визита я вам напомню. Если появятся вопросы до этого — звоните напрямую. Буду рад помочь. До встречи!' },
      { time: '01:41', sp: 'К', text: 'Спасибо, до свидания.' }
    ],
    criteria: [
      { label: 'Приветствие',               score: 1, max: 1, comment: 'Назвал себя по имени и представил салон' },
      { label: 'Выявление потребности',      score: 2, max: 2, comment: 'Уточнил цели, состав семьи, сценарии использования' },
      { label: 'Обращение по имени',         score: 2, max: 2, comment: 'Обращался к клиенту по имени 5 раз на протяжении всего диалога' },
      { label: 'Уточнение срока покупки',    score: 2, max: 2, comment: 'Уточнил срок и использовал для создания срочности' },
      { label: 'Предложение тест-драйва',    score: 2, max: 2, comment: 'Предложил тест-драйв и согласовал конкретное время' },
      { label: 'Создание срочности',         score: 2, max: 2, comment: 'Упомянул акцию с чётким дедлайном 28 февраля' },
      { label: 'Сбор контакта',              score: 1, max: 1, comment: 'Взял номер телефона для подтверждения записи' },
      { label: 'Планирование след. контакта',score: 0, max: 2, comment: 'Запись на тест-драйв есть, но дата второго звонка не согласована' }
    ],
    strong: ['Уверенная работа с возражениями', 'Грамотное использование дедлайна акции', 'Постоянное обращение по имени'],
    weak:   ['Не договорился о контрольном звонке до тест-драйва'],
    rec:    'Добавить в конце диалога вопрос: «Александр, если у вас появятся вопросы раньше — когда вам удобно, чтобы я позвонил?»'
  },

  'Перминов А.А.': {
    duration: '4:11',
    transcript: [
      { time: '00:04', sp: 'М', text: 'Добрый день, Changan, Артём, слушаю вас.' },
      { time: '00:08', sp: 'К', text: 'Привет. Хочу спросить про кредит на Changan Uni-T.' },
      { time: '00:12', sp: 'М', text: 'Да, конечно. Как вас зовут?' },
      { time: '00:14', sp: 'К', text: 'Максим.' },
      { time: '00:15', sp: 'М', text: 'Максим, добрый день! По Uni-T у нас сейчас есть хорошие кредитные программы. Первоначальный взнос от 10%, ставки от 5,9% годовых при господдержке. Скажите, вы уже рассматривали конкретную комплектацию?' },
      { time: '00:28', sp: 'К', text: 'Нет, ещё не смотрел.' },
      { time: '00:30', sp: 'М', text: 'Хорошо. А для каких целей берёте — ежедневные поездки, работа?' },
      { time: '00:35', sp: 'К', text: 'Ну, в основном по делам, иногда с семьёй.' },
      { time: '00:39', sp: 'М', text: 'Понятно. Тогда рекомендую Uni-T в комплектации Premium — там и камеры 360, и подогрев всех сидений. Максим, вы когда планируете приобретение?' },
      { time: '00:50', sp: 'К', text: 'Хотелось бы до конца месяца.' },
      { time: '00:52', sp: 'М', text: 'Отлично, тогда у нас как раз сейчас есть машины в наличии. Предлагаю приехать, посмотреть вживую и сделать тест-драйв. Оставите номер телефона?' },
      { time: '01:01', sp: 'К', text: '8-922-111-22-33.' },
      { time: '01:05', sp: 'М', text: 'Записал. Когда вам удобнее подъехать — на этой неделе или на следующей?' },
      { time: '01:10', sp: 'К', text: 'На этой, в четверг.' },
      { time: '01:12', sp: 'М', text: 'В четверг записываю вас на 14:00. Я позвоню с утра для подтверждения. До встречи, Максим!' },
      { time: '01:18', sp: 'К', text: 'Ок, спасибо.' }
    ],
    criteria: [
      { label: 'Приветствие',               score: 1, max: 1, comment: 'Назвал себя и салон в первой фразе' },
      { label: 'Выявление потребности',      score: 2, max: 2, comment: 'Выяснил цели использования и семейный контекст' },
      { label: 'Обращение по имени',         score: 2, max: 2, comment: 'Трижды обращался по имени в ключевых моментах' },
      { label: 'Уточнение срока покупки',    score: 2, max: 2, comment: 'Уточнил срок, использовал для перехода к визиту' },
      { label: 'Предложение тест-драйва',    score: 2, max: 2, comment: 'Предложил тест-драйв и зафиксировал день' },
      { label: 'Создание срочности',         score: 1, max: 2, comment: 'Упомянул наличие авто, но не назвал дедлайн акции' },
      { label: 'Сбор контакта',              score: 1, max: 1, comment: 'Взял номер телефона' },
      { label: 'Планирование след. контакта',score: 0, max: 2, comment: 'Не обозначил контрольный звонок после записи' }
    ],
    strong: ['Быстро перешёл к потребностям', 'Предложил конкретную комплектацию под запрос'],
    weak:   ['Не создал чёткую срочность', 'Не запланировал второй контакт'],
    rec:    'Упоминать конкретную акцию с дедлайном. В конце спрашивать: «Если появятся вопросы — когда позвонить?»'
  },

  default: {
    duration: '3:28',
    transcript: [
      { time: '00:05', sp: 'М', text: 'Добрый день, дилерский центр Changan, слушаю вас.' },
      { time: '00:09', sp: 'К', text: 'Здравствуйте. Хочу узнать про Changan CS35 Plus.' },
      { time: '00:13', sp: 'М', text: 'Конечно. Как вас зовут?' },
      { time: '00:15', sp: 'К', text: 'Сергей.' },
      { time: '00:16', sp: 'М', text: 'Сергей, добрый день! CS35 Plus — это наш самый популярный городской кроссовер. Расскажите, для чего рассматриваете?' },
      { time: '00:24', sp: 'К', text: 'Ну, для работы больше. Один езжу.' },
      { time: '00:27', sp: 'М', text: 'Понятно. Тогда в базовой или средней комплектации будет оптимально — всё нужное есть. Сергей, вы уже определились со сроком покупки?' },
      { time: '00:36', sp: 'К', text: 'Пока смотрю варианты, не торопился.' },
      { time: '00:40', sp: 'М', text: 'Хорошо. У нас сейчас есть машины в наличии, можно посмотреть вживую и сразу прокатиться на тест-драйве. Вам было бы интересно?' },
      { time: '00:48', sp: 'К', text: 'В принципе да.' },
      { time: '00:50', sp: 'М', text: 'Тогда оставьте номер, я запишу вас на удобное время.' },
      { time: '00:55', sp: 'К', text: '8-963-456-78-90.' },
      { time: '01:00', sp: 'М', text: 'Записал. Когда удобнее — в первой или второй половине недели?' },
      { time: '01:05', sp: 'К', text: 'Во второй.' },
      { time: '01:07', sp: 'М', text: 'Хорошо, предлагаю в пятницу в 12:00. Подтверждение пришлю накануне. Спасибо, Сергей, до встречи!' },
      { time: '01:14', sp: 'К', text: 'Спасибо, до свидания.' }
    ],
    criteria: [
      { label: 'Приветствие',               score: 1, max: 1, comment: 'Назвал салон, но не представился по имени' },
      { label: 'Выявление потребности',      score: 1, max: 2, comment: 'Уточнил только базовый сценарий, не развил тему' },
      { label: 'Обращение по имени',         score: 1, max: 2, comment: 'Обратился по имени только дважды' },
      { label: 'Уточнение срока покупки',    score: 1, max: 2, comment: 'Спросил, но не зафиксировал конкретный срок' },
      { label: 'Предложение тест-драйва',    score: 2, max: 2, comment: 'Предложил тест-драйв и записал клиента' },
      { label: 'Создание срочности',         score: 0, max: 2, comment: 'Срочность не создавалась — нет упоминания акций или ограничений' },
      { label: 'Сбор контакта',              score: 1, max: 1, comment: 'Взял номер телефона' },
      { label: 'Планирование след. контакта',score: 0, max: 2, comment: 'Не договорился о контрольном звонке' }
    ],
    strong: ['Предложил тест-драйв и оперативно записал клиента'],
    weak:   ['Нет срочности', 'Слабое выявление потребностей', 'Редкое обращение по имени', 'Нет планирования следующего контакта'],
    rec:    'Использовать технику «3 вопроса к потребности». Всегда заканчивать диалог конкретной датой следующего звонка.'
  }
}

function getDialog(call) {
  return dialogues[call.employee] ?? dialogues.default
}

function totalScore(dialog) {
  return dialog.criteria.reduce((s, c) => s + c.score, 0)
}
function totalMax(dialog) {
  return dialog.criteria.reduce((s, c) => s + c.max, 0)
}
</script>

<template>
  <div class="av-page">

    <!-- ① Stats strip ──────────────────────────────────────────────────────── -->
    <div class="stats-strip">
      <div class="ss-item">
        <span class="ss-val">{{ stats.total }}</span>
        <span class="ss-label">Звонков в выборке</span>
      </div>
      <div class="ss-div"></div>
      <div class="ss-item">
        <span class="ss-val" style="color:#16a34a">{{ stats.incoming }}</span>
        <span class="ss-label"><i class="pi pi-arrow-circle-down" style="font-size:10px;"></i> Входящих</span>
      </div>
      <div class="ss-div"></div>
      <div class="ss-item">
        <span class="ss-val" style="color:#d97706">{{ stats.outgoing }}</span>
        <span class="ss-label"><i class="pi pi-arrow-circle-up" style="font-size:10px;"></i> Исходящих</span>
      </div>
      <div class="ss-div"></div>
      <div class="ss-item">
        <span class="ss-val" style="color:#7c3aed">{{ stats.avg }}</span>
        <span class="ss-label">Средний балл /13</span>
      </div>
    </div>

    <!-- ② Filters ──────────────────────────────────────────────────────────── -->
    <div class="av-filter-bar">
      <div class="av-filter-group">
        <span class="av-filter-label">Период с</span>
        <DatePicker v-model="dateFrom" dateFormat="yy-mm-dd" showIcon />
      </div>
      <div class="av-filter-group">
        <span class="av-filter-label">по</span>
        <DatePicker v-model="dateTo" dateFormat="yy-mm-dd" showIcon />
      </div>
      <div class="av-filter-group">
        <span class="av-filter-label">Салон</span>
        <Select v-model="salonFilter" :options="salonOptions" optionLabel="label" optionValue="value" placeholder="Все салоны" />
      </div>
      <div class="av-filter-group">
        <span class="av-filter-label">Тип звонка</span>
        <Select v-model="typeFilter" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="Все типы" />
      </div>
      <Button label="Применить" icon="pi pi-filter" style="align-self:flex-end;background:var(--brand)!important;border-color:var(--brand)!important;" />
      <Button label="Сбросить" icon="pi pi-times" outlined size="small" style="align-self:flex-end;" @click="salonFilter=null;typeFilter=null;activeFilters=new Set()" />
    </div>

    <!-- ③ Criteria tag filter ──────────────────────────────────────────────── -->
    <div class="criteria-filter-bar">
      <span class="cf-label">Фильтр по критериям:</span>
      <div class="cf-tags">
        <button
          v-for="c in criteriaList"
          :key="c.key"
          class="cf-tag"
          :class="{ active: activeFilters.has(c.key) }"
          @click="toggleFilter(c.key)"
        >
          <i class="pi" :class="activeFilters.has(c.key) ? 'pi-check' : 'pi-plus'"></i>
          {{ c.label }}
        </button>
      </div>
      <button v-if="activeFilters.size > 0" class="cf-clear" @click="activeFilters = new Set()">
        <i class="pi pi-times"></i> Сбросить
      </button>
    </div>

    <!-- ④ Calls table ──────────────────────────────────────────────────────── -->
    <div class="av-card">
      <div class="table-header">
        <span class="table-count">{{ filteredCalls.length }} звонков</span>
        <Button label="Экспорт" icon="pi pi-download" outlined size="small" />
      </div>
      <table class="calls-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Сотрудник</th>
            <th>Салон</th>
            <th>Тип</th>
            <th>Длительность</th>
            <th>Оценка</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="call in filteredCalls" :key="call.id">
            <tr
              class="call-row"
              :class="[scoreClass(call.score), { expanded: selectedCall?.id === call.id }]"
              @click="selectCall(call)"
            >
              <td>{{ call.date }}</td>
              <td>
                <div class="emp-cell">
                  <div class="emp-av">{{ call.employee[0] }}</div>
                  <span>{{ call.employee }}</span>
                </div>
              </td>
              <td style="color:var(--text-muted);font-size:12px;">{{ call.salon }}</td>
              <td>
                <span class="type-badge" :class="call.type === 'Входящий' ? 'in' : 'out'">
                  <i :class="['pi', call.type === 'Входящий' ? 'pi-arrow-down' : 'pi-arrow-up']"></i>
                  {{ call.type }}
                </span>
              </td>
              <td style="font-size:13px;color:var(--text-muted);">
                <i class="pi pi-clock" style="font-size:11px;margin-right:4px;"></i>{{ getDuration(call) }}
              </td>
              <td>
                <div class="score-cell">
                  <span class="score-num" :class="scoreClass(call.score)">{{ call.score }}/13</span>
                  <div class="score-bar">
                    <div class="score-bar-fill" :class="scoreClass(call.score)" :style="{ width: ((call.score/13)*100)+'%' }"></div>
                  </div>
                </div>
              </td>
              <td>
                <i :class="['pi', selectedCall?.id === call.id ? 'pi-chevron-up' : 'pi-chevron-down']" class="expand-icon"></i>
              </td>
            </tr>

            <!-- ── Expanded detail ── -->
            <tr v-if="selectedCall?.id === call.id" class="detail-row">
              <td colspan="7">
                <div class="detail-panel">

                  <!-- tabs -->
                  <div class="detail-tabs">
                    <button class="dtab" :class="{ active: activeTab==='transcript' }" @click="activeTab='transcript'">
                      <i class="pi pi-align-left"></i> Транскрипция
                    </button>
                    <button class="dtab" :class="{ active: activeTab==='ai' }" @click="activeTab='ai'">
                      <i class="pi pi-sparkles"></i> Оценка ИИ
                    </button>
                    <div class="dtab-spacer"></div>
                    <div class="dtab-meta">
                      <i class="pi pi-clock"></i> {{ getDialog(call).duration }}
                      &nbsp;·&nbsp;
                      <i class="pi pi-microphone"></i> Запись доступна
                    </div>
                  </div>

                  <!-- transcript -->
                  <div v-show="activeTab==='transcript'" class="tab-pane">
                    <!-- Custom audio player -->
                    <div class="custom-player">
                      <button class="cp-play" @click="togglePlay(call.id)">
                        <i :class="['pi', playingId===call.id ? 'pi-pause' : 'pi-play']"></i>
                      </button>
                      <div class="cp-waveform" @click.stop="seekWave($event, call.id)">
                        <div
                          v-for="(h, wi) in waveformBars(call.id)"
                          :key="wi"
                          class="cp-bar"
                          :class="{
                            played: wi < Math.floor(playerProgress(call.id) * 40),
                            violation: isViolationBar(wi)
                          }"
                          :style="{ height: h + 'px' }"
                        ></div>
                      </div>
                      <span class="cp-time">{{ formatTime(playerPos(call.id)) }}</span>
                      <span class="cp-sep">/</span>
                      <span class="cp-dur">{{ getDialog(call).duration }}</span>
                      <div class="cp-speed">
                        <button
                          v-for="sp in [0.75, 1, 1.5, 2]" :key="sp"
                          class="sp-btn" :class="{ active: playSpeed===sp }"
                          @click.stop="playSpeed=sp"
                        >{{ sp }}x</button>
                      </div>
                    </div>
                    <div class="transcript">
                      <div
                        v-for="(line, idx) in getDialog(call).transcript"
                        :key="idx"
                        class="tline"
                        :class="line.sp === 'М' ? 'manager' : 'client'"
                      >
                        <div class="tline-head">
                          <span class="speaker-badge" :class="line.sp === 'М' ? 'mgr' : 'cli'">
                            {{ line.sp === 'М' ? 'Менеджер' : 'Клиент' }}
                          </span>
                          <span class="ttime">[{{ line.time }}]</span>
                        </div>
                        <div class="ttext">{{ line.text }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- AI evaluation -->
                  <div v-show="activeTab==='ai'" class="tab-pane">
                    <div class="ai-header">
                      <div class="ai-score-big">
                        <span class="ai-num">{{ totalScore(getDialog(call)) }}</span>
                        <span class="ai-den">/{{ totalMax(getDialog(call)) }}</span>
                      </div>
                      <div class="ai-pct-wrap">
                        <div class="ai-pct">{{ ((totalScore(getDialog(call))/totalMax(getDialog(call)))*100).toFixed(0) }}%</div>
                        <div class="ai-label">соответствие скрипту</div>
                      </div>
                    </div>

                    <table class="criteria-table">
                      <thead>
                        <tr>
                          <th>Критерий</th>
                          <th>Балл</th>
                          <th>Комментарий ИИ</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="cr in getDialog(call).criteria" :key="cr.label">
                          <td class="cr-name">{{ cr.label }}</td>
                          <td>
                            <span class="cr-score" :class="cr.score === cr.max ? 'full' : cr.score > 0 ? 'partial' : 'zero'">
                              {{ cr.score }}/{{ cr.max }}
                            </span>
                          </td>
                          <td class="cr-comment">{{ cr.comment }}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div class="ai-summary">
                      <div class="ai-block positive">
                        <div class="ai-block-title"><i class="pi pi-check-circle"></i> Сильные стороны</div>
                        <ul>
                          <li v-for="s in getDialog(call).strong" :key="s">{{ s }}</li>
                        </ul>
                      </div>
                      <div class="ai-block negative">
                        <div class="ai-block-title"><i class="pi pi-times-circle"></i> Зоны роста</div>
                        <ul>
                          <li v-for="w in getDialog(call).weak" :key="w">{{ w }}</li>
                        </ul>
                      </div>
                      <div class="ai-block rec">
                        <div class="ai-block-title"><i class="pi pi-lightbulb"></i> Рекомендация</div>
                        <p>{{ getDialog(call).rec }}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </td>
            </tr>
          </template>

          <tr v-if="filteredCalls.length === 0">
            <td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">
              <i class="pi pi-search" style="font-size:24px;display:block;margin-bottom:8px;opacity:0.4;"></i>
              Нет звонков, соответствующих фильтрам
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>
/* ── Stats strip ── */
.stats-strip {
  display: flex; align-items: center; gap: 0;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 14px 24px;
  margin-bottom: 16px;
}
.ss-item { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; }
.ss-val { font-size: 22px; font-weight: 700; color: var(--brand); line-height: 1; }
.ss-label { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 3px; }
.ss-div { width: 1px; background: var(--border); height: 36px; flex-shrink: 0; }

/* ── Criteria filter bar ── */
.criteria-filter-bar {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 12px 16px;
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  margin-bottom: 16px;
}
.cf-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
.cf-tags { display: flex; flex-wrap: wrap; gap: 6px; flex: 1; }
.cf-tag {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 11px; border-radius: 20px; font-size: 12px; font-weight: 500;
  border: 1px solid var(--border); background: var(--surface-alt); color: var(--text-muted);
  cursor: pointer; transition: 0.15s;
}
.cf-tag i { font-size: 10px; }
.cf-tag:hover { border-color: var(--brand); color: var(--brand); }
.cf-tag.active { background: var(--brand-light); border-color: var(--brand); color: var(--brand); font-weight: 600; }
.cf-clear {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 20px; font-size: 11px;
  border: 1px solid #fca5a5; background: #fef2f2; color: #dc2626;
  cursor: pointer; white-space: nowrap;
}

/* ── Table ── */
.table-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px 0;
}
.table-count { font-size: 12px; color: var(--text-muted); font-weight: 500; }

.calls-table { width: 100%; border-collapse: collapse; }
.calls-table thead th {
  padding: 10px 14px;
  font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--text-muted); background: var(--surface-alt);
  border-bottom: 1px solid var(--border); text-align: left;
}
.calls-table tbody td { padding: 11px 14px; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: middle; }
.call-row { cursor: pointer; transition: background 0.1s; border-left: 3px solid transparent; }
.call-row:hover { background: var(--surface-alt); }
.call-row.expanded { background: #f0f7fb; }
.call-row.score-high { border-left-color: #16a34a; }
.call-row.score-mid  { border-left-color: #f59e0b; }
.call-row.score-low  { border-left-color: #ef4444; }
.detail-row td { padding: 0 !important; background: #f7fbfd; border-bottom: 2px solid var(--brand) !important; }

.emp-cell { display: flex; align-items: center; gap: 8px; }
.emp-av {
  width: 28px; height: 28px; border-radius: 8px;
  background: var(--brand); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.type-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px;
}
.type-badge.in  { background: #dcfce7; color: #16a34a; }
.type-badge.out { background: #fef3c7; color: #b45309; }
.type-badge i { font-size: 10px; }

.score-cell { display: flex; align-items: center; gap: 8px; }
.score-num { font-size: 12px; font-weight: 700; white-space: nowrap; min-width: 38px; }
.score-num.score-high { color: #16a34a; }
.score-num.score-mid  { color: #d97706; }
.score-num.score-low  { color: #dc2626; }
.score-bar { width: 60px; height: 5px; background: var(--border); border-radius: 99px; overflow: hidden; }
.score-bar-fill { height: 100%; border-radius: 99px; transition: width 0.4s; }
.score-bar-fill.score-high { background: #16a34a; }
.score-bar-fill.score-mid  { background: #f59e0b; }
.score-bar-fill.score-low  { background: #ef4444; }
.expand-icon { color: var(--text-muted); font-size: 12px; }

/* ── Detail panel ── */
.detail-panel { padding: 0 0 20px; }
.detail-tabs {
  display: flex; align-items: center; gap: 0;
  border-bottom: 1px solid var(--border); padding: 0 20px;
}
.dtab {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 11px 18px; background: none; border: none;
  border-bottom: 2px solid transparent;
  font-size: 13px; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: 0.15s;
}
.dtab:hover { color: var(--text); }
.dtab.active { color: var(--brand); border-bottom-color: var(--brand); font-weight: 600; }
.dtab i { font-size: 13px; }
.dtab-spacer { flex: 1; }
.dtab-meta { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }

.tab-pane { padding: 16px 20px 0; }

/* Audio */
/* Custom audio player */
.custom-player {
  display: flex; align-items: center; gap: 10px;
  background: var(--surface-alt); border: 1px solid var(--border);
  border-radius: 12px; padding: 10px 14px; margin-bottom: 16px;
}
.cp-play {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  background: var(--brand); color: white; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 13px;
  transition: 0.15s;
}
.cp-play:hover { background: var(--brand-dark); }
.cp-waveform {
  flex: 1; display: flex; align-items: center; gap: 2px; height: 36px;
  cursor: pointer; padding: 0 4px;
}
.cp-bar {
  flex: 1; border-radius: 2px; background: var(--border); min-width: 2px;
  transition: background 0.1s;
}
.cp-bar.played    { background: var(--brand); }
.cp-bar.violation { background: #ef4444 !important; }
.cp-time, .cp-dur { font-size: 12px; font-weight: 600; color: var(--text); white-space: nowrap; }
.cp-sep { color: var(--text-muted); font-size: 11px; }
.cp-speed { display: flex; gap: 2px; margin-left: 4px; }
.sp-btn {
  padding: 2px 6px; border-radius: 5px; border: 1px solid var(--border);
  background: var(--surface); color: var(--text-muted); font-size: 10px; font-weight: 600;
  cursor: pointer; transition: 0.12s;
}
.sp-btn.active { background: var(--brand); color: white; border-color: var(--brand); }

/* Transcript */
.transcript { display: flex; flex-direction: column; gap: 10px; max-height: 380px; overflow-y: auto; padding-right: 4px; }
.tline { display: flex; flex-direction: column; gap: 4px; }
.tline-head { display: flex; align-items: center; gap: 8px; }
.speaker-badge {
  font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; letter-spacing: 0.03em;
}
.speaker-badge.mgr { background: var(--brand-light); color: var(--brand); }
.speaker-badge.cli { background: #f3f4f6; color: #374151; }
.ttime { font-size: 10px; color: var(--text-muted); font-family: monospace; }
.ttext {
  font-size: 13px; line-height: 1.55; color: var(--text);
  background: var(--surface); border-radius: 10px; padding: 9px 13px;
  border: 1px solid var(--border); margin-left: 4px;
}
.tline.manager .ttext { border-left: 3px solid var(--brand); }
.tline.client  .ttext { border-left: 3px solid #d1d5db; }

/* AI evaluation */
.ai-header {
  display: flex; align-items: center; gap: 20px;
  background: var(--brand-light); border-radius: 12px;
  padding: 14px 20px; margin-bottom: 16px;
}
.ai-score-big { display: flex; align-items: baseline; gap: 2px; }
.ai-num { font-size: 36px; font-weight: 800; color: var(--brand); line-height: 1; }
.ai-den { font-size: 18px; color: var(--text-muted); }
.ai-pct { font-size: 22px; font-weight: 700; color: var(--brand); }
.ai-label { font-size: 11px; color: var(--text-muted); }

.criteria-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
.criteria-table th {
  padding: 8px 12px; font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);
  background: var(--surface-alt); border-bottom: 1px solid var(--border); text-align: left;
}
.criteria-table td { padding: 9px 12px; border-bottom: 1px solid var(--border); font-size: 12px; vertical-align: top; }
.criteria-table tr:last-child td { border-bottom: none; }
.cr-name { font-weight: 500; color: var(--text); white-space: nowrap; }
.cr-score {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 36px; padding: 2px 8px; border-radius: 8px;
  font-size: 12px; font-weight: 700; white-space: nowrap;
}
.cr-score.full    { background: #dcfce7; color: #16a34a; }
.cr-score.partial { background: #fef3c7; color: #b45309; }
.cr-score.zero    { background: #fee2e2; color: #dc2626; }
.cr-comment { color: var(--text-muted); line-height: 1.4; }

.ai-summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.ai-block { border-radius: 10px; padding: 12px 14px; font-size: 12px; line-height: 1.5; }
.ai-block.positive { background: #f0fdf4; border: 1px solid #bbf7d0; }
.ai-block.negative { background: #fff7ed; border: 1px solid #fed7aa; }
.ai-block.rec      { background: #eff6ff; border: 1px solid #bfdbfe; }
.ai-block-title {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
  margin-bottom: 7px;
}
.ai-block.positive .ai-block-title { color: #16a34a; }
.ai-block.negative .ai-block-title { color: #d97706; }
.ai-block.rec      .ai-block-title { color: #2563eb; }
.ai-block ul { margin: 0; padding-left: 14px; color: var(--text); }
.ai-block ul li { margin-bottom: 3px; }
.ai-block p { margin: 0; color: var(--text); }

@media (max-width: 900px) {
  .ai-summary { grid-template-columns: 1fr; }
}
</style>
