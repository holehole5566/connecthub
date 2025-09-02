import { useState, useEffect } from 'react'
import { SettingsService } from '../services/settingsService'
import type { UserSettings } from '../types/settings'
import AgeRangeSlider from './AgeRangeSlider'
import DistanceSlider from './DistanceSlider'

export default function SettingsView() {
  console.log('SettingsView: Component rendered')
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await SettingsService.getSettings()
        console.log('SettingsView: Settings loaded:', userSettings)
        setSettings(userSettings)
      } catch (error) {
        console.error('SettingsView: Error loading settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    if (!settings) return
    
    console.log('SettingsView: Updating setting:', key, value)
    setIsSaving(true)
    
    try {
      const updatedSettings = await SettingsService.updateSettings({ [key]: value })
      setSettings(updatedSettings)
    } catch (error) {
      console.error('SettingsView: Error updating setting:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTogglePause = async () => {
    const action = settings?.is_paused ? 'reactivate' : 'pause'
    console.log('SettingsView: Toggle pause clicked, action:', action)
    
    const message = settings?.is_paused 
      ? 'Reactivate your account? You will appear in discovery again.'
      : 'Are you sure you want to pause your account? You will not appear in discovery.'
    
    if (confirm(message)) {
      try {
        if (settings?.is_paused) {
          await SettingsService.reactivateAccount()
        } else {
          await SettingsService.pauseAccount()
        }
        await updateSetting('is_paused', !settings?.is_paused)
      } catch (error) {
        console.error('SettingsView: Error toggling pause:', error)
      }
    }
  }

  const handleDeleteAccount = async () => {
    console.log('SettingsView: Delete account clicked')
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await SettingsService.deleteAccount()
        alert('Account deleted successfully')
      } catch (error) {
        console.error('SettingsView: Error deleting account:', error)
      }
    }
  }

  if (isLoading) {
    return <div className="settings-view loading">Loading settings...</div>
  }

  if (!settings) {
    return <div className="settings-view error">Failed to load settings</div>
  }

  return (
    <div className="settings-view">
      <div className="settings-container">
        <h2>Settings</h2>
        
        <div className="settings-section">
          <h3>Discovery Preferences</h3>
          
          <div className="setting-item">
            <DistanceSlider
              min={1}
              max={100}
              value={settings.max_distance}
              onChange={(value) => updateSetting('max_distance', value)}
              disabled={isSaving}
            />
          </div>

          <div className="setting-item">
            <AgeRangeSlider
              min={18}
              max={80}
              minAge={settings.age_range.min}
              maxAge={settings.age_range.max}
              onChange={(min, max) => {
                updateSetting('age_range', { min, max })
              }}
              disabled={isSaving}
            />
          </div>

          <div className="setting-item">
            <div className="toggle-setting">
              <span>Show me in Discovery</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.show_me_in_discovery}
                  onChange={(e) => updateSetting('show_me_in_discovery', e.target.checked)}
                  disabled={isSaving}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Account</h3>
          
          <div className="setting-item">
            <div className="toggle-setting">
              <span>Account Status: {settings.is_paused ? 'Paused' : 'Active'}</span>
              <button 
                onClick={handleTogglePause}
                className={`action-btn ${settings.is_paused ? 'reactivate-btn' : 'pause-btn'}`}
                disabled={isSaving}
              >
                {settings.is_paused ? 'Reactivate Account' : 'Pause Account'}
              </button>
            </div>
          </div>

          <div className="setting-item danger-zone">
            <button 
              onClick={handleDeleteAccount}
              className="action-btn delete-btn"
              disabled={isSaving}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}