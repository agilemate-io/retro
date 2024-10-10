<template>
  <v-responsive class="align-start fill-height bg-application">
    <v-img class="mb-4 mt-8" height="150" src="@/assets/logo.png" />
    <div class="text-center">
      <v-img image="@assets/logo.png" />
      <div class="text-body-2 font-weight-light mb-n1">Welcome to</div>
      <div class="text-h3 font-weight-bold">Agilemate</div>
      <div class="text-h4">Retrospectives</div>
    </div>

    <v-form @submit.prevent="start">
      <v-container>
        <v-row>
          <v-col sm="12" md="6">
            <v-text-field v-model="store.title" label="Retrospective title" outlined density="compact" class="my-4"
              hide-details />
            <v-combobox v-model="store.format" label="Retrospective format" outlined density="compact" class="my-4"
              hide-details :items="formats" />
            <v-btn block variant="text" size="small" color="secondary" class="my-4" @click="options = !options" text="More
              options" />
            <v-sheet color="transparent" class="my-4" v-if="options">
              <v-combobox v-model="store.icebreaker" label="Icebreaker question" outlined density="compact" class="my-4"
                hide-details :items="icebreakers" />
            </v-sheet>
          </v-col>
          <v-col sm="12" md="6">
            <v-text-field v-model="store.name" label="Username" outlined density="compact"
              hint="Enter your display name or alias" class="my-4" prepend-inner-icon="mdi-account" required
              hide-details />

            <v-switch v-model="store.encryption" label="Encrypt data" density="compact" class="ma-4" hide-details />
            <v-text-field :disabled="!store.encryption" v-model="store.password" label="Password" outlined
              density="compact" hint="Enter data encryption password" class="my-2" prepend-inner-icon="mdi-lock"
              hide-details />
          </v-col>
          <v-col cols="12">
            <v-btn color="primary" block size="large" type="submit" text="Start retrospective" />
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-responsive>

</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';

const formats = [
  '~~Random~~',
  'Start, Stop, Continue',
  'Glad, Sad, Mad',
  'Sailboat',
  '4Ls',
  'Lean Coffee',
  'Starfish',
  'Timeline',
  'Went Well, Do Differently, Appreciations',
  'Proud, Sorry, Thankful',
  'ESVP',
  'Plus, Minus, Interesting',
  'Keep, Add, Less, More',
  'Drop, Add, Keep, Improve',
  'KALM',
  'Sprint Retrospective',
  'Project Retrospective',
  'Team Health Check',
  'Mad, Sad, Glad',
  'Satisfaction',
  'Learning Matrix',
]

const icebreakers = [
  '~~Random~~',
  'What is your favorite book?',
  'If you could have any superpower, what would it be?',
  'What is your favorite hobby?',
  'If you could travel anywhere in the world, where would you go?',
  'What is your favorite movie?',
  'What is one thing you are grateful for today?',
  'If you could meet any historical figure, who would it be?',
  'What is your favorite food?',
  'What is your favorite season and why?',
  'What is one thing you are looking forward to this week?',
  'If you could learn any skill instantly, what would it be?',
  'What is your favorite way to relax?',
  'What is your favorite childhood memory?',
  'If you could have dinner with anyone, living or dead, who would it be?',
  'What is your favorite quote or saying?',
  'What is one thing you love about your job?',
  'What is your favorite type of music?',
  'If you could live in any time period, when would it be?',
  'What is your favorite sport or physical activity?',
  'What is one goal you have for this year?'
]

const name = ref('')
const password = ref('')
const encryption = ref(false)
const options = ref(false)

const title = ref('Sprint Retrospective')
const format = ref(formats[0])
const icebreaker = ref('')

let defaults = {
  title: 'Sprint Retrospective',
  format: formats[0],
  icebreaker: icebreakers[0],
  name: '',
  password: '',
  encryption: false,
}
let store = reactive(defaults)

function start() {
  console.log('start', name.value, password.value, encryption.value, title.value, format.value, icebreaker.value)
  window.localStorage.setItem('retro', JSON.stringify(store))
}

onMounted(() => {
  console.log('Mounted')
  const state = window.localStorage.getItem('retro')
  if (state) {
    defaults = JSON.parse(state)
    store = reactive(defaults)
  }
})
</script>

<style lang="scss">
html {
  font-size: 12px !important;
}
</style>