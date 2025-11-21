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
        },
        startLiveTranscript: (state)=>{
          const lastmessage = state.messages[state.messages.length - 1];
          if (lastmessage && lastmessage.role === 'user') {
            
          }else{
            state.messages.push({role: 'user', content: ''})
          }
        },
        updateLiveTranscript: (state, action)=>{
          const lastmessage = state.messages[state.messages.length - 1];
          if (lastmessage && lastmessage.role === 'user') {
            lastmessage.content += action.payload;
          }
        },
        endLiveTranscript: (state, action)=>{
          const lastmessage = state.messages[state.messages.length - 1];
          if (lastmessage && lastmessage.role === 'user') {
            lastmessage.content = action.payload;
          }
        },
        addWelcomeMessage: (state, action)=>{
          state.messages = [{role: 'ai', content: action.payload}]
        }
    }
});

export const { addLocalMessage, 
  clearChat, 
  startAIStreaming, 
  updateAIStreaming, 
  setConversationId, 
  startLiveTranscript, 
  updateLiveTranscript, 
  endLiveTranscript,
  addWelcomeMessage
 } = chatSlice.actions;
export default chatSlice.reducer;