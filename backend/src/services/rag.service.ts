import path from 'path'
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { RecursiveCharacterTextSplitter } from "@langchain/classic/text_splitter";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { pinecone, PINECONE_INDEX, PINECONE_NAMESPACE } from '../config/pinecone.config';
import { PineconeStore } from '@langchain/pinecone';
import { Document } from '@langchain/core/documents';
import { hashString } from '../utils/hash';
import { RunnableSequence } from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers'

export class RAGService {
    // Identify file type and return extracted content
    private async loadDocument(filePath: string) {
        const extension = path.extname(filePath).toLowerCase();

        switch (extension) {
            case '.txt':
                const loader = new TextLoader(filePath);
                return await loader.load();
            case '.pdf':
                const pdfLoader = new PDFLoader(filePath);
                return await pdfLoader.load();
            case '.docx':
                const docxLoader = new DocxLoader(filePath);
                return await docxLoader.load();
            default:
                throw new Error(`Unsupported file type: ${extension}`);
        }
    }

    // Upload/Index document into Pinecone
    async indexDocument(filePath: string) {
        try {
            // Load document
            console.log("Loading Document...");
            const docs = await this.loadDocument(filePath);
            if (!docs || docs.length <= 0) { throw new Error("No text content extracted from file."); }

            // Splitting document into chunks
            console.log('Splitting document into chunks');
            const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
            const docChunks = await splitter.splitDocuments(docs);

            // Generating embeddings
            console.log("Generating embeddings...");
            const embedder = new GoogleGenerativeAIEmbeddings({
                apiKey: process.env.GEMINI_API_KEY || '',
                modelName: 'text-embedding-004'
            });

            // Connecting to pinecone 
            console.log("Connecting to Pinecone...");
            const index = pinecone.Index(PINECONE_INDEX);

            // Creating vector store
            const vectorStore = await PineconeStore.fromExistingIndex(embedder, {
                pineconeIndex: index,
                namespace: PINECONE_NAMESPACE
            })


            // TODO: ADD uniqueness
            const uniqueDocs: Document[] = [];
            const seenChunks = new Set<string>();

            const source = path.basename(filePath);
            const hashedSource = hashString(source);
            console.log("Hashing while uploading File:", source);
            console.log("Hashed value while uploading:", hashedSource);

            for (const doc of docChunks) {
                // Combine source + content to uniquely identify chunks
                const chunkId = hashString(source + doc.pageContent);

                if (!seenChunks.has(chunkId)) {
                    seenChunks.add(chunkId);
                    uniqueDocs.push({
                        ...doc,
                        metadata: {
                            ...doc.metadata,
                            source,
                            hash: hashedSource, // same across all chunks of a file
                            chunkId, // unique to each chunk
                        },
                    });
                }
            }
            // Adding doc chunks to vector store
            console.log("Adding document chunks to Pinecone vector store...");
            await vectorStore.addDocuments(uniqueDocs);
            console.log("Document indexed successfully!");

            return {
                success: true,
                message: "Document indexed successfully",
                fileName: path.basename(filePath),
                chunks: uniqueDocs.length,
            };

        } catch (error: any) {
            console.error("Error loading document:", error);
            throw new Error(error.message || "RAG indexing failed");
        }
    }

    // Delete vectors by source file
    async deleteBySource(fileName: string) {
        if (!fileName) throw new Error("File name is required for deletion.");

        console.log("File to delete:", fileName);

        const hashValue = hashString(fileName);

        const index = pinecone.Index(PINECONE_INDEX);

        const namespace = index.namespace(PINECONE_NAMESPACE)
        console.log(`Deleting all vectors with hash: ${hashValue}`);
        try {
            await namespace.deleteMany({ hash: hashValue });
            return true;
        } catch (error) {
            console.error(`Error deleting vectors for source: ${fileName}`, error);
            throw new Error(`Failed to delete indexed document with file name: ${fileName}`);
        }
    }

    // Chat with agent using RAG - To be implemented
    async getRAGResponse(query: string, chatHistory: Array<{ role: string, content: string}> = []) {

        // Format chat history
        const formattedChatHistory = chatHistory.map(msg=>`${msg.role==='user'?'User':'ai'} : ${msg.content}`).join('\n');
        // Generating embeddings
        const embedder = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY || '',
            modelName: 'text-embedding-004'
        });

        // Connecting to pinecone 
        const index = pinecone.Index(PINECONE_INDEX);

        // Creating vector store
        const vectorStore = await PineconeStore.fromExistingIndex(embedder, {
            pineconeIndex: index,
            namespace: PINECONE_NAMESPACE,
        })
        const docs = await vectorStore.similaritySearch(query, 5);
        const context = docs.map(doc => doc.pageContent).join('\n\n');

        const llm = new ChatGoogleGenerativeAI({
            model: 'gemini-2.5-flash',
            apiKey: process.env.GEMINI_API_KEY,
        });
        const prompt = PromptTemplate.fromTemplate(`
    You are a helpful AI customer assistant developed by Modelcam Technologies Pvt. Ltd.
    Use the chat history and the provided context to assist the customer accurately and concisely.

    Chat History:
    {chatHistory}


    Context:
    {context}


    Question:
    {question}

    Answer:
    `);
        const ragChain = RunnableSequence.from([
            { context: async () => context, question: async () => query, chatHistory: async()=> formattedChatHistory },
            prompt,
            llm,
            new StringOutputParser()
        ]);

        const result = await ragChain.invoke({context, question: query, chatHistory: formattedChatHistory})

        return result;
    }
}