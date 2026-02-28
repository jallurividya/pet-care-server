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
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json())

app.use("/api/auth", _route)
app.use("/api/pets", petRoutes)
app.use("/api/vaccinations", vaccinationRoutes)
app.use("/api/vet-appointments", vetAppointmentRoutes)
app.use("/api/expenses", expenseRoutes)
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/insurance", insuranceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes)
app.use("/api/nutrition", mealRouter)
app.use("/api/posts", postsRoutes);
app.use("/api/playdates", playdatesRoutes);
app.use("/api/notifications", notificationsRoutes);

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
