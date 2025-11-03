import mongoose from "mongoose";

const EmailLogSchema = new mongoose.Schema({
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    messageId: String,
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['sent', 'replied'],
        default: 'sent'
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
})

export default mongoose.model('EmailLog', EmailLogSchema);