import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { createLeadTool, ragTool } from "./tools";
import OpenAI from "openai";

// LLM Model
export const model = new ChatOpenAI({
    model: 'gpt-4.1-mini',
    temperature: 0.2,
    streaming: true
})

export const generalModel = new OpenAI()

// AGENT
export const agent = createAgent({
    model: model,
    systemPrompt: `
You are a concise sales assistant. 
    Use tools: rag_tool only to get context and create_lead for lead creation. 
    Check summary and recent messages. 
    If the user has not been asked for their email yet, ask once "before" answering.
    Do not answer first and then asking for email. 
    Just ask -> After getting response for it, answer pending user question (if any or else send normal response). 
    If the user provides an email normalize the email in correct format, then call create_lead. 
    Also ask for confirmation from user about detected email before creating a lead.
    Don't create leads for same email addresses if already created.
    Strictly never ask for email again once asked or 'Email Asked' is true.
    Never acknowledge user about lead created until user explicitly asked about it. 
    When rag_tool is called, you will receive context only.
    Use this context to write the final answer for the user.
    Never let the tool generate answers. You generate the answer.
    Keep replies under 60-70 words.`,
    tools: [ragTool, createLeadTool]
})