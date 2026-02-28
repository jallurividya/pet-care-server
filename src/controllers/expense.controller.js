import { supabase } from "../config/SupabaseConfig.js";

// POST /api/expenses
 
export const createExpense = async (req, res) => {
  try {
    const { pet_id, category, amount, description, date } = req.body;

    if (!pet_id || !category || !amount || !date) {
      return res.status(400).json({
        message: "pet_id, category, amount and date are required"
      });
    }

    // Check if pet belongs to logged-in user
    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select("id")
      .eq("id", pet_id)
      .eq("user_id", req.user.id)
      .single();

    if (petError || !pet)
      return res.status(403).json({ message: "Unauthorized or pet not found" });

    const { data, error } = await supabase
      .from("expenses")
      .insert([
        {
          pet_id,
          category,
          amount,
          description,
          date
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: "Expense added successfully",
      expense: data[0]
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/expenses

export const getExpenses = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select(`
        *,
        pets(id, name, user_id)
      `)
      .order("date", { ascending: false });

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

// GET /api/expenses/:id
 
export const getSingleExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("expenses")
      .select(`
        *,
        pets(user_id)
      `)
      .eq("id", id)
      .single();

    if (error || !data)
      return res.status(404).json({ message: "Expense not found" });

    if (data.pets.user_id !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/expenses/:id

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: expense, error: fetchError } = await supabase
      .from("expenses")
      .select("*, pets(user_id)")
      .eq("id", id)
      .single();

    if (fetchError || !expense)
      return res.status(404).json({ message: "Expense not found" });

    if (expense.pets.user_id !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const { data, error } = await supabase
      .from("expenses")
      .update(req.body)
      .eq("id", id)
      .select();

    if (error) throw error;

    res.status(200).json({
      message: "Expense updated successfully",
      expense: data[0]
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/expenses/:id

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: expense, error: fetchError } = await supabase
      .from("expenses")
      .select("*, pets(user_id)")
      .eq("id", id)
      .single();

    if (fetchError || !expense)
      return res.status(404).json({ message: "Expense not found" });

    if (expense.pets.user_id !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ message: "Expense deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};