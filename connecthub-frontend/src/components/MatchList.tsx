import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import { MatchService } from '../services/matchService'
import type { Match } from '../types/match'

interface MatchListProps {
  onChatClick: (match: Match) => void
}

export default function MatchList({ onChatClick }: MatchListProps) {
  console.log('MatchList: Component rendered')
  const user = useSelector((state: RootState) => state.user.currentUser)
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMatches = async () => {
      if (!user) {
        console.log('MatchList: No user available, skipping match load')
        return
      }

      console.log('MatchList: Loading matches for user:', user.first_name)
      setIsLoading(true)
      
      try {
        const matchStatus = await MatchService.getMatches()
        console.log('MatchList: Matches loaded:', matchStatus.matches.length)
        setMatches(matchStatus.matches)
      } catch (error) {
        console.error('MatchList: Error loading matches:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMatches()
    
    // Refresh matches every 30 seconds
    const interval = setInterval(loadMatches, 30000)
    return () => clearInterval(interval)
  }, [user])

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  if (isLoading) {
    return <div className="match-list loading">Loading matches...</div>
  }

  if (matches.length === 0) {
    return (
      <div className="match-list empty">
        <p>No matches yet. Keep swiping!</p>
      </div>
    )
  }

  const newMatches = matches.filter(match => !match.last_message)
  const chatMatches = matches.filter(match => match.last_message)

  return (
    <div className="match-list">
      {newMatches.length > 0 && (
        <div className="new-matches-section">
          <h3>New Matches</h3>
          <div className="new-matches-grid">
            {newMatches.map(match => (
              <div key={match.id} className="new-match-card" onClick={() => onChatClick(match)}>
                <img src={match.user.photos[0]} alt={match.user.first_name} />
                <span>{match.user.first_name}</span>
                {match.is_new_match && <div className="new-dot"></div>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {chatMatches.length > 0 && (
        <div className="messages-section">
          <h3>Messages</h3>
          <div className="chat-list">
            {chatMatches.map(match => (
              <div key={match.id} className="chat-item" onClick={() => onChatClick(match)}>
                <img src={match.user.photos[0]} alt={match.user.first_name} className="chat-avatar" />
                <div className="chat-info">
                  <div className="chat-header">
                    <h4>{match.user.first_name}</h4>
                    <span className="chat-time">{formatTime(new Date(match.last_message!.sent_at + 'Z'))}</span>
                  </div>
                  <p className="last-message">
                    {match.last_message!.is_from_current_user ? 'You: ' : ''}
                    {match.last_message!.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}