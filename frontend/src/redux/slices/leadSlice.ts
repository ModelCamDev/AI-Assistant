import { createSlice } from "@reduxjs/toolkit";
import { getAllLeadsThunk, updateLeadThunk } from "../thunks/leadThunk";

interface Lead{
    _id: string;
    email: string;
    status: 'new' | 'replied' | 'converted';
    createdAt: Date;
}

interface LeadState{
    leads: Lead[];
    loading: boolean;
    error: string | null;
}

const initialState: LeadState = {
    leads: [],
    loading: false,
    error: null
}

const leadSlice = createSlice({
    name: 'lead',
    initialState,
    reducers: {},
    extraReducers:(builder)=>{
        builder
        // Get all leads
        .addCase(getAllLeadsThunk.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(getAllLeadsThunk.fulfilled, (state, action)=>{
            state.loading = false;
            state.leads = action.payload;
        })
        .addCase(getAllLeadsThunk.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload as string;
        })
        .addCase(updateLeadThunk.pending, (state)=>{
            state.loading = true;
        })
        .addCase(updateLeadThunk.fulfilled, (state, action)=>{
            state.loading = false;
            if (action.payload) {
                state.leads = state.leads.map(lead=>{
                    if(lead._id===action.payload?.id){
                        lead.status = action.payload.status
                    }
                    return lead
                })
            }
        })
        .addCase(updateLeadThunk.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload as string;
        })
    },
});

export default leadSlice.reducer;