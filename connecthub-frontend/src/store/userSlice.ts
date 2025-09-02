import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AppUser } from '../types/user'

interface UserState {
  currentUser: AppUser | null
  isLoading: boolean
}

const initialState: UserState = {
  currentUser: null,
  isLoading: true
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AppUser | null>) => {
      state.currentUser = action.payload
      state.isLoading = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    }
  }
})

export const { setUser, setLoading } = userSlice.actions
export default userSlice.reducer