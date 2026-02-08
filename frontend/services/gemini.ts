
import { GoogleGenAI } from "@google/genai";
import { Invoice } from "../types";

export const getFinancialInsights = async (invoices: Invoice[]) => {
  // Always use process.env.API_KEY directly in the constructor as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const invoiceSummary = invoices.map(i => ({
    client: i.clientName,
    amount: i.amount,
    status: i.status,
    due: i.dueDate
  }));

  const prompt = `Analyze the following invoice data and provide a concise 3-point bulleted summary of financial health, identifying risks (like overdue accounts) and suggesting next steps. 
  Data: ${JSON.stringify(invoiceSummary)}
  Keep the response professional and actionable.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    // Directly accessing the .text property of GenerateContentResponse as per guidelines
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate AI insights at this time.";
  }
};
