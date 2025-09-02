import type { AppUser } from '../types/user'
import './MatchModal.css'

interface MatchModalProps {
  user: AppUser
  onClose: () => void
  onSendMessage: () => void
}

export default function MatchModal({ user, onClose, onSendMessage }: MatchModalProps) {
  return (
    <div className="match-modal-overlay" onClick={onClose}>
      <div className="match-modal" onClick={(e) => e.stopPropagation()}>
        <div className="match-header">
          <h1>IT'S A MATCH!</h1>
          <p>You and {user.first_name} liked each other</p>
        </div>
        
        <div className="match-photos">
          <div className="match-photo-container">
            <img src={user.photos[0]} alt={user.first_name} className="match-photo" />
            <span className="match-name">{user.first_name}</span>
          </div>
        </div>
        
        <div className="match-actions">
          <button onClick={onSendMessage} className="send-message-btn">
            Send Message
          </button>
          <button onClick={onClose} className="keep-swiping-btn">
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  )
}