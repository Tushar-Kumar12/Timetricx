export interface SupportSubmission {
  id: string
  type: string
  name: string
  email: string
  subject?: string
  message?: string
  priority?: string
  timestamp: string
  status: string
}

export class SupportSubmissionModel {
  static create(data: any): SupportSubmission {
    return {
      id: crypto.randomUUID(),
      ...data,               // 🔥 EXACT jo aaya
      timestamp: new Date().toISOString(),
      status: 'pending',
    }
  }
}
