import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const sendMessageThunk = createAsyncThunk<string, string, {rejectValue: string}>('chat/sendMessage', async(text, {rejectWithValue})=>{
    try {
        const {data} = await axiosInstance.post('/api/chat', {query: text});
        return data.result
    } catch (error:any) {
        rejectWithValue(error.response?.data.message || "Unknow error while sending message")
    }
})