import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import FlashcardDocument from "../schema/FlashcardsSchema.js";
dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export async function generateFlashcards(sessionid,content) {
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `You are an assistant that generates study flashcards.
Create flashcards based on the content below.

Output JSON array where each element is an object:
{
  "title": "short string",
  "body": ["bullet point 1", "bullet point 2", ...]
}

Do NOT include commentary or markdown.

Content:
${content}`,
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
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            body: { type: "array", items: { type: "string" } },
          },
          required: ["title", "body"],
        },
      },
    },
  });

  const text = response.candidates[0].content.parts[0].text;
//   console.log("Raw flashcards output:", text);

  try {
    const flashcards = JSON.parse(text);
    await FlashcardDocument.insertOne({ sessionId: sessionid, flashcards });
    return flashcards;
  } catch (err) {
    console.error("Failed to parse flashcards JSON:", err);
    return [];
  }
}


// (async () => {
//   const content = `
// Artificial Intelligence is the simulation of human intelligence by machines.
// It has applications in self-driving cars, chatbots, and medical diagnosis.
// Machine Learning is a subset of AI that allows machines to learn from data.
// `;
//   const flashcards = await generateFlashcards(232323,content);
//   console.log(flashcards);
// })();
