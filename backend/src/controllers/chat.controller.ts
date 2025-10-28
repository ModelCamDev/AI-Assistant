import { NextFunction, Request, Response } from "express";

export const chatWithAgent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { messages, leadId } = req.body;
    
        // TODO: Implement chat with agent logic
    
        res.json({ message: "Chat with agent endpoint" , data:{messages, leadId}});
    } catch (error: any) {
        next(error);
    }
}