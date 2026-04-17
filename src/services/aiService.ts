import { GoogleGenAI } from '@google/genai';

// Requires the environment variable to be set
const geminiApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({ apiKey: geminiApiKey });
}

export async function* getHairRecommendationStream(
  hairType: string,
  concern: string,
  languageName: string
) {
  if (!ai) {
    yield `[System: API Key missing. Please configure GEMINI_API_KEY]`;
    return;
  }

  const prompt = `You are 'Tolean AI', a luxury botanical hair oil consultant. 
  The user has ${hairType} hair and their main concern is ${concern}.
  
  Recommend EXACTLY ONE of these products:
  - Botanical Argan No. 07 (Best for straight/wavy hair, frizz, dryness)
  - Marula Silk (Best for curly/coily hair, damage, frizz)
  - Scalp Elixir (Best for all hair types, scalp health, dryness)
  
  Respond elegantly in ${languageName}. Keep it to a single luxurious paragraph of max 3 sentences. Include the suggested product name wrapped in bold asterisks, e.g., **Marula Silk**. Do not ask follow-up questions.`;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("AI Error:", error);
    yield "Our consultant is currently unavailable. Please try again shortly.";
  }
}
