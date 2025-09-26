import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const aiResponseService = async (projectDescription) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a Mermaid flowchart for the given project showing Setup, Current Features, and Future Features.

Rules:
- Start with "flowchart TD" 
- No code blocks or explanations
- Use proper line breaks (not \\n)
- Use only alphanumeric node IDs with underscores
- Return only raw Mermaid syntax

Project: ${projectDescription}`,
    });
    console.log("ai response", response.text);
    return response.text;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export default aiResponseService;
