export interface ChatMessage {
  id: string
  match_id: string
  text: string
  from_user_id: number
  is_from_current_user: boolean
  sent_at: string
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
}