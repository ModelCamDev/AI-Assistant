# Implement Full Email-Gated Conversation Flow in LeadFlow Graph

## Objective

Design and implement a `StateGraph` + `createReactAgent` hybrid system that ensures:

* Email is collected before answering user queries.
* All conversational edge cases (user refusals, invalid replies, multiple turns, etc.) are gracefully handled.
* Agent only answers once valid email is present.
* Flow state is deterministic, recoverable, and traceable.

---

## Required Graph Nodes

| Node Name              | Purpose                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `extractEmailNode`     | Detect and extract email automatically from every user message using regex or LLM.     |
| `checkEmailNode`       | Check if `userEmail` exists in state; route to `askEmailNode` or `agentAnswerNode`.    |
| `askEmailNode`         | Politely request user email if missing. Set flag `hasAskedForEmail = true`.            |
| `validateEmailNode`    | Validate response: check for valid email pattern or refusal ("I don't want to share"). |
| `reAskEmailNode`       | Rephrase and ask again if user response is unclear or invalid.                         |
| `emailRefusalNode`     | Handle polite refusals and still answer the question without requiring email.          |
| `pendingQuestionNode`  | Save original user question before email flow begins to avoid loss of context.         |
| `agentAnswerNode`      | Invoke `createReactAgent` to answer the stored user question.                          |
| `saveConversationNode` | Save full chat (userEmail, question, answer, etc.) to DB and update lead status.       |
| `errorNode`            | Catch any tool or LLM error and reply with fallback message.                           |

---

## Required Tools

| Tool                | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| **`RAGService`**    | Retrieve and ground knowledge for factual answers.                       |
| **`LeadService`**   | Manage lead creation, update, and assign conversation to leads.          |
| **`EmailService`**  | Handle email follow-ups or summaries.                                    |
| **`ValidatorTool`** | Validate if message contains valid email / refusal / unrelated.          |
| **`RephraseTool`**  | Rephrase questions or polite follow-up messages for re-asking scenarios. |
| **`DBService`**     | Save and fetch conversation state / history.                             |

---

## Edge Cases to Handle

1. User provides email **before being asked** — auto-extract and skip ask step.
2. Agent tries to **answer before email** — block until email exists in state.
3. Agent **repeats email request** — prevent by using `hasAskedForEmail` flag.
4. User gives **non-email text** when asked — detect and re-ask politely.
5. User **refuses to share email** — acknowledge refusal and still answer question.
6. User **changes topic** mid-flow — store new `pendingQuestion` and restart email-check logic.
7. User gives **ambiguous reply** ("Here it is") — validate via LLM or regex before proceeding.
8. Agent loses **context after multiple turns** — store original question in `previousQuestion` and always answer from it.
9. Agent or tool **fails unexpectedly** — catch error and reply via `errorNode`.

---

## Context-Aware Prompting for `createReactAgent`

```ts
const agent = createReactAgent({
  llm,
  tools: [RAGService, LeadService, EmailService],
  systemPrompt: `
    You are a lead qualification assistant for LeadFlow.
    - If user has not shared an email, DO NOT answer yet. Wait for graph to ask.
    - If email is shared, start your reply with "Thank you for sharing your email."
    - Always answer the original stored question (state.previousQuestion), not the latest message.
    - If user refuses to share their email, still answer politely and mark this in response as "Email not shared."
    - Keep answers concise, professional, and informative.
    - Never ask for the email yourself — that is handled by the graph.
    - Never repeat previous questions.
    - If unsure, clarify briefly before proceeding.
  `
});
```

---

## State Schema Example

```ts
stateSchema: z.object({
  message: z.string(),
  previousQuestion: z.string().optional(),
  userEmail: z.string().optional(),
  hasAskedForEmail: z.boolean().default(false),
  chatHistory: z.array(z.object({ role: z.string(), content: z.string() })).default([]),
  error: z.string().optional(),
})
```

---

## Expected Flow

```
__start__ → extractEmail
  → checkEmail
     → askEmail → validateEmail → (agentAnswer | reAskEmail | emailRefusal)
     → agentAnswer → saveConversation → __end__
     → errorNode (fallback)
```

---

## Implementation Notes

* Implement `ValidatorTool` using regex + small LLM classifier for robust email detection.
* Use `hasAskedForEmail` flag to prevent repeated email prompts.
* Ensure `previousQuestion` is stored before entering email flow.
* Add fallback in `errorNode` for any unexpected exceptions.
* Integrate with `DBService` or `MemorySaver` for persistent state tracking.

---

**Goal:** Achieve a robust, state-driven conversational workflow that smartly handles lead qualification, ensures email collection, and delivers context-aware LLM responses without redundant or incorrect prompts.
