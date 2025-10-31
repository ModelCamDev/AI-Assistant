import { NextFunction, Request, Response } from "express";
import { AgentFlowGraph } from "../llm/leadFlowGraph";

export const chatWithAgent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query, leadId } = req.body;
        const result = await AgentFlowGraph.invoke({ message: query, leadId: leadId || "" }, { configurable: { thread_id: "conv_1" } });
        return res.status(200).json({
            message: "Graph Invoked successfully",
            result: result.response,
            leadId: result.leadId
        })
    } catch (error: any) {
        next(error);
    }
}