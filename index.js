import express from "express"
import dotenv from "dotenv"
import cron from "node-cron";

import { checkDBConnection } from "./src/utils/dbHealthCheck.js"
import { _route } from "./src/routes/auth.routes.js"
import petRoutes from "./src/routes/pet.routes.js"
import vaccinationRoutes from "./src/routes/vaccination.route.js"
import vetAppointmentRoutes from "./src/routes/vetAppointment.routes.js"
import expenseRoutes from "./src/routes/expense.routes.js"
import dashboardRoutes from "./src/routes/dashboard.routes.js"
import insuranceRoutes from "./src/routes/insurance.routes.js";
import adminRoutes from "./src/routes/admin.routes.js"
import activitiesRoutes from "./src/routes/activities.routes.js"
import healthRoutes from "./src/routes/health.routes.js"
import userRoutes from "./src/routes/user.routes.js"
import aiRoutes from "./src/routes/ai.routes.js"
import mealRouter from "./src/routes/meal.routes.js"
import postsRoutes from "./src/routes/posts.routes.js";
import playdatesRoutes from "./src/routes/playdates.routes.js";
import notificationsRoutes from "./src/routes/notifications.routes.js";
import { expireOldPlaydates } from "./src/controllers/playdates.controller.js";


import cors from "cors"
import "./src/cron/reminderCron.js";

dotenv.config()
const app = express()

app.use(cors({
  origin: "https://pet-care-client-fawn.vercel.app/",
  credentials: true
}));
app.use(express.json())

app.use("/auth", _route)
app.use("/pets", petRoutes)
app.use("/vaccinations", vaccinationRoutes)
app.use("/vet-appointments", vetAppointmentRoutes)
app.use("/expenses", expenseRoutes)
app.use("/dashboard", dashboardRoutes);
app.use("/insurance", insuranceRoutes);
app.use("/admin", adminRoutes);
app.use("/activities", activitiesRoutes);
app.use("/health", healthRoutes);
app.use("/users", userRoutes);
app.use("/ai", aiRoutes)
app.use("/nutrition", mealRouter)
app.use("/posts", postsRoutes);
app.use("/playdates", playdatesRoutes);
app.use("/notifications", notificationsRoutes);

cron.schedule("0 * * * *", () => {
  expireOldPlaydates();
});

const startServer = async () => {
    const isDBConnected = await checkDBConnection()
    if (!isDBConnected) {
        console.log("Server not started due to DB connection failure")
        process.exit(1)
    }
    const PORT = process.env.PORT || 7777
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    })
}
startServer()
