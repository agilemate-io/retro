/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import router from '../router'
import vuetify from './vuetify'
import { VueFire } from 'vuefire'
import { app as firebaseApp } from '../firebase'

// Types
import type { App } from 'vue'

export function registerPlugins (app: App) {
  app
    .use(router)
    .use(vuetify)
    .use(VueFire, { firebaseApp})
}
