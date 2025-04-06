/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createNotifications } from './composables/useNotifications'

// Styles
import '@mdi/font/css/materialdesignicons.css'
import './styles/main.scss'
import router from './router'
import vuetify from './plugins/vuetify'

const app = createApp(App)
const notifications = createNotifications()

app.use(createPinia())
app.use(router)
app.use(vuetify)

// Provide notifications system globally
app.provide('notifications', notifications)

app.mount('#app')
