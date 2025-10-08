
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getRetrievalDecision(
  query,
  summary,
  history
) {
  const historyText = history.map(h => `${h.role}: ${h.content}`).join("\n");

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `You are a retrieval decision agent.

Your job: Decide if additional retrieval from a vector DB is needed, and if so, generate a retrieval query that covers the user's request and all related entities or concepts from the summary.

Rules:
1. If the latest user query asks for new details, facts, explanations, comparisons, or topics NOT explicitly covered in the chat history or summary → reqd = true.
2. If the user asks to restate, summarize, or elaborate on existing content → reqd = false.
3. When reqd = true, the retrievalQuery must:
   - Include keywords from the user query.
   - Expand to include related concepts, entities, or subtopics mentioned in the summary that might be relevant.
   - Avoid repeating irrelevant or generic terms.

Examples:
Q: "Give me more details about neural networks"  
→ { "reqd": true, "retrievalQuery": "neural networks architecture, training, layers, activation functions, applications" }

Q: "Summarize what we've discussed"  
→ { "reqd": false, "retrievalQuery": "" }

Q: "Compare CNN and RNN"  
→ { "reqd": true, "retrievalQuery": "comparison between convolutional neural networks and recurrent neural networks, advantages, use cases" }

Now, decide for this input.

Summary:
${summary}

Chat History:
${historyText}

User Question:
${query}`
        },
      ],
    },
  ];

  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          reqd: { type: "boolean" },
          retrievalQuery: { type: "string" },
        },
        required: ["reqd", "retrievalQuery"],
      },
    },
  });
  console.log("Retrieval decision response:", response.candidates[0].content.parts[0].text);
  return JSON.parse(response.candidates[0].content.parts[0].text);
}