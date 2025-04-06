<template>
  <v-app :theme="themeStore.isDark ? 'dark' : 'light'">
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <img
          src="@/assets/logo.svg"
          max-height="40"
          max-width="40"
          class="mx-2"
        />
        <div class="text-h6 text-uppercase"><span class="font-weight-reguar">Agilemate</span> <span class="font-weight-light">Retrospectives</span></div>
      </div>
      <v-spacer />
      <template v-if="isAuthenticated">
        <v-btn
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          text
          class="mx-2"
        >
          <v-icon left>{{ item.icon }}</v-icon>
          {{ item.text }}
        </v-btn>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              text
              class="mx-2"
            >
              <v-avatar size="32" class="mr-2">
                <v-img
                  v-if="currentUser?.photoURL"
                  :src="currentUser.photoURL"
                  :alt="currentUser.displayName || 'User'"
                />
                <v-icon v-else>mdi-account</v-icon>
              </v-avatar>
              {{ currentUser?.displayName || 'User' }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="handleLogout">
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template v-else>
        <v-btn
          to="/user/login"
          text
          class="mx-2"
        >
          <v-icon left>mdi-login</v-icon>
          Login
        </v-btn>
        <v-btn
          to="/user/register"
          text
          class="mx-2"
        >
          <v-icon left>mdi-account-plus</v-icon>
          Register
        </v-btn>
      </template>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            v-bind="props"
          >
            <v-icon>mdi-theme-light-dark</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, i) in themeOptions"
            :key="i"
            :value="item.value"
            @click="themeStore.setTheme(item.value)"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.icon"></v-icon>
            </template>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <notification-list />
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/theme'
import { useNotifications } from '@/composables/useNotifications'
import NotificationList from '@/components/common/NotificationList.vue'
import type { Theme } from '@/stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const notifications = useNotifications()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUser = computed(() => authStore.currentUser)

const navItems = [
  { text: 'Home', to: '/', icon: 'mdi-home' },
  { text: 'New Retro', to: '/retrospective/new', icon: 'mdi-plus' },
  { text: 'Past Retros', to: '/retrospective/past', icon: 'mdi-history' },
  { text: 'Team', to: '/team-dashboard', icon: 'mdi-account-group' },
  { text: 'Analytics', to: '/analytics', icon: 'mdi-chart-line' }
]

const themeOptions = [
  { title: 'Light', value: 'light' as Theme, icon: 'mdi-white-balance-sunny' },
  { title: 'Dark', value: 'dark' as Theme, icon: 'mdi-moon-waning-crescent' },
  { title: 'System', value: 'system' as Theme, icon: 'mdi-monitor' }
]

const handleLogout = async () => {
  try {
    await authStore.logout()
    notifications.add({
      type: 'success',
      message: 'Logged out successfully'
    })
    router.push('/user/login')
  } catch (error) {
    notifications.add({
      type: 'error',
      message: error instanceof Error ? error.message : 'Logout failed'
    })
  }
}

onMounted(() => {
  themeStore.initTheme()
})
</script>

<style>
.v-main {
  min-height: 100vh;
}
</style>
