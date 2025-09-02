import { useState, useRef } from 'react'
import type { AppUser } from '../types/user'

interface SwipeCardProps {
  user: AppUser
  onSwipe: (id: number, type: 'like' | 'nope' | 'super') => void
  onCardClick: (user: AppUser) => void
  zIndex: number
  isTop: boolean
}

export default function SwipeCard({ user, onSwipe, onCardClick, zIndex, isTop }: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)

  const threshold = 120
  const rotateFactor = 15 / window.innerWidth

  const handleStart = (clientX: number, clientY: number) => {
    if (!isTop) return
    setIsDragging(true)
    startPos.current = { x: clientX, y: clientY }
    hasMoved.current = false
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !isTop) return
    
    const dx = clientX - startPos.current.x
    const dy = clientY - startPos.current.y
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMoved.current = true
    }
    
    const rot = dx * rotateFactor

    setPosition({ x: dx, y: dy })
    setRotation(rot)
  }

  const handleEnd = () => {
    if (!isDragging || !isTop) return
    console.log('SwipeCard: Drag end, position:', position, 'user:', user.first_name)
    setIsDragging(false)

    const { x, y } = position

    if (x > threshold) {
      console.log('SwipeCard: Triggering LIKE swipe')
      onSwipe(user.id, 'like')
    } else if (x < -threshold) {
      console.log('SwipeCard: Triggering NOPE swipe')
      onSwipe(user.id, 'nope')
    } else if (y < -threshold) {
      console.log('SwipeCard: Triggering SUPER swipe')
      onSwipe(user.id, 'super')
    } else {
      console.log('SwipeCard: Resetting card position')
      setPosition({ x: 0, y: 0 })
      setRotation(0)
    }
  }

  const handleClick = () => {
    if (isTop && !hasMoved.current) {
      onCardClick(user)
    }
  }

  const likeOpacity = Math.max(0, Math.min(1, position.x / threshold))
  const nopeOpacity = Math.max(0, Math.min(1, -position.x / threshold))
  const superOpacity = Math.max(0, Math.min(1, -position.y / threshold))

  const depth = Math.max(0, 2 - zIndex)
  const scale = Math.max(0.92, 1 - depth * 0.02)
  const translateY = Math.min(depth * 4, 24)

  return (
    <div
      ref={cardRef}
      className="card"
      style={{
        backgroundImage: `url("${user.photos[0]}")`,
        transform: `translate(${position.x}px, ${position.y + translateY}px) rotate(${rotation}deg) scale(${scale})`,
        zIndex,
        cursor: isTop ? 'grab' : 'default'
      }}
      data-label={`${user.first_name}, ${user.age}`}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      onClick={handleClick}
    >
      <div className="badge like" style={{ opacity: likeOpacity }}>LIKE</div>
      <div className="badge nope" style={{ opacity: nopeOpacity }}>NOPE</div>
      <div className="badge super" style={{ opacity: superOpacity }}>SUPER</div>
    </div>
  )
}