import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";


export const getAllLeadsThunk = createAsyncThunk('lead/all', async (_, {rejectWithValue})=>{
    try {
        const {data} = await axiosInstance.get('/api/lead/all');
        return data.leads;
    } catch (error: any) {
        return rejectWithValue(error.response.data.message||'Unable to fetch all leads')
    }
});
