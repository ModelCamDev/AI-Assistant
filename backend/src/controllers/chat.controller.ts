import { NextFunction, Request, Response } from "express";
import { RAGService } from "../services/rag.service";

const ragService = new RAGService();
export const chatWithAgent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query, messages, leadId } = req.body;
    
        // TODO: Implement chat with agent logic
        if(!query) {return res.status(400).json({message: "query is required"})}
        const answer = await ragService.getRAGResponse(query, messages);

        res.json({ message: "Chat with agent endpoint" , data: answer});
    } catch (error: any) {
        next(error);
    }
}