import { useState, useRef } from 'react'
import { SetupService } from '../services/setupService'
import type { SetupData } from '../types/setup'

interface SetupViewProps {
  userId: number
  onSetupComplete: (user: any) => void
}

export default function SetupView({ userId, onSetupComplete }: SetupViewProps) {
  
  const [setupData, setSetupData] = useState<SetupData>({
    photos: [],
    bio: '',
    interests: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    files.forEach(file => {
      if (setupData.photos.length < 6) {
        const reader = new FileReader()
        reader.onload = () => {
          setSetupData(prev => ({
            ...prev,
            photos: [...prev.photos, reader.result as string].slice(0, 6)
          }))
        }
        reader.readAsDataURL(file)
      }
    })
    

  }

  const removeImage = (index: number) => {
    setSetupData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))

  }

  const handleSubmit = async () => {
    const validation = SetupService.validateSetupData(setupData)
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setIsSubmitting(true)
    setErrors([])
    
    try {
      const newUser = await SetupService.updateUserProfile(userId, setupData)
      onSetupComplete(newUser)
    } catch (error) {
      setErrors(['Failed to create profile. Please try again.'])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="setup-view">
      <div className="setup-container">
        <div className="setup-header">
          <h1>Welcome to Coonecthub!</h1>
          <p>Let's set up your profile to get started</p>
        </div>

        <div className="setup-form">
          <div className="form-section">
            <h3>Photos</h3>
            <p>Add at least one photo to continue</p>
            <div className="photos-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="photo-slot">
                  {setupData.photos[i] ? (
                    <>
                      <img src={setupData.photos[i]} alt={`Photo ${i + 1}`} className="setup-photo" />
                      <button className="remove-photo-btn" onClick={() => removeImage(i)}>×</button>
                    </>
                  ) : (
                    <button className="add-photo-btn" onClick={() => fileInputRef.current?.click()}>
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>About You</h3>
            
            <div className="form-field">
              <label>Bio</label>
              <textarea
                value={setupData.bio}
                onChange={(e) => setSetupData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                className="setup-input"
                rows={3}
              />
            </div>

            <div className="form-field">
              <label>Interests</label>
              <div className="interests-grid">
                {['travel', 'music', 'movies', 'sports', 'food', 'art', 'books', 'gaming'].map(interest => (
                  <button
                    key={interest}
                    type="button"
                    className={`interest-tag ${setupData.interests.includes(interest) ? 'selected' : ''}`}
                    onClick={() => {
                      setSetupData(prev => ({
                        ...prev,
                        interests: prev.interests.includes(interest)
                          ? prev.interests.filter(i => i !== interest)
                          : [...prev.interests, interest]
                      }))
                    }}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="setup-errors">
              {errors.map((error, index) => (
                <p key={index} className="error-message">{error}</p>
              ))}
            </div>
          )}

          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="setup-submit-btn"
          >
            {isSubmitting ? 'Creating Profile...' : 'Complete Setup'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}