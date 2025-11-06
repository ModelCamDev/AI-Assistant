import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    filePath: { type: String, required: true },
    size: Number,
    mimeType: String,
    createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Document', DocumentSchema);