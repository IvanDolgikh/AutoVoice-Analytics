<script setup>
import { ref, computed, reactive, nextTick, watch } from 'vue'
import { useAppStore } from '../../stores/appStore.js'

const { state, roleLabel } = useAppStore()

// ── Role context ──────────────────────────────────────────────────────────────
const roleCtx = computed(() => {
  const r = state.currentRole
  return {
    name: r === 'director' ? 'Директор' : r === 'manager' ? 'Руководитель' : 'Сотрудник',
    access: r === 'director'
      ? ['Статистика всех салонов', 'Все сотрудники', 'Конверсионные отчёты', 'Балльные отчёты', 'Сценарии']
      : r === 'manager'
      ? ['Статистика команды', 'Звонки сотрудников', 'Балльный отчёт', 'Сценарии отдела']
      : ['Мои звонки', 'Мои показатели', 'Советы по скрипту']
  }
})

// ── Suggested prompts by role ─────────────────────────────────────────────────
const promptSets = {
  director: [
    { icon: 'pi-chart-bar',           text: 'Какой средний балл по команде за июнь?' },
    { icon: 'pi-trophy',              text: 'Кто из сотрудников показывает лучшие результаты?' },
    { icon: 'pi-exclamation-triangle',text: 'Кому нужен дополнительный coaching?' },
    { icon: 'pi-chart-line',          text: 'Какие тренды в работе команды за месяц?' },
    { icon: 'pi-filter',              text: 'Какова конверсионная воронка отдела продаж?' },
    { icon: 'pi-lightbulb',           text: 'Дай рекомендации по улучшению показателей' },
  ],
  manager: [
    { icon: 'pi-chart-bar',           text: 'Какой средний балл по команде за июнь?' },
    { icon: 'pi-exclamation-triangle',text: 'Кому нужен дополнительный coaching?' },
    { icon: 'pi-list-check',          text: 'Объясни критерии скрипта Changan' },
    { icon: 'pi-lightbulb',           text: 'Дай рекомендации по улучшению показателей' },
    { icon: 'pi-car',                 text: 'Как правильно предлагать тест-драйв?' },
    { icon: 'pi-filter',              text: 'Какова конверсионная воронка отдела продаж?' },
  ],
  employee: [
    { icon: 'pi-star',                text: 'Какой у меня балл за последнюю неделю?' },
    { icon: 'pi-question-circle',     text: 'Как улучшить создание срочности?' },
    { icon: 'pi-car',                 text: 'Как правильно предлагать тест-драйв?' },
    { icon: 'pi-list-check',          text: 'Объясни критерии скрипта Changan' },
  ]
}
const prompts = computed(() => promptSets[state.currentRole] ?? promptSets.manager)

// ── AI response engine ────────────────────────────────────────────────────────
function bold(t) { return t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }

const rules = [
  {
    match: ['средний балл', 'показател', 'как дела', 'июнь', 'статистик', 'обзор', 'сводк', 'итог'],
    parts: () => [
      { type: 'p', text: 'За июнь 2026 года команда в целом показывает стабильный результат. Вот ключевые показатели:' },
      { type: 'kpi', items: [
        { label: 'Средний балл', value: '78%', cls: 'ok', trend: '↑ +3% к маю' },
        { label: 'Звонков проверено', value: '212', cls: 'brand', trend: '' },
        { label: 'Норма (≥80%)', value: '5 / 12', cls: 'ok', trend: '' },
        { label: 'Нарушений', value: '31', cls: 'bad', trend: '↓ −8 к маю' }
      ]},
      { type: 'p', text: 'Самый проблемный критерий — **Создание срочности** (23% выполнения). Рекомендую организовать тренинг на следующей неделе.' }
    ]
  },
  {
    match: ['лучший', 'топ', 'рейтинг', 'кто лучше', 'кто первый', 'кто лидер', 'лидер'],
    parts: () => [
      { type: 'p', text: 'Топ-5 сотрудников по среднему баллу за июнь:' },
      { type: 'table',
        headers: ['#', 'Сотрудник', 'Балл', 'Изм.', 'Статус'],
        rows: [
          ['1', 'Артемович Д.С.',  '92%', '+4%', 'ok'],
          ['2', 'Белов Д.С.',      '89%', '−2%', 'ok'],
          ['3', 'Яхонтов Р.А.',    '84%', '+5%', 'ok'],
          ['4', 'Перминов А.А.',   '82%', '−3%', 'ok'],
          ['5', 'Морозов Р.А.',    '79%', '+3%', 'warn'],
        ]
      },
      { type: 'tip', text: 'Артемович Д.С. стабильно держится на первом месте. Можно попросить его провести внутренний мастер-класс для команды по критериям "Срочность" и "Тест-драйв".' }
    ]
  },
  {
    match: ['coaching', 'внимани', 'слабый', 'проблем', 'нарушен', 'кому нужн', 'кто отстаёт', 'кто отстает', 'аутсайдер'],
    parts: () => [
      { type: 'warning', text: '3 сотрудника показывают результаты ниже допустимого порога (65%):' },
      { type: 'table',
        headers: ['Сотрудник', 'Балл', 'Главная проблема', 'Рекомендация'],
        rows: [
          ['Лебедев П.Р.',   '54%', 'Срочность, Тест-драйв', 'Индивидуальный coaching'],
          ['Григорьев А.В.', '59%', 'Потребность, Срочность', 'Разбор звонков совместно'],
          ['Каримов И.И.',   '64%', 'Имя клиента, Потребность', 'Тренинг по скрипту'],
        ]
      },
      { type: 'p', text: 'Общая проблема у всех троих — **Создание срочности**. Этот критерий выполняется только в 23% звонков. Рекомендую групповой тренинг с разбором лучших практик.' }
    ]
  },
  {
    match: ['срочност', 'urgency'],
    parts: () => [
      { type: 'p', text: 'Создание срочности — техника, которая помогает клиенту принять решение быстрее. Вот конкретные приёмы:' },
      { type: 'list', items: [
        '**Ограниченность наличия**: «Эта комплектация сейчас в наличии всего 2 экземпляра в Тюмени»',
        '**Цена актуальна сейчас**: «Текущая цена действует до конца месяца, после возможна индексация»',
        '**Очередь на тест-драйв**: «Ближайший свободный слот — следующая пятница, записать вас?»',
        '**Бонус при быстром решении**: «При покупке до 20-го — зимняя резина в подарок»',
      ]},
      { type: 'tip', text: 'Важно: срочность должна быть реальной. Общие фразы «выгодное предложение» не работают — клиент чувствует неискренность. Называйте конкретные даты и цифры.' },
      { type: 'kpi', items: [
        { label: 'Текущий %', value: '23%', cls: 'bad', trend: 'команда' },
        { label: 'Цель', value: '70%', cls: 'ok', trend: '' },
        { label: 'Лучший', value: '67%', cls: 'warn', trend: 'Артемович' },
      ]}
    ]
  },
  {
    match: ['тест-драйв', 'тест драйв', 'testdrive', 'тестдрайв', 'предложить тест', 'тест'],
    parts: () => [
      { type: 'p', text: 'Тест-драйв — один из ключевых этапов конверсии. Клиент, который сел за руль, покупает в 2.3 раза чаще. Вот как правильно предлагать:' },
      { type: 'list', items: [
        '**Не спрашивайте разрешения**: вместо «Не хотите ли…» — «Давайте запишем вас на тест-драйв»',
        '**Привяжите к потребности клиента**: «Вы говорили, что важна динамика — именно это почувствуете сами»',
        '**Дайте конкретный выбор**: «Есть время в пятницу в 11:00 или в субботу в 10:00 — что удобнее?»',
        '**Снимите возражение заранее**: «Займёт 30 минут — зато точно поймёте, ваш это автомобиль или нет»',
      ]},
      { type: 'kpi', items: [
        { label: 'Предлагают', value: '40%', cls: 'bad', trend: 'команда' },
        { label: 'Цель', value: '90%', cls: 'ok', trend: '' },
        { label: 'Конверсия', value: '38%', cls: 'warn', trend: 'с тест-драйвом' },
      ]},
      { type: 'tip', text: 'Данные февраля: сотрудники, предлагающие тест-драйв, закрывают сделки в 2.3× чаще. Это самая высокая точка роста прямо сейчас.' }
    ]
  },
  {
    match: ['критери', 'скрипт', 'changan', 'что проверяет', 'из чего состоит', 'баллы', 'оценк'],
    parts: () => [
      { type: 'p', text: 'Скрипт Changan состоит из 8 критериев. Вот полная разбивка с текущими средними показателями по команде:' },
      { type: 'table',
        headers: ['Критерий', 'Макс. балл', 'Сред. %', 'Статус'],
        rows: [
          ['Приветствие',         '1', '91%', 'ok'],
          ['Выявление потребности','2', '79%', 'ok'],
          ['Обращение по имени',  '1', '67%', 'warn'],
          ['Срок покупки',        '2', '31%', 'bad'],
          ['Тест-драйв',          '2', '40%', 'bad'],
          ['Создание срочности',  '2', '23%', 'bad'],
          ['Взял контакт',        '1', '57%', 'warn'],
          ['Следующий контакт',   '2', '68%', 'warn'],
        ]
      },
      { type: 'p', text: 'Максимальный балл — **13**. Средний по команде — **10.5 (81%)**. Три критерия с красным статусом — главные точки роста.' }
    ]
  },
  {
    match: ['конверси', 'воронка', 'переключен', 'сколько клиент'],
    parts: () => [
      { type: 'p', text: 'Конверсионная воронка отдела продаж за июнь 2026:' },
      { type: 'table',
        headers: ['Этап', 'Кол-во', 'Конверсия'],
        rows: [
          ['Входящих звонков',      '152', '100%'],
          ['Выявление потребности', '122',  '80%'],
          ['Тест-драйв',             '59',  '39%'],
          ['Договорённость',         '37',  '24%'],
        ]
      },
      { type: 'warning', text: 'Самый большой отсев — на этапе «Тест-драйв»: только 39% клиентов доходят до него. Это главная точка роста.' },
      { type: 'tip', text: 'Если поднять конверсию на этапе тест-драйва с 39% до 60%, количество договорённостей вырастет примерно на 32% — около +12 сделок в месяц.' }
    ]
  },
  {
    match: ['тренд', 'динамик', 'рост', 'падени', 'изменени', 'история', 'прошлый месяц'],
    parts: () => [
      { type: 'p', text: 'Динамика среднего балла команды по неделям за июнь:' },
      { type: 'kpi', items: [
        { label: '27 янв – 2 фев', value: '74%', cls: 'warn', trend: 'база' },
        { label: '3 – 9 фев',      value: '77%', cls: 'warn', trend: '↑ +3%' },
        { label: '10 – 16 фев',    value: '80%', cls: 'ok',   trend: '↑ +3%' },
        { label: '17 – 23 фев',    value: '78%', cls: 'ok',   trend: '↓ −2%' },
      ]},
      { type: 'list', items: [
        'Устойчивый рост в первые 3 недели — заметно влияние coaching-сессий',
        'Небольшой откат на 4-й неделе — вероятно, рост нагрузки по входящим',
        '**Создание срочности** улучшилось: с 18% до 23% (+5%)',
        '**Тест-драйв** остаётся на уровне 40% — требует отдельной работы',
      ]}
    ]
  },
  {
    match: ['рекомендац', 'совет', 'что делать', 'как улучш', 'что можн', 'план', 'что предлагаешь'],
    parts: () => [
      { type: 'p', text: 'На основе данных февраля — 3 приоритетных действия для роста:' },
      { type: 'list', items: [
        '**Тренинг по созданию срочности** — провести до 15 февраля. Выполняется только на 23%. Используйте лучшие звонки Артемовича Д.С. как примеры.',
        '**Индивидуальная работа** с Лебедевым П.Р. и Григорьевым А.В. — оба ниже 60%. Разбор 3–5 их звонков совместно с менеджером.',
        '**Усилить контроль тест-драйва** — добавить обязательный пункт предложения в чек-лист самоконтроля для всех менеджеров.',
      ]},
      { type: 'tip', text: 'Прогноз: при реализации этих 3 пунктов средний балл команды вырастет на +5–7% к марту. Это ~+4 дополнительных сделки в месяц.' }
    ]
  },
  {
    match: ['мой балл', 'мои результ', 'как я', 'мои показатели', 'моя статистик'],
    parts: () => [
      { type: 'p', text: 'Ваши показатели за последние 7 дней:' },
      { type: 'kpi', items: [
        { label: 'Средний балл', value: '84%', cls: 'ok', trend: '↑ +6% к прошлой неделе' },
        { label: 'Звонков', value: '12', cls: 'brand', trend: '' },
        { label: 'Норма', value: '9 / 12', cls: 'ok', trend: '' },
        { label: 'Замечания', value: '3', cls: 'warn', trend: '' },
      ]},
      { type: 'p', text: 'Ваш главный резерв роста — **Создание срочности** (выполнено в 33% звонков) и **Срок покупки** (50%). Поработайте именно с этими двумя критериями.' }
    ]
  },
  {
    match: ['имя', 'обращ', 'клиент', 'как называть'],
    parts: () => [
      { type: 'p', text: 'Обращение клиента по имени — простой но мощный инструмент. Вот как встроить его в разговор:' },
      { type: 'list', items: [
        '**Узнайте имя в начале**: «Подскажите, как вас зовут, чтобы мне было удобнее с вами общаться?»',
        '**Используйте имя 2–3 раза**: при уточнении деталей, при предложении тест-драйва, при прощании',
        '**Не переусердствуйте**: имя каждые 30 секунд звучит искусственно — 2–3 раза за звонок оптимально',
        '**Запишите имя сразу**: чтобы не забыть и не переспрашивать — это снижает доверие',
      ]},
      { type: 'kpi', items: [
        { label: 'Команда', value: '67%', cls: 'warn', trend: 'узнают имя' },
        { label: 'Обращаются', value: '54%', cls: 'warn', trend: 'по имени' },
        { label: 'Цель', value: '95%', cls: 'ok', trend: '' },
      ]}
    ]
  },
  {
    match: ['контакт', 'телефон', 'взять контакт', 'собрать контакт'],
    parts: () => [
      { type: 'p', text: 'Сбор контакта — финальный этап входящего звонка. Даже если клиент «просто спрашивал»:' },
      { type: 'list', items: [
        '**Не ждите согласия на покупку**: «Запишу вас в базу, чтобы сообщить об актуальных предложениях» — работает даже с сомневающимися',
        '**Предложите причину**: «Запишу ваш номер — позвоню, как только поступит нужная комплектация»',
        '**Подтвердите и повторите**: «Итак, ваш номер ... — правильно записал?» — показывает внимательность',
      ]},
      { type: 'tip', text: 'Клиент, у которого взяли контакт, конвертируется в сделку на 34% чаще — даже если изначально отказался от встречи.' }
    ]
  },
]

function findResponse(text) {
  const t = text.toLowerCase()
  for (const rule of rules) {
    if (rule.match.some(k => t.includes(k))) return rule.parts()
  }
  return [
    { type: 'p', text: 'Понял ваш вопрос. Уточните, пожалуйста, что именно вас интересует:' },
    { type: 'list', items: [
      'Статистика и показатели команды',
      'Конкретный критерий скрипта (тест-драйв, срочность, контакт…)',
      'Кто нуждается в coaching',
      'Рекомендации по улучшению',
      'Конверсионная воронка',
    ]}
  ]
}

// ── Chat sessions ─────────────────────────────────────────────────────────────
const now = () => new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })

function makeMsg(role, parts, text) {
  return { id: Date.now() + Math.random(), role, parts, text, time: now(), reaction: null, copied: false }
}

const greeting = [
  { type: 'p', text: 'Привет! Я ваш AI-ассистент по качеству звонков AutoVoice Analytics. Я знаю всё о результатах вашей команды, критериях скрипта Changan и конверсионных показателях.' },
  { type: 'tip', text: 'Спросите меня о показателях команды, конкретном критерии или попросите дать рекомендации — я отвечу на основе реальных данных за июнь 2026.' }
]

const chats = reactive([
  {
    id: 1,
    title: 'Анализ команды — июнь',
    date: '04.02',
    messages: [
      makeMsg('assistant', greeting, ''),
      makeMsg('user', null, 'Какой средний балл по команде за июнь?'),
      makeMsg('assistant', findResponse('средний балл за июнь'), ''),
      makeMsg('user', null, 'Кому нужен дополнительный coaching?'),
      makeMsg('assistant', findResponse('кому нужен coaching'), ''),
    ]
  },
  {
    id: 2,
    title: 'Советы по тест-драйву',
    date: '03.02',
    messages: [
      makeMsg('assistant', greeting, ''),
      makeMsg('user', null, 'Как правильно предлагать тест-драйв?'),
      makeMsg('assistant', findResponse('тест-драйв'), ''),
    ]
  },
  {
    id: 3,
    title: 'Критерии скрипта',
    date: '03.02',
    messages: [
      makeMsg('assistant', greeting, ''),
      makeMsg('user', null, 'Объясни критерии скрипта Changan'),
      makeMsg('assistant', findResponse('критерии скрипта'), ''),
    ]
  }
])

const activeChatId = ref(1)
const activeChat = computed(() => chats.find(c => c.id === activeChatId.value))

function selectChat(id) { activeChatId.value = id }

function newChat() {
  const id = Date.now()
  chats.unshift({ id, title: 'Новый диалог', date: new Date().toLocaleDateString('ru', { day: '2-digit', month: '2-digit' }), messages: [makeMsg('assistant', greeting, '')] })
  activeChatId.value = id
}

// ── Sending ───────────────────────────────────────────────────────────────────
const input    = ref('')
const typing   = ref(false)
const messagesEl = ref(null)

function scrollBottom() {
  nextTick(() => {
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  })
}

watch(() => activeChat.value?.messages.length, scrollBottom)

function send() {
  const text = input.value.trim()
  if (!text || typing.value) return
  input.value = ''

  activeChat.value.messages.push(makeMsg('user', null, text))
  if (activeChat.value.title === 'Новый диалог') activeChat.value.title = text.slice(0, 32) + (text.length > 32 ? '…' : '')
  scrollBottom()

  typing.value = true
  setTimeout(() => {
    typing.value = false
    activeChat.value.messages.push(makeMsg('assistant', findResponse(text), ''))
    scrollBottom()
  }, 900 + Math.random() * 600)
}

function onKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
}

function usePrompt(text) { input.value = text; send() }

function copyMsg(msg) {
  const text = msg.parts
    ? msg.parts.map(p => {
        if (p.type === 'p') return p.text.replace(/\*\*(.*?)\*\*/g, '$1')
        if (p.type === 'list') return p.items.map(i => '• ' + i.replace(/\*\*(.*?)\*\*/g, '$1')).join('\n')
        if (p.type === 'table') return [p.headers.join('\t'), ...p.rows.map(r => r.join('\t'))].join('\n')
        if (p.type === 'kpi') return p.items.map(i => `${i.label}: ${i.value}`).join(' | ')
        if (p.type === 'tip' || p.type === 'warning') return p.text
        return ''
      }).join('\n\n')
    : msg.text
  navigator.clipboard.writeText(text).then(() => {
    msg.copied = true
    setTimeout(() => { msg.copied = false }, 1800)
  })
}

function react(msg, r) { msg.reaction = msg.reaction === r ? null : r }

// Row status class for tables
function rowCls(row) {
  const last = row[row.length - 1]
  return last === 'ok' ? 'row-ok' : last === 'warn' ? 'row-warn' : last === 'bad' ? 'row-bad' : ''
}
function isStatusCol(val) { return val === 'ok' || val === 'warn' || val === 'bad' }
function statusLabel(v) { return v === 'ok' ? 'Норма' : v === 'warn' ? 'Замечание' : 'Нарушение' }
</script>

<template>
  <div class="chat-shell">

    <!-- ── Sidebar ── -->
    <aside class="chat-sidebar">
      <button class="new-chat-btn" @click="newChat">
        <i class="pi pi-plus"></i> Новый диалог
      </button>

      <div class="chat-list">
        <div
          v-for="c in chats" :key="c.id"
          class="chat-item"
          :class="{ active: activeChatId === c.id }"
          @click="selectChat(c.id)"
        >
          <div class="ci-icon"><i class="pi pi-comments"></i></div>
          <div class="ci-body">
            <div class="ci-title">{{ c.title }}</div>
            <div class="ci-date">{{ c.date }}</div>
          </div>
        </div>
      </div>

      <!-- Context block -->
      <div class="sidebar-context">
        <div class="ctx-title"><i class="pi pi-database"></i> AI имеет доступ к</div>
        <div class="ctx-item" v-for="a in roleCtx.access" :key="a">
          <i class="pi pi-check-circle"></i> {{ a }}
        </div>
        <div class="ctx-role">
          <i class="pi pi-user"></i> Роль: <strong>{{ roleCtx.name }}</strong>
        </div>
      </div>
    </aside>

    <!-- ── Main ── -->
    <div class="chat-main">

      <!-- Header -->
      <div class="chat-header">
        <div class="ch-left">
          <div class="ch-avatar"><i class="pi pi-android"></i></div>
          <div>
            <div class="ch-name">AutoVoice AI</div>
            <div class="ch-status"><span class="online-dot"></span> Онлайн · анализирует данные февраля</div>
          </div>
        </div>
        <div class="ch-title">{{ activeChat?.title }}</div>
      </div>

      <!-- Messages -->
      <div class="messages-area" ref="messagesEl">
        <template v-for="msg in activeChat?.messages" :key="msg.id">

          <!-- User message -->
          <div v-if="msg.role === 'user'" class="msg-row user">
            <div class="msg-bubble user">{{ msg.text }}</div>
            <div class="msg-time">{{ msg.time }}</div>
          </div>

          <!-- Assistant message -->
          <div v-else class="msg-row assistant">
            <div class="msg-ai-avatar"><i class="pi pi-android"></i></div>
            <div class="msg-ai-wrap">
              <div class="msg-bubble assistant">

                <template v-for="(part, pi) in msg.parts" :key="pi">

                  <!-- Paragraph -->
                  <p v-if="part.type==='p'" class="mp-p" v-html="bold(part.text)"></p>

                  <!-- Bulleted list -->
                  <ul v-else-if="part.type==='list'" class="mp-list">
                    <li v-for="item in part.items" :key="item" v-html="bold(item)"></li>
                  </ul>

                  <!-- Table -->
                  <div v-else-if="part.type==='table'" class="mp-table-wrap">
                    <table class="mp-table">
                      <thead>
                        <tr><th v-for="h in part.headers" :key="h">{{ h }}</th></tr>
                      </thead>
                      <tbody>
                        <tr v-for="row in part.rows" :key="row[0]" :class="rowCls(row)">
                          <td v-for="(cell, ci) in row" :key="ci">
                            <template v-if="ci === row.length-1 && isStatusCol(cell)">
                              <span class="tbl-status" :class="cell">{{ statusLabel(cell) }}</span>
                            </template>
                            <template v-else-if="ci === row.length-1 && (cell.includes('+') || cell.includes('−') || cell.includes('-'))">
                              <span :class="cell.startsWith('+') ? 'tbl-up' : 'tbl-dn'">{{ cell }}</span>
                            </template>
                            <template v-else>{{ cell }}</template>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- KPI grid -->
                  <div v-else-if="part.type==='kpi'" class="mp-kpi">
                    <div v-for="item in part.items" :key="item.label" class="kpi-card" :class="item.cls">
                      <div class="kpi-val">{{ item.value }}</div>
                      <div class="kpi-lbl">{{ item.label }}</div>
                      <div class="kpi-trend" v-if="item.trend">{{ item.trend }}</div>
                    </div>
                  </div>

                  <!-- Tip -->
                  <div v-else-if="part.type==='tip'" class="mp-tip">
                    <i class="pi pi-lightbulb"></i>
                    <span v-html="bold(part.text)"></span>
                  </div>

                  <!-- Warning -->
                  <div v-else-if="part.type==='warning'" class="mp-warning">
                    <i class="pi pi-exclamation-triangle"></i>
                    <span v-html="bold(part.text)"></span>
                  </div>

                </template>
              </div>

              <!-- Message actions -->
              <div class="msg-actions">
                <span class="msg-time-sm">{{ msg.time }}</span>
                <button class="msg-act-btn" :class="{ active: msg.reaction==='up' }" @click="react(msg,'up')" title="Полезно">
                  <i class="pi pi-thumbs-up"></i>
                </button>
                <button class="msg-act-btn" :class="{ active: msg.reaction==='down' }" @click="react(msg,'down')" title="Не полезно">
                  <i class="pi pi-thumbs-down"></i>
                </button>
                <button class="msg-act-btn" @click="copyMsg(msg)" title="Скопировать">
                  <i class="pi" :class="msg.copied ? 'pi-check' : 'pi-copy'"></i>
                </button>
              </div>
            </div>
          </div>

        </template>

        <!-- Typing indicator -->
        <div v-if="typing" class="msg-row assistant">
          <div class="msg-ai-avatar"><i class="pi pi-android"></i></div>
          <div class="typing-bubble">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <!-- Suggested prompts -->
      <div class="prompts-bar" v-if="!typing">
        <div class="prompts-label"><i class="pi pi-bolt"></i> Быстрые вопросы</div>
        <div class="prompts-list">
          <button
            v-for="p in prompts" :key="p.text"
            class="prompt-chip"
            @click="usePrompt(p.text)"
          >
            <i :class="['pi', p.icon]"></i>
            {{ p.text }}
          </button>
        </div>
      </div>

      <!-- Input -->
      <div class="input-area">
        <textarea
          v-model="input"
          class="chat-input"
          placeholder="Задайте вопрос о команде, критериях, конверсии…"
          rows="1"
          @keydown="onKey"
          @input="e => e.target.style.height = 'auto', e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'"
        ></textarea>
        <button class="send-btn" :disabled="!input.trim() || typing" @click="send">
          <i class="pi pi-send"></i>
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── Shell ── */
.chat-shell {
  display: flex; height: calc(100vh - 64px);
  max-width: 1440px; margin: 0 auto;
  background: var(--bg);
  overflow: hidden;
}

/* ── Sidebar ── */
.chat-sidebar {
  width: 260px; flex-shrink: 0;
  background: var(--surface); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; gap: 0;
  overflow-y: auto;
}

.new-chat-btn {
  display: flex; align-items: center; gap: 8px;
  margin: 14px 12px 8px; padding: 10px 16px;
  background: var(--brand); color: white;
  border: none; border-radius: 10px;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.15s;
}
.new-chat-btn:hover { background: var(--brand-dark); }

.chat-list { display: flex; flex-direction: column; gap: 2px; padding: 0 8px; flex: 1; }
.chat-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 10px; border-radius: 10px; cursor: pointer; transition: 0.12s;
}
.chat-item:hover { background: var(--surface-alt); }
.chat-item.active { background: var(--brand-light); }
.ci-icon { font-size: 14px; color: var(--text-muted); flex-shrink: 0; }
.chat-item.active .ci-icon { color: var(--brand); }
.ci-body { flex: 1; min-width: 0; }
.ci-title { font-size: 12px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chat-item.active .ci-title { color: var(--brand); }
.ci-date { font-size: 10px; color: var(--text-muted); margin-top: 1px; }

.sidebar-context {
  margin: 12px; padding: 12px; border-radius: 10px;
  background: var(--surface-alt); border: 1px solid var(--border);
  display: flex; flex-direction: column; gap: 6px;
}
.ctx-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: flex; align-items: center; gap: 5px; margin-bottom: 2px; }
.ctx-item { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
.ctx-item i { color: #16a34a; font-size: 10px; }
.ctx-role { font-size: 11px; color: var(--text-muted); margin-top: 4px; padding-top: 6px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 5px; }
.ctx-role i { color: var(--brand); font-size: 11px; }

/* ── Main ── */
.chat-main {
  flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden;
}

/* Chat header */
.chat-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; background: var(--surface); border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.ch-left { display: flex; align-items: center; gap: 10px; }
.ch-avatar {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, var(--brand), var(--accent));
  color: white; display: flex; align-items: center; justify-content: center; font-size: 16px;
}
.ch-name { font-size: 14px; font-weight: 700; color: var(--text); }
.ch-status { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 5px; margin-top: 1px; }
.online-dot { width: 7px; height: 7px; border-radius: 50%; background: #16a34a; display: inline-block; }
.ch-title { font-size: 12px; color: var(--text-muted); max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Messages */
.messages-area {
  flex: 1; overflow-y: auto; padding: 20px 24px;
  display: flex; flex-direction: column; gap: 16px;
  scroll-behavior: smooth;
}

.msg-row { display: flex; gap: 10px; align-items: flex-start; }
.msg-row.user { flex-direction: row-reverse; }
.msg-row.user .msg-time { text-align: right; }

.msg-ai-avatar {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--brand), var(--accent));
  color: white; display: flex; align-items: center; justify-content: center; font-size: 13px;
  margin-top: 2px;
}

.msg-bubble {
  max-width: 72%; padding: 12px 15px; border-radius: 14px;
  font-size: 13px; line-height: 1.6;
}
.msg-bubble.user {
  background: var(--brand); color: white; border-bottom-right-radius: 4px;
}
.msg-bubble.assistant {
  background: var(--surface); border: 1px solid var(--border);
  color: var(--text); border-bottom-left-radius: 4px;
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; gap: 10px;
}

.msg-time { font-size: 10px; color: var(--text-muted); margin-top: 4px; padding: 0 4px; }

.msg-ai-wrap { display: flex; flex-direction: column; gap: 4px; max-width: 76%; }
.msg-actions { display: flex; align-items: center; gap: 2px; padding-left: 4px; }
.msg-time-sm { font-size: 10px; color: var(--text-muted); margin-right: 4px; }
.msg-act-btn {
  background: none; border: none; cursor: pointer; padding: 4px 6px; border-radius: 6px;
  color: var(--text-muted); font-size: 11px; transition: 0.12s;
}
.msg-act-btn:hover { background: var(--surface-alt); color: var(--text); }
.msg-act-btn.active { color: var(--brand); }

/* Typing indicator */
.typing-bubble {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 14px; border-bottom-left-radius: 4px;
  padding: 14px 18px; display: flex; gap: 5px; align-items: center;
  box-shadow: var(--shadow-sm);
}
.typing-bubble span {
  width: 7px; height: 7px; border-radius: 50%; background: var(--text-muted);
  animation: bounce 1.2s infinite ease-in-out;
}
.typing-bubble span:nth-child(2) { animation-delay: 0.2s; }
.typing-bubble span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }

/* Message parts */
.mp-p { margin: 0; }
.mp-p:not(:first-child) { margin-top: 2px; }

.mp-list { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
.mp-list li { font-size: 13px; line-height: 1.55; }

.mp-table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid var(--border); }
.mp-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.mp-table thead th {
  padding: 8px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.04em; color: var(--text-muted); background: var(--surface-alt);
  border-bottom: 1px solid var(--border); text-align: left; white-space: nowrap;
}
.mp-table tbody td { padding: 8px 10px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.mp-table tbody tr:last-child td { border-bottom: none; }
.mp-table tbody tr:hover { background: var(--surface-alt); }
.row-ok   td:first-child { border-left: 3px solid #16a34a; }
.row-warn td:first-child { border-left: 3px solid #d97706; }
.row-bad  td:first-child { border-left: 3px solid #dc2626; }
.tbl-status { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px; }
.tbl-status.ok   { background: #dcfce7; color: #16a34a; }
.tbl-status.warn { background: #fef3c7; color: #d97706; }
.tbl-status.bad  { background: #fee2e2; color: #dc2626; }
.tbl-up { color: #16a34a; font-weight: 600; }
.tbl-dn { color: #dc2626; font-weight: 600; }

.mp-kpi { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px; }
.kpi-card {
  padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border);
  background: var(--surface-alt);
}
.kpi-card.ok     { background: #f0fdf4; border-color: #bbf7d0; }
.kpi-card.warn   { background: #fffbeb; border-color: #fde68a; }
.kpi-card.bad    { background: #fef2f2; border-color: #fecaca; }
.kpi-card.brand  { background: var(--brand-light); border-color: var(--border); }
.kpi-val { font-size: 20px; font-weight: 700; color: var(--text); line-height: 1; }
.kpi-card.ok   .kpi-val { color: #16a34a; }
.kpi-card.warn .kpi-val { color: #d97706; }
.kpi-card.bad  .kpi-val { color: #dc2626; }
.kpi-card.brand .kpi-val { color: var(--brand); }
.kpi-lbl { font-size: 10px; color: var(--text-muted); margin-top: 3px; }
.kpi-trend { font-size: 10px; font-weight: 600; color: var(--text-muted); margin-top: 2px; }
.kpi-card.ok   .kpi-trend { color: #16a34a; }
.kpi-card.bad  .kpi-trend { color: #dc2626; }

.mp-tip {
  display: flex; gap: 8px; align-items: flex-start;
  background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;
  padding: 10px 12px; font-size: 12px; color: #166534; line-height: 1.5;
}
.mp-tip i { color: #16a34a; font-size: 13px; flex-shrink: 0; margin-top: 1px; }

.mp-warning {
  display: flex; gap: 8px; align-items: flex-start;
  background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px;
  padding: 10px 12px; font-size: 12px; color: #92400e; line-height: 1.5;
}
.mp-warning i { color: #d97706; font-size: 13px; flex-shrink: 0; margin-top: 1px; }

/* Prompts */
.prompts-bar {
  padding: 8px 20px 0; display: flex; align-items: flex-start; gap: 10px;
  flex-shrink: 0; background: var(--bg); flex-wrap: wrap;
}
.prompts-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); white-space: nowrap; margin-top: 6px; display: flex; align-items: center; gap: 4px; }
.prompts-list { display: flex; flex-wrap: wrap; gap: 6px; }
.prompt-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 11px; border-radius: 20px; font-size: 11px; font-weight: 500;
  border: 1px solid var(--border); background: var(--surface); color: var(--text-muted);
  cursor: pointer; transition: 0.12s; white-space: nowrap;
}
.prompt-chip:hover { border-color: var(--brand); color: var(--brand); background: var(--brand-light); }
.prompt-chip i { font-size: 11px; }

/* Input */
.input-area {
  display: flex; align-items: flex-end; gap: 10px;
  padding: 12px 20px 16px; background: var(--surface); border-top: 1px solid var(--border);
  flex-shrink: 0;
}
.chat-input {
  flex: 1; padding: 11px 14px; border: 1px solid var(--border); border-radius: 12px;
  font-size: 13px; font-family: inherit; color: var(--text); background: var(--surface-alt);
  resize: none; outline: none; max-height: 120px; line-height: 1.5; transition: border-color 0.15s;
}
.chat-input:focus { border-color: var(--accent); background: var(--surface); }
.chat-input::placeholder { color: var(--text-muted); }
.send-btn {
  width: 42px; height: 42px; border-radius: 11px; flex-shrink: 0;
  background: var(--brand); color: white; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 15px;
  transition: 0.15s;
}
.send-btn:hover:not(:disabled) { background: var(--brand-dark); }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
