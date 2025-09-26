import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const aiResponseService = async (metaData) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Explain how AI works in a few words",
    });
    console.log("ai response",response.text);
    return response.text;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export default aiResponseService;