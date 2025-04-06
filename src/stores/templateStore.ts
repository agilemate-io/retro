import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useFirestore } from 'vuefire'
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore'
import type { RetroTemplate } from '@/types/retro-templates'
import { RETRO_TEMPLATES } from '@/types/retro-templates'

export const useTemplateStore = defineStore('template', () => {
  const db = useFirestore()
  const customTemplates = ref<RetroTemplate[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const allTemplates = computed(() => [
    ...RETRO_TEMPLATES,
    ...customTemplates.value
  ])

  const loadCustomTemplates = async (teamId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const templatesRef = collection(db, 'templates')
      const q = query(templatesRef, where('teamId', '==', teamId))
      const querySnapshot = await getDocs(q)
      
      customTemplates.value = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as RetroTemplate[]
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load custom templates'
      console.error('Error loading custom templates:', e)
    } finally {
      loading.value = false
    }
  }

  const createTemplate = async (template: Omit<RetroTemplate, 'id'>, teamId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const templatesRef = collection(db, 'templates')
      const docRef = await addDoc(templatesRef, {
        ...template,
        teamId,
        createdAt: new Date(),
        isCustom: true
      })
      
      const newTemplate = {
        ...template,
        id: docRef.id
      } as RetroTemplate
      
      customTemplates.value.push(newTemplate)
      return newTemplate
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create template'
      console.error('Error creating template:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateTemplate = async (templateId: string, updates: Partial<RetroTemplate>) => {
    try {
      loading.value = true
      error.value = null
      
      const templateRef = doc(db, 'templates', templateId)
      await updateDoc(templateRef, updates)
      
      const index = customTemplates.value.findIndex(t => t.id === templateId)
      if (index !== -1) {
        customTemplates.value[index] = {
          ...customTemplates.value[index],
          ...updates
        }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update template'
      console.error('Error updating template:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteTemplate = async (templateId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const templateRef = doc(db, 'templates', templateId)
      await deleteDoc(templateRef)
      
      customTemplates.value = customTemplates.value.filter(t => t.id !== templateId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete template'
      console.error('Error deleting template:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    customTemplates,
    allTemplates,
    loading,
    error,
    loadCustomTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
}) 