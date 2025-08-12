import { Router } from "express";
import { prisma as client } from "../index";
import { basicOnboardingInfo } from "../types";

export  const router = Router()

router.post("/basicInfo", async(req, res) => {
    console.log("request arrived");
    
    
    const parsedData = basicOnboardingInfo.safeParse(req.body)

    if(!parsedData.success)
    {
        res.status(400).json({message:"Invalid data format"})
        return

    }
    try{
        const user = await client.userInfo.findFirst({
            where:{
                contact: parsedData.data.contact
            }
        })
        if(user)
        {
            res.status(403).json({message:"User Already Exists"})
            return 
        }
        const newUser  = await client.userInfo.create({
            data:{
               
                firstname: parsedData.data.firstname,
                lastname : parsedData.data.lastname,
                dob : parsedData.data.dob,
                city : parsedData.data.city,
                email : parsedData.data.email,
                contact: parsedData.data.contact
    
            }
        })
        if(newUser)
        {
            res.status(200).json({id: newUser.id, firstname: newUser.firstname, lastname: newUser.lastname,
                
            })
            return
        }
        res.status(400).json({message : "Cannot create new user"})
        return 
    }
    catch(e)
    {
        res.status(500).json({message: "Server Error"})
        return 
    }
   
})