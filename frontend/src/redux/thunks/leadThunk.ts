import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";


export const getAllLeadsThunk = createAsyncThunk('lead/all', async (_, {rejectWithValue})=>{
    try {
        const {data} = await axiosInstance.get('/api/lead/all');
        return data.leads;
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Unable fetch all leads")
        return rejectWithValue(error.response?.data?.message||'Unable to fetch all leads');
    }
});
