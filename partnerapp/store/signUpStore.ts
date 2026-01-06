import { create } from 'zustand'
interface SignUpState {
  // State
  firstName: string
  lastName: string
  email: string
  contact: string
  city: string
  dob: string
  profileImage: string
  // Actions
  setfirstName: (name: string) => void
  setlastName: (name: string) => void
  setEmail: (email: string) => void
  setContact: (contact: string) => void
  setCity: (city: string) => void
  setDob: (dob: string) => void
  setProfileImage: (uri: string) => void
}
const signUpStore = create<SignUpState>((set) => ({
  firstName: '',
  lastName: '',
  email: '',
  contact: '',
  city: '',
  dob: '',
  profileImage: '',
  setfirstName: (name) => set({ firstName :name }),
  setlastName: (name) => set({ lastName:name  }),
  setEmail: (email) => set({ email }),
  setContact: (contact) => set({ contact }),
  setCity: (city) => set({ city }),
  setDob: (dob) => set({ dob }),
  setProfileImage: (uri) => set({ profileImage: uri }),
}))
export default signUpStore