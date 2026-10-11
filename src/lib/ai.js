import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeTicket({ subject, description }) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });

  const prompt = `You are a support ticket triage assistant for a customer support team.

A customer submitted this complaint:
Subject: ${subject}
Description: ${description}

Analyze it and respond with ONLY valid JSON, no markdown formatting, no backticks, in exactly this shape:
{
  "category": "one of: Billing, Delivery, Product Defect, Account, General Inquiry, Other",
  "priority": "one of: Low, Medium, High, Urgent",
  "sentiment": "one of: Positive, Neutral, Frustrated, Angry",
  "summary": "a one-sentence summary of the issue",
  "suggestedResponse": "a short, polite, helpful draft reply to the customer, 2-4 sentences",
  "needsHuman": true or false — true if this requires a human agent's judgment (e.g. a refund, a complex dispute, an angry customer), false if the suggested response is likely sufficient on its own (e.g. a simple FAQ-style question)
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Gemini sometimes wraps JSON in markdown code fences despite instructions — strip them defensively
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse Gemini response:", text);
    // Safe fallback: if parsing fails, always escalate to a human rather than silently losing the ticket
    return {
      category: "Other",
      priority: "Medium",
      sentiment: "Neutral",
      summary: subject,
      suggestedResponse: "",
      needsHuman: true,
    };
  }
}
