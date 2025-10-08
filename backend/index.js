import dotenv from 'dotenv';
import { exec } from 'child_process';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { loadDocument } from './ai/Uploader.js'; // add .js if using ESM
import SummaryModel from './schema/ResponseSchema.js'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { retrieve } from './ai/Retriver.js';
import { getRetrievalDecision } from './ai/QueryOptimizer.js'
import HistoryModel from './schema/HistoryModel.js';
import { generateFlashcards } from './ai/Flashcards.js';

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Api is live' });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let filetoDel = null;

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, "files/upload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1e6);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${base}_${timestamp}_${randomNum}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExts = [".pdf", ".docx", ".doc", ".pptx", ".txt", ".csv", ".xlsx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) cb(null, true);
    else cb(new Error(`Unsupported file type: ${ext}`));
  }
});

// Upload endpoint
app.post("/upload/document/:sessionid", upload.single("file"), async (req, res) => {
  try {
    const filename = req.file.filename;
    const filePath = path.join(uploadDir, filename);

    console.log("File stored at:", filePath);
    filetoDel = filePath;

    await loadDocument(filePath, req.params.sessionid);

    // remove file after processing
    fs.unlinkSync(filePath);
    console.log(`${filename} deleted after storing in vector DB.`);

    res.json({ message: `${filename} uploaded, processed, and stored successfully.` });
  } catch (error) {
    console.error("Upload failed:", error);
    if (filetoDel && fs.existsSync(filetoDel)) {
      fs.unlinkSync(filetoDel);
      console.log(`${filetoDel} deleted after storing in vector DB.`);

    }
    res.status(500).send("File upload failed. Unsupported type or internal error.");
  }
});

app.post("/ragChat", async (req, res) => {
  try {
    const { query, sessionid } = req.body;
    const history = req.body.history || [];

    if (!query || !sessionid) {
      return res.status(400).send("Missing query or sessionid in request body.");
    }

    // --- Fetch memory ---
    const summaryDoc = await SummaryModel.findOne({ sessionid });
    const summary = summaryDoc?.summary || "No summary found.";
    // console.log("Summary:", summary);

    let optimizedRetrieval=null
    // --- Decide if retrieval is required ---
    try {
      optimizedRetrieval =await getRetrievalDecision(query, summary, history);
      console.log("Decision:", optimizedRetrieval);
    } catch (error) {
      console.error("Error in retrieval decision:", error);
      return res.status(500).send("Error in optimizing retrieval.");
    }

    if (optimizedRetrieval.reqd) {
      // --- Retrieve docs ---
      const docs = await retrieve(
        optimizedRetrieval.retrievalQuery,
        `doc_${sessionid}`
      );
      const context = docs.join("\n---\n");

      // --- Build prompt ---
      const prompt = `You are a helpful study assistant.
Donot answer anything other than Studies or the context.
If its not there in the context Avoid answering it

Recent turns:
${history.map(h => `${h.role}: ${h.content}`).join("\n")}

User query: ${query}

Relevant context:
${context}

Answer concisely but completely.`;

      // --- Stream Gemini response ---
      const model = new ChatGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
        model: "gemini-2.5-flash",
      });

      const response = await model.invoke([{ role: "user", content: prompt }]);
      let cleaned =response.content
        .replace(/```json|```/g, "")
        .trim();
      res.json(JSON.parse(JSON.stringify(cleaned)))
    } else {
      res.send(summary);
    }
  } catch (err) {
    console.error("RAG Chat Error:", err);
    res.status(500).send("Internal error in RAG chat.");
  }
});

// summary
app.get("/summary/:sessionid", async (req, res) => {
  const { sessionid } = req.params.sessionid;
    const summaryDoc = await SummaryModel.findOne({ sessionid });
    const summary = summaryDoc?.summary || "No summary found.";
    return res.json({summary})
})

app.get('/flashcards/:sessionid', async (req, res) => {
  const { sessionid } = req.params.sessionid;
  if (!sessionid) {
    return res.status(400).send("Missing sessionid in query parameters.");
  }
  const summaryDoc = await SummaryModel.findOne({ sessionid });
  const summary = summaryDoc?.summary || "No summary found.";

  const cards=generateFlashcards(sessionid, summary)
  return res.json({cards})
})

// 
// Port listner
// 
app.listen(process.env.PORT || 3000, () => {
  console.log(`API on http://localhost:${process.env.PORT || 3000}`)
});