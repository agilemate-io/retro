<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
  >
    <v-card>
      <v-card-title>Export Retrospective</v-card-title>
      
      <v-card-text>
        <v-form v-model="isValid">
          <v-select
            v-model="options.format"
            :items="exportFormats"
            label="Export Format"
            required
          />

          <v-divider class="my-4" />

          <v-checkbox
            v-model="options.includeMetadata"
            label="Include Metadata"
          />

          <v-checkbox
            v-model="options.includeFeedback"
            label="Include Feedback"
          />

          <v-checkbox
            v-model="options.includeActionItems"
            label="Include Action Items"
          />

          <v-checkbox
            v-model="options.includeVotes"
            label="Include Votes"
          />

          <v-checkbox
            v-model="options.includeParticipants"
            label="Include Participants"
          />

          <v-divider class="my-4" />

          <v-text-field
            v-model="options.customHeader"
            label="Custom Header"
          />

          <v-text-field
            v-model="options.customFooter"
            label="Custom Footer"
          />

          <v-select
            v-model="options.dateFormat"
            :items="dateFormats"
            label="Date Format"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="error"
          variant="text"
          @click="dialog = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="!isValid"
          @click="exportRetro"
        >
          Export
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Retrospective, ExportOptions } from '@/types'
import { exportRetrospective } from '@/utils/export'

const props = defineProps<{
  modelValue: boolean
  retro: Retrospective
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const isValid = ref(true)

const exportFormats = [
  { title: 'PDF Document', value: 'pdf' },
  { title: 'CSV Spreadsheet', value: 'csv' },
  { title: 'JSON Data', value: 'json' }
]

const dateFormats = [
  { title: 'ISO Format', value: 'YYYY-MM-DD HH:mm' },
  { title: 'US Format', value: 'MM/DD/YYYY HH:mm' },
  { title: 'EU Format', value: 'DD/MM/YYYY HH:mm' }
]

const options = ref<ExportOptions>({
  format: 'pdf',
  includeMetadata: true,
  includeFeedback: true,
  includeActionItems: true,
  includeVotes: true,
  includeParticipants: true,
  dateFormat: 'YYYY-MM-DD HH:mm'
})

const exportRetro = async () => {
  loading.value = true
  try {
    const result = await exportRetrospective(props.retro, options.value)
    
    // Handle the export result based on format
    if (options.value.format === 'pdf') {
      const blob = result as Blob
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${props.retro.title}_${new Date().toISOString()}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } else {
      const content = result as string
      const blob = new Blob(
        [content],
        { type: `application/${options.value.format}` }
      )
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${props.retro.title}_${new Date().toISOString()}.${options.value.format}`
      link.click()
      URL.revokeObjectURL(url)
    }

    dialog.value = false
  } catch (error) {
    console.error('Export error:', error)
    // TODO: Show error message
  } finally {
    loading.value = false
  }
}
</script> 