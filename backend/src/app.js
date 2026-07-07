import express from 'express'
import cors from "cors"

import userRouter from './routes/user.route.js'
import freelancerRouter from './routes/freelancer.route.js'
import clientRouter from './routes/client.route.js'

import uploadRouter from './routes/uploadImage.route.js'

const app = express()   //create an express app

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())

// routes declaration
app.use("/api/v1", userRouter)
app.use("/api/v1/profile/freelancer", freelancerRouter)
app.use("/api/v1/profile/client", clientRouter)
// app.use("/api/v1/users/profile", freelancerRouter)
app.use("/api/v1/users/upload", uploadRouter)
// example route: http://localhost:4000/api/v1/users/register

export default app