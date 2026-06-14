<script setup>
import { useAppStore } from './stores/appStore.js'
import LoginView from './components/LoginView.vue'
import AppHeader from './components/AppHeader.vue'
import StatPage from './components/pages/StatPage.vue'
import CallsPage from './components/pages/CallsPage.vue'
import ReportsPage from './components/pages/ReportsPage.vue'
import ScenariosPage from './components/pages/ScenariosPage.vue'
import GroupPage from './components/pages/GroupPage.vue'
import ChatPage from './components/pages/ChatPage.vue'
import GoalsPage from './components/pages/GoalsPage.vue'
import CoachingPage from './components/pages/CoachingPage.vue'
import AchievementsPage from './components/pages/AchievementsPage.vue'
import SupportChat from './components/SupportChat.vue'

const { state } = useAppStore()
</script>

<template>
  <LoginView v-if="!state.isLoggedIn" />

  <template v-else>
    <AppHeader />
    <main>
      <transition name="page" mode="out-in">
        <StatPage      v-if="state.currentPage === 'stat'"      key="stat" />
        <CallsPage     v-else-if="state.currentPage === 'calls'"     key="calls" />
        <ReportsPage   v-else-if="state.currentPage === 'reports'"   key="reports" />
        <ScenariosPage v-else-if="state.currentPage === 'scenarios'" key="scenarios" />
        <GroupPage     v-else-if="state.currentPage === 'group'"     key="group" />
        <GoalsPage        v-else-if="state.currentPage === 'goals'"        key="goals" />
        <CoachingPage     v-else-if="state.currentPage === 'coaching'"     key="coaching" />
        <AchievementsPage v-else-if="state.currentPage === 'achievements'" key="achievements" />
        <ChatPage         v-else-if="state.currentPage === 'chat'"         key="chat" />
      </transition>
    </main>
    <SupportChat />
  </template>
</template>

<style>
.page-enter-active, .page-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.page-enter-from { opacity: 0; transform: translateY(6px); }
.page-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
