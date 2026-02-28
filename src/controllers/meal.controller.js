import { supabase } from "../config/SupabaseConfig.js";

/**
 * GET /api/nutrition/:petId
 * Returns a detailed meal plan for a dog or cat based on breed, age, weight, and species.
 */
export const getMealPlan = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user?.id;

    // Fetch pet info
    const { data: pet, error } = await supabase
      .from("pets")
      .select("id, name, breed, dob, weight, species, user_id")
      .eq("id", petId)
      .single();

    if (error) return res.status(500).json({ message: "Database error" });
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // Ownership check
    if (userId && pet.user_id !== userId)
      return res.status(403).json({ message: "Not authorized for this pet" });

    // Calculate age in years
    const today = new Date();
    const birthDate = new Date(pet.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;

    // Determine daily calories
    let dailyCalories;
    if (pet.species.toLowerCase() === "dog") {
      if (age < 1) dailyCalories = Math.round(50 * pet.weight); // puppy
      else if (age <= 7) dailyCalories = Math.round(30 * pet.weight); // adult
      else dailyCalories = Math.round(25 * pet.weight); // senior
    } else if (pet.species.toLowerCase() === "cat") {
      if (age < 1) dailyCalories = Math.round(55 * pet.weight); // kitten
      else if (age <= 10) dailyCalories = Math.round(40 * pet.weight); // adult
      else dailyCalories = Math.round(35 * pet.weight); // senior
    } else return res.status(400).json({ message: "Unknown species" });

    // Breed-specific adjustments
    const breedAdjustments = {
      // Dogs
      "german shepherd": { multiplier: 1, notes: "Large breed: joint supplements recommended." },
      "labrador": { multiplier: 1.1, notes: "Active breed: slightly higher portions." },
      "bulldog": { multiplier: 0.9, notes: "Prone to obesity: control portions." },
      "pomeranian": { multiplier: 0.8, notes: "Small breed: avoid overfeeding." },

      // Cats
      "persian": { multiplier: 1, notes: "Long hair: grooming supplement recommended." },
      "siamese": { multiplier: 1, notes: "Maintain lean body weight." },
      "maine coon": { multiplier: 1.2, notes: "Large breed: monitor portions." },
      "ragdoll": { multiplier: 1, notes: "Moderate portions, active lifestyle." },
    };

    const breedKey = pet.breed?.toLowerCase();
    const breedInfo = breedAdjustments[breedKey] || { multiplier: 1, notes: "" };

    // Meal plan (3 meals)
    let meals;
    if (pet.species.toLowerCase() === "dog") {
      meals = [
        { meal_time: "Morning", food: "Dry Kibble", portion_g: Math.round((dailyCalories * 0.3 / 3.5) * breedInfo.multiplier), notes: "Protein-rich kibble" },
        { meal_time: "Afternoon", food: "Cooked lean meat + rice/vegetables", portion_g: Math.round((dailyCalories * 0.4 / 3.5) * breedInfo.multiplier), notes: "Avoid bones & seasoning" },
        { meal_time: "Evening", food: "Wet balanced dog food", portion_g: Math.round((dailyCalories * 0.3 / 3.5) * breedInfo.multiplier), notes: "Includes vitamins & minerals" },
      ];
    } else {
      meals = [
        { meal_time: "Morning", food: "High-protein wet cat food", portion_g: Math.round((dailyCalories * 0.4 / 3.5) * breedInfo.multiplier), notes: "Contains taurine" },
        { meal_time: "Afternoon", food: "Cooked fish/chicken", portion_g: Math.round((dailyCalories * 0.35 / 3.5) * breedInfo.multiplier), notes: "No bones, lightly cooked" },
        { meal_time: "Evening", food: "Dry cat kibble", portion_g: Math.round((dailyCalories * 0.25 / 3.5) * breedInfo.multiplier), notes: "Balanced minerals & vitamins" },
      ];
    }

    // Key nutrients
    const nutrients = pet.species.toLowerCase() === "dog"
      ? [
          "Protein: growth & muscle maintenance",
          "Fat: energy & skin health",
          "Carbohydrates: energy",
          "Fiber: digestive health",
          "Calcium & Phosphorus: bone strength",
          "Vitamins & minerals: immunity",
          "Omega-3 & Omega-6: coat & brain health",
        ]
      : [
          "Protein: high requirement for cats",
          "Fat: energy & skin/coat health",
          "Taurine: essential for heart & vision",
          "Vitamins & minerals: immunity",
          "Water: cats require hydration from food",
          "Omega-3 & Omega-6: coat & brain health",
        ];

    // Foods to avoid
    const avoidFoods = pet.species.toLowerCase() === "dog"
      ? ["Chocolate, caffeine, alcohol", "Onions, garlic, grapes, raisins", "Cooked bones", "Artificial sweeteners (xylitol)", "High salt or sugar foods"]
      : ["Chocolate, caffeine, alcohol", "Onions, garlic, grapes, raisins", "Raw fish (thiamine deficiency)", "Dairy (many cats are lactose intolerant)", "Artificial sweeteners (xylitol)"];

    // Hydration
    const hydration = pet.species.toLowerCase() === "dog"
      ? "Provide fresh water always."
      : "Provide fresh water; cats often drink little, wet food helps hydration.";

    res.json({
      petId: pet.id,
      petName: pet.name,
      species: pet.species,
      breed: pet.breed,
      age,
      weight: pet.weight,
      dailyCalories,
      meals,
      nutrients,
      avoidFoods,
      hydration,
      breedNotes: breedInfo.notes,
    });
  } catch (err) {
    console.error("Error in getMealPlan:", err);
    res.status(500).json({ message: err.message });
  }
};