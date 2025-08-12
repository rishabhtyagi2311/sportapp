import e, { Router } from "express";
import { footballProfileRegister, footballTeamCreate, createfootballMatchBaseSchema} from "../types";
import { prisma as client } from "../index";
export const router  =Router()

router.post("/profileRegister", async(req, res) => {
    console.log(req.body);
    
    const parsedData = footballProfileRegister.safeParse(req.body)
    if(!parsedData.success)
    {
        res.status(400).json({message: "Invalid data format"})
        return 
    }
    try{
        const existUser = await client.footballProfile.findUnique({
            where: {
                userId : parsedData.data.userId
            }
        })
        if(existUser)
        {
            res.status(403).json({message: "User Already Exists"})
            return 
        }
        const newProfile = await client.footballProfile.create({
            data:{
                userId : parsedData.data.userId,
                role: parsedData.data.role,
                nickname : parsedData.data.nickname,
                experience : parsedData.data.experience
                
            }
        })
        if(newProfile)
        {
            res.status(200).json({id : newProfile.id, role: newProfile.role, experience :newProfile.experience, nickname : newProfile.nickname})
            return 
        }
        res.status(400).json({message : "Cannot create Football Profile"})
        return 
    }
    catch(e)
    {
        res.status(500).json({message: "Server Error"})
        return 
    }
})



router.post("/createTeam", async (req, res) => {
    const parsed = footballTeamCreate.safeParse(req.body);
  
    if (!parsed.success) {
        res.status(400).json({ message: "Invalid team data" });
        return 
    }
  
    const { createdByUserId, name, location, maxPlayers, playerIds } = parsed.data;
  
    try {
        
        const team = await client.footballTeam.create({
            data:{
                name,
                location,
                maxPlayers,
                createdById : createdByUserId
            }
        })
  
      // Add members step-by-step
      await client.footballTeamMember.createMany({
        data: playerIds.map((id) => ({
          footballProfileId: id,
          footballTeamId: team.id,
        })),
      });
  
      // Final fetch with all relations
      const fullTeam = await client.footballTeam.findUnique({
        where: { id: team.id },
        include: {
          members: {
            include: {
              footballProfile: {
                include: {
                  user: true,
                },
              },
            },
          },
          createdBy: {
            include: {
              user: true,
            },
          },
        },
      });
  
      res.status(200).json({ message: "Team created successfully", team: fullTeam });
      return 
    } catch (err) {
      console.error("Error creating team:", err);
      res.status(500).json({ message: "Internal Server Error" });
      return 
    }
  });
  

router.get('/fetchPlayers', async (req, res) => {
    try {
      const players = await client.footballProfile.findMany({
        select: {
          id: true,
          userId: true,
          nickname: true,
          role: true,
          experience: true,
        },
      });
  
      res.json({ success: true, players });
      return 
    } catch (error) {
      console.error('Error fetching football players:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
      return 
    }
  });



router.get('/myTeams', async (req, res) => {
  const userId = parseInt(req.query.userId as string);

  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid or missing userId in query' });
    return 
  }
console.log(userId);

  try {
    // Fetch the user's football profile
    const profile = await client.footballProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    

    if (!profile) {
        res.status(404).json({ error: 'Football profile not found' });
      return 
    }

    const profileId = profile.id;

    // Fetch teams where user is either creator or a member
    const teams = await client.footballTeam.findMany({
      where: {
        OR: [
          { createdById: profileId },
          { members: { some: { footballProfileId: profileId } } },
        ],
      },
      include: {
        createdBy: {
          include: {
            user: true,
          },
        },
        members: {
          include: {
            footballProfile: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  
    

      res.json({ teams });
      return 
  } catch (error) {
    console.error('Error fetching teams:', error);
      res.status(500).json({ error: 'Internal server error' });
      return 
  }
});


  
router.get("/profileCheck/:id" , async(req, res) => {

  
    
  const id = parseInt(req.params.id); 
  console.log(id);
  

  if (isNaN(id)) {
      res.status(400).json({ message: "Invalid user ID" });
      return 
  }

  try {
      const userExist = await client.footballProfile.findUnique({
          where: {
          userId: id,
          },
      });
      console.log(userExist);
      
      if (userExist) {
          res.status(200).json({check : true , userDetails : userExist});
          return 
      } else {
          console.log("check negative ");
          
          res.status(200).json({ check: false });
          return 
      }
  } 
  catch (err) 
  {
      console.error("Error checking user profile:", err);
      res.status(500).json({ message: "Internal Server Error" });
      return 
  }
})



// router.get('/allTeams', async (req, res) => {
//   try {
//     const teams = await prisma.client.footballTeam.findMany({
//       include: {
//         members: {
//           include: {
//             footballProfile: true, // This will get the player profile info
//           },
//         },
//       },
//     });

//     // Format the response
//     const teamsWithPlayers = teams.map((team) => ({
//       id : team.id,
//       teamName: team.name,
//       location: team.location,
//       maxPlayers: team.maxPlayers,
//       players: team.members.map((member) => ({
//         id : member.footballProfile.id,
//         nickname: member.footballProfile.nickname,
//         role: member.footballProfile.role,
//         experience: member.footballProfile.experience,
//       })),
//     }));
//     console.log(teamsWithPlayers);
    
//     res.json(teamsWithPlayers);
//     return 
//   } catch (error) {
//     console.error('Error fetching teams:', error);
//     res.status(500).json({ error: 'Internal server error' });
//     return 
//   }
// });