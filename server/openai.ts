import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generates an image based on a text prompt using DALL-E-3
 * @param prompt The text prompt to generate an image from
 * @returns A URL to the generated image
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    // Enhance the prompt for better story-appropriate results
    const enhancedPrompt = `Comic panel style illustration: ${prompt}. Detailed, colorful, with clear characters and action, suitable for a comic strip or storyboard. No text or speech bubbles in the image.`;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return response.data[0].url || "";
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
}

/**
 * Analyzes a prompt and returns suggested captions or story elements
 * @param prompt The prompt to analyze
 * @returns Suggested captions or narrative elements
 */
export async function suggestCaption(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a creative comic book writer who excels at writing concise, engaging captions for comic panels. Keep captions short (under 100 characters) and impactful."
        },
        {
          role: "user",
          content: `Based on this description of a comic panel, suggest a short caption or dialog text that would work well in a speech bubble: "${prompt}"`
        }
      ],
      max_tokens: 100,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error suggesting caption:", error);
    throw new Error(`Failed to suggest caption: ${error.message}`);
  }
}

/**
 * Generates a theme for a new storyboard challenge
 * @returns A challenge theme with title, description, and tags
 */
export async function generateChallengeTheme(): Promise<{
  title: string;
  description: string;
  tags: string[];
  category: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a creative director for comic book challenges. Generate engaging themes for collaborative comic strip creation."
        },
        {
          role: "user",
          content: "Generate a new challenge theme for a collaborative comic strip. Include a catchy title, brief description (1-2 sentences), 2-3 genre tags, and a main category (Sci-Fi, Fantasy, Horror, Adventure, Mystery, or Comedy). Format as JSON."
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 250,
    });

    const themeData = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: themeData.title || "Mysterious Adventure",
      description: themeData.description || "Embark on an exciting journey through the unknown.",
      tags: themeData.tags || ["Adventure", "Mystery"],
      category: themeData.category || "Adventure"
    };
  } catch (error) {
    console.error("Error generating challenge theme:", error);
    throw new Error(`Failed to generate challenge theme: ${error.message}`);
  }
}
