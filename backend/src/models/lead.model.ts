import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
  },
  status: {
    type: String,
    enum: ["new", "replied"],
    default: "new",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Lead = mongoose.model("Lead", LeadSchema);

export default Lead;
