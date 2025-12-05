import { createSlice } from "@reduxjs/toolkit";
import { adminLoginThunk } from "../thunks/adminThunk";
import { toast } from "react-toastify";

interface AdminState {
    isLoggedIn: boolean;
    admin: {
        email: string;
        id: string;
        role: 'user' | 'admin';
    } | null;
    loading: boolean;
    error: string | null;
}

const initialState: AdminState = {
    isLoggedIn: !!sessionStorage.getItem('token'),
    admin: null,
    loading: false,
    error: null,
}

const adminSlice = createSlice({
    name:'admin',
    initialState,
    reducers: {
        logoutAdmin: (state) => {
            state.isLoggedIn = false;
            state.admin = null;
            sessionStorage.removeItem('token')
            toast.success("You've been logged out!")
        }
    },
    extraReducers(builder) {
        builder.addCase(adminLoginThunk.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(adminLoginThunk.fulfilled,(state, action)=>{
            state.loading = false;
            state.isLoggedIn = true;
            state.admin = action.payload.admin
        })
        .addCase(adminLoginThunk.rejected,(state, action)=>{
            state.loading = false;
            state.error = action.payload || 'Login FAILED'
        })
    }
})

export const {logoutAdmin} = adminSlice.actions;
export default adminSlice.reducer;