import axios from "axios"

const backend_url = process.env.EXPO_PUBLIC_BACKEND_URL



class onboardingService {

    async  basicInfoRegister(data: any) {
        console.log(data);
        console.log(backend_url);
      
      try{
        const newUser = await axios.post(`${backend_url}/api/v1/onboarding/basicInfo` , {
            firstname : data.firstname,
            lastname : data.lastname,
            dob :data.dob,
            city : data.city,
            contact : data.contact,
            email : data.email
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
