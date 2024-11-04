<template>
  <v-responsive class="align-start fill-height bg-application">
    <v-img class="mb-4 mt-8" height="150" src="@/assets/logo.png" />
    <div class="text-center">
      <v-img image="@assets/logo.png" />
      <div class="text-body-2 font-weight-light">Welcome to</div>
      <div class="text-h3 font-weight-bold">Agilemate</div>
      <div class="text-h4">Retrospectives</div>
    </div>

    <v-form @submit.prevent="start">
      <v-container>
        <v-row>
          {{ store }}
          <v-col sm="12" md="6">
            <v-text-field v-model="store.title" label="Retrospective title" density="compact" class="my-4"
              hide-details />
            <v-combobox v-model="store.format" label="Retrospective format" density="compact" class="my-4"
              hide-details :items="formats" />
            <v-btn block variant="text" size="small" color="secondary" class="my-4" @click="options = !options" text="More
              options" />
            <v-sheet color="transparent" class="my-4" v-if="options">
              <v-combobox v-model="store.icebreaker" label="Icebreaker question" density="compact" class="my-4"
                hide-details :items="icebreakers" />
            </v-sheet>
          </v-col>
          <v-col sm="12" md="6">
            <v-text-field v-model="store.username" label="Username" density="compact"
              hint="Enter your display name or alias" class="my-4" prepend-inner-icon="mdi-account" required
              hide-details />
            <v-switch v-model="store.encryption" label="Encrypt data" density="compact" class="ma-4" hide-details />
            <v-text-field v-if="store.encryption" v-model="store.password" label="Password"
              density="compact" hint="Enter data encryption password" class="my-2" prepend-inner-icon="mdi-lock"
              hide-details />
          </v-col>
          <v-col cols="12">
            <v-btn color="primary" block size="large" type="submit" text="Start retrospective" />
            <v-btn block variant="text" size="small" color="secondary" class="my-4" @click="sessions = !sessions" text="Previous retrospectives" />
            <div v-if="sessions">
              <a href="" v-for="(retro, id) in retros" :key="id" class="text-caption mx-4">{{ retro.title }}</a>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-responsive>

</template>

<script setup lang="ts">
import { useStore } from '@/composables/store'
// import { db } from '@/firebase'
import { doc, getDoc, setDoc } from "firebase/firestore"
import { uid } from 'uid'
import { onMounted, reactive, ref } from 'vue'
import { useFirestore, useDocument } from 'vuefire'

const db = useFirestore()

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
  '',
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

const options = ref(false)
const sessions = ref(false)

let defaults = {
  title: 'Sprint Retrospective',
  format: formats[0],
  icebreaker: icebreakers[0],
  username: '',
  password: '',
  encryption: false,
}
let store = reactive(defaults)
let sessionInfo = reactive({ currentSession: null as string | null, allSessions: [] as string[] })
let retros = {}

async function start() {
  console.log('start', store)

  const docId = await createRetro()

  const { set } = useStore()
  set('retro', store, store.password)
  // set('app', { currentSession: docId, allSessions: [docId] })
  // const sessionInfo = { currentSession: docId, allSessions: [docId] }
  if (docId) {
    sessionInfo.currentSession = docId
    if (!sessionStorage.allSessions) sessionStorage.allSessions = []
    if (!sessionStorage.allSessions.includes(docId)) sessionInfo.allSessions.push(docId)
    window.localStorage.setItem('app', JSON.stringify(sessionInfo))
  }

  console.log('Saved data', store, store.password)
  // let data = JSON.stringify(store)
  // if (store.encryption && store.password) {
  //   console.log('Encrypting data')
  //   data = encrypt(data, store.password)
  // }
  // window.localStorage.setItem('retro', data)
  // const sessionData = { encryption: true, password: store.password }
  // window.sessionStorage.setItem('retro', JSON.stringify(sessionData))
}

// type Retrospective = {
//   title: string,
//   description: string | null,
//   owner: string,
//   format: string,
//   icebreaker: string,
//   board: any,
// }

async function createRetro() {
  try {
    // const doc = await databases.getDocument('agilemate', 'retrospectives', 'sessions')
    const retro = {
      title: store.title,
      owner: store.username,
      format: store.format,
      // icebreaker: store.icebreaker,
      board: {
        columns: [
          { title: 'Start', cards: [] },
          { title: 'Stop', cards: [] },
          { title: 'Continue', cards: [] },
        ],
      },
      // config: {
      //   encryption: store.encryption,
      //   password: store.password,
      // },
      // created: new Date().toISOString(),
      // updated: new Date().toISOString(),
    }
    console.log('createRetro', retro)
    // await databases.createDocument('agilemate', 'retrospectives', ID.unique(0), doc)
    // await databases.updateDocument('agilemate', 'retrospectives', 'sessions', doc.$id, doc)


    const docId = uid(6)
    await setDoc(doc(db, "retro", docId), retro)
    // await addDoc(collection(db, "retro"), retro); // automatinc id
    // db.app..collection('retrospectives').add(doc)
    console.log('Retrospective created')
    return docId
  } catch (error) {
    console.error('Error creating retrospective', error)
  }
}

async function loadRetros() {
  for (let retroId of sessionInfo.allSessions) {
    // const retro = await useDocument(doc(db, "retro", retroId))
    const retro = await getDoc(doc(db, "retro", retroId))
    if(retro.exists()) {
      console.log('Retrospective', retro.data(), retroId)
      retros[retro.id] = retro.data()
    }
  }
}

onMounted(() => {
  const info = window.localStorage.getItem('app')
  if (info) sessionInfo = JSON.parse(info)
  console.log('Loaded session info', sessionInfo)
  const { get } = useStore()
  const data = get('retro')
  console.log('Loaded data', data)
  if (data) defaults = data
  store = reactive(defaults)
  loadRetros()
})
</script>

<style lang="scss">
html {
  font-size: 12px !important;
}
</style>