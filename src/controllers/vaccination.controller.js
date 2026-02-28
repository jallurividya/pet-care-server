import { supabase } from "../config/SupabaseConfig.js";

// POST /api/vaccinations

export const createVaccination = async (req, res) => {
  try {
    const { pet_id, vaccine_name, given_date, next_due_date, reminder_sent } = req.body;

    if (!pet_id || !vaccine_name || !given_date) {
      return res.status(400).json({ message: "pet_id, vaccine_name and given_date are required" });
    }

    // Verify that the pet belongs to logged-in user
    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select("*")
      .eq("id", pet_id)
      .eq("user_id", req.user.id)
      .single();

    if (petError) return res.status(403).json({ message: "Unauthorized or pet not found" });

    const { data, error } = await supabase
      .from("vaccinations")
      .insert([
        { pet_id, vaccine_name, given_date, next_due_date, reminder_sent: reminder_sent || false }
      ])
      .select();

    if (error) throw error;

    res.status(201).json({ message: "Vaccination added", vaccination: data[0] });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/vaccinations

export const getVaccinations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("vaccinations")
      .select(`
        *,
        pets(id, name)
      `)
      .eq("pets.user_id", req.user.id);

    if (error) throw error;

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/vaccinations/:id

export const getSingleVaccination = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("vaccinations")
      .select(`
        *,
        pets(id, name, user_id)
      `)
      .eq("id", id)
      .single();

    if (error || !data) return res.status(404).json({ message: "Vaccination not found" });

    if (data.pets.user_id !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/vaccinations/:id

export const updateVaccination = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the vaccination to check ownership
    const { data: vac, error: vacError } = await supabase
      .from("vaccinations")
      .select("*, pets(user_id)")
      .eq("id", id)
      .single();

    if (vacError || !vac) return res.status(404).json({ message: "Vaccination not found" });

    if (vac.pets.user_id !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const { data, error } = await supabase
      .from("vaccinations")
      .update(req.body)
      .eq("id", id)
      .select();

    if (error) throw error;

    res.status(200).json({ message: "Vaccination updated", vaccination: data[0] });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/vaccinations/:id

export const deleteVaccination = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the vaccination to check ownership
    const { data: vac, error: vacError } = await supabase
      .from("vaccinations")
      .select("*, pets(user_id)")
      .eq("id", id)
      .single();

    if (vacError || !vac) return res.status(404).json({ message: "Vaccination not found" });

    if (vac.pets.user_id !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const { error } = await supabase
      .from("vaccinations")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ message: "Vaccination deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};