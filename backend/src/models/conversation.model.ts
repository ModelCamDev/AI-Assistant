import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lead",
    },
    messages: [
        {
            role: {
                type: String,
                enum: ["user", "ai"]
            },
            content: {
                type: String
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

const Conversation = mongoose.model("Conversation", ConversationSchema);

export default Conversation;