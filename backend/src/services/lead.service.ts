import Lead from "../models/lead.model";
import { Types } from "mongoose";

export interface ILead {
  _id: Types.ObjectId;
  email: string;
  conversationId?: Types.ObjectId;
  status: "new" | "replied";
  createdAt: Date;
}

export interface LeadInput {
  email: string;
  conversationId?: Types.ObjectId;
}

class LeadService {
    // Create or update Lead
  async upsertLead(leadData: LeadInput): Promise<ILead> {
    try {
      const updatedLead = await Lead.findOneAndUpdate(
        { email: leadData.email },
        { 
          $set: {
            conversationId: leadData.conversationId,
            status: "new"
          }
        },
        { 
          new: true, // Return the updated document
          upsert: true, // Create if it doesn't exist
          setDefaultsOnInsert: true // Apply schema defaults on insert
        }
      );

      return {
        _id: updatedLead._id,
        email: updatedLead.email,
        conversationId: updatedLead.conversationId,
        status: updatedLead.status,
        createdAt: updatedLead.createdAt
      } as ILead;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to create lead");
    }
  }


}

export default new LeadService();
