import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { Match } from '../types/match'
import { ChatService, type ChatMessage } from '../services/chatService'
import { useSocketIO } from '../hooks/useSocketIO'
import type { RootState } from '../store'

interface ChatRoomProps {
  match: Match
  onBack: () => void
  onProfileClick: (user: any) => void
}

type Message = ChatMessage

export default function ChatRoom({ match, onBack, onProfileClick }: ChatRoomProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [newMessage, setNewMessage] = useState('')

  const { sendMessage: sendSocketMessage } = useSocketIO({
    matchId: match.id,
    userId: currentUser?.id || 1,
    onMessage: (socketMessage) => {
      const message: Message = {
        id: socketMessage.id,
        match_id: socketMessage.match_id,
        from_user_id: socketMessage.from_user_id,
        text: socketMessage.text,
        sent_at: socketMessage.sent_at,
        is_from_current_user: socketMessage.from_user_id === (currentUser?.id || 1)
      }
      setMessages(prev => [...prev, message])
    }
  })
  
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const history = await ChatService.getChatHistory(match.id)
        console.log('ChatRoom: Chat history loaded:', history.length, 'messages')
        setMessages(history)
      } catch (error) {
        console.error('ChatRoom: Error loading chat history:', error)
      } finally {
        setIsLoadingHistory(false)
      }
    }
    
    loadChatHistory()
  }, [match.id])

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    
    const messageText = newMessage.trim()
    setNewMessage('')
    
    try {
      sendSocketMessage(messageText)
    } catch (error) {
      console.error('ChatRoom: Error sending message:', error)
      setNewMessage(messageText)
    }
  }

  const formatTime = (date: Date | string) => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? new Date(date + 'Z') : date
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="chat-room">
      <div className="chat-header">
        <button onClick={onBack} className="back-btn">←</button>
        <div className="chat-user-info">
          <img 
            src={match.user.photos[0]} 
            alt={match.user.first_name} 
            className="chat-user-avatar" 
            onClick={() => {
              console.log('ChatRoom: Profile image clicked for user:', match.user.first_name)
              onProfileClick(match.user)
            }}
          />
          <h3>{match.user.first_name}</h3>
        </div>
      </div>

      <div className="messages-container">
        {isLoadingHistory ? (
          <div className="loading-messages">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-chat">
            <img src={match.user.photos[0]} alt={match.user.first_name} className="empty-chat-avatar" />
            <h4>You matched with {match.user.first_name}!</h4>
            <p>Start the conversation</p>
          </div>
        ) : (
          messages.map(message => (
            <div key={message.id} className={`message ${message.is_from_current_user ? 'sent' : 'received'}`}>
              <div className="message-bubble">
                <p>{message.text}</p>
                <span className="message-time">{formatTime(message.sent_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="message-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={`Message ${match.user.first_name}...`}
          className="message-input"
        />
        <button onClick={sendMessage} className="send-btn" disabled={!newMessage.trim()}>
          Send
        </button>
      </div>
    </div>
  )
}