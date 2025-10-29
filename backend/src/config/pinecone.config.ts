import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.PINECONE_API_KEY) {
  throw new Error("Missing PINECONE_API_KEY in environment variables");
}

// Initialize Pinecone client (LangChain will use this)
export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Optionally export a default index reference (if you use same index everywhere)
export const PINECONE_INDEX = process.env.PINECONE_INDEX || "demo";
export const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE || "demo-namespace";