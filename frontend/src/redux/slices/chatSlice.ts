import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
export interface ChatMessage{
    role: string;
    content: string;
}

interface ChateState{
    messages: ChatMessage[];
    conversationId: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: ChateState = {
    messages: [],
    loading: false,
    conversationId: null,
    error: null
}

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers:{
        addLocalMessage: (state, action: PayloadAction<ChatMessage>)=>{
            state.messages.push(action.payload);
        },
        clearChat: (state)=>{
            state.messages = []
        },
        startAIStreaming: (state)=>{
          state.messages.push({role: 'ai', content: ''});
        },
        updateAIStreaming: (state, action)=>{
          const lastmessage = state.messages[state.messages.length - 1];
          if (lastmessage && lastmessage.role === 'ai') {
            lastmessage.content += action.payload;
          }
        },
        setConversationId: (state, action)=>{
          state.conversationId = action.payload;
        }
    }
});

export const {addLocalMessage, clearChat, startAIStreaming, updateAIStreaming, setConversationId} = chatSlice.actions;
export default chatSlice.reducer;