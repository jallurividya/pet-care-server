import { supabase } from "../config/SupabaseConfig.js";
import axios from "axios";

// POST /api/vet-appointments

export const createVetAppointment = async (req, res) => {
  try {
    const {
      pet_id,
      vet_name,
      clinic_name,
      appointment_date,
      purpose,
      reminder_date,
      status,
      notes
    } = req.body;

    if (!pet_id || !appointment_date) {
      return res.status(400).json({
        message: "pet_id and appointment_date are required"
      });
    }

    // Check pet ownership
    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select("id")
      .eq("id", pet_id)
      .eq("user_id", req.user.id)
      .single();

    if (petError || !pet)
      return res.status(403).json({ message: "Unauthorized or pet not found" });

    const { data, error } = await supabase
      .from("vet_appointments")
      .insert([
        {
          pet_id,
          vet_name,
          clinic_name,
          appointment_date,
          purpose,
          reminder_date,
          status: status || "upcoming",
          notes
        }
      ])
      .select(`
    *,
    pets(id, name, user_id)
  `);

    if (error) throw error;

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: data[0]
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/vet-appointments

export const getVetAppointments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("vet_appointments")
      .select(`
        *,
        pets(id, name, user_id)
      `)
      .order("appointment_date", { ascending: true });

    if (error) throw error;

    // Filter only logged-in user's pets
    const filtered = data.filter(
      (item) => item.pets.user_id === req.user.id
    );

    res.status(200).json(filtered);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/vet-appointments/:id

export const getSingleVetAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("vet_appointments")
      .select(`
        *,
        pets(id, user_id)
      `)
      .eq("id", id)
      .single();

    if (error || !data)
      return res.status(404).json({ message: "Appointment not found" });

    if (data.pets.user_id !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// PUT /api/vet-appointments/:id

export const updateVetAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: appointment, error: fetchError } = await supabase
      .from("vet_appointments")
      .select("*, pets(user_id)")
      .eq("id", id)
      .single();

    if (fetchError || !appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (appointment.pets.user_id !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const { data, error } = await supabase
      .from("vet_appointments")
      .update(req.body)
      .eq("id", id)
      .select(`*,
        pets(id,name,user_id)
        `);

    if (error) throw error;

    res.status(200).json({
      message: "Appointment updated successfully",
      appointment: data[0]
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/vet-appointments/:id

export const deleteVetAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: appointment, error: fetchError } = await supabase
      .from("vet_appointments")
      .select("*, pets(user_id)")
      .eq("id", id)
      .single();

    if (fetchError || !appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (appointment.pets.user_id !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const { error } = await supabase
      .from("vet_appointments")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ message: "Appointment deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getNearbyEmergencyVets = async (req, res) => {
  try {
    const { lat, lng } = req.query; // latitude & longitude

    if (!lat || !lng) return res.status(400).json({ message: "Latitude and longitude required" });

    // Example: Using Google Places API (replace with your API key)
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search.php?q=veterinary+near+{lat},{lng}&format=jsonv2`
    );

    const vets = response.data.results.map((vet) => ({
      name: vet.name,
      address: vet.vicinity,
      rating: vet.rating,
      user_ratings_total: vet.user_ratings_total,
      location: vet.geometry.location,
      place_id: vet.place_id,
    }));

    res.json({ vets });
  } catch (error) {
    console.error("Error fetching emergency vets:", error.message);
    res.status(500).json({ message: "Failed to fetch nearby vets" });
  }
};