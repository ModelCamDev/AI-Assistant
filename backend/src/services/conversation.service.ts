import Conversation from "../models/conversation.model";
import { Types } from "mongoose";
import { RAGService } from "./rag.service";

export interface IMessage {
    role: "user" | "ai";
    content: string;
}

export interface IConversation {
    _id: Types.ObjectId;
    messages: IMessage[];
    createdAt: Date;
}



export interface UpdateConversationInput {
    conversationId: Types.ObjectId;
    messages: IMessage[];
}

const ragService = new RAGService()

class ConversationService {
    // Create new conversation
    async createConversation(messages?: IMessage[]): Promise<IConversation> {
        try {
            const newConversation = new Conversation({
                messages: messages || [] // Initialize with provided messages or empty array
            });

            const savedConversation = await newConversation.save();
            
            return {
                _id: savedConversation._id,
                messages: savedConversation.messages,
                createdAt: savedConversation.createdAt
            } as IConversation;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to create conversation");
        }
    }

    /**
     * Appends new messages to an existing conversation
     * @param data Object containing conversationId and messages to append
     * @returns Updated conversation with new messages
     */
    async updateConversation(data: UpdateConversationInput): Promise<IConversation> {
        try {
            const conversation = await Conversation.findById(data.conversationId);
            
            if (!conversation) {
                throw new Error("Conversation not found");
            }

            // Add new messages to the existing array
            data.messages.forEach(message => {
                conversation.messages.push(message);
            });
            
            const updatedConversation = await conversation.save();

            if (!updatedConversation) {
                throw new Error("Conversation not found");
            }

            return {
                _id: updatedConversation._id,
                messages: updatedConversation.messages,
                createdAt: updatedConversation.createdAt
            } as IConversation;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to update conversation");
        }
    }

    async summarizeConversation(conversationId: Types.ObjectId | undefined): Promise<string>{
        try {
            const prompt = `Write a short follow-up email summary based on the conversation history.
Start the response directly with “As we discussed...” — do not include any title or labels like “Summary.”
Use a friendly, professional tone as if the agent is personally following up with the user.
Avoid referring to “the user” or “the AI”; write naturally in second person (“you”) to the recipient. Ask them to reply to this email if they are interested.`

            const conversation = await Conversation.findById(conversationId);
            if (!conversationId || !conversation) {
                const resposne = await ragService.getRAGResponse(prompt, [{role:'user', content: 'I want to know about your company and products provided by your company.'}])
                return resposne;
            }
            let allMessages = conversation.messages.map(message=>({role: message.role|| 'user', content: message.content || ''}));
            if (allMessages.length<=0) {
                allMessages = [...allMessages, {role:'user', content: 'I want to know about your company and products provided by your company.'}]
            }
            const resposne = await ragService.getRAGResponse(prompt, allMessages)
            return resposne;
        } catch (error) {
            console.log("Error while summarizing conversation");
            throw new Error('Error while summarizing conversation')
        }

    }
}

export default new ConversationService();