import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import z from 'zod';
import { tool } from '@langchain/core/tools';
import { MemorySaver, StateGraph, interrupt } from "@langchain/langgraph";


// RAG TOOL
const ragTool = tool(
    async({query})=>{
        console.log("RAG tool called");
        
        return `RAG response retrieved for query: ${query}`
    },
    {
        name: 'rag_tool',
        description: "Fetch contextual information",
        schema: z.object({
            query: z.string()
        })
    }
)
const isValidEmail = (email:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// CREATE LEAD TOOL
export const createLeadTool = tool(
  async ({ email }) => {
    // Placeholder lead creation response
    console.log("Create lead tool called for email", email);
    let currentEmail = email?.trim();
    if (!currentEmail) {
      const resp = interrupt({
        action: 'ask_email',
        message: 'Please provide your email to continue'
      });
      if(!resp) return;
      currentEmail = resp.email?.trim();
    }
    if (!isValidEmail(currentEmail)) {
      const resp = interrupt({
        action: 'invalid_email',
        message: `"${currentEmail}" is not a valid email. PLease provide a valid email.`
      })
      if(!resp) return;
      currentEmail = resp.email?.trim();
    }

    const confirmation = interrupt({
      action: 'confirm_email',
      message: `Confirm email: "${currentEmail}". (approve / edit / cancel)`
    });

    if(!confirmation) return;

    if (confirmation.action === "cancel") {
      return "Lead creation cancelled.";
    }

    if (confirmation.action === "edit") {
      const edited = confirmation.email?.trim();
      if (!isValidEmail(edited)) {
        return interrupt({
          action: "invalid_email",
          email: edited,
          message: `"${edited}" is invalid. Please enter a valid email.`,
        });
      }
      currentEmail = edited;
    }
    return {
      success: true,
      leadId: `lead_${Date.now()}`,
      email,
      message: "Lead created successfully (placeholder)",
    };
  },
  {
    name: "create_lead",
    description: "Create a lead with the given email",
    schema: z.object({
      email: z.string().describe('email to create lead'),
    }),
  }
);

// LLM Model
const model = new ChatOpenAI({
    model: 'gpt-4.1-mini',
    temperature: 0.2
})
// AGENT
export const agent = createAgent({
    model: model,
    systemPrompt: `You are a concise sales assistant. 
    Use tools: rag_tool only for context answers and create_lead for lead creation. 
    Check summary and recent messages. 
    If the user has not been asked for their email yet, ask once before answering. 
    After getting response for it, answer any pending user question even if they refuse. 
    If the user provides an email normalize the email in correct format, then call create_lead. 
    Never ask for email again once asked. 
    Keep replies under 60-70 words.`,
    tools: [ragTool, createLeadTool]
})

// State schema
const State = z.object({
  userMessage: z.string(),
  messages: z.array(z.object({role: z.enum(['user', 'ai']), content: z.string()})).default([]),
  summary: z.string().optional(),
});

// Graph
export const graph = new StateGraph(State)
                .addNode('addUserMessage', (state: z.infer<typeof State>)=>{
                  return {...state, messages: [...(state.messages || []), {role: 'user', content: state.userMessage}]}
                })

                .addNode('agent_node',async(state: z.infer<typeof State>)=>{

                    const result = await agent.invoke({
                      messages: [
                        ...(state.summary?[{role: 'system', content: `summary: ${state.summary}`}]:[]), 
                        ...state.messages
                      ]});

                    const normalizedAIMessage = {role: 'ai', content: result.messages.at(-1)?.content}
                    return { ...state, messages: [...state.messages, normalizedAIMessage]}
                })

                .addNode('summarize', async(state)=>{
                  const MAX_MESSAGES = 6;
                  const KEEP_RECENT = 4;
                  if (state.messages.length<=MAX_MESSAGES) {
                    return state;
                  }
                  const olderMessages = state.messages.slice(0, -KEEP_RECENT);
                  const recentMessages = state.messages.slice(-KEEP_RECENT);

                  const textToSummarize = olderMessages.map(msg=>`${msg.role}: ${msg.content}`).join('\n');
                  const summaryPrompt = `
                  Summarize the following conversation in 4-5 sentences.
                  Keep only key facts, user preferences, decisions, and important context.
                  Also remember that if 'assistant(ai)' has asked for email to 'user' or not.

                  Conversation:
                  ${textToSummarize}
                  
                  Existing summary (if any):
                  ${state.summary}`;

                  const summaryResult = await model.invoke([{role: 'human', content: summaryPrompt}]);
                  const newSummary = summaryResult.content;
                  return {...state, summary: newSummary, messages: recentMessages}
                })

                .addEdge('__start__', 'addUserMessage')
                .addEdge('addUserMessage', 'summarize')
                .addEdge('summarize','agent_node')
                .addEdge('agent_node','__end__')
                .compile({checkpointer: new MemorySaver()});

