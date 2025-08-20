
import {create} from "zustand"


interface SignUpState {

  // State properties
  firstName: string
  lastName: string
  email: string
  contact: string
  city: string
  dob: string
  
  // Action methods
  setFirstName: (name: string) => void
  setLastName: (name: string) => void
  setEmail: (email: string) => void
  setContact: (contact: string) => void
  setCity: (city: string) => void
  setDob: (dob: string) => void
  

 
}
const signUpStore = create<SignUpState>((set) => ({

  firstName: '',
  lastName: '',
  email: '',
  contact: '',
  city: '',
  dob: '',
 
  setFirstName: (name: string) => set({ firstName: name }),
  setLastName: (name: string) => set({ lastName: name }),
  setEmail: (email: string) => set({ email: email }),
  setContact: (contact: string) => set({ contact: contact }),
  setCity: (city: string) => set({ city: city }),
  setDob: (dob: string) => set({ dob: dob }),
   
}))

export default signUpStore