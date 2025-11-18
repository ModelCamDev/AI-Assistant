import z from "zod";
import { agent, model } from "../agent/agent";
import { MemorySaver, StateGraph } from "@langchain/langgraph";
import { getSocket } from "../../sockets/socket";

// State schema
const State = z.object({
  userMessage: z.string(),
  messages: z.array(z.object({role: z.enum(['user', 'ai']), content: z.string()})).optional(),
  summary: z.string().optional(),
  response: z.string().optional(),
  socketId: z.string(),
  conversationId: z.string()
});

interface StateInputSchema{
    userMessage: string;
    messages?: {role:'user'|'ai', content: string}[];
    summary?: string;
    response?: string;
    socketId: string;
    conversationId: string;
}

// Nodes
async function addUserMessage(state: StateInputSchema) {
    return { ...state, messages: [...(state.messages || []), { role: 'user', content: state.userMessage }] }
}

async function agentNode(state: StateInputSchema) {

    const io = getSocket();
    let fullResponse = '';

    const stream = await agent.stream({
        messages: [ {role: 'system', content: `Current conversationId: ${state.conversationId}`},
            ...(state.summary ? [{ role: 'system', content: `summary: ${state.summary}` }] : []),
            ...(state.messages || [])
        ]
    },{ streamMode: 'messages'});
    for await (const chunk of stream){
        const [token, _ ] = chunk;
        if (token.id?.startsWith('run')) continue;
        if (token.type === 'ai') {
            fullResponse += token.content;
            io.to(state.socketId).emit('agent_chunk', token.content);
        }
    }
    io.to(state.socketId).emit('agent_complete')
    const aiResposne = fullResponse;
    const normalizedAIMessage = { role: 'ai', content: aiResposne }
    return { ...state, messages: [...(state.messages || []), normalizedAIMessage], response: aiResposne };
}

async function summarizationIfNeeded(state: StateInputSchema) {
    const MAX_MESSAGES = 6;
    const KEEP_RECENT = 4;
    if (!state.messages?.length) return state;

    if (state.messages.length <= MAX_MESSAGES) {
        return state;
    }
    const olderMessages = state.messages.slice(0, -KEEP_RECENT);
    const recentMessages = state.messages.slice(-KEEP_RECENT);

    const textToSummarize = olderMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    const summaryPrompt = `
                  Summarize the following conversation in 4-5 sentences.
                  Keep only key facts, user preferences, decisions, and important context.
                  Also remember that if 'assistant(ai)' has asked for email to 'user' or not.

                  Conversation:
                  ${textToSummarize}
                  
                  Existing summary (if any):
                  ${state.summary}`;

    const summaryResult = await model.invoke([{ role: 'human', content: summaryPrompt }]);
    const newSummary = summaryResult.content;
    return { ...state, summary: newSummary, messages: recentMessages }
}

// Workflow graph
export const leadFlow = new StateGraph(State)
                .addNode('addUserMessage', addUserMessage)
                .addNode('summarize', summarizationIfNeeded)
                .addNode('agent_node', agentNode)

                .addEdge('__start__', 'addUserMessage')
                .addEdge('addUserMessage', 'summarize')
                .addEdge('summarize','agent_node')
                .addEdge('agent_node','__end__')
                .compile({checkpointer: new MemorySaver()});
