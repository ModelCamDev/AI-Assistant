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
            status: "new", 
            updatedAt: new Date()
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
      const emailBody = `
      <!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#f4f4f4; font-family: Roboto;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding: 40px 0;">
    <tr><td align="center">

      <table width="90%" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:6px; overflow:hidden;">

        <!-- Logo -->
        <tr>
          <td align="center" style="padding: 20px;">
            <img src="https://www.modelcamtechnologies.com/images/logo1.png"
              alt="Modelcam Logo"
              width="150"
              style="display:block;">
          </td>
        </tr>

        <!-- Header -->
        <tr>
          <td style="background:#6DA944; padding:20px; color:#ffffff; font-size:20px; font-weight:bold;">
            Welcome to Modelcam Technologies!
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:30px; line-height:1.6; color:#333333;">
            <h2 style="margin:0 0 15px 0; font-size:16px;">Hello there,</h2>

            <div style="background:#f1f7ff; padding:15px; border-left:4px solid #6DA944;">
              ${greeting.choices[0].message.content}
            </div>

            <p style="margin:15px 0;">Best regards,<br>Modelcam Technologies pvt. ltd.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f8f8; padding:15px; text-align:center; font-size:12px; color:#777;">
            © 2025 Modelcam Technologies Pvt. Ltd.
          </td>
        </tr>

      </table>

    </td></tr>
  </table>

</body>
</html>

      `;
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
        const leads = await Lead.find().sort({ createdAt: -1});
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
      const updatedLead = await Lead.findByIdAndUpdate(leadId, {status: status, updatedAt: new Date()}, {new: true});
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