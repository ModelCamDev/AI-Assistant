import { DynamicTool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ToolNode } from "@langchain/langgraph/prebuilt";

const tools: DynamicTool[] = []
const extractEmailAgent = new ToolNode(tools);

const model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
}).bindTools(tools);



