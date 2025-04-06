import { ref, computed } from 'vue'

export interface Notification {
  id: number
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  timeout?: number
}

const notifications = ref<Notification[]>([])
let id = 0

export function createNotifications() {
  const add = (notification: Omit<Notification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: id++,
      timeout: notification.timeout ?? 5000
    }
    notifications.value.push(newNotification)
  }

  const remove = (id: number) => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  const clear = () => {
    notifications.value = []
  }

  return {
    notifications: computed(() => notifications.value),
    add,
    remove,
    clear
  }
}

export function useNotifications() {
  return createNotifications()
} 