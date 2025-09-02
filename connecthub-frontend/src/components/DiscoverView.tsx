import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import type { AppUser } from '../types/user'
import { MatchService } from '../services/matchService'
import { SettingsService } from '../services/settingsService'
import { DiscoveryService } from '../services/discoveryService'
import type { UserSettings } from '../types/settings'
import UserDetailModal from './UserDetailModal'
import SwipeCard from './SwipeCard'
import MatchModal from './MatchModal'
import './ActionAnimation.css'

export default function DiscoverView() {
  console.log('DiscoverView: Component rendered')
  const user = useSelector((state: RootState) => state.user.currentUser)
  

  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [users, setUsers] = useState<AppUser[]>([])
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null)
  const [matchedUser, setMatchedUser] = useState<AppUser | null>(null)
  const [actionAnimation, setActionAnimation] = useState<{type: 'like' | 'nope' | 'super', show: boolean} | null>(null)
  
  useEffect(() => {
    console.log('DiscoverView: matchedUser changed to:', matchedUser)
  }, [matchedUser])
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await SettingsService.getSettings()
        console.log('DiscoverView: Settings loaded:', userSettings)
        setSettings(userSettings)
      } catch (error) {
        console.error('DiscoverView: Error loading settings:', error)
      }
    }
    loadSettings()
  }, [])
  
  useEffect(() => {
    if (!user || !settings) return
    
    const loadDiscoverUsers = async () => {
      try {
        console.log('DiscoverView: Loading users with settings:', settings)
        const availableUsers = await DiscoveryService.getDiscoverUsers(
          settings.age_range.min,
          settings.age_range.max,
          settings.max_distance
        )
        

        
        console.log('DiscoverView: Loaded users count:', availableUsers.length)
        setUsers(availableUsers)
      } catch (error) {
        console.error('DiscoverView: Error loading users:', error)
        setUsers([])
      }
    }
    
    loadDiscoverUsers()
  }, [user, settings])
  
  console.log('DiscoverView: Current users count:', users.length)
  console.log('DiscoverView: Selected user:', selectedUser)
  console.log('DiscoverView: matchedUser state:', matchedUser)

  const handleSwipe = async (id: number, type: 'like' | 'nope' | 'super') => {
    console.log('DiscoverView: Swipe action:', type, 'for user ID:', id)
    
    // Find the user BEFORE removing from array
    const swipedUser = users.find(u => u.id === id)
    console.log('DiscoverView: swipedUser found:', swipedUser, 'for id:', id)
    console.log('DiscoverView: current users:', users.map(u => ({id: u.id, name: u.first_name})))
    
    // Show animation
    setActionAnimation({type, show: true})
    setTimeout(() => setActionAnimation(null), 1000)
    
    // Add match for likes and super likes
    if ((type === 'like' || type === 'super') && user) {
      try {
        const result = await MatchService.addLike(id, type === 'super' ? 'super' : 'like')
        console.log('DiscoverView: Match result:', result)
        console.log('DiscoverView: Checking match condition - isMatch:', result.isMatch, 'swipedUser:', swipedUser)
        if (result.isMatch && swipedUser) {
          console.log('DiscoverView: Its a match! 🎉')
          console.log('DiscoverView: Setting matched user:', swipedUser)
          setMatchedUser(swipedUser)
          console.log('DiscoverView: setMatchedUser called')
          // Don't remove user immediately on match, let modal handle it
          return
        } else {
          console.log('DiscoverView: Like sent, waiting for mutual like')
        }
      } catch (error) {
        console.error('DiscoverView: Error adding match:', error)
      }
    }
    
    // Only remove user if it's not a match
    setUsers(prev => {
      const filtered = prev.filter(user => user.id !== id)
      console.log('DiscoverView: Users after swipe, remaining count:', filtered.length)
      return filtered
    })
    setSelectedUser(null)
    console.log('DiscoverView: Selected user cleared after swipe')
  }




  const topUser = users[users.length - 1]

  if (!settings) {
    return <div className="discover-view loading">Loading preferences...</div>
  }
  
  if (settings.is_paused) {
    return (
      <div className="discover-view paused">
        <div className="paused-message">
          <h3>Account Paused</h3>
          <p>Your account is currently paused. Go to Settings to reactivate discovery.</p>
        </div>
      </div>
    )
  }

    // Check if user has location
  if (user && !user.location) {
    return (
      <div className="discover-view no-location">
        <div className="no-location-message">
          <h3>📍 Location Required</h3>
          <p>Please add your location in your profile to start discovering people nearby.</p>
        </div>
      </div>
    )
  }
  
  if (users.length === 0) {
    return (
      <div className="discover-view no-users">
        <div className="no-users-message">
          <h3>No More Users</h3>
          <p>There are no more users to discover in your area. Try adjusting your preferences in Settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="discover-view">
      <div className="deck">
        {users.map((user, index) => (
          <SwipeCard
            key={user.id}
            user={user}
            onSwipe={handleSwipe}
            onCardClick={(user) => {
              setSelectedUser(user)
            }}
            zIndex={index}
            isTop={index === users.length - 1}
          />
        ))}
      </div>

      {actionAnimation && (
        <div className={`action-animation ${actionAnimation.type}`}>
          {actionAnimation.type === 'like' && '♥'}
          {actionAnimation.type === 'nope' && '✖'}
          {actionAnimation.type === 'super' && '★'}
        </div>
      )}

      <div className="controls">
        <button onClick={() => topUser && handleSwipe(topUser.id, 'nope')} className="ctrl nope">✖</button>
        <button onClick={() => topUser && handleSwipe(topUser.id, 'super')} className="ctrl superlike">★</button>
        <button onClick={() => topUser && handleSwipe(topUser.id, 'like')} className="ctrl like">♥</button>
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSwipe={handleSwipe}
        />
      )}
      
      {matchedUser && (
        <MatchModal
          user={matchedUser}
          onClose={() => {
            setMatchedUser(null)
            // Remove the matched user from the deck
            setUsers(prev => prev.filter(user => user.id !== matchedUser.id))
          }}
          onSendMessage={() => {
            console.log('DiscoverView: Send message to match:', matchedUser.first_name)
            setMatchedUser(null)
            // Remove the matched user from the deck
            setUsers(prev => prev.filter(user => user.id !== matchedUser.id))
            // TODO: Navigate to chat or matches
          }}
        />
      )}
    </div>
  )
}