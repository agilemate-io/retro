import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const currentUser = computed(() => user.value)

  async function login(email: string, password: string) {
    try {
      loading.value = true
      error.value = null
      const auth = getAuth()
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred during login'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle() {
    try {
      loading.value = true
      error.value = null
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred during Google login'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string, displayName: string) {
    try {
      loading.value = true
      error.value = null
      const auth = getAuth()
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName,
        email,
        createdAt: new Date(),
        lastLogin: new Date()
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred during registration'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      loading.value = true
      error.value = null
      const auth = getAuth()
      await signOut(auth)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred during logout'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function init() {
    const auth = getAuth()
    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (userData) => {
        user.value = userData
        isInitialized.value = true

        if (userData) {
          // Update last login time
          const userDoc = doc(db, 'users', userData.uid)
          const userSnapshot = await getDoc(userDoc)
          if (userSnapshot.exists()) {
            await setDoc(userDoc, {
              lastLogin: new Date()
            }, { merge: true })
          }
        }

        resolve()
      })
    })
  }

  return {
    user,
    loading,
    error,
    isInitialized,
    isAuthenticated,
    currentUser,
    login,
    loginWithGoogle,
    register,
    logout,
    init
  }
}) 