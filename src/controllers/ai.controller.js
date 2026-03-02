// controllers/diet.controller.js
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

// ⚡ Initialize OpenAI SDK for Gemini 2.5 Flash
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Helper: Calculate age in years from date of birth
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

// ================= GET DIET SUGGESTION =================
export const getDietSuggestion = async (req, res) => {
  try {
    const { species, breed, weight, dob } = req.body;

    // ---------- Input Validation ----------
    if (
      !species || typeof species !== "string" || !species.trim() ||
      !breed || typeof breed !== "string" || !breed.trim() ||
      !weight || isNaN(weight) || weight <= 0 ||
      !dob || isNaN(new Date(dob).getTime())
    ) {
      return res.status(400).json({
        message: "Invalid input. Provide valid species, breed, weight, and date of birth (dob).",
      });
    }

    const age = calculateAge(dob);

    // ---------- Prompt for Gemini (elaborate structured diet plan) ----------
    const prompt = `
You are a professional veterinary nutritionist. Create a **comprehensive daily diet plan** for a pet with these details:

Species: ${species.trim()}
Breed: ${breed.trim()}
Age: ${age} years
Weight: ${weight} kg

The diet plan should be **elaborate and practical**, and include:

1) Meal schedule (number of meals, time suggestions)  
2) Portion guidance for each meal  
3) Detailed list of key nutrients and why they are important  
4) Specific foods to include  
5) Foods to avoid (with reasons)  
6) Hydration advice (how much water, when, tips)  
7) Optional treats (healthy examples)  
8) Tips for maintaining a balanced diet

**Requirements:**
- Use a clear numbered or bullet-point format.  
- Do NOT include greetings or general text, only the diet plan.  
- Keep it practical and safe for the pet.

Output example:

1) Meal 1: ...  
2) Meal 2: ...  
3) Key nutrients: ...  
4) Foods to avoid: ...  
5) Hydration advice: ...  
6) Optional treats: ...  
7) Additional tips: ...
`;

    // ---------- Call Gemini 2.5 Flash ----------
    const response = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: "You provide safe, detailed, and structured pet diet advice in practical format.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,  // More tokens for detailed response
      top_p: 0.9,
    });

    const suggestion = response.choices?.[0]?.message?.content?.trim();

    if (!suggestion) {
      return res.status(500).json({
        message: "Failed to generate diet suggestion from Gemini.",
      });
    }

    res.status(200).json({ suggestion });

  } catch (error) {
    console.error("Full Gemini Error:", error.response || error);

    if (error.code === "insufficient_quota") {
      return res.status(429).json({
        message: "AI quota exceeded. Please try again later.",
      });
    }

    res.status(500).json({
      message: "Server error while generating diet suggestion.",
      details: error.message,
    });
  }
};