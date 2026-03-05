import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

export const getDietSuggestion = async (req, res) => {
  try {
    const { species, breed, weight, dob } = req.body;

    if (!species || !breed || !weight || !dob) {
      return res.status(400).json({
        message: "Species, breed, weight and dob are required"
      });
    }

    const age = calculateAge(dob);

    const prompt = `
Create a detailed pet diet plan.

Species: ${species}
Breed: ${breed}
Age: ${age} years
Weight: ${weight} kg

Include:
1. Meal schedule
2. Portion sizes
3. Nutrients needed
4. Foods to include
5. Foods to avoid
6. Hydration advice
7. Healthy treats
8. Extra tips

Return only the diet plan.
`;
console.log("Gemini API Key Exists:", !!process.env.GEMINI_API_KEY);
    const response = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const suggestion = response.choices?.[0]?.message?.content;

    res.json({ suggestion });

  } catch (error) {

    console.error(
      "Gemini Error:",
      error.response?.data || error.message || error
    );

    res.status(500).json({
      message: "Server error while generating diet suggestion.",
      details: error.message
    });
  }
};