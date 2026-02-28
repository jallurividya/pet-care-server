import { supabase } from "../config/SupabaseConfig.js";
export const getAdminAnalytics = async (req, res) => {
  try {
    // 1️⃣ Total Users
    const { count: totalUsers, error: userError } = await supabase
      .from("app_users")
      .select("*", { count: "exact", head: true });

    if (userError) throw userError;

    // 2️⃣ Total Pets
    const { count: totalPets, error: petError } = await supabase
      .from("pets")
      .select("*", { count: "exact", head: true });

    if (petError) throw petError;

    // 3️⃣ Get All Subscribed Policies with Premium (JOIN)
    const { data: insuranceData, error: insuranceError } = await supabase
      .from("pet_insurance")
      .select(`
        end_date,
        insurance_policies (
          premium_amount
        )
      `);

    if (insuranceError) throw insuranceError;

    const totalPolicies = insuranceData.length;

    // 4️⃣ Total Revenue
    const totalRevenue = insuranceData.reduce((sum, item) => {
      return sum + Number(item.insurance_policies?.premium_amount || 0);
    }, 0);

    // 5️⃣ Monthly Revenue
    const monthlyMap = {};

    insuranceData.forEach(policy => {
      const month = new Date(policy.end_date).toLocaleString("default", {
        month: "short",
        year: "numeric"
      });

      const premium = Number(
        policy.insurance_policies?.premium_amount || 0
      );

      monthlyMap[month] = (monthlyMap[month] || 0) + premium;
    });

    const monthlyRevenue = Object.entries(monthlyMap).map(
      ([month, revenue]) => ({ month, revenue })
    );

    // 6️⃣ Expiring in Next 7 Days (Correct Table)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const { count: expiringPolicies, error: expiryError } = await supabase
      .from("pet_insurance")
      .select("*", { count: "exact", head: true })
      .gte("end_date", today.toISOString())
      .lte("end_date", nextWeek.toISOString());

    if (expiryError) throw expiryError;

    res.status(200).json({
      totalUsers,
      totalPets,
      totalPolicies,
      totalRevenue,
      expiringPolicies,
      monthlyRevenue
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};