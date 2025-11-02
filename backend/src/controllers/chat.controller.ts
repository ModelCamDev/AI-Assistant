import { NextFunction, Request, Response } from "express";
import { AgentFlowGraph } from "../llm/leadFlowGraph";
import conversationService from "../services/conversation.service";

import { Session } from "express-session";

interface CustomSession extends Session{
    conversationId?:string
}

export const chatWithAgent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = req.session as CustomSession;
        const { query, leadId } = req.body;

        if (!session.conversationId) {
            // create a new conversation and assign its id to the session
            const conv = await conversationService.createConversation();
            session.conversationId = conv._id.toString();
        }

        const result = await AgentFlowGraph.invoke({ message: query, leadId: leadId || "", conversationId: session.conversationId || "" }, { configurable: { thread_id: session.conversationId || "default_conversation" } });
        return res.status(200).json({
            message: "Graph Invoked successfully",
            result: result.response,
            leadId: result.leadId
        })
    } catch (error: any) {
        next(error);
    }
}