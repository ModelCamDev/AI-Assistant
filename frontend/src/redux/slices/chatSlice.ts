import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { generateVoiceThunk, sendMessageThunk, sendVoiceThunk } from "../thunks/chatThunk";

export interface ChatMessage{
    role: string;
    content: string;
}

interface ChateState{
    messages: ChatMessage[];
    loading: boolean;
    error: string | null;
}

const initialState: ChateState = {
    messages: [],
    loading: false,
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
        }
    },
    extraReducers(builder) {
        builder
        .addCase(sendMessageThunk.pending,(state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(sendMessageThunk.fulfilled, (state, action)=>{
            state.loading = false;
            // state.messages.push({role:'ai', content: action.payload})
        })
        .addCase(sendMessageThunk.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload || "Unable to send message"
        })
        // Voice thunk
      .addCase(sendVoiceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendVoiceThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({role: 'user', content: action.payload.query})
        state.messages.push({ role: "ai", content: action.payload.response });
      })
      .addCase(sendVoiceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to send voice message";
      })
    //   Get Voice thunk
      .addCase(generateVoiceThunk.pending, (state)=>{
        state.loading = true;
        state.error = null;
      })
      .addCase(generateVoiceThunk.fulfilled, (state, action)=>{
        state.loading = false;
        state.messages.push({role: 'ai', content: action.payload.text})
      })
      .addCase(generateVoiceThunk.rejected, (state, action)=>{
        state.loading = false;
        state.error = action.payload || "Unable to get welcome voice message";
      })
    },
});

export const {addLocalMessage, clearChat, startAIStreaming, updateAIStreaming} = chatSlice.actions;
export default chatSlice.reducer;