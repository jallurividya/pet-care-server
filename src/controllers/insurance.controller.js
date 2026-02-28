import { supabase } from "../config/SupabaseConfig.js";
export const createPolicy = async (req, res) => {
  try {
    const { provider_name, policy_name, premium_amount, coverage_amount, description } = req.body;
    const { data, error } = await supabase
      .from("insurance_policies")
      .insert([
        {
          provider_name,
          policy_name,
          premium_amount,
          coverage_amount,
          description
        }
      ])
      .select();
    if (error) throw error;
    res.status(201).json({
      message: "Policy created successfully",
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPolicies = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("insurance_policies")
      .select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update insurance policy details (Admin)
export const updatePolicyDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { provider_name, policy_name, premium_amount, coverage_amount, description } = req.body;

    const { data, error } = await supabase
      .from("insurance_policies")
      .update({ provider_name, policy_name, premium_amount, coverage_amount, description })
      .eq("id", id)
      .select();

    if (error) throw error;

    res.status(200).json({
      message: "Policy details updated successfully",
      data: data[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const subscribePolicy = async (req, res) => {
  try {
    const { pet_id, policy_id, policy_number, start_date, end_date, emergency_contact } = req.body;
    const { data: pet } = await supabase
      .from("pets")
      .select("*")
      .eq("id", pet_id)
      .eq("user_id", req.user.id)
      .single();
    if (!pet) {
      return res.status(403).json({
        message: "You can only insure your own pet"
      });
    }
    const { data, error } = await supabase
      .from("pet_insurance")
      .insert([
        {
          pet_id,
          policy_id,
          policy_number,
          start_date,
          end_date,
          claim_status: "pending",
          emergency_contact
        }
      ])
      .select();
    if (error) throw error;
    res.status(201).json({
      message: "Policy subscribed successfully",
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /insurance/subscriptions
// src/controllers/insurance.controller.js
export const getAllSubscriptions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("pet_insurance")
      .select(`
        id,
        policy_number,
        claim_status,
        start_date,
        end_date,
        emergency_contact,
        pets (
          name,
          app_users!inner (
            email
          )
        ),
        insurance_policies (
          policy_name,
          provider_name,
          premium_amount,
          coverage_amount
        )
      `);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPetInsurance = async (req, res) => {
  try {
    const { petId } = req.params;
    const { data, error } = await supabase
      .from("pet_insurance")
      .select(`
        *,
        insurance_policies (
          provider_name,
          policy_name,
          premium_amount,
          coverage_amount
        )
      `)
      .eq("pet_id", petId);
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { claim_status } = req.body;
    const { data, error } = await supabase
      .from("pet_insurance")
      .update({ claim_status })
      .eq("id", id)
      .select();
    if (error) throw error;
    res.status(200).json({
      message: "Claim status updated",
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("insurance_policies")
      .delete()
      .eq("id", id);
    if (error) throw error;
    res.status(200).json({
      message: "Policy deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};