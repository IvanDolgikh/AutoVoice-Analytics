<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../../stores/appStore.js'
import Chart from 'primevue/chart'
import Button from 'primevue/button'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'

const { scoreReport } = useAppStore()

// ── Shared filters ────────────────────────────────────────────────────────────
const dateFrom   = ref(new Date('2026-06-01'))
const dateTo     = ref(new Date('2026-06-30'))
const salonOpts  = [
  { label: 'Все салоны', value: null },
  { label: 'Автосалон Окружная', value: 'okr' },
  { label: 'Автосалон Федюнинского', value: 'fed' },
  { label: 'Автосалон Пермякова', value: 'per' }
]
const salonFilter = ref(null)

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSION REPORT
// ═══════════════════════════════════════════════════════════════════════════════
const availableTags = [
  { key: 'salon',    label: 'Салон',       icon: 'pi-building' },
  { key: 'employee', label: 'Сотрудник',   icon: 'pi-user' },
  { key: 'type',     label: 'Тип звонка',  icon: 'pi-phone' },
  { key: 'need',     label: 'Потребность', icon: 'pi-tag' }
]
const droppedLevels = ref([])
const dragKey       = ref(null)
const dropActive    = ref(false)
const convGenerated = ref(false)
const convLoading   = ref(false)

function onDragStart(key) { dragKey.value = key }
function onDragOver(e) { e.preventDefault(); dropActive.value = true }
function onDragLeave()  { dropActive.value = false }
function onDrop(e) {
  e.preventDefault(); dropActive.value = false
  const tag = availableTags.find(t => t.key === dragKey.value)
  if (tag && !droppedLevels.value.find(l => l.key === tag.key)) {
    droppedLevels.value.push(tag)
  }
}
function removeLevel(key) { droppedLevels.value = droppedLevels.value.filter(l => l.key !== key) }

// Conversion steps
const convSteps = ['Входящих звонков', 'Выявление потребности', 'Тест-драйв', 'Договорённость']

const convDataByKey = {
  salon: [
    { name: 'Автосалон Окружная',     vals: [58, 47, 22, 14] },
    { name: 'Автосалон Федюнинского', vals: [42, 31, 18, 11] },
    { name: 'Автосалон Пермякова',    vals: [52, 44, 19, 12] }
  ],
  employee: [
    { name: 'Артемович Д.С.',  vals: [14, 12, 7, 5] },
    { name: 'Белов Д.С.',      vals: [12, 10, 6, 4] },
    { name: 'Яхонтов Р.А.',    vals: [13, 10, 5, 3] },
    { name: 'Морозов Р.А.',    vals: [11, 9, 4, 3]  },
    { name: 'Перминов А.А.',   vals: [15, 11, 5, 3] }
  ],
  type: [
    { name: 'Входящие',   vals: [112, 91, 43, 28] },
    { name: 'Исходящие',  vals: [40,  29, 16,  9] }
  ],
  need: [
    { name: 'Новый автомобиль', vals: [89, 74, 38, 24] },
    { name: 'Trade-in',         vals: [38, 28, 13,  8] },
    { name: 'Сервис',           vals: [25, 20,  8,  5] }
  ]
}

const convRows = computed(() => {
  if (!droppedLevels.value.length) return []
  const key = droppedLevels.value[0].key
  return convDataByKey[key] ?? []
})

const convTotals = computed(() => {
  if (!convRows.value.length) return []
  return convSteps.map((_, i) => convRows.value.reduce((s, r) => s + r.vals[i], 0))
})

function pct(row, idx) {
  return idx === 0 ? 100 : Math.round((row.vals[idx] / row.vals[0]) * 100)
}
function totalPct(idx) {
  if (!convTotals.value.length || idx === 0) return 100
  return Math.round((convTotals.value[idx] / convTotals.value[0]) * 100)
}
function convColor(p) {
  return p >= 70 ? '#16a34a' : p >= 40 ? '#d97706' : '#dc2626'
}
function convBg(p) {
  return p >= 70 ? '#dcfce7' : p >= 40 ? '#fef3c7' : '#fee2e2'
}

// Bar chart for conversion
const convChartData = computed(() => {
  if (!convRows.value.length) return null
  const colors = ['#0b5e7e','#1b7ea3','#2eaed4','#93d4e9']
  return {
    labels: convRows.value.map(r => r.name),
    datasets: convSteps.map((step, si) => ({
      label: step,
      data: convRows.value.map(r => si === 0 ? r.vals[0] : Math.round((r.vals[si] / r.vals[0]) * 100)),
      backgroundColor: colors[si],
      borderRadius: 4,
      barPercentage: 0.7
    }))
  }
})
const convChartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', align: 'end', labels: { font: { size: 11 }, boxWidth: 12, padding: 10 } },
    tooltip: { callbacks: { label: ctx => ctx.datasetIndex === 0 ? ` ${ctx.raw} звонков` : ` ${ctx.raw}% конверсия` } }
  },
  scales: {
    x: { ticks: { font: { size: 11 }, color: '#5a7a92' }, grid: { display: false }, border: { display: false } },
    y: { ticks: { font: { size: 11 }, color: '#5a7a92' }, grid: { color: 'rgba(0,0,0,0.05)' }, border: { display: false } }
  }
}

function generateConv() {
  convLoading.value = true
  setTimeout(() => { convLoading.value = false; convGenerated.value = true }, 700)
}

function exportConvCSV() {
  const header = ['Группа', ...convSteps].join(';')
  const rows = convRows.value.map(r =>
    [r.name, ...r.vals.map((v, i) => `${v} (${pct(r, i)}%)`)].join(';')
  )
  const total = ['Итого', ...convTotals.value.map((v, i) => `${v} (${totalPct(i)}%)`)].join(';')
  const csv = [header, ...rows, total].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = 'conversion_report.csv'; a.click()
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCORE REPORT
// ═══════════════════════════════════════════════════════════════════════════════
const scoreGenerated  = ref(false)
const scoreLoading    = ref(false)
const scoreSortField  = ref('total')
const scoreSortAsc    = ref(false)

const criteriaShort = ['Привет.','Потреб.','Имя','Срок','Тест-д.','Срочн.','Контакт','След.к.']
const criteriaFull  = ['Приветствие','Выявление потребности','Обращение по имени','Срок покупки','Тест-драйв','Создание срочности','Сбор контакта','Планирование след. контакта']
const maxScores     = [1, 2, 1, 2, 2, 2, 1, 2]
const maxTotal      = maxScores.reduce((a, b) => a + b, 0)

const scoreRows = computed(() => {
  const trendSeeds = [-1, +1, 0, +2, -1, 0, +1, -2, +1, 0, -1, +1]
  const rows = scoreReport.value.map((r, idx) => {
    const scores = [r.c1, r.c2, r.c3, r.c4, r.c5, r.c6, r.c7, r.c8]
    const trend = trendSeeds[idx] ?? 0
    return { name: r.name, scores, total: r.total, trend }
  })
  return rows.sort((a, b) => {
    const mul = scoreSortAsc.value ? 1 : -1
    return (a[scoreSortField.value] > b[scoreSortField.value] ? 1 : -1) * mul
  })
})

const scoreAvgs = computed(() => {
  if (!scoreRows.value.length) return []
  const n = scoreRows.value.length
  return maxScores.map((_, ci) =>
    +(scoreRows.value.reduce((s, r) => s + r.scores[ci], 0) / n).toFixed(1)
  )
})
const avgTotal = computed(() => scoreAvgs.value.reduce((a, b) => a + b, 0).toFixed(1))

function cellClass(score, max) {
  if (score === max) return 'cell-full'
  if (score > 0)    return 'cell-part'
  return 'cell-zero'
}
function trendClass(t) { return t > 0 ? 'trend-up' : t < 0 ? 'trend-dn' : 'trend-eq' }

// Radar chart
const radarData = computed(() => ({
  labels: criteriaShort,
  datasets: [
    {
      label: 'Среднее %',
      data: scoreAvgs.value.map((v, i) => Math.round((v / maxScores[i]) * 100)),
      borderColor: '#0b5e7e', backgroundColor: 'rgba(11,94,126,0.12)',
      pointBackgroundColor: '#0b5e7e', pointRadius: 4, borderWidth: 2
    },
    {
      label: 'Цель %',
      data: [80, 80, 80, 80, 80, 80, 80, 80],
      borderColor: '#16a34a', borderDash: [5, 4],
      backgroundColor: 'rgba(22,163,74,0.04)', pointRadius: 0, borderWidth: 1.5
    }
  ]
}))
const radarOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'top', align: 'end', labels: { font: { size: 11 }, boxWidth: 12 } },
    tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}%` } }
  },
  scales: {
    r: {
      min: 0, max: 100,
      ticks: { stepSize: 25, font: { size: 10 }, backdropColor: 'transparent', color: '#5a7a92' },
      grid: { color: 'rgba(0,0,0,0.06)' },
      pointLabels: { font: { size: 10, weight: '500' }, color: '#1a2c3e' },
      angleLines: { color: 'rgba(0,0,0,0.06)' }
    }
  }
}

// Insights
const insights = computed(() => {
  const avgs = scoreAvgs.value
  const worst = criteriaFull[avgs.map((v, i) => v / maxScores[i]).indexOf(Math.min(...avgs.map((v, i) => v / maxScores[i])))]
  const best  = criteriaFull[avgs.map((v, i) => v / maxScores[i]).indexOf(Math.max(...avgs.map((v, i) => v / maxScores[i])))]
  const topEmp = scoreRows.value[0]?.name
  const below60 = scoreRows.value.filter(r => (r.total / maxTotal) < 0.6).length
  return { worst, best, topEmp, below60 }
})

function generateScore() {
  scoreLoading.value = true
  setTimeout(() => { scoreLoading.value = false; scoreGenerated.value = true }, 700 )
}

function sortBy(field) {
  if (scoreSortField.value === field) scoreSortAsc.value = !scoreSortAsc.value
  else { scoreSortField.value = field; scoreSortAsc.value = false }
}

function exportScoreCSV() {
  const header = ['Сотрудник', ...criteriaFull, 'Итого', 'Тренд'].join(';')
  const rows = scoreRows.value.map(r =>
    [r.name, ...r.scores, `${r.total}/${maxTotal}`, r.trend > 0 ? `+${r.trend}` : r.trend].join(';')
  )
  const avg = ['Среднее', ...scoreAvgs.value, avgTotal.value, ''].join(';')
  const csv = [header, ...rows, avg].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = 'score_report.csv'; a.click()
}

function exportPDF() {
  const printHeader = document.querySelector('.print-header')
  if (printHeader) {
    printHeader.textContent = `AutoVoice Analytics — Отчёт · ${new Date().toLocaleDateString('ru-RU')}`
    printHeader.style.display = 'block'
  }
  window.print()
  if (printHeader) printHeader.style.display = 'none'
}
</script>

<template>
  <div class="av-page reports-page">

    <div class="print-header"></div>

    <!-- ═══════ CONVERSION REPORT ═══════ -->
    <div class="report-section av-card">
      <div class="rs-head">
        <div>
          <div class="rs-title"><i class="pi pi-objects-column"></i> Конверсионный отчёт</div>
          <div class="rs-sub">Иерархическая структура с тегами в строках</div>
        </div>
        <div class="rs-filters">
          <DatePicker v-model="dateFrom" dateFormat="yy-mm-dd" showIcon placeholder="С" style="width:150px;" />
          <DatePicker v-model="dateTo"   dateFormat="yy-mm-dd" showIcon placeholder="По" style="width:150px;" />
          <Select v-model="salonFilter" :options="salonOpts" optionLabel="label" optionValue="value" placeholder="Все салоны" style="width:180px;" />
        </div>
      </div>

      <div class="conv-builder">
        <!-- Available tags -->
        <div class="tag-section">
          <div class="tag-section-label">Доступные теги</div>
          <div class="tag-pool">
            <div
              v-for="tag in availableTags"
              :key="tag.key"
              class="drag-tag"
              :class="{ used: droppedLevels.find(l => l.key === tag.key) }"
              draggable="true"
              @dragstart="onDragStart(tag.key)"
            >
              <i :class="['pi', tag.icon]"></i>
              {{ tag.label }}
              <i class="pi pi-bars drag-handle"></i>
            </div>
          </div>
        </div>

        <!-- Drop zone -->
        <div class="drop-section">
          <div class="tag-section-label">Строки отчёта (перетащите теги)</div>
          <div
            class="drop-zone"
            :class="{ 'dz-active': dropActive, 'dz-filled': droppedLevels.length > 0 }"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
          >
            <template v-if="droppedLevels.length === 0">
              <i class="pi pi-arrow-right" style="font-size:16px;opacity:0.4;"></i>
              <span>Перетащите теги сюда</span>
            </template>
            <template v-else>
              <div v-for="(level, idx) in droppedLevels" :key="level.key" class="level-chip">
                <span class="level-num">{{ idx + 1 }}</span>
                <i :class="['pi', level.icon]"></i>
                {{ level.label }}
                <i class="pi pi-times level-remove" @click="removeLevel(level.key)"></i>
              </div>
            </template>
          </div>
        </div>

        <!-- Actions -->
        <div class="conv-actions">
          <Button
            :label="convLoading ? 'Генерируем...' : 'Сгенерировать отчёт'"
            icon="pi pi-play"
            :loading="convLoading"
            :disabled="droppedLevels.length === 0"
            style="background:var(--brand)!important;border-color:var(--brand)!important;"
            @click="generateConv"
          />
          <Button v-if="convGenerated" label="Экспорт CSV" icon="pi pi-download" outlined @click="exportConvCSV" />
          <Button v-if="convGenerated" label="Экспорт PDF" icon="pi pi-file-pdf" outlined @click="exportPDF" style="color:#dc2626!important;border-color:#dc2626!important;" />
        </div>
      </div>

      <!-- Generated result -->
      <transition name="fade">
        <div v-if="convGenerated && convRows.length" class="conv-result">
          <div class="result-label">
            <i class="pi pi-check-circle" style="color:var(--brand);"></i>
            Отчёт сгенерирован · Группировка по: <strong>{{ droppedLevels.map(l=>l.label).join(' → ') }}</strong>
          </div>

          <!-- Conversion table -->
          <div style="overflow-x:auto;">
            <table class="conv-table">
              <thead>
                <tr>
                  <th>{{ droppedLevels[0]?.label }}</th>
                  <th v-for="step in convSteps" :key="step">{{ step }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in convRows" :key="row.name">
                  <td class="row-name">{{ row.name }}</td>
                  <td v-for="(val, idx) in row.vals" :key="idx">
                    <div class="conv-cell">
                      <span class="conv-count">{{ val }}</span>
                      <span class="conv-pct" :style="{ background: convBg(pct(row,idx)), color: convColor(pct(row,idx)) }">
                        {{ pct(row, idx) }}%
                      </span>
                      <div v-if="idx > 0" class="conv-bar-bg">
                        <div class="conv-bar-fill" :style="{ width: pct(row,idx)+'%', background: convColor(pct(row,idx)) }"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td><strong>Итого</strong></td>
                  <td v-for="(val, idx) in convTotals" :key="idx">
                    <div class="conv-cell">
                      <span class="conv-count"><strong>{{ val }}</strong></span>
                      <span class="conv-pct" :style="{ background: convBg(totalPct(idx)), color: convColor(totalPct(idx)) }">
                        {{ totalPct(idx) }}%
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Bar chart -->
          <div class="conv-chart-wrap">
            <div class="chart-title">Сравнение конверсии по группам</div>
            <div style="height:220px;">
              <Chart v-if="convChartData" type="bar" :data="convChartData" :options="convChartOptions" style="height:100%;" />
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- ═══════ SCORE REPORT ═══════ -->
    <div class="report-section av-card">
      <div class="rs-head">
        <div>
          <div class="rs-title"><i class="pi pi-star"></i> Балльный отчёт по сотрудникам</div>
          <div class="rs-sub">Оценка по 8 критериям скрипта · макс. {{ maxTotal }} баллов</div>
        </div>
        <div class="rs-filters">
          <DatePicker v-model="dateFrom" dateFormat="yy-mm-dd" showIcon style="width:150px;" />
          <DatePicker v-model="dateTo"   dateFormat="yy-mm-dd" showIcon style="width:150px;" />
          <Select v-model="salonFilter" :options="salonOpts" optionLabel="label" optionValue="value" placeholder="Все салоны" style="width:180px;" />
        </div>
      </div>

      <div class="score-builder">
        <div class="score-level-info">
          <span class="tag-section-label">Уровень группировки</span>
          <div class="level-chip static"><span class="level-num">1</span><i class="pi pi-user"></i> Сотрудник</div>
          <span style="font-size:11px;color:var(--text-muted);">Балльный отчёт поддерживает один уровень иерархии</span>
        </div>
        <div class="conv-actions">
          <Button
            :label="scoreLoading ? 'Генерируем...' : 'Сгенерировать отчёт'"
            icon="pi pi-play"
            :loading="scoreLoading"
            style="background:var(--brand)!important;border-color:var(--brand)!important;"
            @click="generateScore"
          />
          <Button v-if="scoreGenerated" label="Экспорт CSV" icon="pi pi-download" outlined @click="exportScoreCSV" />
          <Button v-if="scoreGenerated" label="Экспорт PDF" icon="pi pi-file-pdf" outlined @click="exportPDF" style="color:#dc2626!important;border-color:#dc2626!important;" />
        </div>
      </div>

      <transition name="fade">
        <div v-if="scoreGenerated" class="score-result">
          <div class="result-label">
            <i class="pi pi-check-circle" style="color:var(--brand);"></i>
            Отчёт сгенерирован · {{ scoreRows.length }} сотрудников · Средний балл: <strong>{{ avgTotal }}/{{ maxTotal }}</strong>
          </div>

          <!-- Insights -->
          <div class="insights-row">
            <div class="insight-card best">
              <i class="pi pi-trophy"></i>
              <div>
                <div class="ic-label">Лучший критерий</div>
                <div class="ic-val">{{ insights.best }}</div>
              </div>
            </div>
            <div class="insight-card worst">
              <i class="pi pi-exclamation-triangle"></i>
              <div>
                <div class="ic-label">Требует внимания</div>
                <div class="ic-val">{{ insights.worst }}</div>
              </div>
            </div>
            <div class="insight-card top">
              <i class="pi pi-user"></i>
              <div>
                <div class="ic-label">Лучший сотрудник</div>
                <div class="ic-val">{{ insights.topEmp }}</div>
              </div>
            </div>
            <div class="insight-card danger" v-if="insights.below60 > 0">
              <i class="pi pi-times-circle"></i>
              <div>
                <div class="ic-label">Ниже 60%</div>
                <div class="ic-val">{{ insights.below60 }} сотр.</div>
              </div>
            </div>
          </div>

          <!-- Score table -->
          <div style="overflow-x:auto;">
            <table class="score-table">
              <thead>
                <tr>
                  <th class="sortable" @click="sortBy('name')">
                    Сотрудник <i class="pi" :class="scoreSortField==='name'?(scoreSortAsc?'pi-sort-up':'pi-sort-down'):'pi-sort'"></i>
                  </th>
                  <th v-for="(sh, idx) in criteriaShort" :key="sh" :title="criteriaFull[idx]">
                    {{ sh }}<br><span class="max-label">max {{ maxScores[idx] }}</span>
                  </th>
                  <th class="sortable" @click="sortBy('total')">
                    Итог <i class="pi" :class="scoreSortField==='total'?(scoreSortAsc?'pi-sort-up':'pi-sort-down'):'pi-sort'"></i>
                  </th>
                  <th>Тренд</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in scoreRows" :key="row.name" class="score-row">
                  <td class="emp-name">{{ row.name }}</td>
                  <td v-for="(sc, ci) in row.scores" :key="ci" class="score-cell-td">
                    <span class="score-chip" :class="cellClass(sc, maxScores[ci])">{{ sc }}</span>
                  </td>
                  <td>
                    <div class="total-cell">
                      <span class="total-num" :class="(row.total/maxTotal)>=0.7?'high':(row.total/maxTotal)>=0.5?'mid':'low'">
                        {{ row.total }}/{{ maxTotal }}
                      </span>
                      <div class="total-bar">
                        <div class="total-fill"
                          :class="(row.total/maxTotal)>=0.7?'high':(row.total/maxTotal)>=0.5?'mid':'low'"
                          :style="{ width: ((row.total/maxTotal)*100)+'%' }">
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span :class="['trend', trendClass(row.trend)]">
                      <i class="pi" :class="row.trend>0?'pi-arrow-up':row.trend<0?'pi-arrow-down':'pi-minus'"></i>
                      {{ row.trend > 0 ? '+' : '' }}{{ row.trend !== 0 ? row.trend : '' }}
                    </span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="avg-row">
                  <td><strong>Среднее</strong></td>
                  <td v-for="(avg, ci) in scoreAvgs" :key="ci" class="score-cell-td">
                    <span class="score-chip" :class="cellClass(Math.round(avg), maxScores[ci])">{{ avg }}</span>
                  </td>
                  <td>
                    <div class="total-cell">
                      <span class="total-num high">{{ avgTotal }}/{{ maxTotal }}</span>
                      <div class="total-bar">
                        <div class="total-fill high" :style="{ width: ((+avgTotal/maxTotal)*100)+'%' }"></div>
                      </div>
                    </div>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Radar chart -->
          <div class="score-chart-wrap">
            <div class="chart-title">Средний балл по критериям (% от максимума)</div>
            <div style="height:280px;">
              <Chart type="radar" :data="radarData" :options="radarOptions" style="height:100%;" />
            </div>
          </div>
        </div>
      </transition>
    </div>

  </div>
</template>

<style scoped>
.reports-page { display: flex; flex-direction: column; gap: 20px; }

/* ── Section card ── */
.report-section { overflow: hidden; }
.rs-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; padding: 20px 22px 14px;
  border-bottom: 1px solid var(--border);
}
.rs-title { font-size: 15px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; }
.rs-title i { color: var(--brand); }
.rs-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.rs-filters { display: flex; gap: 8px; flex-wrap: wrap; }

/* ── Conv builder ── */
.conv-builder { padding: 16px 22px; display: flex; flex-direction: column; gap: 14px; }
.tag-section-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px; display: block; }
.tag-pool { display: flex; flex-wrap: wrap; gap: 8px; }
.drag-tag {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 500;
  background: var(--surface-alt); border: 1px solid var(--border); color: var(--text);
  cursor: grab; transition: 0.15s;
}
.drag-tag:hover { border-color: var(--brand); color: var(--brand); }
.drag-tag.used { opacity: 0.4; cursor: not-allowed; }
.drag-tag i { font-size: 12px; }
.drag-handle { opacity: 0.3; margin-left: 2px; }

.drop-zone {
  border: 2px dashed var(--border); border-radius: 10px; min-height: 54px;
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 12px 16px;
  color: var(--text-muted); font-size: 13px; transition: 0.15s;
}
.drop-zone.dz-active { border-color: var(--accent); background: var(--brand-light); }
.drop-zone.dz-filled { border-style: solid; border-color: var(--brand); }
.level-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 10px; border-radius: 8px;
  background: var(--brand-light); border: 1px solid var(--brand);
  color: var(--brand); font-size: 12px; font-weight: 600;
}
.level-chip.static { cursor: default; }
.level-num {
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--brand); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0;
}
.level-remove { opacity: 0.6; cursor: pointer; margin-left: 2px; }
.level-remove:hover { opacity: 1; }

.conv-actions { display: flex; gap: 10px; flex-wrap: wrap; }

/* ── Conv result ── */
.conv-result { padding: 0 22px 20px; display: flex; flex-direction: column; gap: 16px; }
.result-label {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; color: var(--text-muted);
  background: var(--surface-alt); border-radius: 8px; padding: 8px 12px;
}
.result-label strong { color: var(--text); }

/* Conv table */
.conv-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.conv-table thead th {
  padding: 9px 14px; font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--text-muted); background: var(--surface-alt);
  border-bottom: 2px solid var(--border); text-align: left;
}
.conv-table tbody td { padding: 10px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.conv-table tfoot td { padding: 10px 14px; background: var(--surface-alt); }
.row-name { font-weight: 600; font-size: 13px; white-space: nowrap; }
.total-row { background: var(--surface-alt); }

.conv-cell { display: flex; flex-direction: column; gap: 4px; }
.conv-count { font-size: 14px; font-weight: 700; color: var(--text); }
.conv-pct { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 20px; display: inline-block; }
.conv-bar-bg { height: 4px; background: var(--border); border-radius: 99px; width: 80px; overflow: hidden; }
.conv-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s; }

.conv-chart-wrap { background: var(--surface-alt); border-radius: 12px; padding: 16px 16px 12px; }
.chart-title { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 10px; }

/* ── Score builder ── */
.score-builder { padding: 16px 22px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; border-bottom: 1px solid var(--border); }
.score-level-info { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

/* ── Score result ── */
.score-result { padding: 0 22px 20px; display: flex; flex-direction: column; gap: 16px; }

/* Insights */
.insights-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.insight-card {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; border-radius: 10px;
  border: 1px solid var(--border);
}
.insight-card i { font-size: 18px; flex-shrink: 0; }
.insight-card.best  { background: #f0fdf4; border-color: #bbf7d0; }
.insight-card.best i { color: #16a34a; }
.insight-card.worst { background: #fff7ed; border-color: #fed7aa; }
.insight-card.worst i { color: #d97706; }
.insight-card.top   { background: var(--brand-light); border-color: #bdd4e4; }
.insight-card.top i { color: var(--brand); }
.insight-card.danger { background: #fef2f2; border-color: #fecaca; }
.insight-card.danger i { color: #dc2626; }
.ic-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); }
.ic-val { font-size: 13px; font-weight: 600; color: var(--text); margin-top: 2px; }

/* Score table */
.score-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.score-table thead th {
  padding: 9px 10px; font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.03em;
  color: var(--text-muted); background: var(--surface-alt);
  border-bottom: 2px solid var(--border); text-align: center; white-space: nowrap;
}
.score-table thead th:first-child { text-align: left; }
.score-table tbody td { padding: 9px 10px; border-bottom: 1px solid var(--border); text-align: center; vertical-align: middle; }
.score-table tbody td:first-child { text-align: left; }
.score-table tfoot td { padding: 9px 10px; background: #f0f7fb; border-top: 2px solid var(--brand); text-align: center; }
.score-table tfoot td:first-child { text-align: left; }
.sortable { cursor: pointer; user-select: none; }
.sortable:hover { color: var(--brand) !important; }
.max-label { font-size: 9px; font-weight: 400; opacity: 0.7; }
.emp-name { font-weight: 600; white-space: nowrap; text-align: left !important; }
.score-row:hover { background: var(--surface-alt); }
.avg-row { }

.score-chip {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 7px;
  font-size: 12px; font-weight: 700;
}
.cell-full { background: #dcfce7; color: #16a34a; }
.cell-part { background: #fef3c7; color: #b45309; }
.cell-zero { background: #fee2e2; color: #dc2626; }

.total-cell { display: flex; flex-direction: column; gap: 3px; align-items: flex-start; min-width: 80px; }
.total-num { font-size: 12px; font-weight: 700; }
.total-num.high { color: #16a34a; }
.total-num.mid  { color: #d97706; }
.total-num.low  { color: #dc2626; }
.total-bar { width: 70px; height: 4px; background: var(--border); border-radius: 99px; overflow: hidden; }
.total-fill { height: 100%; border-radius: 99px; transition: width 0.5s; }
.total-fill.high { background: #16a34a; }
.total-fill.mid  { background: #f59e0b; }
.total-fill.low  { background: #ef4444; }

.trend { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 600; padding: 2px 6px; border-radius: 6px; }
.trend-up { background: #dcfce7; color: #16a34a; }
.trend-dn { background: #fee2e2; color: #dc2626; }
.trend-eq { background: var(--surface-alt); color: var(--text-muted); }
.trend i { font-size: 10px; }

.score-chart-wrap { background: var(--surface-alt); border-radius: 12px; padding: 16px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s, transform 0.2s; }
.fade-enter-from { opacity: 0; transform: translateY(8px); }

@media (max-width: 900px) {
  .insights-row { grid-template-columns: repeat(2, 1fr); }
  .rs-head { flex-direction: column; }
}
</style>
