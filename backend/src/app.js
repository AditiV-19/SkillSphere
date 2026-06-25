import express from 'express'
import userRouter from './routes/user.route.js'
import profileRouter from './routes/profile.route.js'


const app = express()   //create an express app

app.use(express.json())

// routes declaration
app.use("/api/v1", userRouter)
app.use("/api/v1/users/profile", profileRouter)

// example route: http://localhost:4000/api/v1/users/register

export default app