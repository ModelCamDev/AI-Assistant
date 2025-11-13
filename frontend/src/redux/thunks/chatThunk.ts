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

export interface VoiceResponse {
  contentType: string; // e.g. 'audio/webm'
  audio: string; // base64 string
  query: string; // recognized user text
  response: string; // ai text reply
}

export const sendVoiceThunk = createAsyncThunk<VoiceResponse,FormData,{ rejectValue: string }>("chat/sendVoice", async (formData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post("/api/chat/voice", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data as VoiceResponse;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Unknown error while sending voice"
    );
  }
});

export const generateVoiceThunk = createAsyncThunk<{audio:string, contentType: string, text: string}, string, {rejectValue: string}>('chat/getVoice', async(text, {rejectWithValue})=>{
  try {
    const {data} = await axiosInstance.post('/api/chat/tts', {text: text});
    return {audio: data.audio, contentType: data.contentType, text: text}
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Unknown error while getting voice"
    );
  }
})