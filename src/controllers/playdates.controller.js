import { supabase } from "../config/SupabaseConfig.js";


// ✅ Create Playdate
export const createPlaydate = async (req, res) => {
  try {
    const { title, description, location, event_date } = req.body;
    const host_id = req.user.id;

    const { data, error } = await supabase
      .from("playdates")
      .insert([{ host_id, title, description, location, event_date }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ Get All Playdates
// controllers/playdate.controller.js
export const getPlaydates = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("playdates")
      .select(`
        id,
        title,
        description,
        location,
        event_date,
        created_at,
        host_id,
        status,
        playdate_rsvps!inner(id)   -- join with RSVPs
      `)
      .order("event_date", { ascending: true });

    if (error) throw error;

    // Map data to include RSVP count
    const playdatesWithCount = data.map(p => ({
      ...p,
      rsvp_count: p.playdate_rsvps?.length || 0
    }));

    res.json(playdatesWithCount);

  } catch (err) {
    console.error("Get Playdates Error:", err);
    res.status(500).json({ message: err.message });
  }
};


// ✅ RSVP
// controllers/playdate.controller.js

export const rsvpPlaydate = async (req, res) => {
  try {
    const { playdateId } = req.params;
    const user_id = req.user.id;

    // Check duplicate RSVP
    const { data: existing } = await supabase
      .from("playdate_rsvps")
      .select("id")
      .eq("playdate_id", playdateId)
      .eq("user_id", user_id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: "Already joined this playdate" });
    }

    // Insert RSVP
    const { error: insertError } = await supabase
      .from("playdate_rsvps")
      .insert([{ playdate_id: playdateId, user_id }]);
    if (insertError) throw insertError;

    // Count RSVPs
    const { count } = await supabase
      .from("playdate_rsvps")
      .select("id", { count: "exact" })
      .eq("playdate_id", playdateId);

    res.json({ message: "RSVP successful", rsvp_count: count });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePlaydate = async (req, res) => {
  try {
    const { playdateId } = req.params;
    const user_id = req.user.id;

    const { data: playdate, error: fetchError } = await supabase
      .from("playdates")
      .select("host_id")
      .eq("id", playdateId)
      .single();

    if (fetchError) throw fetchError;

    if (!playdate) {
      return res.status(404).json({ message: "Playdate not found" });
    }

    if (playdate.host_id !== user_id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { data, error } = await supabase
      .from("playdates")
      .update(req.body)
      .eq("id", playdateId)   // ✅ FIXED
      .select()
      .single();

    if (error) throw error;

    res.json(data);

  } catch (err) {
    console.error("FINAL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deletePlaydate = async (req, res) => {
  try {
    const { playdateId } = req.params;
    const user_id = req.user.id;

    // 1️⃣ Check if playdate exists
    const { data: playdate, error: fetchError } = await supabase
      .from("playdates")
      .select("host_id")
      .eq("id", playdateId)
      .single();

    if (fetchError || !playdate) {
      return res.status(404).json({ message: "Playdate not found" });
    }

    // 2️⃣ Check ownership
    if (playdate.host_id !== user_id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 3️⃣ Delete playdate
    const { error: deleteError } = await supabase
      .from("playdates")
      .delete()
      .eq("id", playdateId);

    if (deleteError) throw deleteError;

    res.json({ message: "Playdate deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const expireOldPlaydates = async () => {
  const now = new Date().toISOString();

  await supabase
    .from("playdates")
    .update({ status: "expired" })
    .lt("event_date", now)
    .eq("status", "active");
};