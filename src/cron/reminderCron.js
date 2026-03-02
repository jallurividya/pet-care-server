import cron from "node-cron";
import { supabase } from "../config/SupabaseConfig.js";

// 🔔 Create Notification Function
async function createNotification(userId, type, referenceId, message) {
  const today = new Date().toISOString().split("T")[0];

  // Prevent duplicate notifications for same day
  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", userId)
    .eq("type", type)
    .eq("reference_id", referenceId)
    .gte("created_at", today);

  if (!existing || existing.length === 0) {
    await supabase.from("notifications").insert([
      {
        user_id: userId,
        type,
        reference_id: referenceId,
        message,
        is_read: false,
      },
    ]);
  }
}

cron.schedule("*/2 * * * *", async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { data: vaccinations } = await supabase
      .from("vaccinations")
      .select(`
        id,
        vaccine_name,
        pets!inner(user_id)
      `)
      .eq("next_due_date", today)
      .eq("completed", false);

    for (let vac of vaccinations || []) {
      const message = `Vaccination due today: ${vac.vaccine_name}`;

      await createNotification(
        vac.pets.user_id,
        "vaccination",
        vac.id,
        message
      );
    }
    const { data: activities } = await supabase
      .from("activities")
      .select(`
        id,
        type,
        pets!inner(user_id)
      `)
      .eq("date", today);

    for (let act of activities || []) {
      const message = `Activity scheduled today: ${act.type}`;

      await createNotification(
        act.pets.user_id,
        "activity",
        act.id,
        message
      );
    }
    const { data: appointments } = await supabase
      .from("vet_appointments")
      .select(`
        id,
        purpose,
        pets!inner(user_id)
      `)
      .gte("appointment_date", `${today} 00:00:00`)
      .lte("appointment_date", `${today} 23:59:59`)
      .eq("status", "upcoming");

    for (let app of appointments || []) {
      const message = `Vet appointment today: ${app.purpose}`;

      await createNotification(
        app.pets.user_id,
        "appointment",
        app.id,
        message
      );
    }

  } catch (error) {
    console.error("Cron Error:", error);
  }
});