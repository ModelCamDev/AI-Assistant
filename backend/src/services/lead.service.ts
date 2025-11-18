import Lead from "../models/lead.model";
import { Types } from "mongoose";
import emailLogService from "./emailLog.service";
import { RAGService } from "./rag.service";
import { generalModel } from "../ai/agent/agent";
const ragService = new RAGService();
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

      // Send Welcome email to lead
      const welcomePrompt = `Write a short, friendly, and professional welcome message for a new user or potential customer.
The message should sound natural, as if written by a company representative, but it should not include any greeting (like “Hi,” “Hello,” “Dear [Name],”) or any closing line (like “Thanks,” “Regards,” or a signature).

The message should:

Begin directly with a welcoming statement (e.g., “Welcome to Modelcam Technologies! ...”).

Highlight the main products or services offered.

End naturally with an encouraging or positive note (e.g., “We're excited to help you get started” or “Looking forward to working with you”).

Write it in a conversational and engaging tone — as if the agent is personally introducing the company, not as a generic description.
Do not include any headers, footers, or labels like “Message:” or “Summary:”.`;
      const greeting = await generalModel.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{role: 'system', content: welcomePrompt}],
        stream: false
      })
      const emailBody = `Hi there,\n\n${greeting.choices[0].message.content}\n\nBest regards,\nModelcam Technologies pvt. ltd.`;
      await emailLogService.sendEmailToLead({leadId: updatedLead._id.toString(), to: updatedLead.email, subject: "Welcome to Modelcam!", body: emailBody}) 
      

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
  // Update Lead Status
  async updateLeadStatus(leadId: string, status: string){
    try {
      const updatedLead = await Lead.findByIdAndUpdate(leadId, {status: status}, {new: true});
      return updatedLead;
    } catch (error) {
      if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to update lead status");
    }
  }
  // Filter leads by status
  async filterLeadsByStatus(status: string) {
    try {
      const filteredLeads = await Lead.find({ status });
      return filteredLeads
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update lead status");
    }
  }

}

export default new LeadService();