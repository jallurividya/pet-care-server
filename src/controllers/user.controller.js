import { supabase } from "../config/SupabaseConfig.js";

// Get Logged-in User
export const getMe = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("app_users")
      .select("id, name, email, phone, role, created_at")
      .eq("id", req.user.id)
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch user",
      error: err.message,
    });
  }
};
// Update Logged-in User
export const updateMe = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const { data, error } = await supabase
      .from("app_users")
      .update({
        name,
        email,
        phone,
      })
      .eq("id", req.user.id)
      .select("id, name, email, phone, role, created_at")
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      message: "Failed to update profile",
      error: err.message,
    });
  }
};
// Admin: Get All Users
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const { data, error } = await supabase
      .from("app_users")
      .select("id, name, email, phone, role, created_at");

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: err.message,
    });
  }
};

// Admin: Delete User
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied",
      });
    }
    const { id } = req.params;
    const { error } = await supabase
      .from("app_users")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete user",
      error: err.message,
    });
  }
};