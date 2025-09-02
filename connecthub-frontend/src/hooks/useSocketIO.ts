import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketMessage {
  id: string
  type: string
  match_id: string
  from_user_id: number
  text: string
  sent_at: string
}

interface UseSocketIOProps {
  matchId: string
  userId: number
  onMessage: (message: SocketMessage) => void
}

export const useSocketIO = ({ matchId, userId, onMessage }: UseSocketIOProps) => {
  const socket = useRef<Socket | null>(null)
  const reconnectAttempts = useRef(0)

  useEffect(() => {
    if (socket.current?.connected) return
    
    const socketUrl = import.meta.env.VITE_CHAT_URL || (typeof window !== 'undefined' ? `wss://${window.location.hostname}/socket.io` : 'wss://your-domain.com/socket.io')
    
    socket.current = io(socketUrl, {
      forceNew: true,
      transports: ['websocket', 'polling']
    })
    
    socket.current.on('connect', () => {
      reconnectAttempts.current = 0
      socket.current?.emit('join_room', {
        match_id: matchId,
        user_id: userId
      })
    })

    socket.current.on('new_message', onMessage)

    socket.current.on('connect_error', (error) => {
      console.warn('Socket connection failed:', error.message)
    })
    
    return () => {
      socket.current?.disconnect()
      socket.current = null
    }
  }, [matchId, userId])

  const sendMessage = useCallback((text: string) => {
    socket.current?.emit('send_message', {
      match_id: matchId,
      from_user_id: userId,
      text
    })
  }, [matchId, userId])



  return { sendMessage }
}