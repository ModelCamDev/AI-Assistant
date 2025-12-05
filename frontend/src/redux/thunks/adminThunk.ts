import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";

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
        const {data} = await axiosInstance.post('/api/user/login', credentials);
        const {_id:id, email, role} = data.user;
        sessionStorage.setItem('token', data.token);
        toast.success("You've successfully logged in")
        return {admin: {id , email, role}, token: data.token} as AdminLoginResponse;
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Unable to login, something went wrong")
      return rejectWithValue("Login failed");
    }
})

export const adminRegisterThunk = createAsyncThunk<AdminRegisterResponse, RegisterCredentials, {rejectValue: string}>('admin/register',async (credentials, {rejectWithValue})=>{
    try {
        const {data} = await axiosInstance.post('/api/user/register', credentials);
        toast.success("You've successfully registered, kindly login to continue")
        const {_id:id, email, role} = data.user;
        return {id , email, role} as AdminRegisterResponse;
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Unable to login, something went wrong")
      return rejectWithValue("Registration failed");
    }
})