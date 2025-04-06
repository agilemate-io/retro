import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createWrapper } from '@/utils/test-utils'
import CreateTeamDialog from '../team/CreateTeamDialog.vue'
import { useTeamStore } from '@/stores/teamStore'

describe('CreateTeamDialog', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = createWrapper(CreateTeamDialog, {
      props: {
        modelValue: true
      }
    })
  })

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('validates team name', async () => {
    const input = wrapper.find('[data-test="team-name-input"]')
    await input.setValue('')
    expect(wrapper.vm.isValid).toBe(false)
    
    await input.setValue('Test Team')
    expect(wrapper.vm.isValid).toBe(true)
  })

  it('creates team on form submit', async () => {
    const teamStore = useTeamStore()
    const createTeamSpy = vi.spyOn(teamStore, 'createTeam')

    await wrapper.find('[data-test="team-name-input"]').setValue('Test Team')
    await wrapper.find('form').trigger('submit.prevent')

    expect(createTeamSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Team'
      })
    )
  })
}) 