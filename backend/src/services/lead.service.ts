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
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      if (!updatedLead) {
        throw new Error("Failed to upsert lead");
      }

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

  // Get Lead By ID
  async getLeadById(id: string): Promise<ILead> {
    try {
      const lead = await Lead.findById(id);
      
      if (!lead) {
        throw new Error(`Lead with id ${id} not found`);
      }

      return {
        _id: lead._id,
        email: lead.email,
        conversationId: lead.conversationId,
        status: lead.status,
        createdAt: lead.createdAt
      } as ILead;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to get lead by id");
    }
  }
    
  // Get Pending Leads
  async getPendingLeads(): Promise<ILead[]> {
    try {
      const pendingLeads = await Lead.find({ status: 'new' });
      
      return pendingLeads.map(lead => ({
        _id: lead._id,
        email: lead.email,
        conversationId: lead.conversationId,
        status: lead.status,
        createdAt: lead.createdAt
      } as ILead));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to get pending leads");
    }
  }
  // Get all Leads
  async getAllLeads(): Promise<ILead[]>{
    try {
        const leads = await Lead.find();
        return leads.map(lead=>({
            _id: lead._id,
            email: lead.email,
            conversationId: lead.conversationId,
            status: lead.status,
            createdAt: lead.createdAt
        } as ILead))
    } catch (error) {
        if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to get all leads");
    }
  }

}

export default new LeadService();