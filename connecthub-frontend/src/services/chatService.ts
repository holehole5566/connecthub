import type { ChatMessage } from '../types/chat'

export { type ChatMessage }

export class ChatService {
  // Production: Replace with actual API call
  static async getChatHistory(match_id: string): Promise<ChatMessage[]> {
    // Use API service for backend calls
    const { apiService } = await import('./apiService')
    const response = await apiService.getChatHistory({ match_id })
    const chatData = response.data
    if (Array.isArray(chatData)) {
      return chatData
    } else {
      return chatData?.items || []
    }
  }

}