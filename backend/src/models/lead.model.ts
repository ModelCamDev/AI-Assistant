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
    enum: ["new", "replied", 'converted'],
    default: "new",
  },
  updatedAt:{
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Lead = mongoose.model("Lead", LeadSchema);

export default Lead;
