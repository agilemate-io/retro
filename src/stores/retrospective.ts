import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Retrospective } from '@/types/retrospective'

export const useRetrospectiveStore = defineStore('retrospective', () => {
  const retrospectives = ref<Retrospective[]>([])
  const currentRetrospective = ref<Retrospective | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getTeamRetrospectives = async (teamId: string) => {
    try {
      loading.value = true
      error.value = null
      // Filter retrospectives by team ID
      const teamRetros = retrospectives.value.filter(r => r.teamId === teamId)
      return teamRetros
    } catch (err) {
      error.value = 'Failed to load retrospectives'
      console.error('Error loading retrospectives:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getRetrospective = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      const retro = retrospectives.value.find(r => r.id === id)
      if (!retro) {
        throw new Error('Retrospective not found')
      }
      currentRetrospective.value = retro
      return retro
    } catch (err) {
      error.value = 'Failed to load retrospective'
      console.error('Error loading retrospective:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createRetrospective = async (data: Omit<Retrospective, 'id'>, teamId: string) => {
    try {
      loading.value = true
      error.value = null
      const newRetro: Retrospective = {
        ...data,
        id: crypto.randomUUID(),
        teamId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      retrospectives.value.push(newRetro)
      return newRetro
    } catch (err) {
      error.value = 'Failed to create retrospective'
      console.error('Error creating retrospective:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateRetrospective = async (id: string, data: Partial<Retrospective>) => {
    try {
      loading.value = true
      error.value = null
      const index = retrospectives.value.findIndex(r => r.id === id)
      if (index === -1) {
        throw new Error('Retrospective not found')
      }
      const updatedRetro = {
        ...retrospectives.value[index],
        ...data,
        updatedAt: new Date().toISOString()
      }
      retrospectives.value[index] = updatedRetro
      if (currentRetrospective.value?.id === id) {
        currentRetrospective.value = updatedRetro
      }
      return updatedRetro
    } catch (err) {
      error.value = 'Failed to update retrospective'
      console.error('Error updating retrospective:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteRetrospective = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      const index = retrospectives.value.findIndex(r => r.id === id)
      if (index === -1) {
        throw new Error('Retrospective not found')
      }
      retrospectives.value.splice(index, 1)
      if (currentRetrospective.value?.id === id) {
        currentRetrospective.value = null
      }
    } catch (err) {
      error.value = 'Failed to delete retrospective'
      console.error('Error deleting retrospective:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    retrospectives,
    currentRetrospective,
    loading,
    error,
    getTeamRetrospectives,
    getRetrospective,
    createRetrospective,
    updateRetrospective,
    deleteRetrospective
  }
}) 