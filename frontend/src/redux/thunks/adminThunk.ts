import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

interface AdminLoginResponse {
    admin: {
        id: string
        email: string;
        role: "user" | "admin";
    };
    token: string;
}
interface AdminRegisterResponse{
    id: string
    email: string;
    role: "user" | "admin";
}
interface LoginCredentials{
    email: string;
    password: string;
}
interface RegisterCredentials{
    name?: string
    email: string;
    password: string;
    role:string;
}
export const adminLoginThunk = createAsyncThunk<AdminLoginResponse, LoginCredentials, {rejectValue: string}>('admin/login',async (credentials, {rejectWithValue})=>{
    try {
        console.log('Credentials recieved inside thunk:', credentials);
        const {data} = await axiosInstance.post('/api/user/login', credentials);
        console.log("Data received:", data);
        const {_id:id, email, role} = data.user;
        return {admin: {id , email, role}, token: data.token} as AdminLoginResponse;
    } catch (error) {
      return rejectWithValue("Login failed");
    }
})

export const adminRegisterThunk = createAsyncThunk<AdminRegisterResponse, RegisterCredentials, {rejectValue: string}>('admin/register',async (credentials, {rejectWithValue})=>{
    try {
        console.log('Credentials recieved inside thunk:', credentials);
        const {data} = await axiosInstance.post('/api/user/register', credentials);
        console.log("Data received:", data);
        
        const {_id:id, email, role} = data.user;
        return {id , email, role} as AdminRegisterResponse;
    } catch (error) {
      return rejectWithValue("Registration failed");
    }
})