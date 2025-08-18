
import {create} from "zustand"


interface signUp {
    first :String,
    last:  String,
    email : String
}
interface signUpState {
    signUpDetails : signUp[],

    addSignUpDetails: (item:signUp) => void
}

const signUpStore = create <signUpState>( (set)=>({

    signUpDetails: [],

    addSignUpDetails : (item : signUp) => set( (state)=>({

        signUpDetails : [ ...state.signUpDetails ,item]
    }))
}))

export default signUpStore