import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = secret("GeminiApiKey");

interface AnalyzeImageRequest {
  imageData: string; // base64 encoded image
}

interface AnalyzeImageResponse {
  fact: string;
  category: string;
}

// Analyzes an uploaded image and returns an interesting fact about it.
export const analyzeImage = api<AnalyzeImageRequest, AnalyzeImageResponse>(
  { expose: true, method: "POST", path: "/analyze" },
  async (req) => {
    const genAI = new GoogleGenerativeAI(geminiApiKey());
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      // Convert base64 to the format expected by Gemini
      const imagePart = {
        inlineData: {
          data: req.imageData,
          mimeType: "image/jpeg"
        }
      };

      const prompt = `Analyze this image and provide a surprising, educational, and fun fact about what you see. The fact should be:
      - Under 100 words
      - Genuinely interesting and surprising
      - Educational but accessible
      - Related to what's visible in the image
      
      Also categorize the fact into one of these categories: science, history, nature, technology, culture, food, art, or general.
      
      Respond in JSON format with 'fact' and 'category' fields.`;

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      const parsed = JSON.parse(text);
      
      return {
        fact: parsed.fact,
        category: parsed.category
      };
    } catch (error) {
      console.error("Error analyzing image:", error);
      
      // Fallback fact if AI fails
      return {
        fact: "Did you know that the human eye can distinguish about 10 million different colors? Every image you capture contains a unique combination of these colors that tells its own story!",
        category: "science"
      };
    }
  }
);
