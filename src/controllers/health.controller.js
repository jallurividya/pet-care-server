import { supabase } from "../config/SupabaseConfig.js";

// Create a new health log
export const createHealthLog = async (req, res) => {
  try {
    const { pet_id, weight, temperature, symptoms, notes, date } = req.body;
    const userId = req.user.id;

    const { data: pet } = await supabase
      .from("pets")
      .select("id")
      .eq("id", pet_id)
      .eq("user_id", userId)
      .single();

    if (!pet) return res.status(403).json({ message: "Not authorized for this pet" });

    const { data, error } = await supabase
      .from("health_logs")
      .insert([{ pet_id, weight, temperature, symptoms, notes, date }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all health logs for a pet
export const getHealthLogsByPet = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.id;

    const { data: pet } = await supabase
      .from("pets")
      .select("id")
      .eq("id", petId)
      .eq("user_id", userId)
      .single();

    if (!pet) return res.status(403).json({ message: "Not authorized" });

    const { data, error } = await supabase
      .from("health_logs")
      .select("*")
      .eq("pet_id", petId)
      .order("date", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update health log
export const updateHealthLog = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("health_logs")
      .update(req.body)
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete health log
export const deleteHealthLog = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("health_logs")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ message: "Health log deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Weight trend
export const getWeightTrend = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.id;

    const { data: pet } = await supabase
      .from("pets")
      .select("id")
      .eq("id", petId)
      .eq("user_id", userId)
      .single();

    if (!pet) return res.status(403).json({ message: "Not authorized" });

    const { data, error } = await supabase
      .from("health_logs")
      .select("date, weight")
      .eq("pet_id", petId)
      .not("weight", "is", null)
      .order("date", { ascending: true });

    if (error) throw error;

    res.json({ petId, weightTrend: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};