import axios from "axios"

const backend_url = process.env.EXPO_PUBLIC_BACKEND_URL



class onboardingService {

    async  basicInfoRegister(firstName:string, lastName : string, email : string, contact : string, city : string, dob : string) {
       
        console.log(backend_url);
      
      try{
        const newUser = await axios.post(`${backend_url}/api/v1/onboarding/basicInfo` , {
            firstname : firstName,
            lastname : lastName,
            dob :dob,
            city : city,
            contact : contact,
            email : email
        })
        if(newUser)
        {
            return newUser
        }

      }
      catch(e)
      {
        console.log(e);
        return null
        
      }
        

    }
}

export const onBoardingService = new onboardingService()
