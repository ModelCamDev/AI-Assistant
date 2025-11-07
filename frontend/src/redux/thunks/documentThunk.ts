import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { type Document } from "../slices/documentSlice";
import { toast } from "react-toastify";

export const fetchDocumentsThunk = createAsyncThunk<Document[], void, {rejectValue: string}>('document/getAll', async(_, {rejectWithValue})=>{
    try {
        const {data} = await axiosInstance.get('/api/upload/all');
        return data.documents;
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Unknown error while fetching documents");
        rejectWithValue(error.response?.data?.message || "Unknown error while fetching all documents")
    }
})

export const uploadDocumentsThunk = createAsyncThunk<void, File[], {rejectValue: string}>('document/upload', async(files, {rejectWithValue})=>{
    try {
        const formData = new FormData();
        files.forEach(file=>formData.append("files", file))
        const {data} = await axiosInstance.post('/api/upload',formData,{
            headers:{
                "Content-Type": "multipart/form-data"
            }
        });
        console.log("Files uploaded:", data.files);
        toast.success("Files uploaded succefully");
        return 
    } catch (error: any) {
        console.log("Error while uploading");
        toast.error(error.response?.data?.message || "Unknown error while uploading documents");
        rejectWithValue(error.response?.data?.message || "Unknown error while uploading documents")
    }
})

export const deleteDocumentsThunk = createAsyncThunk<string, string, {rejectValue: string}>('document/delete', async(fileName, {rejectWithValue})=>{
    try {
        const {data} = await axiosInstance.delete(`/api/upload/${fileName}`)
        console.log('File deleted', data);
        toast.success("File deleted successfully");
        return data.fileName;
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Unknown error while deleting documents");
        rejectWithValue(error.response?.data?.message || "Unknown error while deleting documents")
    }
})