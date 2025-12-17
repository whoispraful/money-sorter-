import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Transaction, StatementData } from "../types";

// Helper to generate simple IDs
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const transactionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isValidFinancialDocument: { 
      type: Type.BOOLEAN, 
      description: "Set to false if the image is NOT a bank statement, invoice, receipt, or financial table. Set to true otherwise." 
    },
    validationReason: {
      type: Type.STRING,
      description: "If invalid, allow the user to know why. E.g., 'Not a financial document. Please upload a receipt or invoice.'"
    },
    transactions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "YYYY-MM-DD" },
          description: { type: Type.STRING },
          amount: { type: Type.NUMBER, description: "The numeric value in the original currency." },
          currency: { type: Type.STRING, description: "The 3-letter currency code (e.g. USD, EUR, GBP)." },
          amountInUSD: { type: Type.NUMBER, description: "Convert the amount to USD using approximate current exchange rates." },
          category: { type: Type.STRING },
          notes: { type: Type.STRING },
        },
        required: ["date", "description", "amount", "currency", "amountInUSD"],
      },
    },
  },
  required: ["isValidFinancialDocument", "transactions"]
};

export const parseStatement = async (file: File): Promise<Omit<StatementData, 'id'>> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey.includes("API_KEY")) { // Check for empty or unreplaced placeholder
        throw new Error("API Key is missing or invalid. Check environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const filePart = await fileToGenerativePart(file);

    const prompt = `
      Analyze the provided image or PDF.
      
      TASK:
      1. Identify if this is a valid financial document (Statement, Receipt, Invoice, Bill).
      2. Extract all transactions.
      3. CRITICAL: Identify the currency. If it is NOT USD, you MUST estimate the converted value in USD for the 'amountInUSD' field.
      
      RULES:
      - Date format: YYYY-MM-DD.
      - Expenses are negative numbers (e.g. -10.50), Income is positive.
      - Categories: Groceries, Utilities, Rent, Dining, Travel, Salary, Transfer, Tech/Services, Medical.
      - If the image is blurry or not financial, set isValidFinancialDocument: false.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          filePart,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: transactionSchema,
        temperature: 0.1,
      },
    });

    const responseText = response.text;
    if (!responseText) throw new Error("No response from Gemini");

    const cleanJson = responseText.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.error("JSON Parse Error. Raw text:", responseText);
      throw new Error("Failed to parse AI response. Please try again.");
    }

    if (parsed.isValidFinancialDocument === false) {
       return {
         fileName: file.name,
         isValid: false,
         validationError: parsed.validationReason || "Please upload a valid invoice or receipt.",
         transactions: [],
         summary: { totalCredits: 0, totalDebits: 0, netFlow: 0 }
       };
    }

    const rawTransactions = parsed.transactions || [];
    const transactions: Transaction[] = rawTransactions.map((t: any) => ({
        ...t,
        id: generateId(),
        currency: t.currency || 'USD',
        amountInUSD: t.amountInUSD || t.amount
    }));

    const totalCredits = transactions.filter(t => t.amountInUSD > 0).reduce((acc, t) => acc + t.amountInUSD, 0);
    const totalDebits = transactions.filter(t => t.amountInUSD < 0).reduce((acc, t) => acc + t.amountInUSD, 0);

    return {
      fileName: file.name,
      transactions,
      isValid: true,
      summary: {
        totalCredits,
        totalDebits,
        netFlow: totalCredits + totalDebits,
      }
    };

  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    // Directly propagate meaningful errors
    throw new Error(error.message || "Could not process file. Ensure it is a clear image or PDF.");
  }
};