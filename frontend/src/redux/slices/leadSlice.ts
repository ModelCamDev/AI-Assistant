import { createSlice } from "@reduxjs/toolkit";
import { getAllLeadsThunk } from "../thunks/leadThunk";

interface Lead{
    _id: string;
    email: string;
    status: 'new' | 'replied' | 'converted';
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
    },
});

export default leadSlice.reducer;