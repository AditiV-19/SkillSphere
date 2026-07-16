import express from 'express'
import cors from "cors"

import userRouter from './routes/user.route.js'
import freelancerRouter from './routes/freelancer.route.js'
import clientRouter from './routes/client.route.js'
import uploadRouter from './routes/uploadImage.route.js'
import gigRouter from './routes/gig.route.js'
import reviewRouter from './routes/review.route.js'
import chatRouter from './routes/chat.route.js'
import notificationRouter from './routes/notification.route.js'
import adminRouter from './routes/admin.routes.js'
const app = express() 

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())

app.use("/api/v1", userRouter)
app.use("/api/v1/profile/freelancer", freelancerRouter)
app.use("/api/v1/profile/client", clientRouter)
app.use("/api/v1/users/upload", uploadRouter)

app.use("/api/v1/client/gig", gigRouter)
app.use("/api/v1/reviews", reviewRouter)

app.use("/api/v1/chat", chatRouter)

app.use("/api/v1/notifications", notificationRouter);

app.use("/api/v1/admin", adminRouter);
export default app