import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { sendMessageThunk } from "../thunks/chatThunk";

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
            state.messages.push({role:'ai', content: action.payload})
        })
        .addCase(sendMessageThunk.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload || "Unable to send message"
        })
    },
});

export const {addLocalMessage, clearChat} = chatSlice.actions;
export default chatSlice.reducer;