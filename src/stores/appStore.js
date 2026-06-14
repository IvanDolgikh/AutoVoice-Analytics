import { reactive, computed } from 'vue'

const employees = [
  'Перминов А.А.', 'Артемович Д.С.', 'Суздальцев К.С.', 'Яхонтов Р.А.', 'Абдуллин И.И.',
  'Белов Д.С.', 'Морозов Р.А.', 'Соколов К.С.', 'Каримов И.И.', 'Григорьев А.В.',
  'Лебедев П.Р.', 'Новиков О.А.'
]

const employeeScores = {
  'Перминов А.А.': 11, 'Артемович Д.С.': 12, 'Суздальцев К.С.': 9,
  'Яхонтов Р.А.': 11, 'Абдуллин И.И.': 10, 'Белов Д.С.': 12,
  'Морозов Р.А.': 11, 'Соколов К.С.': 10, 'Каримов И.И.': 9,
  'Григорьев А.В.': 8, 'Лебедев П.Р.': 7, 'Новиков О.А.': 10
}

export const criteria = [
  'Потребность — Определённая',
  'Приветствие — Представился',
  'Имя клиента — Узнал / обращался по имени',
  'Срок покупки — Уточнил срок',
  'Тест-драйв — Предложил',
  'Создание срочности',
  'Взял контакт',
  'Следующий контакт — Договорился'
]

export const criteriaPct = [78.9, 91.4, 67.1, 30.9, 40.1, 23.0, 56.6, 68.4]

const salons = ['Автосалон Окружная', 'Автосалон Федюнинского', 'Автосалон Пермякова']

const seed = [0.72, 0.45, 0.81, 0.33, 0.67, 0.55, 0.78, 0.42, 0.61, 0.38, 0.59, 0.70]
const salonSeed = [0, 1, 2, 0, 1, 2, 0, 1, 0, 2, 1, 0]
const dateSeed = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]

const calls = employees.map((emp, idx) => ({
  id: idx + 1,
  date: `2025-02-0${dateSeed[idx]}`,
  employee: emp,
  salon: salons[salonSeed[idx]],
  type: seed[idx] > 0.6 ? 'Исходящий' : 'Входящий',
  score: employeeScores[emp],
  dialog: `Диалог с ${emp}: обсуждение условий покупки, тест-драйв, акции.`
}))

const state = reactive({
  isLoggedIn: false,
  currentRole: '',
  currentPage: 'stat',
  activeTags: [],
  darkMode: false
})

export function useAppStore() {
  const topEmployees = computed(() =>
    [...employees]
      .sort((a, b) => employeeScores[b] - employeeScores[a])
      .slice(0, 5)
      .map(emp => ({
        name: emp,
        score: employeeScores[emp],
        percent: +((employeeScores[emp] / 13) * 100).toFixed(1)
      }))
  )

  const criteriaData = computed(() =>
    criteria.map((name, i) => ({ name, pct: criteriaPct[i] }))
  )

  // Per-criterion scores (max: [1,2,1,2,2,2,1,2] = 13)
  const empCriteria = {
    'Перминов А.А.':   [1, 2, 1, 2, 2, 1, 1, 1],
    'Артемович Д.С.':  [1, 2, 1, 2, 2, 2, 1, 1],
    'Суздальцев К.С.': [1, 2, 1, 1, 1, 0, 1, 2],
    'Яхонтов Р.А.':    [1, 2, 1, 2, 1, 1, 1, 2],
    'Абдуллин И.И.':   [1, 2, 1, 1, 2, 0, 1, 2],
    'Белов Д.С.':      [1, 2, 1, 2, 2, 2, 1, 1],
    'Морозов Р.А.':    [1, 1, 1, 2, 2, 1, 1, 2],
    'Соколов К.С.':    [1, 2, 1, 1, 1, 1, 1, 2],
    'Каримов И.И.':    [1, 2, 0, 1, 1, 1, 1, 2],
    'Григорьев А.В.':  [1, 2, 0, 1, 1, 0, 1, 2],
    'Лебедев П.Р.':    [1, 1, 0, 1, 1, 0, 1, 2],
    'Новиков О.А.':    [1, 2, 1, 1, 2, 0, 1, 2]
  }

  const scoreReport = computed(() =>
    employees.map(emp => {
      const cs = empCriteria[emp]
      return { name: emp, c1: cs[0], c2: cs[1], c3: cs[2], c4: cs[3], c5: cs[4], c6: cs[5], c7: cs[6], c8: cs[7], total: employeeScores[emp] }
    })
  )

  const roleLabel = computed(() => {
    const map = { director: 'Директор', manager: 'Руководитель', employee: 'Сотрудник' }
    return map[state.currentRole] || ''
  })

  function login(role) {
    state.isLoggedIn = true
    state.currentRole = role
  }

  function logout() {
    state.isLoggedIn = false
    state.currentRole = ''
    state.currentPage = 'stat'
  }

  function setPage(page) {
    state.currentPage = page
  }

  function addTag(tag) {
    if (tag && !state.activeTags.includes(tag)) state.activeTags.push(tag)
  }

  function removeTag(tag) {
    const idx = state.activeTags.indexOf(tag)
    if (idx > -1) state.activeTags.splice(idx, 1)
  }

  function toggleDarkMode() {
    state.darkMode = !state.darkMode
    document.documentElement.classList.toggle('dark-mode', state.darkMode)
  }

  return {
    state, calls, topEmployees, criteriaData, scoreReport, roleLabel,
    login, logout, setPage, addTag, removeTag, toggleDarkMode
  }
}
