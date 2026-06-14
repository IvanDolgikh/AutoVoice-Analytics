<script setup>
import { useAppStore } from '../stores/appStore.js'
import NotificationCenter from './NotificationCenter.vue'

const { state, roleLabel, logout, setPage, toggleDarkMode } = useAppStore()

const navItems = [
    { key: 'stat', label: 'Статистика', icon: 'pi-chart-bar' },
    { key: 'calls', label: 'Звонки', icon: 'pi-phone' },
    { key: 'reports', label: 'Отчёты', icon: 'pi-file-export' },
    { key: 'scenarios', label: 'Сценарии', icon: 'pi-list-check' },
    { key: 'group', label: 'Групп. проверки', icon: 'pi-users' },
    { key: 'goals', label: 'Цели', icon: 'pi-flag' },
    { key: 'coaching', label: 'Coaching', icon: 'pi-calendar' },
    { key: 'achievements', label: 'Рейтинг', icon: 'pi-trophy' },
    { key: 'chat', label: 'ИИ-ассистент', icon: 'pi-comments' }
]
</script>

<template>
    <header class="app-header">
        <div class="header-inner">
            <div class="logo">
                <div class="logo-icon"><i class="pi pi-microphone"></i></div>
                <div>
                    <div class="logo-name">AutoVoice Analytics</div>
                    <div class="logo-sub">интеллектуальная QA‑платформа</div>
                </div>
            </div>

            <nav class="nav-pills">
                <button
                    v-for="item in navItems"
                    :key="item.key"
                    class="nav-pill"
                    :class="{ active: state.currentPage === item.key }"
                    @click="setPage(item.key)"
                >
                    <i :class="['pi', item.icon]"></i>
                    {{ item.label }}
                </button>
            </nav>

            <div class="header-right">
                <NotificationCenter />

                <button
                    class="theme-btn"
                    @click="toggleDarkMode"
                    :title="state.darkMode ? 'Светлая тема' : 'Тёмная тема'"
                >
                    <i :class="['pi', state.darkMode ? 'pi-sun' : 'pi-moon']"></i>
                </button>

                <div class="user-chip">
                    <div class="user-avatar">{{ roleLabel[0] }}</div>
                    <div>
                        <div class="user-name">admin</div>
                        <div class="user-role">{{ roleLabel }}</div>
                    </div>
                    <button
                        class="logout-btn"
                        title="Выйти"
                        @click="logout"
                    >
                        <i class="pi pi-sign-out"></i>
                    </button>
                </div>
            </div>
        </div>
    </header>
</template>

<style scoped>
.app-header {
    background: #ffffff;
    border-bottom: 1px solid var(--border);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-inner {
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 24px;
    height: 60px;
    display: flex;
    align-items: center;
    gap: 16px;
}

.logo {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
}

.logo-icon {
    width: 34px;
    height: 34px;
    background: var(--brand-light);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo-icon i {
    color: var(--brand);
    font-size: 15px;
}

.logo-name {
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
}

.logo-sub {
    font-size: 10px;
    color: var(--text-muted);
}

.nav-pills {
    display: flex;
    gap: 1px;
    background: var(--bg);
    padding: 3px;
    border-radius: 12px;
    flex: 1;
    justify-content: center;
    flex-wrap: nowrap;
    overflow-x: auto;
}

.nav-pill {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 8px;
    border: none;
    background: transparent;
    font-size: 11.5px;
    font-weight: 500;
    color: var(--text-muted);
    cursor: pointer;
    transition: 0.15s;
    white-space: nowrap;
    flex-shrink: 0;
}

.nav-pill i {
    font-size: 12px;
}

.nav-pill:hover {
    background: rgba(255, 255, 255, 0.7);
    color: var(--text);
}

.nav-pill.active {
    background: #ffffff;
    color: var(--brand);
    font-weight: 600;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.balance-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--brand-light);
    border-radius: 10px;
    padding: 5px 10px;
    font-size: 11px;
    color: var(--brand);
}

.balance-chip i {
    font-size: 13px;
}

.balance-count {
    font-weight: 700;
    line-height: 1.2;
}

.balance-exp {
    font-size: 10px;
    opacity: 0.7;
}

.theme-btn {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    background: var(--surface-alt);
    border: 1px solid var(--border);
    color: var(--text-muted);
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.15s;
}

.theme-btn:hover {
    background: var(--brand-light);
    color: var(--brand);
    border-color: var(--brand);
}

.user-chip {
    display: flex;
    align-items: center;
    gap: 7px;
    background: var(--surface-alt);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 4px 8px 4px 5px;
}

.user-avatar {
    width: 26px;
    height: 26px;
    background: var(--brand);
    color: white;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
}

.user-name {
    font-size: 11px;
    font-weight: 600;
    color: var(--text);
    line-height: 1.2;
}

.user-role {
    font-size: 10px;
    color: var(--text-muted);
}

.logout-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #dc2626;
    padding: 2px 4px;
    border-radius: 6px;
    opacity: 0.7;
    transition: 0.15s;
}

.logout-btn:hover {
    opacity: 1;
    background: #fef2f2;
}
</style>
