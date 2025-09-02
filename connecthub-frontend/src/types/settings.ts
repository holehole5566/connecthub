export interface UserSettings {
  id: number
  user_id: number
  max_distance: number
  age_range: {
    min: number
    max: number
  }
  show_me_in_discovery: boolean
  is_paused: boolean
}

export interface SettingsState {
  settings: UserSettings
  isLoading: boolean
}