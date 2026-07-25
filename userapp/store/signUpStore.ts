import { create } from 'zustand'
interface SignUpState {
  // State
  name: string
  nickName: string
  email: string
  contact: string
  city: string
  dob: string
  password: string
  profileImage: string
  // Actions
  setName: (name: string) => void
  setNickName: (name: string) => void
  setEmail: (email: string) => void
  setContact: (contact: string) => void
  setCity: (city: string) => void
  setDob: (dob: string) => void
  setPassword: (password: string) => void
  setProfileImage: (uri: string) => void
}
const signUpStore = create<SignUpState>((set) => ({
  name: '',
  nickName: '',
  email: '',
  contact: '',
  city: '',
  dob: '',
  password: '',
  profileImage: '',
  setName: (name) => set({ name }),
  setNickName: (name) => set({ nickName: name }),
  setEmail: (email) => set({ email }),
  setContact: (contact) => set({ contact }),
  setCity: (city) => set({ city }),
  setDob: (dob) => set({ dob }),
  setPassword: (password) => set({ password }),
  setProfileImage: (uri) => set({ profileImage: uri }),
}))
export default signUpStore