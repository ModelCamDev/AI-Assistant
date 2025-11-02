import Conversation from "../models/conversation.model";
import { Types } from "mongoose";

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
}

export default new ConversationService();