import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to calculate age from DOB
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

export const getDietSuggestion = async (req, res) => {
  try {
    const { species, breed, weight, dob } = req.body;

    // Validation
    if (!species || !breed || !weight || !dob) {
      return res.status(400).json({
        message: "Species, breed, weight and dob are required.",
      });
    }

    const age = calculateAge(dob);

    const prompt = `
You are a professional veterinary nutrition expert.

Suggest a healthy and practical daily diet plan for:

Species: ${species}
Breed: ${breed}
Age: ${age} years
Weight: ${weight} kg

Include:
- Meal frequency
- Portion guidance
- Key nutrients
- Foods to avoid
- Hydration advice

Keep it simple and practical.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You provide safe and responsible pet diet advice.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const suggestion = response.choices?.[0]?.message?.content;

    if (!suggestion) {
      return res.status(500).json({
        message: "Failed to generate diet suggestion.",
      });
    }

    res.status(200).json({ suggestion });

  } catch (error) {
    console.error("AI Diet Error:", error);

    if (error.code === "insufficient_quota") {
      return res.status(429).json({
        message: "AI quota exceeded. Please try again later."
      });
    }

    res.status(500).json({
      message: "Server error while generating diet suggestion."
    });
  }
};