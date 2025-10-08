import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  // useUnifiedTopology: true,
});

const SummarySchema = new mongoose.Schema({
  sessionid: { type: String, required: true},
  summary: { type: String, required: true },
});

export default mongoose.model("Summary", SummarySchema);

