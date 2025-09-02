import React, { useState, useRef, useCallback } from 'react'

interface AgeRangeSliderProps {
  min: number
  max: number
  minAge: number
  maxAge: number
  onChange: (min: number, max: number) => void
  disabled?: boolean
}

export default function AgeRangeSlider({ 
  min, 
  max, 
  minAge, 
  maxAge, 
  onChange, 
  disabled = false 
}: AgeRangeSliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  const getPercentage = useCallback((value: number) => {
    return ((value - min) / (max - min)) * 100
  }, [min, max])

  const getValueFromPosition = useCallback((clientX: number) => {
    if (!sliderRef.current) return min
    
    const rect = sliderRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(min + percentage * (max - min))
  }, [min, max])

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragging(type)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || disabled) return
    
    const newValue = getValueFromPosition(e.clientX)
    
    if (isDragging === 'min') {
      const newMin = Math.min(newValue, maxAge - 1)
      if (newMin !== minAge) {
        onChange(newMin, maxAge)
      }
    } else {
      const newMax = Math.max(newValue, minAge + 1)
      if (newMax !== maxAge) {
        onChange(minAge, newMax)
      }
    }
  }, [isDragging, minAge, maxAge, onChange, getValueFromPosition, disabled])

  const handleMouseUp = useCallback(() => {
    setIsDragging(null)
  }, [])

  // Add global mouse event listeners
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

  const minPercentage = getPercentage(minAge)
  const maxPercentage = getPercentage(maxAge)

  return (
    <div className="age-range-slider">
      <div className="age-range-header">
        <span className="age-range-label">Age Range</span>
        <span className="age-range-values">{minAge} - {maxAge}</span>
      </div>
      
      <div 
        ref={sliderRef}
        className={`dual-slider ${disabled ? 'disabled' : ''}`}
      >
        <div className="slider-track">
          <div 
            className="slider-range"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          />
        </div>
        
        <div
          className={`slider-thumb min-thumb ${isDragging === 'min' ? 'dragging' : ''}`}
          style={{ left: `${minPercentage}%` }}
          onMouseDown={handleMouseDown('min')}
        >
          <div className="thumb-tooltip">{minAge}</div>
        </div>
        
        <div
          className={`slider-thumb max-thumb ${isDragging === 'max' ? 'dragging' : ''}`}
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={handleMouseDown('max')}
        >
          <div className="thumb-tooltip">{maxAge}</div>
        </div>
      </div>
      
      <div className="age-range-labels">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}