<script setup>
import { ref, computed, reactive, nextTick } from 'vue'
import { useAppStore } from '../stores/appStore.js'

const { state, roleLabel } = useAppStore()

// ── Online status (09:00–18:00 weekdays) ─────────────────────────────────────
const isOnline = computed(() => {
  const h = new Date().getHours(), d = new Date().getDay()
  return d >= 1 && d <= 5 && h >= 9 && h < 18
})

// ── Panel state ───────────────────────────────────────────────────────────────
const open     = ref(false)
const minimized = ref(false)
const unread   = ref(1)

function toggle() {
  if (!open.value) { open.value = true; minimized.value = false; unread.value = 0 }
  else minimized.value = !minimized.value
}
function close() { open.value = false }

// ── Ticket ────────────────────────────────────────────────────────────────────
const ticketId   = ref(null)
const ticketShown = ref(false)

function genTicket() {
  const n = String(Math.floor(Math.random() * 9000) + 1000)
  ticketId.value = `AV-${new Date().getMonth() + 1}${new Date().getDate()}-${n}`
}

// ── Messages ──────────────────────────────────────────────────────────────────
const mid = ref(10)
function mkMsg(role, text, meta) {
  return { id: ++mid.value, role, text, time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }), meta: meta || null }
}

const welcomeText = computed(() =>
  isOnline.value
    ? 'Привет! Я Алина, специалист поддержки AutoVoice Analytics 👋\nЧем могу помочь? Выберите тему или напишите свой вопрос.'
    : 'Привет! Сейчас поддержка офлайн (работаем пн–пт, 09:00–18:00).\nОставьте сообщение — ответим утром в первую очередь.'
)

const messages = reactive([
  mkMsg('agent', welcomeText.value)
])

// Quick topics
const topics = [
  { icon: 'pi-exclamation-circle', label: 'Ошибка / баг',    key: 'bug',      color: '#fee2e2', tc: '#dc2626' },
  { icon: 'pi-question-circle',    label: 'Вопрос',           key: 'question', color: '#e0f2fe', tc: '#0369a1' },
  { icon: 'pi-graduation-cap',     label: 'Обучение',         key: 'training', color: '#ede9fe', tc: '#7c3aed' },
  { icon: 'pi-lightbulb',          label: 'Пожелание',        key: 'wish',     color: '#fef3c7', tc: '#d97706' },
  { icon: 'pi-file-import',        label: 'Проблема с данными',key: 'data',    color: '#dcfce7', tc: '#16a34a' },
  { icon: 'pi-wallet',             label: 'Баланс / оплата',  key: 'billing',  color: '#f3e8ff', tc: '#9333ea' },
]

const topicsShown = ref(true)
const priority    = ref('medium')
const priorities  = [
  { key: 'low',    label: 'Низкий',   color: '#16a34a' },
  { key: 'medium', label: 'Средний',  color: '#d97706' },
  { key: 'high',   label: 'Высокий',  color: '#dc2626' },
  { key: 'urgent', label: 'Срочно!',  color: '#7c3aed' },
]
const priorityColor = computed(() => priorities.find(p => p.key === priority.value)?.color ?? '#d97706')

// ── Auto-response rules ───────────────────────────────────────────────────────
const rules = [
  {
    match: ['ошибк', 'не работает', 'баг', 'сломал', 'вылет', 'краш', 'не загружа'],
    replies: [
      'Понял, фиксирую! Пожалуйста, уточните: в каком разделе возникла ошибка и что отображается на экране?',
      'Я передала информацию техническому специалисту. Время ответа — до 2 рабочих часов. Номер вашего обращения: **{{ticket}}**'
    ],
    delays: [1400, 4500]
  },
  {
    match: ['звонк', 'баланс', 'лимит', 'закончил', 'оплат', 'тариф', 'стоим'],
    replies: [
      'Уточняю информацию по вашему аккаунту...',
      'На вашем балансе сейчас **1 847 звонков**, действуют до 31.05.2026. Если хотите пополнить — пришлю ссылку на оплату.'
    ],
    delays: [1200, 3000]
  },
  {
    match: ['обучен', 'как работ', 'инструкц', 'помогите разобрат', 'не понимаю'],
    replies: [
      'Конечно, помогу разобраться! Что именно вызывает затруднение? Конкретный раздел или функция?',
      'Также у нас есть видео-инструкции в Базе знаний. Могу прислать ссылку на нужный раздел — скажите тему.'
    ],
    delays: [1300, 3500]
  },
  {
    match: ['скрипт', 'критери', 'сценари', 'оценк'],
    replies: [
      'По вопросам настройки сценариев и критериев — это к нашему отделу внедрения. Уточните задачу, и я переведу обращение на нужного специалиста.',
    ],
    delays: [1600]
  },
  {
    match: ['пожелан', 'предложен', 'улучш', 'добавьте', 'хотели бы'],
    replies: [
      'Спасибо за пожелание! Мы ценим обратную связь. Я передам его команде разработки — они рассматривают все предложения при планировании.',
      'Обращение **{{ticket}}** зафиксировано. Если пожелание наберёт приоритет — вы получите уведомление о статусе.'
    ],
    delays: [1500, 4000]
  },
  {
    match: ['отчёт', 'экспорт', 'excel', 'csv', 'выгрузк'],
    replies: [
      'По вопросам экспорта: в разделах «Отчёты» и «Групповые проверки» есть кнопки «Экспорт CSV» — данные скачиваются в формате, совместимом с Excel.',
      'Если нужен другой формат (PDF, XLSX) — это можно сделать через настройки экспорта. Хотите, пришлю инструкцию?'
    ],
    delays: [1200, 3800]
  },
]

function fallbackReplies() {
  return [
    'Понял вас! Уточните, пожалуйста, детали — чем точнее опишете, тем быстрее помогу.',
    `Обращение **{{ticket}}** зафиксировано. Ожидайте ответа в течение ${isOnline.value ? '1 рабочего часа' : 'следующего рабочего дня'}.`
  ]
}
function fallbackDelays() { return [1300, 3500] }

// ── Sending ───────────────────────────────────────────────────────────────────
const input     = ref('')
const agentTyping = ref(false)
const rated     = ref(null)
const messagesEl = ref(null)

function scrollBottom() {
  nextTick(() => {
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  })
}

function sendQueue(replies, delays) {
  let cum = 0
  replies.forEach((text, i) => {
    cum += delays[i] ?? 1500
    setTimeout(() => {
      if (i === replies.length - 1) agentTyping.value = false
      const rendered = ticketId.value ? text.replace('{{ticket}}', ticketId.value) : text
      messages.push(mkMsg('agent', rendered))
      scrollBottom()
      // If offline, offer rating after last message
      if (i === replies.length - 1 && !isOnline.value && rated.value === null) {
        setTimeout(() => {
          messages.push(mkMsg('agent', 'Оцените, пожалуйста, качество нашей поддержки:', 'rating'))
          scrollBottom()
        }, 1200)
      }
    }, cum)
  })
}

function selectTopic(topic) {
  topicsShown.value = false
  messages.push(mkMsg('user', topic.label))
  scrollBottom()
  handleAutoReply(topic.label)
}

function send() {
  const text = input.value.trim()
  if (!text) return
  input.value = ''
  topicsShown.value = false

  if (!ticketId.value) {
    genTicket()
    ticketShown.value = true
    setTimeout(() => { ticketShown.value = false }, 4000)
  }

  messages.push(mkMsg('user', text))
  scrollBottom()
  handleAutoReply(text)
}

function handleAutoReply(text) {
  const t = text.toLowerCase()
  const rule = rules.find(r => r.match.some(k => t.includes(k)))
  const replies = rule ? rule.replies : fallbackReplies()
  const delays  = rule ? rule.delays  : fallbackDelays()

  agentTyping.value = true
  setTimeout(() => {
    // First reply ends typing
  }, delays[0])
  sendQueue(replies, delays)
}

function onKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
}

function rate(n) {
  rated.value = n
  messages.push(mkMsg('user', '⭐'.repeat(n) + ` (${n}/5)`))
  setTimeout(() => {
    messages.push(mkMsg('agent', n >= 4
      ? 'Спасибо за высокую оценку! Рады были помочь 😊'
      : 'Спасибо за честность. Передам команде — постараемся стать лучше.'
    ))
    scrollBottom()
  }, 900)
  scrollBottom()
}

function boldRender(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
}
</script>

<template>
  <Teleport to="body">

    <!-- ── Floating button ── -->
    <div class="sc-fab-wrap" v-if="state.isLoggedIn">
      <transition name="ticket-banner">
        <div v-if="ticketShown && ticketId" class="ticket-toast">
          <i class="pi pi-check-circle"></i>
          Обращение <strong>{{ ticketId }}</strong> создано
        </div>
      </transition>

      <button class="sc-fab" @click="toggle" :class="{ open, pulse: !open && unread > 0 }">
        <transition name="icon-flip" mode="out-in">
          <i v-if="!open || minimized" key="chat" class="pi pi-comments"></i>
          <i v-else key="minus" class="pi pi-minus"></i>
        </transition>
        <span v-if="!open && unread > 0" class="fab-badge">{{ unread }}</span>
        <span class="fab-status-dot" :class="isOnline ? 'online' : 'offline'"></span>
      </button>
    </div>

    <!-- ── Chat panel ── -->
    <transition name="panel">
      <div v-if="open && state.isLoggedIn" class="sc-panel" :class="{ minimized }">

        <!-- Header -->
        <div class="sc-head" @click="minimized && toggle()">
          <div class="sc-agent">
            <div class="agent-av">А</div>
            <div>
              <div class="agent-name">Алина · Служба поддержки</div>
              <div class="agent-status">
                <span class="status-dot" :class="isOnline ? 'online' : 'offline'"></span>
                {{ isOnline ? 'Онлайн · отвечает быстро' : 'Офлайн · ответим утром' }}
              </div>
            </div>
          </div>
          <div class="sc-head-actions">
            <button class="head-btn" @click.stop="minimized = !minimized" :title="minimized ? 'Развернуть' : 'Свернуть'">
              <i class="pi" :class="minimized ? 'pi-chevron-up' : 'pi-minus'"></i>
            </button>
            <button class="head-btn close" @click.stop="close" title="Закрыть">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>

        <template v-if="!minimized">

          <!-- Ticket bar -->
          <div v-if="ticketId" class="sc-ticket-bar">
            <i class="pi pi-ticket"></i>
            Обращение <strong>{{ ticketId }}</strong>
            <span class="priority-pill" :style="{ background: priorityColor + '20', color: priorityColor }">
              {{ priorities.find(p=>p.key===priority)?.label }}
            </span>
          </div>

          <!-- Messages -->
          <div class="sc-messages" ref="messagesEl">
            <div v-for="msg in messages" :key="msg.id" class="msg-wrap" :class="msg.role">

              <!-- Agent avatar -->
              <div v-if="msg.role === 'agent'" class="msg-av">А</div>

              <div class="msg-content">
                <!-- Rating request -->
                <template v-if="msg.meta === 'rating'">
                  <div class="msg-bubble agent">
                    <span v-html="boldRender(msg.text)"></span>
                  </div>
                  <div class="rating-row" v-if="rated === null">
                    <button v-for="n in 5" :key="n" class="star-btn" @click="rate(n)">
                      <i class="pi pi-star-fill" :style="{ color: '#f59e0b' }"></i>
                    </button>
                  </div>
                  <div v-else class="rated-confirm">Оценка отправлена · {{ '⭐'.repeat(rated) }}</div>
                </template>

                <!-- Regular message -->
                <template v-else>
                  <div class="msg-bubble" :class="msg.role" v-html="boldRender(msg.text)"></div>
                </template>

                <div class="msg-time">{{ msg.time }}</div>
              </div>
            </div>

            <!-- Quick topics -->
            <div v-if="topicsShown" class="topics-wrap">
              <div class="topics-label">Выберите тему:</div>
              <div class="topics-grid">
                <button
                  v-for="t in topics" :key="t.key"
                  class="topic-chip"
                  :style="{ background: t.color, color: t.tc, borderColor: t.tc + '40' }"
                  @click="selectTopic(t)"
                >
                  <i :class="['pi', t.icon]"></i>
                  {{ t.label }}
                </button>
              </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="agentTyping" class="msg-wrap agent">
              <div class="msg-av">А</div>
              <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>
          </div>

          <!-- Priority + Input -->
          <div class="sc-input-area">
            <div class="priority-row">
              <span class="pri-label">Приоритет:</span>
              <button
                v-for="p in priorities" :key="p.key"
                class="pri-btn"
                :class="{ active: priority === p.key }"
                :style="priority === p.key ? { background: p.color + '18', color: p.color, borderColor: p.color } : {}"
                @click="priority = p.key"
              >{{ p.label }}</button>
            </div>
            <div class="input-row">
              <textarea
                v-model="input"
                class="sc-textarea"
                placeholder="Опишите ваш вопрос или проблему…"
                rows="1"
                @keydown="onKey"
                @input="e => { e.target.style.height='auto'; e.target.style.height = Math.min(e.target.scrollHeight, 80)+'px' }"
              ></textarea>
              <button class="sc-send" :disabled="!input.trim()" @click="send">
                <i class="pi pi-send"></i>
              </button>
            </div>
            <div class="sc-footer-note">
              <i class="pi pi-lock"></i> Переписка защищена · AutoVoice Support
            </div>
          </div>

        </template>
      </div>
    </transition>

  </Teleport>
</template>

<style scoped>
/* ── FAB ── */
.sc-fab-wrap {
  position: fixed; bottom: 24px; right: 24px; z-index: 900;
  display: flex; flex-direction: column; align-items: flex-end; gap: 10px;
}

.sc-fab {
  width: 54px; height: 54px; border-radius: 50%;
  background: var(--brand); color: white;
  border: none; cursor: pointer; font-size: 22px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(11,94,126,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}
.sc-fab:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(11,94,126,0.5); }
.sc-fab.open  { background: var(--brand-dark); }

.sc-fab.pulse::before {
  content: ''; position: absolute; inset: -4px; border-radius: 50%;
  background: var(--brand); opacity: 0.3;
  animation: pulse-ring 2s ease-out infinite;
}
@keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.35; } 100% { transform: scale(1.55); opacity: 0; } }

.fab-badge {
  position: absolute; top: -3px; right: -3px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #dc2626; color: white; font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid white;
}

.fab-status-dot {
  position: absolute; bottom: 2px; right: 2px;
  width: 11px; height: 11px; border-radius: 50%; border: 2px solid white;
}
.fab-status-dot.online  { background: #22c55e; }
.fab-status-dot.offline { background: #94a3b8; }

/* ── Ticket toast ── */
.ticket-toast {
  background: var(--brand); color: white;
  padding: 8px 14px; border-radius: 10px; font-size: 12px;
  display: flex; align-items: center; gap: 7px;
  box-shadow: 0 4px 14px rgba(11,94,126,0.35);
  white-space: nowrap;
}

/* ── Panel ── */
.sc-panel {
  position: fixed; bottom: 90px; right: 24px; z-index: 899;
  width: 340px; max-height: 520px;
  background: var(--surface); border-radius: 18px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
  display: flex; flex-direction: column;
  overflow: hidden; border: 1px solid var(--border);
}
.sc-panel.minimized { max-height: 60px; }

/* Header */
.sc-head {
  background: var(--brand); color: white;
  padding: 12px 14px;
  display: flex; align-items: center; justify-content: space-between;
  flex-shrink: 0;
  cursor: pointer;
}
.sc-agent { display: flex; align-items: center; gap: 10px; }
.agent-av {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.25); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; flex-shrink: 0;
}
.agent-name   { font-size: 13px; font-weight: 700; line-height: 1.2; }
.agent-status { font-size: 10px; opacity: 0.85; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; }
.status-dot.online  { background: #4ade80; }
.status-dot.offline { background: rgba(255,255,255,0.5); }

.sc-head-actions { display: flex; gap: 4px; }
.head-btn {
  width: 26px; height: 26px; border-radius: 6px; border: none;
  background: rgba(255,255,255,0.15); color: white;
  cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.head-btn:hover { background: rgba(255,255,255,0.25); }
.head-btn.close:hover { background: rgba(220,38,38,0.6); }

/* Ticket bar */
.sc-ticket-bar {
  background: var(--brand-light); color: var(--brand);
  padding: 6px 14px; font-size: 11px; font-weight: 500;
  display: flex; align-items: center; gap: 7px;
  border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.priority-pill { font-size: 10px; font-weight: 700; padding: 1px 8px; border-radius: 20px; margin-left: auto; }

/* Messages */
.sc-messages {
  flex: 1; overflow-y: auto; padding: 14px 12px;
  display: flex; flex-direction: column; gap: 10px;
  scroll-behavior: smooth;
}

.msg-wrap { display: flex; gap: 7px; align-items: flex-end; }
.msg-wrap.user { flex-direction: row-reverse; }

.msg-av {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--brand); color: white; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; margin-bottom: 16px;
}

.msg-content { display: flex; flex-direction: column; gap: 2px; max-width: 82%; }
.msg-wrap.user .msg-content { align-items: flex-end; }

.msg-bubble {
  padding: 9px 12px; border-radius: 14px;
  font-size: 12px; line-height: 1.55; word-break: break-word;
}
.msg-bubble.agent {
  background: var(--surface-alt); border: 1px solid var(--border);
  color: var(--text); border-bottom-left-radius: 4px;
}
.msg-bubble.user {
  background: var(--brand); color: white; border-bottom-right-radius: 4px;
}

.msg-time { font-size: 9px; color: var(--text-muted); padding: 0 2px; }

/* Topics */
.topics-wrap { display: flex; flex-direction: column; gap: 7px; }
.topics-label { font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; padding-left: 2px; }
.topics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
.topic-chip {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 9px; border-radius: 8px; font-size: 11px; font-weight: 500;
  border: 1px solid transparent; cursor: pointer; transition: 0.12s; text-align: left;
}
.topic-chip:hover { filter: brightness(0.93); }
.topic-chip i { font-size: 12px; flex-shrink: 0; }

/* Typing dots */
.typing-dots {
  background: var(--surface-alt); border: 1px solid var(--border);
  border-radius: 14px; border-bottom-left-radius: 4px;
  padding: 12px 16px; display: flex; gap: 5px; align-items: center;
}
.typing-dots span {
  width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted);
  animation: tdot 1.2s infinite ease-in-out;
}
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes tdot { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }

/* Rating */
.rating-row { display: flex; gap: 4px; padding: 4px 2px; }
.star-btn { background: none; border: none; cursor: pointer; font-size: 20px; padding: 2px; transition: transform 0.1s; }
.star-btn:hover { transform: scale(1.2); }
.rated-confirm { font-size: 11px; color: #16a34a; padding: 4px 2px; }

/* Input area */
.sc-input-area {
  border-top: 1px solid var(--border); padding: 10px 12px 8px; flex-shrink: 0;
  display: flex; flex-direction: column; gap: 7px;
}
.priority-row { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.pri-label { font-size: 10px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-right: 2px; }
.pri-btn {
  font-size: 10px; font-weight: 600; padding: 3px 9px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--surface-alt); color: var(--text-muted);
  cursor: pointer; transition: 0.12s;
}
.pri-btn.active { font-weight: 700; }

.input-row { display: flex; gap: 8px; align-items: flex-end; }
.sc-textarea {
  flex: 1; padding: 9px 11px; border: 1px solid var(--border); border-radius: 10px;
  font-size: 12px; font-family: inherit; color: var(--text); background: var(--surface-alt);
  resize: none; outline: none; max-height: 80px; line-height: 1.5; transition: border-color 0.15s;
}
.sc-textarea:focus { border-color: var(--accent); background: var(--surface); }
.sc-textarea::placeholder { color: var(--text-muted); }

.sc-send {
  width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
  background: var(--brand); color: white; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 14px;
  transition: 0.15s;
}
.sc-send:hover:not(:disabled) { background: var(--brand-dark); }
.sc-send:disabled { opacity: 0.35; cursor: not-allowed; }

.sc-footer-note {
  font-size: 10px; color: var(--text-muted); display: flex; align-items: center; gap: 4px;
  justify-content: center;
}
.sc-footer-note i { font-size: 10px; }

/* ── Transitions ── */
.panel-enter-active { transition: opacity 0.2s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.panel-leave-active { transition: opacity 0.15s, transform 0.18s ease-in; }
.panel-enter-from, .panel-leave-to { opacity: 0; transform: translateY(16px) scale(0.95); }

.ticket-banner-enter-active { transition: opacity 0.2s, transform 0.25s; }
.ticket-banner-leave-active { transition: opacity 0.2s, transform 0.2s; }
.ticket-banner-enter-from, .ticket-banner-leave-to { opacity: 0; transform: translateX(20px); }

.icon-flip-enter-active, .icon-flip-leave-active { transition: opacity 0.15s, transform 0.15s; }
.icon-flip-enter-from { opacity: 0; transform: rotate(-90deg) scale(0.7); }
.icon-flip-leave-to   { opacity: 0; transform: rotate( 90deg) scale(0.7); }
</style>
