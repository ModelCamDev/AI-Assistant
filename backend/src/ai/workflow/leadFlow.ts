import z from "zod";
import { agent, generalModel, model } from "../agent/agent";
import { MemorySaver, StateGraph } from "@langchain/langgraph";
import { getSocket } from "../../sockets/socket";
import { zodResponseFormat } from 'openai/helpers/zod'
import conversationService, { IMessage, UpdateConversationInput } from "../../services/conversation.service";
import { Types } from "mongoose";
import { AIMessageChunk, ToolMessage, ToolMessageChunk } from "langchain";

// State schema
const State = z.object({
  userMessage: z.string(),
  messages: z.array(z.object({role: z.enum(['user', 'ai']), content: z.string()})).optional(),
  summary: z.string().optional(),
  response: z.string().optional(),
  socketId: z.string(),
  conversationId: z.string(),
  emailAsked: z.boolean().default(false),
  createdLeads: z.array(z.string()).default([]),
});

interface StateInputSchema{
    userMessage: string;
    messages?: {role:'user'|'ai', content: string}[];
    summary?: string;
    response?: string;
    socketId: string;
    conversationId: string;
    emailAsked: boolean;
    createdLeads: string[];
}

// Nodes

//  [Node] for Appending user message to state.messages
async function addUserMessage(state: StateInputSchema) {
    return { ...state, messages: [...(state.messages || []), { role: 'user', content: state.userMessage }], response: '' }
}

// [Node] Agent Node
async function agentNode(state: StateInputSchema) {

    const io = getSocket();
    let fullResponse = '';
    let createdLeads: string[] = [];

    const stream = await agent.stream({
        messages: [ {role: 'system', content: `Current conversationId: ${state.conversationId}, Email Asked: ${state.emailAsked}, Created Leads: ${JSON.stringify(state.createdLeads)}`},
            ...(state.summary ? [{ role: 'system', content: `summary: ${state.summary}` }] : []),
            ...(state.messages || [])
        ]
    },{ streamMode: 'messages'});
    for await (const chunk of stream){
        const [token, _ ] = chunk;
        if (token.id?.startsWith('run')) {
            if (ToolMessage.isInstance(token) && token.name === 'create_lead') {
                const leadData = JSON.parse(typeof token.content === 'string'? token.content : '{}');
                if(typeof leadData.email === 'string' && leadData.email) createdLeads.push(leadData.email);
            }
            continue;
        };

        if (token.type === 'ai') {
            fullResponse += token.content;
            io.to(state.socketId).emit('agent_chunk', token.content);
        }
    }
    
    io.to(state.socketId).emit('agent_complete')
    const aiResposne = fullResponse;
    const normalizedAIMessage = { role: 'ai', content: aiResposne }
    return { ...state, messages: [...(state.messages || []), normalizedAIMessage], response: aiResposne, createdLeads: [...(state.createdLeads || []), ...createdLeads] };
}
// [Node] to detect if Agent has asked for email
async function detectEmailAsked(state: StateInputSchema) {
    const lastResponse = state.response || '';
    const prompt = `
    You are a classifier. Read the following assistant message:

    "${lastResponse}"

    Decide if the assistant is explicitly asking the user for their email address.

    Return ONLY JSON that matches this schema:
    {
        "emailAsked": boolean
    }
        `;
    const EmailDetectionSchema = z.object({
        emailAsked: z.boolean()
    })
    const result = await generalModel.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{role: 'system', content: prompt}],
        response_format: zodResponseFormat(EmailDetectionSchema, 'email_ask_detection')
    })
    const output = EmailDetectionSchema.parse(JSON.parse(result.choices[0].message.content || '{ "emailAsked": false}'))

    return { ...state, emailAsked: output.emailAsked }
}
// [Conditional Edge] to detect emailAsked only if state.emailAsked is false.
function needDetection(state: StateInputSchema){
    if (state.emailAsked) {
        return 'summarize'
    } else {
        return 'detectEmailAsked'
    }
}
// [Node] to summarize state.messages only depending on length of conversation
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

                  Conversation:
                  ${textToSummarize}
                  
                  Existing summary (if any):
                  ${state.summary}`;

    const summaryResult = await generalModel.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{role: 'system', content: summaryPrompt}],
        stream: false
      });
    const newSummary = summaryResult.choices[0].message.content;
    return { ...state, summary: newSummary, messages: recentMessages }
}

// [Node] to add messages to DB
async function updateConversation(state: StateInputSchema) {
  if (!state.response) return state; // nothing to add
  
  // If we have a conversation, update it
  if (state.conversationId) {
    try {
      const updateData: UpdateConversationInput = {
        conversationId: new Types.ObjectId(state.conversationId),
        messages: [ ...(state.messages?.slice(-2) || [])]
      };
      await conversationService.updateConversation(updateData);
    } catch (err) {
      console.error('Failed to update conversation:', err);
    }
  }
  return state;
}

// Workflow graph
export const leadFlow = new StateGraph(State)
                .addNode('addUserMessage', addUserMessage)
                .addNode('summarize', summarizationIfNeeded)
                .addNode('agent_node', agentNode)
                .addNode('detectEmailAsked', detectEmailAsked)
                .addNode('updateConversation', updateConversation)
                
                .addEdge('__start__', 'addUserMessage')
                .addEdge('addUserMessage', 'agent_node')
                .addConditionalEdges('agent_node', needDetection)
                .addEdge('detectEmailAsked', 'summarize')
                .addEdge('summarize','updateConversation')
                .addEdge('updateConversation','__end__')
                .compile({checkpointer: new MemorySaver()});
