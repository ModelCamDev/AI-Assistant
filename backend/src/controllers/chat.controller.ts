import { NextFunction, Request, Response } from "express";
import { AgentFlowGraph } from "../llm/leadFlowGraph";
import conversationService from "../services/conversation.service";

import { Session } from "express-session";
import { generateTextToSpeech, transcribeAudio } from "../services/voice.service";
import { graph } from "../llm/DemoFlow";
import { Command } from "@langchain/langgraph";
import { leadFlow } from "../ai/workflow/leadFlow";

interface CustomSession extends Session{
    conversationId?:string;
    isInterrupted: boolean;
}

export const chatWithAgent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = req.session as CustomSession;
        const { query } = req.body;

        if (!session.conversationId) {
            // create a new conversation and assign its id to the session
            console.log("------------------------TEXT CHAT------------------------")
            console.time('graphInvokation')
            const conv = await conversationService.createConversation();
            console.timeEnd('graphInvokation')
            console.log("------------------------------------------------")
            session.conversationId = conv._id.toString();
        }

        const result = await AgentFlowGraph.invoke({ message: query, conversationId: session.conversationId || "" }, { configurable: { thread_id: session.conversationId || "default_conversation" } });
        return res.status(200).json({
            message: "Graph Invoked successfully",
            result: result.response,
            leadId: result.leadId
        })
    } catch (error: any) {
        next(error);
    }
}

export const voiceChatWithAgent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = req.session as CustomSession;

        if (!req.file || !req.file.buffer) {
            throw new Error("No audio file provided")
        }

        if (!session.conversationId) {
            // create a new conversation and assign its id to the session
            const conv = await conversationService.createConversation();
            session.conversationId = conv._id.toString();
        }
        console.log("-----------------------VOICE CHAT-------------------------")
        console.time('transcribe')
        const userQuery = await transcribeAudio(req.file.buffer, req.file.originalname);
        console.timeEnd('transcribe')
        console.time('graphInvokation')
        const result = await AgentFlowGraph.invoke({message: userQuery, conversationId: session.conversationId}, { configurable: { thread_id: session.conversationId || "default_conversation" } });
        console.timeEnd('graphInvokation')
        console.time('generateAudio')
        const audioBuffer = await generateTextToSpeech(result.response || "Unable to generate audio");
        console.timeEnd('generateAudio')
        console.log("------------------------------------------------")
        const audioBase64 = audioBuffer.toString('base64');

        return res.status(200).json({
            message: "Voice graph invoked successfully",
            query: userQuery,
            response: result.response,
            audio: audioBase64,
            contentType: "audio/mpeg",
            leadId: result.leadId,
        })
    } catch (error) {
        next(error)
    }
}

export const generateTTS = async (req: Request, res: Response, next: NextFunction)=>{
    const { text } = req.body;
    try {
        const audioBuffer = await generateTextToSpeech(text);
        const audioBase64 = audioBuffer.toString('base64');
        res.status(200).json({
            message: 'Voice generated',
            audio: audioBase64,
            contentType: "audio/mpeg"
        })
    } catch (error) {
        next(error)
    }
}

export const demoChat = async (req: Request, res: Response, next: NextFunction)=>{
        try {
            const { query } = req.body;
            console.time('GraphInvokation')
            const response = await leadFlow.invoke({userMessage: query},{configurable:{thread_id: 'conv_1'}});
            console.timeEnd('GraphInvokation')
            console.log("Current number of messages:", response.messages?.length);
            console.log(`Current Summary: ${response.summary}`);
            console.log('--------------------------------------------------------------------------');
            return res.json({ message: response.response || "No response recieved..."})
            // return res.json({ message: response.messages?.at(-1), interrupt: response.__interrupt__ || "No interruption" })
        } catch (error) {
            next(error)
        }
}

export const resumeChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { action, email } = req.body;
        const response = await graph.invoke(new Command({ resume: { action, email } }), { configurable: { thread_id: 'conv_1' } });
        if (response.__interrupt__) {
            return res.json({ interrupt: response.__interrupt__ })
        }
        return res.json({ message: response.messages.at(-1), interrupt: response.__interrupt__ || "No interruption" })
    } catch (error) {
        next(error)
    }
}