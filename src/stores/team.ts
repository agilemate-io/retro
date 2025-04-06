import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Team } from '@/types/team'

export const useTeamStore = defineStore('team', () => {
  const teams = ref<Team[]>([])
  const currentTeam = ref<Team | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getTeams = async () => {
    try {
      loading.value = true
      error.value = null
      return teams.value
    } catch (err) {
      error.value = 'Failed to load teams'
      console.error('Error loading teams:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getTeam = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      const team = teams.value.find(t => t.id === id)
      if (!team) {
        throw new Error('Team not found')
      }
      currentTeam.value = team
      return team
    } catch (err) {
      error.value = 'Failed to load team'
      console.error('Error loading team:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createTeam = async (data: Omit<Team, 'id'>) => {
    try {
      loading.value = true
      error.value = null
      const newTeam: Team = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        members: []
      }
      teams.value.push(newTeam)
      return newTeam
    } catch (err) {
      error.value = 'Failed to create team'
      console.error('Error creating team:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTeam = async (id: string, data: Partial<Team>) => {
    try {
      loading.value = true
      error.value = null
      const index = teams.value.findIndex(t => t.id === id)
      if (index === -1) {
        throw new Error('Team not found')
      }
      const updatedTeam = {
        ...teams.value[index],
        ...data,
        updatedAt: new Date().toISOString()
      }
      teams.value[index] = updatedTeam
      if (currentTeam.value?.id === id) {
        currentTeam.value = updatedTeam
      }
      return updatedTeam
    } catch (err) {
      error.value = 'Failed to update team'
      console.error('Error updating team:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTeam = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      const index = teams.value.findIndex(t => t.id === id)
      if (index === -1) {
        throw new Error('Team not found')
      }
      teams.value.splice(index, 1)
      if (currentTeam.value?.id === id) {
        currentTeam.value = null
      }
    } catch (err) {
      error.value = 'Failed to delete team'
      console.error('Error deleting team:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setCurrentTeam = (team: Team | null) => {
    currentTeam.value = team
  }

  return {
    teams,
    currentTeam,
    loading,
    error,
    getTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    setCurrentTeam
  }
}) 