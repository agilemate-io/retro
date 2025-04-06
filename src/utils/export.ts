import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { Parser } from 'json2csv'
import type { Retrospective, ActionItem, FeedbackItem } from '@/types/retrospective'

export interface ExportOptions {
  format: ExportFormat
  includeMetadata: boolean
  includeFeedback: boolean
  includeActionItems: boolean
  includeVotes: boolean
  includeParticipants: boolean
  customHeader?: string
  customFooter?: string
  dateFormat?: string
}

export type ExportFormat = 'pdf' | 'csv' | 'json'

export async function exportRetrospective(
  retro: Retrospective,
  options: ExportOptions
): Promise<Blob | string> {
  switch (options.format) {
    case 'pdf':
      return exportToPDF(retro, options)
    case 'csv':
      return exportToCSV(retro, options)
    case 'json':
      return exportToJSON(retro, options)
    default:
      throw new Error(`Unsupported export format: ${options.format}`)
  }
}

async function exportToPDF(
  retro: Retrospective,
  options: ExportOptions
): Promise<Blob> {
  const doc = new jsPDF()
  let yOffset = 20

  // Add custom header if provided
  if (options.customHeader) {
    doc.setFontSize(14)
    doc.text(options.customHeader, 20, yOffset)
    yOffset += 10
  }

  // Add title
  doc.setFontSize(20)
  doc.text(retro.title, 20, yOffset)
  yOffset += 15

  // Add metadata
  if (options.includeMetadata) {
    doc.setFontSize(12)
    doc.text(`Date: ${formatDate(retro.createdAt, options.dateFormat)}`, 20, yOffset)
    yOffset += 10
    doc.text(`Template: ${retro.settings.template}`, 20, yOffset)
    yOffset += 10
  }

  // Add participants
  if (options.includeParticipants) {
    doc.setFontSize(16)
    doc.text('Participants', 20, yOffset)
    yOffset += 10
    doc.setFontSize(12)
    retro.participants.forEach(participant => {
      doc.text(`- ${participant}`, 30, yOffset)
      yOffset += 7
    })
    yOffset += 10
  }

  // Add feedback section
  if (options.includeFeedback) {
    doc.setFontSize(16)
    doc.text('Feedback', 20, yOffset)
    yOffset += 10

    const feedbackData = retro.feedback.map(item => [
      item.category || 'Uncategorized',
      item.content,
      options.includeVotes ? item.votes.toString() : ''
    ])

    const headers = ['Category', 'Feedback']
    if (options.includeVotes) headers.push('Votes')

    doc.autoTable({
      startY: yOffset,
      head: [headers],
      body: feedbackData
    })

    yOffset = (doc as any).lastAutoTable.finalY + 20
  }

  // Add action items section
  if (options.includeActionItems) {
    doc.setFontSize(16)
    doc.text('Action Items', 20, yOffset)
    yOffset += 10

    const actionItemsData = retro.actionItems.map(item => [
      item.content,
      item.assignedTo || 'Unassigned',
      item.status,
      item.dueDate ? formatDate(item.dueDate, options.dateFormat) : 'No due date'
    ])

    doc.autoTable({
      startY: yOffset,
      head: [['Content', 'Assigned To', 'Status', 'Due Date']],
      body: actionItemsData
    })
  }

  // Add custom footer if provided
  if (options.customFooter) {
    const pageHeight = doc.internal.pageSize.height
    doc.setFontSize(10)
    doc.text(options.customFooter, 20, pageHeight - 10)
  }

  return doc.output('blob')
}

async function exportToCSV(
  retro: Retrospective,
  options: ExportOptions
): Promise<string> {
  const rows: any[] = []

  // Add metadata
  if (options.includeMetadata) {
    rows.push({
      type: 'metadata',
      title: retro.title,
      date: formatDate(retro.createdAt, options.dateFormat),
      template: retro.settings.template
    })
  }

  // Add participants
  if (options.includeParticipants) {
    retro.participants.forEach(participant => {
      rows.push({
        type: 'participant',
        id: participant
      })
    })
  }

  // Add feedback
  if (options.includeFeedback) {
    retro.feedback.forEach(item => {
      rows.push({
        type: 'feedback',
        category: item.category || 'Uncategorized',
        content: item.content,
        votes: options.includeVotes ? item.votes : undefined,
        author: item.authorName
      })
    })
  }

  // Add action items
  if (options.includeActionItems) {
    retro.actionItems.forEach(item => {
      rows.push({
        type: 'action-item',
        content: item.content,
        assignedTo: item.assignedTo || 'Unassigned',
        status: item.status,
        dueDate: item.dueDate ? formatDate(item.dueDate, options.dateFormat) : 'No due date'
      })
    })
  }

  const parser = new Parser({
    fields: Object.keys(rows[0] || {})
  })

  return parser.parse(rows)
}

async function exportToJSON(
  retro: Retrospective,
  options: ExportOptions
): Promise<string> {
  const result: any = {
    exportDate: new Date().toISOString()
  }

  if (options.includeMetadata) {
    result.metadata = {
      title: retro.title,
      date: formatDate(retro.createdAt, options.dateFormat),
      template: retro.settings.template
    }
  }

  if (options.includeParticipants) {
    result.participants = retro.participants
  }

  if (options.includeFeedback) {
    result.feedback = retro.feedback.map(item => ({
      category: item.category || 'Uncategorized',
      content: item.content,
      ...(options.includeVotes && { votes: item.votes }),
      author: item.authorName,
      createdAt: formatDate(item.createdAt, options.dateFormat)
    }))
  }

  if (options.includeActionItems) {
    result.actionItems = retro.actionItems.map(item => ({
      content: item.content,
      assignedTo: item.assignedTo || 'Unassigned',
      status: item.status,
      dueDate: item.dueDate ? formatDate(item.dueDate, options.dateFormat) : 'No due date'
    }))
  }

  return JSON.stringify(result, null, 2)
}

function formatDate(date: Date | string, format?: string): string {
  const d = new Date(date)
  if (!format) return d.toISOString()

  // Simple date formatter - extend as needed
  return format
    .replace('YYYY', d.getFullYear().toString())
    .replace('MM', (d.getMonth() + 1).toString().padStart(2, '0'))
    .replace('DD', d.getDate().toString().padStart(2, '0'))
    .replace('HH', d.getHours().toString().padStart(2, '0'))
    .replace('mm', d.getMinutes().toString().padStart(2, '0'))
} 