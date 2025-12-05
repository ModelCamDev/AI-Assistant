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
export const updateLeadThunk = createAsyncThunk<{id: string, status: "new" | "replied" | "converted"} | undefined, {id: string, status: string}, {rejectValue: string}>('lead/update', async (updateData, {rejectWithValue})=>{
    try {
        const {data} = await axiosInstance.patch(`/api/lead/${updateData.id}`,{status: updateData.status});
        if(!data.success) rejectWithValue('Unable to update lead');
        toast.success(data.message || "Lead Updated")
        return {id: data.lead?._id, status: data.lead?.status}
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Unknown error while uploading documents")
        rejectWithValue(error.response?.data?.message || "Unknown error while uploading documents")
    }
})