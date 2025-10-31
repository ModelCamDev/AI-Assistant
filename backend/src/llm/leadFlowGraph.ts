// Routing is controlled by us
import { StateGraph , MemorySaver } from '@langchain/langgraph';
import { z } from 'zod';
import { RAGService } from '../services/rag.service'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
const ragService = new RAGService();
interface StateSchema {
    message: string;
    previousMessage?: string;
    chatHistory?: {role:'user'|'ai', content: string}[];
    isFirstMessage: boolean;
    email?: string;
    response?: string;
    leadId?: string;
    next?:string;
}
// State Schema
const ChatState = z.object({
    message: z.string(),
    previousMessage: z.string().optional(),
    chatHistory: z.array(z.object({role: z.enum(['user', 'ai']), content: z.string()})).optional(),
    isFirstMessage: z.boolean().default(true),
    email: z.string().optional(),
    response: z.string().optional(),
    leadId: z.string().optional(),
    next: z.string().optional(),
})

// LLM Model
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  model: "gemini-2.5-flash",
});



// Define Node
async function extractEmailNode(state: StateSchema) {
    // console.log("LLM deciding what to will be next step:",  {message: state.message, prevMessage: state.previousMessage});
    const prompt = `
You are a helpful assistant managing a conversation for lead generation.
Decide the next action based on the user message. 
Also refer to chat history provided, if we have already asked for the email then don't ask again for email.

Return JSON ONLY with:
{
  "decision": "askEmail" | "createLead" | "rag",
  "email": "<email if found>"
}

Rules:
- If user provided an email, use "createLead".
- If user clearly refuses to share email, use "rag".
- If no email and not refused, use "askEmail".
- Never include explanations, just JSON.

User Message: """${state.message}"""

Chat History: 
"""${(state.chatHistory || []).map(chat=>JSON.stringify(chat)).join('\n')}"""
`;

    // Getting rsponse from LLM to decide what to do next
    const llmResponse = await model.invoke([{ role: 'user', content: prompt }]);
    console.log('LLM Response:', llmResponse.content);

    let decisionData;
    try {
        decisionData = JSON.parse(llmResponse.content.toString().replace(/```json/g, "").replace(/```/g, "").trim()|| "{}") 
    } catch {
        decisionData = { decision: 'rag'}
    }

    console.log("LLM Decision", decisionData);
    const updatedMessage = state.previousMessage || state.message;
    return { ...state, message: updatedMessage, email: decisionData.email || state.email || "",  next: decisionData.decision || 'rag'}
}

async function askForEmail (state: StateSchema){
    console.log("[askForEmail] Asking for email...");
    console.log("State received inside ask Email", {message: state.message, prevMessage: state.previousMessage})
    const reply = "Before I proceed, could you please share your email?"
    return {...state, previousMessage: state.message, response: reply}
}

async function createLead (state: StateSchema){
    console.log('[createLead] Creating Lead...');
    console.log("State received inside CreateLead Node: ", {message: state.message, prevMessage: state.previousMessage});
    // After creating lead we'll set message as previous message
    const mockLeadId = `leadId_${Date.now()}`
    return {...state, leadId: mockLeadId}
}


async function rag (state: StateSchema){
    console.log('[RAG] Getting Response from RAG');
    console.log("State received inside RAG Node: ",  {message: state.message, prevMessage: state.previousMessage});
    // We'll use state.message to get data from rag
    const textResponse = await ragService.getRAGResponse(state.message, (state.chatHistory || []))
    return {...state, response: textResponse, previousMessage: ''}
}

// Pre Node
async function addUserMessage(state: StateSchema) {
  console.log("Adding user's message at the start of flow");
  console.log("State received at the start of Invokation: ", {message: state.message, prevMessage: state.previousMessage});
  const updatedHistory = [
    ...(state.chatHistory || []),
    { role: "user", content: state.message },
  ];
  return { ...state, chatHistory: updatedHistory };
}

// Post Node
async function addAssistantMessage(state: StateSchema) {
  console.log("Adding assistant's response at end of flow");
  console.log("State received at the end of Invokation: ", {message: state.message, prevMessage: state.previousMessage});
  console.log('----------------------------------------------------------------------------')
  if (!state.response) return state; // nothing to add
  const updatedHistory = [
    ...(state.chatHistory || []),
    { role: "ai", content: state.response },
  ];
  return { ...state, chatHistory: updatedHistory };
}

// Define Conditional checks
function checkFirstMessage(state: StateSchema):string{
    console.log("State received at the start of Invokation: ", state);
    // User Entered chat, so we'll ask for email
    if (state.isFirstMessage && !state.email && !state.leadId) {
        console.log("First message, so sending to askEmail");
        return 'askEmail'
    }
    // Not a first message but email exists, so create lead
    if (!state.isFirstMessage && state.email && !state.leadId) {
        console.log("Not a first message, email exists but no leadId, so creating lead");
        return 'createLead'
    }
    // User don't want to provide email
    if (!state.isFirstMessage && !state.email && !state.leadId) {
        console.log("In second or newer messages user didn't passed email, so continuing chat");
        return 'rag'
    }
    console.log("No condition satisfied, so continuing chat");
    return 'rag';
}

function checkFlow(state: StateSchema) {
    if (!state.email && !state.leadId) {
        console.log("-> No email, No leadId, So sendig to extractEmail")
        return "extractEmail";
    }
    if (state.email && !state.leadId) {
        console.log('-> Email exists but no leadId, so sending to createLead')
        return "createLead";
    }
    console.log("-> Fallback to RAG")
    return "rag";
}

const checkpointer = new MemorySaver();
// Build Graph
export const AgentFlowGraph = new StateGraph(ChatState)
                        .addNode('askEmail',askForEmail)
                        .addNode('createLead',createLead)
                        .addNode('rag', rag)
                        .addNode('extractEmail', extractEmailNode)
                        .addNode('addUserMessage', addUserMessage)
                        .addNode('addAssistantResponse', addAssistantMessage)

                        .addEdge('__start__','addUserMessage')
                        .addConditionalEdges('addUserMessage', checkFlow)
                        .addConditionalEdges('extractEmail',(state):string=>(state.next || "rag"))
                        .addEdge('askEmail', 'addAssistantResponse')
                        .addEdge('createLead','rag')
                        .addEdge('rag', 'addAssistantResponse')
                        .addEdge('addAssistantResponse', '__end__')
                        .compile({checkpointer})
