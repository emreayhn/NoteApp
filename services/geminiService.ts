import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey: apiKey });
}

export const summarizeNote = async (noteContent: string): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API key not found. Skipping AI summarization.");
    return "API Key eksik. Özetleme yapılamadı.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Aşağıdaki öğrenci notunu akademik ve öz bir dille, madde işaretleri kullanarak 3 cümlede özetle:\n\n"${noteContent}"`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Özet oluşturulamadı.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Yapay zeka servisine ulaşırken bir hata oluştu.";
  }
};