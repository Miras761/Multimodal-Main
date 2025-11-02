import { GoogleGenAI, Content } from "@google/genai";
import { Message, Part } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. Please set it in your environment.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = "You are Multimodal Main, a helpful AI assistant created by a programmer. You are witty, smart, and an expert in many fields. When asked about your identity or the model you are based on, simply state that you are Multimodal Main, a bot created by a programmer. Respond in Russian.";

// Note: The gemini-2.5-flash model does not support system instructions in chat sessions (`ai.chats.create`).
// We must use `generateContent` and pass the history manually.

export const sendMessageToGemini = async (history: Message[], newUserParts: Part[]): Promise<string> => {
  // Filter out the initial welcome message from the model before sending history
  const filteredHistory = history.slice(1);

  const contents: Content[] = filteredHistory.map(msg => ({
      role: msg.role,
      parts: msg.parts,
  }));
  
  // Add the new user message
  contents.push({ role: 'user', parts: newUserParts });

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: contents,
      config: {
        systemInstruction: systemInstruction
      }
    });
    
    const text = result.text;
    if (text) {
        return text;
    } else {
        return "I'm sorry, I couldn't generate a response. The response might have been empty or blocked.";
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `Error: ${error.message}`;
    }
    return "An unknown error occurred while contacting the AI.";
  }
};
