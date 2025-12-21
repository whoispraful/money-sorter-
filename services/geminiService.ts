import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Transaction, StatementData } from "../types";

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
    isValidFinancialDocument: { type: Type.BOOLEAN },
    validationReason: { type: Type.STRING },
    transactions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          description: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          currency: { type: Type.STRING },
          amountInUSD: { type: Type.NUMBER },
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
    
    if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
      throw new Error("CRITICAL: API Key is missing. Please set the API_KEY environment variable in your deployment dashboard.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const filePart = await fileToGenerativePart(file);

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          filePart,
          { text: "Extract all transactions from this bank statement/receipt. Convert all amounts to USD. Return only valid JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: transactionSchema,
      },
    });

    const parsed = JSON.parse(response.text || "{}");

    if (parsed.isValidFinancialDocument === false) {
       return {
         fileName: file.name,
         isValid: false,
         validationError: parsed.validationReason || "The uploaded file is not a valid financial document.",
         transactions: [],
         summary: { totalCredits: 0, totalDebits: 0, netFlow: 0 }
       };
    }

    const transactions: Transaction[] = (parsed.transactions || []).map((t: any) => ({
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
      summary: { totalCredits, totalDebits, netFlow: totalCredits + totalDebits }
    };

  } catch (error: any) {
    console.error("Gemini Error Details:", error);
    let msg = error.message || "Extraction failed.";
    
    // Help users solve the specific Google Console issue
    if (msg.includes("403") || msg.includes("PERMISSION_DENIED") || msg.includes("referer")) {
      msg = "GOOGLE PERMISSION ERROR: 1. Go to Google Cloud Console > Credentials. 2. Set 'Application restrictions' to 'NONE'. 3. Set 'API restrictions' to 'DON'T RESTRICT KEY'. 4. WAIT 5 MINUTES for Google to update. 5. Refresh this page.";
    }
    
    throw new Error(msg);
  }
};