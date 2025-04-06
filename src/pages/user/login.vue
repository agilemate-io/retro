<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="emailInput"
                label="Email"
                name="email"
                prepend-icon="mdi-email"
                type="email"
                :error-messages="emailErrors"
                @input="$v.email.$touch()"
                @blur="$v.email.$touch()"
                variant="solo-filled"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                @click:append="showPassword = !showPassword"
                :error-messages="passwordErrors"
                @input="$v.password.$touch()"
                @blur="$v.password.$touch()"
                variant="solo-filled"
              ></v-text-field>

              <v-checkbox
                v-model="rememberMe"
                label="Remember me"
                color="primary"
              ></v-checkbox>

              <v-btn
                color="primary"
                block
                type="submit"
                :loading="loading"
                :disabled="loading"
              >
                Login
              </v-btn>

              <div class="text-center mt-4">
                <v-btn
                  text
                  color="primary"
                  @click="handleGoogleLogin"
                  :loading="loading"
                  :disabled="loading"
                >
                  <v-icon left>mdi-google</v-icon>
                  Login with Google
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn text color="primary" to="/user/register">
              Don't have an account? Register
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import { useNotifications } from '@/composables/useNotifications'

const router = useRouter()
const authStore = useAuthStore()
const notifications = useNotifications()

const emailInput = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const loading = ref(false)

const rules = {
  email: { required, email },
  password: { required }
}

const $v = useVuelidate(rules, { email: emailInput, password })

const emailErrors = computed(() => {
  const errors = []
  if (!$v.value.email.$dirty) return errors
  if (!$v.value.email.required) errors.push('Email is required')
  if (!$v.value.email.email) errors.push('Must be a valid email')
  return errors
})

const passwordErrors = computed(() => {
  const errors = []
  if (!$v.value.password.$dirty) return errors
  if (!$v.value.password.required) errors.push('Password is required')
  return errors
})

const handleLogin = async () => {
  try {
    $v.value.$touch()
    if ($v.value.$invalid) return

    loading.value = true
    await authStore.login(emailInput.value, password.value)
    notifications.add({
      type: 'success',
      message: 'Login successful'
    })
    router.push('/')
  } catch (error) {
    notifications.add({
      type: 'error',
      message: error instanceof Error ? error.message : 'Login failed'
    })
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    loading.value = true
    await authStore.loginWithGoogle()
    notifications.add({
      type: 'success',
      message: 'Login successful'
    })
    router.push('/')
  } catch (error) {
    notifications.add({
      type: 'error',
      message: error instanceof Error ? error.message : 'Google login failed'
    })
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  $v.value.$reset()
})
</script> 