import { mount, VueWrapper } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createTestingPinia } from '@pinia/testing'
import type { Component } from 'vue'
import { vi } from 'vitest'

export function createWrapper(
  component: Component,
  options: any = {}
) {
  const vuetify = createVuetify({
    components,
    directives
  })

  return mount(component, {
    global: {
      plugins: [
        vuetify,
        createTestingPinia({
          createSpy: vi.fn
        })
      ],
      stubs: {
        transition: false
      }
    },
    ...options
  })
}

export function createMockRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }
} 