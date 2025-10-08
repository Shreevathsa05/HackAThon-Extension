import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  // useUnifiedTopology: true,
});
const HistorySchema = new mongoose.Schema(
  {
    sessionid: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true } // this gives you createdAt, updatedAt
);

const HistoryModel = mongoose.model("History", HistorySchema);
export default HistoryModel;
