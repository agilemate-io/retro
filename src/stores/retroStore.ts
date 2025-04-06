import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Retrospective, RetroPhase } from '@/types/retrospective'
import { useFirestore } from '@/composables/useFirestore'
import { useTeamStore } from '@/stores/teamStore'

export const useRetroStore = defineStore('retro', () => {
  const { queryCollection } = useFirestore()
  const teamStore = useTeamStore()

  const currentRetro = ref<Retrospective | null>(null)
  const retroPhase = ref<RetroPhase>('feedback')
  const timeRemaining = ref(0)
  const retrospectives = ref<Retrospective[]>([])

  const isRetroActive = computed(() => currentRetro.value !== null)

  const recentRetrospectives = computed(() => {
    return retrospectives.value
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
  })

  const completedActionItemsCount = computed(() => {
    return retrospectives.value.reduce((count, retro) => 
      count + retro.actionItems.filter(item => item.status === 'completed').length, 0
    )
  })

  const pendingActionItemsCount = computed(() => {
    return retrospectives.value.reduce((count, retro) => 
      count + retro.actionItems.filter(item => item.status === 'pending').length, 0
    )
  })

  const pendingActionItems = computed(() => {
    return retrospectives.value
      .flatMap(retro => retro.actionItems
        .filter(item => item.status === 'pending')
        .map(item => ({
          ...item,
          retroTitle: retro.title
        }))
      )
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return a.dueDate.getTime() - b.dueDate.getTime()
        }
        return a.dueDate ? -1 : b.dueDate ? 1 : 0
      })
  })

  async function loadRetrospectives() {
    if (!teamStore.currentTeam) return

    const retros = await queryCollection<Retrospective>('retrospectives', [
      { field: 'teamId', operator: '==', value: teamStore.currentTeam.id }
    ])
    retrospectives.value = retros
  }

  function startNewRetro(title: string, teamId: string) {
    currentRetro.value = {
      id: crypto.randomUUID(),
      title,
      teamId,
      createdAt: new Date(),
      phase: 'feedback',
      feedback: [],
      actionItems: [],
      participants: [],
      settings: {
        template: 'mad-sad-glad',
        timeBoxes: {
          feedback: 10,
          grouping: 5,
          voting: 5,
          actionItems: 10
        },
        maxVotesPerUser: 5,
        allowAnonymousFeedback: false
      }
    }
  }

  return {
    currentRetro,
    retroPhase,
    timeRemaining,
    isRetroActive,
    recentRetrospectives,
    completedActionItemsCount,
    pendingActionItemsCount,
    pendingActionItems,
    startNewRetro,
    loadRetrospectives
  }
}) 