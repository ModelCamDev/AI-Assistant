import { Request, Response } from "express";

export const generateLead = async (req: Request, res: Response) => {
  try {
    const {email} = req.body;
    // TODO: Create lead using email.
    res.status(201).json({ message: 'Lead generated successfully', lead: email });
  } catch (error) {
    res.status(500).json({ message: 'Error generating lead', error });
  } 
};