<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Register</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                v-model="displayName"
                label="Display Name"
                name="displayName"
                prepend-icon="mdi-account"
                :error-messages="error"
                required
                variant="solo-filled"
              />
              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                prepend-icon="mdi-email"
                type="email"
                :error-messages="error"
                required
                variant="solo-filled"
              />
              <v-text-field
                v-model="password"
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                :error-messages="error"
                required
                variant="solo-filled"
              />
              <v-text-field
                v-model="confirmPassword"
                label="Confirm Password"
                name="confirmPassword"
                prepend-icon="mdi-lock-check"
                type="password"
                :error-messages="error"
                required
                variant="solo-filled"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              :loading="loading"
              @click="handleRegister"
            >
              Register
            </v-btn>
          </v-card-actions>
          <v-divider class="my-4" />
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue"
              variant="outlined"
              :loading="loading"
              @click="handleGoogleLogin"
            >
              <v-icon left>mdi-google</v-icon>
              Register with Google
            </v-btn>
          </v-card-actions>
          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="text"
              color="primary"
              to="/user/login"
            >
              Already have an account? Login
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  try {
    loading.value = true
    error.value = ''
    await authStore.register(email.value, password.value, displayName.value)
    router.push('/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Registration failed'
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    await authStore.loginWithGoogle()
    router.push('/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Google registration failed'
  } finally {
    loading.value = false
  }
}
</script> 