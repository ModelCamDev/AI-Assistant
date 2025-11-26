# AgentFlow – Conversational Lead Generation System

A production-ready conversational AI system designed for fast, token-optimized, and high-quality lead‑generation interactions. This project uses a centralized LLM, LangChain, LangGraph, and RAG to provide dynamic conversations, email extraction, lead creation, and context‑aware responses.

## Core Features

### 1. Centralized LLM for All Intelligence

* Single LangChain/OpenAI model handles conversation routing, email detection, RAG generation, and summarization.
* Reduces token usage and speeds up workflow execution.

### 2. Smart Email Collection Workflow

* Agent greets the user and asks for email only once.
* Email confirmation flow supports approve, edit, and reject.
* If declined, the agent continues without asking again.

### 3. RAG (Retrieval-Augmented Generation)

* Pinecone vector store with LangChain retriever.
* Provides accurate and contextual responses using stored knowledge base.

### 4. Summarization and Token Reduction

* Old messages are summarized periodically.
* Only a small window of recent messages is kept.
* Helps reduce input tokens by a significant factor.

### 5. Lead Creation Logic

* Triggered when email is provided or when user explicitly commands.
* Backend service handles lead upsert.

### 6. Real-Time Streaming

* Supports Socket.io for real-time streaming.
* Each LLM chunk is streamed immediately to frontend.

### 7. Optional LangGraph Workflow

* Used when orchestration of nodes is required.
* Not strictly required in updated design.

## System Architecture (Text Description)

### Backend Flow

1. User sends a message.
2. Token reducer generates: summarized history + recent messages.
3. A single LLM Controller returns structured JSON:

   * askEmail
   * createLead
   * rag
4. Based on the decision:

   * If askEmail: respond with prompt requesting email.
   * If createLead: validate, confirm, and store email.
   * If rag: run Pinecone retrieval and generate answer.
5. The final answer is streamed to the client.
6. Email is never requested twice.

## Tech Stack

### Backend

* Node.js (Express)
* LangChain
* LangGraph
* Pinecone
* MongoDB
* Socket.io

### LLM Providers

* OpenAI (recommended)
* Gemini optional

### Frontend

* React
* Redux Toolkit
* Socket.io client

## Installation and Setup

### 1. Install dependencies

```
npm install
```

### 2. Environment Variables

Create a .env file with the following values:

```
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_INDEX=
PINECONE_NAMESPACE=
MONGODB_URI=
JWT_SECRET=
```

Optional:

```
GEMINI_API_KEY=
```

### 3. Run development server

```
npm run dev
```

## Streaming Responses

### Socket.io

* Server streams chunks using `socket.emit('ai_chunk', data)`.
* Frontend appends chunks in real time.

## LLM Workflow Logic

### Example JSON returned by LLM

```
{
  "decision": "askEmail" | "createLead" | "rag",
  "email": "optional"
}
```

### Decision Rules

* If email is present in message: createLead
* If user refuses email: rag
* If no email collected yet: askEmail
* If user says "create a lead": createLead

## RAG (Retrieval‑Augmented Generation)

### Process

1. Convert query to embeddings.
2. Perform similarity search in Pinecone.
3. Build LLM prompt with retrieved context and chat history.
4. Produce final answer.

### RAG Optimizations

* Limit context to top 5 documents.
* Use compact embedding model.
* Use summarized history when chat grows long.

## Summarization Strategy

* Summaries replace older chat messages once history threshold is exceeded.
* Keeps last few messages intact for continuity.
* Reduces token cost in every LLM invocation.
