import { supabase } from "../config/SupabaseConfig.js";

// ✅ Get logged-in user's notifications
export const getNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const user_id = req.user.id;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", user_id);

    if (error) throw error;

    res.json({ message: "Notification marked as read" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const user_id = req.user.id;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", user_id);

    if (error) throw error;

    res.json({ message: "Notification deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};