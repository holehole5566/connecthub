import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../store'
import { setUser } from '../store/userSlice'
import type { AppUser } from '../types/user'

export default function ProfileView() {
  console.log('ProfileView: Component rendered')
  const dispatch = useDispatch()

  const user = useSelector((state: RootState) => state.user.currentUser)
  console.log('ProfileView: Current user from store:', user)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<AppUser>>({})
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    console.log('ProfileView: useEffect triggered, user:', user, 'isEditing:', isEditing)
    if (user && !isEditing) {
      const newEditData = {
        first_name: user.first_name,
        last_name: user.last_name,
        age: user.age,
        bio: user.bio,
        interests: [...user.interests],
        photos: [...user.photos],
        location: user.location
      }
      console.log('ProfileView: Setting edit data:', newEditData)
      setEditData(newEditData)
    }
  }, [user, isEditing])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const currentPhotos = editData.photos || []
    
    files.forEach(file => {
      if (currentPhotos.length < 6) {
        const reader = new FileReader()
        reader.onload = () => {
          setEditData(prev => ({
            ...prev,
            photos: [...(prev.photos || []), reader.result as string].slice(0, 6)
          }))
        }
        reader.readAsDataURL(file)
      }
    })
    
    const log = document.getElementById('log')
    if (log) {
      log.textContent = 'Photos added!'
      setTimeout(() => { if (log.textContent === 'Photos added!') log.textContent = '' }, 1500)
    }
  }

  const removeImage = (index: number) => {
    setEditData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }))
  }

  const getLocation = () => {
    setIsGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
            const data = await response.json()
            const city = data.city || data.locality || data.principalSubdivision || 'Unknown City'
            
            setEditData(prev => ({
              ...prev,
              location: { latitude, longitude, city }
            }))
          } catch {
            setEditData(prev => ({
              ...prev,
              location: { latitude, longitude, city: 'Current Location' }
            }))
          }
          setIsGettingLocation(false)
        },
        () => {
          setIsGettingLocation(false)
          alert('Unable to get location')
        }
      )
    } else {
      setIsGettingLocation(false)
      alert('Geolocation not supported')
    }
  }

  const toggleEdit = async () => {
    console.log('ProfileView: Toggle edit clicked, current isEditing:', isEditing)
    if (isEditing && user) {
      try {
        // Prepare update data
        const updateData = {
          first_name: editData.first_name,
          last_name: editData.last_name,
          bio: editData.bio,
          interests: editData.interests,
          photos: editData.photos,
          location: editData.location
        }
        
        // Call API to update user
        const { apiService } = await import('../services/apiService')
        const response = await apiService.updateUser(user.id, updateData)
        
        if (response.success && response.data) {
          // Update Redux store with response data
          dispatch(setUser(response.data))
          
          const log = document.getElementById('log')
          if (log) {
            log.textContent = 'Profile saved!'
            setTimeout(() => { if (log.textContent === 'Profile saved!') log.textContent = '' }, 1500)
          }
        }
      } catch (error) {
        console.error('ProfileView: Error saving profile:', error)
        const log = document.getElementById('log')
        if (log) {
          log.textContent = 'Error saving profile'
          setTimeout(() => { if (log.textContent === 'Error saving profile') log.textContent = '' }, 1500)
        }
      }
    }
    setIsEditing(!isEditing)
    console.log('ProfileView: Edit mode changed to:', !isEditing)
  }

  return (
    <div className="profile-view">
      <div className="profile-container">
        <div className="profile-header">
          <div className="images-grid">
            {Array.from({ length: 6 }).map((_, i) => {
              const photos = isEditing ? (editData.photos || []) : (user?.photos || [])
              return (
                <div key={i} className="image-slot">
                  {photos[i] ? (
                    <>
                      <img src={photos[i]} alt={`Profile ${i + 1}`} className="grid-image" />
                      {isEditing && (
                        <button className="remove-btn" onClick={() => removeImage(i)}>×</button>
                      )}
                    </>
                  ) : isEditing ? (
                    <button className="add-image-btn" onClick={() => fileInputRef.current?.click()}>
                      +
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
          {isEditing ? (
            <div>
              <input
                className="profile-name-input"
                value={editData.first_name || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="First name"
              />
              <input
                className="profile-name-input"
                value={editData.last_name || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Last name"
              />
            </div>
          ) : (
            <h2>{user?.first_name} {user?.last_name}, {user?.age}</h2>
          )}
        </div>
        
        <div className="profile-fields">
          {isEditing ? (
            <>

              <div className="field-group">
                <label>Bio</label>
                <textarea
                  className="profile-textarea"
                  value={editData.bio || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
              <div className="field-group">
                <label>Interests</label>
                <input
                  className="profile-input"
                  value={(editData.interests || []).join(', ')}
                  onChange={(e) => setEditData(prev => ({ ...prev, interests: e.target.value.split(',').map(s => s.trim()) }))}
                  placeholder="Your interests (comma separated)"
                />
              </div>
              <div className="field-group">
                <label>Location</label>
                <div className="location-controls">
                  <button 
                    type="button" 
                    className="edit-btn" 
                    onClick={getLocation}
                    disabled={isGettingLocation}
                    style={{ fontSize: '12px', padding: '8px 12px' }}
                  >
                    {isGettingLocation ? '📍 Getting...' : '📍 Get Location'}
                  </button>
                  {editData.location && (
                    <input 
                      className="profile-input" 
                      value={`${editData.location.city} (${editData.location.latitude.toFixed(4)}, ${editData.location.longitude.toFixed(4)})`}
                      readOnly
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="profile-preview">
              <div className="bio-section">
                <h3>About</h3>
                <p>{user?.bio}</p>
              </div>
              <div className="interests-section">
                <h3>Interests</h3>
                <div className="interests-tags">
                  {user?.interests.map((interest: string, i:number) => (
                    <span key={i} className="interest-tag">{interest}</span>
                  ))}
                </div>
              </div>
              {user?.location && (
                <div className="location-section">
                  <h3>Location</h3>
                  <p>📍 {user.location.city}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button className="edit-btn" onClick={toggleEdit}>
            {isEditing ? '💾 Save' : '✏️ Edit Profile'}
          </button>
          {isEditing && (
            <label className="profile-upload-btn" onClick={() => fileInputRef.current?.click()}>
              📷 Add Photos ({(editData.photos || []).length}/6)
            </label>
          )}
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
    </div>
  )
}