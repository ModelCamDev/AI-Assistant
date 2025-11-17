import z from 'zod';
import { tool } from '@langchain/core/tools';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { pinecone, PINECONE_INDEX, PINECONE_NAMESPACE } from '../../config/pinecone.config';
import { PineconeStore } from '@langchain/pinecone';
import leadService from '../../services/lead.service';

// RAG Tool
export const ragTool = tool(
    async({query})=>{
        console.log("RAG tool called");
        try {
            // Create embedder
            const embedder = new GoogleGenerativeAIEmbeddings({
                apiKey: process.env.GEMINI_API_KEY || '',
                modelName: 'text-embedding-004'
            });
            // Connect to pinecone index
            const index = pinecone.Index(PINECONE_INDEX);
            console.time('createVectorStore')
            // Creating vector store
            const vectorStore = await PineconeStore.fromExistingIndex(embedder, {
                pineconeIndex: index,
                namespace: PINECONE_NAMESPACE,
            })
            console.timeEnd('createVectorStore')
            // Get top 5 relevant documents
            console.time('GetReleventDOcs')
            const docs = await vectorStore.similaritySearch(query, 5);
            console.timeEnd('GetReleventDOcs')
            // Build a context string
            const context = docs.map(doc=>doc.pageContent).join('\n\n');
            const sources = docs.map(doc=>({id: doc.id, metadata: doc.metadata}));
    
            return {context, sources};
        } catch (error) {
            console.log("Error in RAG tool:", error);
            return {context: '', sources: []}
        }
    },
    {
        name: 'rag_tool',
        description: "Fetch relevant context documents about business from Pinecone for a given query (no LLM generation here).",
        schema: z.object({
            query: z.string().describe('User query to search relevant knowledge.')
        })
    }
)

// Create Lead Tool
export const createLeadTool = tool(
  async ({ email }) => {
    console.log("Create lead tool called for email", email);
    try {
        const lead = await leadService.upsertLead({email: email});
        console.log("Lead Created successfully.");
        return {
          success: true,
          leadId: lead._id,
          email: lead.email,
          message: "Lead created successfully",
        };
    } catch (error) {
        console.log("Error in createLead Tool:", error);
        return {
          success: false,
          leadId: null,
          email: email,
          message: `Unable to create lead with email ${email}`,
        };
    }
  },
  {
    name: "create_lead",
    description: "Create a lead with the given email",
    schema: z.object({
      email: z.string().describe('email to create lead'),
    }),
  }
);