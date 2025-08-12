import  express from "express";

import cors from "cors"
import {router as onboardingRouter} from "./routerUser/onboardingRouter"
import {router as footballRouter} from "./routerUser/footballRouter"
import { PrismaClient } from '@prisma/client';

const app =  express()
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json())


app.use("/api/v1/onboarding", onboardingRouter)
app.use("/api/v1/football", footballRouter)

app.listen(3000, ()=> {
    console.log("server is up at port 3000");
    })


