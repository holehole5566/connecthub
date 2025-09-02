import React, { useState, useRef, useCallback } from 'react'

interface DistanceSliderProps {
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export default function DistanceSlider({ 
  min, 
  max, 
  value, 
  onChange, 
  disabled = false 
}: DistanceSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const getPercentage = useCallback((val: number) => {
    return ((val - min) / (max - min)) * 100
  }, [min, max])

  const getValueFromPosition = useCallback((clientX: number) => {
    if (!sliderRef.current) return min
    
    const rect = sliderRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(min + percentage * (max - min))
  }, [min, max])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(true)
    const newValue = getValueFromPosition(e.clientX)
    onChange(newValue)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || disabled) return
    const newValue = getValueFromPosition(e.clientX)
    onChange(newValue)
  }, [isDragging, onChange, getValueFromPosition, disabled])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const percentage = getPercentage(value)

  return (
    <div className="distance-slider">
      <div className="distance-header">
        <span className="distance-label">Maximum Distance</span>
        <span className="distance-value">{value} km</span>
      </div>
      
      <div 
        ref={sliderRef}
        className={`single-slider ${disabled ? 'disabled' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <div className="slider-track">
          <div 
            className="slider-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div
          className={`slider-thumb ${isDragging ? 'dragging' : ''}`}
          style={{ left: `${percentage}%` }}
        >
          <div className="thumb-tooltip">{value} km</div>
        </div>
      </div>
      
      <div className="distance-labels">
        <span>{min} km</span>
        <span>{max} km</span>
      </div>
    </div>
  )
}