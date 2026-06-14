<script setup>
import { ref } from 'vue'
import { useAppStore } from '../stores/appStore.js'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Select from 'primevue/select'
import Button from 'primevue/button'

const { login } = useAppStore()

const loginName = ref('admin')
const loginPass = ref('123')
const selectedRole = ref('director')

const roles = [
  { label: 'Директор', value: 'director' },
  { label: 'Руководитель отдела', value: 'manager' },
  { label: 'Сотрудник', value: 'employee' }
]
</script>

<template>
  <div class="login-overlay">
    <div class="login-wrap">
      <div class="login-brand">
        <div class="login-icon"><i class="pi pi-chart-line"></i></div>
        <h1>AutoVoice</h1>
        <p>Аналитика звонков автосалона</p>
      </div>

      <div class="login-fields">
        <div class="lf-group">
          <label>Логин</label>
          <InputText v-model="loginName" placeholder="Введите логин" fluid />
        </div>
        <div class="lf-group">
          <label>Пароль</label>
          <Password v-model="loginPass" placeholder="Введите пароль" :feedback="false" toggleMask fluid />
        </div>
        <div class="lf-group">
          <label>Роль</label>
          <Select v-model="selectedRole" :options="roles" optionLabel="label" optionValue="value" placeholder="Выберите роль" fluid />
        </div>
        <Button label="Войти" icon="pi pi-sign-in" class="login-btn" fluid @click="login(selectedRole)" />
      </div>

      <p class="login-hint">AutoVoice Analytics · интеллектуальная QA‑платформа</p>
    </div>
  </div>
</template>

<style scoped>
.login-overlay {
  position: fixed; inset: 0;
  background: linear-gradient(145deg, #071f2e 0%, #0b3d57 55%, #0e5470 100%);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.login-wrap {
  width: 380px;
  background: #ffffff;
  border-radius: 24px;
  padding: 36px 32px 28px;
  box-shadow: 0 32px 64px rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.login-brand {
  text-align: center;
}
.login-icon {
  width: 56px; height: 56px;
  background: var(--brand-light);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px;
}
.login-icon i { font-size: 24px; color: var(--brand); }
.login-brand h1 { font-size: 22px; font-weight: 700; color: var(--text); }
.login-brand p { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

.login-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.lf-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.lf-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.login-btn {
  background: var(--brand) !important;
  border-color: var(--brand) !important;
  margin-top: 4px;
  height: 42px;
  font-weight: 600;
}
.login-btn:hover { background: var(--brand-dark) !important; border-color: var(--brand-dark) !important; }

.login-hint {
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
}
</style>
