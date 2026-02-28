import cron from "node-cron";
import { supabase } from "../config/SupabaseConfig.js";
import { transporter } from "../utils/emailService.js";

cron.schedule("0 9 * * *", async () => {
  console.log("Running reminder cron...");

  const today = new Date().toISOString().split("T")[0];

  const { data: vaccinations } = await supabase
    .from("vaccinations")
    .select(`
      vaccine_name,
      next_due_date,
      pets(user_id),
      pets!inner(user_id)
    `)
    .eq("next_due_date", today);

  for (let vac of vaccinations) {
    const { data: user } = await supabase
      .from("app_users")
      .select("email, name")
      .eq("id", vac.pets.user_id)
      .single();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Vaccination Reminder",
      text: `Hi ${user.name}, your pet's vaccine ${vac.vaccine_name} is due today.`
    });
  }
});