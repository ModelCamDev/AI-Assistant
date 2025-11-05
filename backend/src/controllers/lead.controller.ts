import { NextFunction, Request, Response } from "express";
import leadService from "../services/lead.service";

export const generateLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {email} = req.body;
    const lead = await leadService.upsertLead({email});
    res.status(201).json({success: true, message: 'Lead generated successfully', lead });
  } catch (error) {
    next(error);
  } 
};

export const updateLeadStatus = async (req: Request, res: Response, next: NextFunction)=>{
  const {leadId, status} = req.body;
  try {
    const updatedLead = await leadService.updateLeadStatus(leadId, status);
    if (!updatedLead){
      res.status(404).json({success: false, message: "Lead not found"});
      return;
    }
    res.status(200).json({success: true, message: "Lead updated successfully", lead: updatedLead})
    return;
  } catch (error) {
    
  }
}

export const getAllLeads = async (req: Request, res: Response, next: NextFunction)=>{
  try {
    const leads = await leadService.getAllLeads();
    res.status(200).json({success: true, message:'All leads fetched',leads})
    return
  } catch (error) {
    next(error)
  }
}

export const filterLeadsByStatus = async (req: Request, res: Response, next: NextFunction)=>{
  try {
    const {status} = req.params;
    const leads = await leadService.filterLeadsByStatus(status as string || '');
    res.status(200).json({success: true, message:`Filtered leads with status:"${status}" fetched`,leads})
    return
  } catch (error) {
    next(error)
  }
}