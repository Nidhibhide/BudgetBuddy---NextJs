import { NextRequest } from "next/server";
import { JsonOne } from "@/app/backend/utils/ApiResponse";
import { GoogleGenerativeAI } from "@google/generative-ai";


const googleAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(request: NextRequest) {
  try {
    const { categoryName } = await request.json();

    if (!categoryName) {
      return JsonOne(400, "Category name is required", false);
    }

    const prompt = `Suggest 3 relevant Lucide React icon names for the category "${categoryName}". Return only the icon names in PascalCase as a JSON array, e.g., ["Home", "Settings", "Star"]. Ensure all suggested icons are valid and exist in the Lucide React library.`;

    const model = googleAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
    });
    const result = await model.generateContent(prompt);

    let textResponse = result.response.text().trim();
    textResponse = textResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let suggestions: string[] = [];
    try {
      suggestions = JSON.parse(textResponse);
    } catch {
      console.warn("Invalid JSON from Gemini:", textResponse);
      return JsonOne(500, "Failed to parse AI response", false);
    }
    return JsonOne(200, "Icon suggestions generated", true, { suggestions });
  } catch (error) {
    console.error("Error generating icon suggestions:", error);
    return JsonOne(500, "Error generating icon suggestions", false);
  }
}
