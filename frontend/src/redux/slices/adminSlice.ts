import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AdminState{
    isLoggedIn: boolean;
    email: string | null;
}

const initialState: AdminState = {
    isLoggedIn: false,
    email: null
}

const adminSlice = createSlice({
    name:'admin',
    initialState,
    reducers: {
        loginAdmin: (state, action:PayloadAction<{email: string}>)=>{
            state.isLoggedIn = true;
            state.email = action.payload.email;
        },
        logoutAdmin: (state)=>{
            state.isLoggedIn = false;
            state.email = null;
        }
    }
})

export const {loginAdmin, logoutAdmin} = adminSlice.actions;
export default adminSlice.reducer;