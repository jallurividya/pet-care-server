import { supabase } from "../config/SupabaseConfig.js";

// POST /api/pets

export const createPet = async (req, res) => {
  try {
    const { name, species, breed, gender, dob, weight, medical_history, photo_url } = req.body;

    if (!name || !species) {
      return res.status(400).json({ message: "Name and species are required" });
    }

    const { data, error } = await supabase
      .from("pets")
      .insert([
        {
          user_id: req.user.id,
          name,
          species,
          breed,
          gender,
          dob,
          weight,
          medical_history,
          photo_url
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: "Pet registered successfully",
      pet: data[0]
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/pets

export const getPets = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET /api/pets/:id

export const getSinglePet = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/pets/:id

export const updatePet = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("pets")
      .update(req.body)
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select();

    if (error) throw error;

    if (!data.length) {
      return res.status(404).json({ message: "Pet details not found" });
    }

    res.status(200).json({
      message: "Pet updated successfully",
      pet: data[0]
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/pets/:id

export const deletePet = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("pets")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id);

    if (error) throw error;

    res.status(200).json({ message: "Pet deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};