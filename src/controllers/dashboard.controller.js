import { supabase } from "../config/SupabaseConfig.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: pets, error: petError } = await supabase
      .from("pets")
      .select("id")
      .eq("user_id", userId);

    if (petError) throw petError;

    const petIds = pets?.map(p => p.id) || [];

    if (petIds.length === 0) {
      return res.json({
        totalPets: 0,
        upcomingVaccinations: [],
        upcomingAppointments: [],
        totalExpenses: 0,
        monthlyExpenses: []
      });
    }

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const todayStr = today.toISOString().split("T")[0];
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    const { data: vaccinations, error: vacError } = await supabase
      .from("vaccinations")
      .select("*")
      .in("pet_id", petIds)
      .gte("next_due_date", todayStr)
      .lte("next_due_date", nextWeekStr);

    if (vacError) throw vacError;

    const { data: appointments, error: appError } = await supabase
      .from("vet_appointments")
      .select("*")
      .in("pet_id", petIds)
      .gte("appointment_date", todayStr)
      .order("appointment_date", { ascending: true });

    if (appError) throw appError;

    const { data: expenses, error: expError } = await supabase
      .from("expenses")
      .select("amount, date")
      .in("pet_id", petIds);

    if (expError) throw expError;

    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + Number(exp.amount),
      0
    );

    const monthlyMap = {};

    expenses.forEach(exp => {
      const month = new Date(exp.date).toLocaleString("default", {
        month: "short",
        year: "numeric"
      });

      monthlyMap[month] =
        (monthlyMap[month] || 0) + Number(exp.amount);
    });

    const monthlyExpenses = Object.entries(monthlyMap)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    res.status(200).json({
      totalPets: pets.length,
      upcomingVaccinations: vaccinations || [],
      upcomingAppointments: appointments || [],
      totalExpenses,
      monthlyExpenses
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};