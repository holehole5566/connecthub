import { useState } from 'react'
import type { AppUser } from '../types/user'

interface UserDetailModalProps {
  user: AppUser
  onClose: () => void
  onSwipe: (id: number, type: 'like' | 'nope' | 'super') => void
}

export default function UserDetailModal({ user, onClose, onSwipe }: UserDetailModalProps) {
  console.log('UserDetailModal: Rendered for user:', user.first_name, user.id)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  
  const nextPhoto = () => {
    setCurrentPhotoIndex(prev => (prev + 1) % user.photos.length)
  }
  
  const prevPhoto = () => {
    setCurrentPhotoIndex(prev => (prev - 1 + user.photos.length) % user.photos.length)
  }
  
  return (
    <div className="modal-overlay" onClick={() => {
      console.log('UserDetailModal: Overlay clicked, closing modal')
      onClose()
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={() => {
          console.log('UserDetailModal: Close button clicked')
          onClose()
        }}>×</button>
        
        <div className="user-photos-container">
          <div className="photo-navigation">
            <div className="photo-nav-left" onClick={prevPhoto}></div>
            <div className="photo-nav-right" onClick={nextPhoto}></div>
          </div>
          <img 
            src={user.photos[currentPhotoIndex]} 
            alt={`${user.first_name} ${currentPhotoIndex + 1}`} 
            className="current-photo"
          />
          <div className="photo-indicators">
            {user.photos.map((_, index) => (
              <div 
                key={index} 
                className={`photo-dot ${index === currentPhotoIndex ? 'active' : ''}`}
                onClick={() => setCurrentPhotoIndex(index)}
              />
            ))}
          </div>
        </div>

        <div className="user-info">
          <h2>{user.first_name} {user.last_name}, {user.age}</h2>
          {user.username && <p className="username">@{user.username}</p>}
          <p className="distance">{user.distance} km away</p>
          {user.is_premium && <span className="premium-badge">⭐ Premium</span>}
          
          <div className="bio">
            <p>{user.bio}</p>
          </div>

          <div className="interests">
            <h3>Interests</h3>
            <div className="interest-tags">
              {user.interests.map((interest, index) => (
                <span key={index} className="interest-tag">{interest}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-controls">
          <button onClick={() => {
            console.log('UserDetailModal: NOPE button clicked for user:', user.id)
            onSwipe(user.id, 'nope')
          }} className="ctrl nope">✖</button>
          <button onClick={() => {
            console.log('UserDetailModal: SUPER button clicked for user:', user.id)
            onSwipe(user.id, 'super')
          }} className="ctrl superlike">★</button>
          <button onClick={() => {
            console.log('UserDetailModal: LIKE button clicked for user:', user.id)
            onSwipe(user.id, 'like')
          }} className="ctrl like">♥</button>
        </div>
      </div>
    </div>
  )
}