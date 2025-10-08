//FlashcardDocument.js
import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  // useUnifiedTopology: true,
});

const singleFlashcardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body: { 
    type: [String], 
    required: true, 
    validate: [(arr) => arr.length > 0, "Body must have at least one point"]
  },
});

const flashcardDocumentSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    flashcards: [singleFlashcardSchema],
  },
  { timestamps: true }
);

const FlashcardDocument = mongoose.model("FlashcardDocument", flashcardDocumentSchema);
export default FlashcardDocument;
