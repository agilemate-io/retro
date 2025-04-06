import { ref } from 'vue'
import { auth } from '@/firebase'
import type { User } from 'firebase/auth'

export function useAuth() {
  const currentUser = ref<User | null>(null)

  auth.onAuthStateChanged(user => {
    currentUser.value = user
  })

  return {
    currentUser
  }
} 