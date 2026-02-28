import { supabase } from "../config/SupabaseConfig.js";

export const createActivity = async (req, res) => {
  try {
    const { pet_id, type, duration, date, notes } = req.body;
    const userId = req.user.id;

    // 🔒 Ensure pet belongs to logged-in user
    const { data: pet } = await supabase
      .from("pets")
      .select("id")
      .eq("id", pet_id)
      .eq("user_id", userId)
      .single();

    if (!pet) {
      return res.status(403).json({ message: "Not authorized for this pet" });
    }

    const { data, error } = await supabase
      .from("activities")
      .insert([
        { pet_id, type, duration, date, notes }
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActivitiesByPet = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.id;

    // 🔒 Ensure pet belongs to user
    const { data: pet } = await supabase
      .from("pets")
      .select("id")
      .eq("id", petId)
      .eq("user_id", userId)
      .single();

    if (!pet) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("pet_id", petId)
      .order("date", { ascending: false });

    if (error) throw error;

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("activities")
      .update(req.body)
      .eq("id", id)
      .select();

    if (error) throw error;

    res.json(data[0]);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Activity deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ACTIVITY SUMMARY (WEEKLY / MONTHLY)

export const getActivitySummary = async (req, res) => {
  try {
    const { petId } = req.params;
    const { type } = req.query; // weekly or monthly
    const userId = req.user.id;

    // 🔒 Validate pet ownership
    const { data: pet } = await supabase
      .from("pets")
      .select("id")
      .eq("id", petId)
      .eq("user_id", userId)
      .single();

    if (!pet) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const today = new Date();
    let startDate = new Date();

    if (type === "weekly") {
      startDate.setDate(today.getDate() - 7);
    } else if (type === "monthly") {
      startDate.setMonth(today.getMonth() - 1);
    } else {
      return res.status(400).json({ message: "Invalid type. Use weekly or monthly." });
    }

    const { data: activities, error } = await supabase
      .from("activities")
      .select("*")
      .eq("pet_id", petId)
      .gte("date", startDate.toISOString())
      .lte("date", today.toISOString());

    if (error) throw error;

    // 📊 Aggregate stats
    const summary = {
      totalActivities: activities.length,
      walks: 0,
      feeding: 0,
      play: 0,
      medication: 0,
      totalDuration: 0
    };

    activities.forEach(act => {
      if (act.type === "walk") summary.walks++;
      if (act.type === "feeding") summary.feeding++;
      if (act.type === "play") summary.play++;
      if (act.type === "medication") summary.medication++;

      if (act.duration) {
        summary.totalDuration += act.duration;
      }
    });

    res.json({
      period: type,
      from: startDate,
      to: today,
      summary
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};