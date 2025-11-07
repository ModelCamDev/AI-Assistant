import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { deleteDocumentsThunk, fetchDocumentsThunk, uploadDocumentsThunk } from "../thunks/documentThunk";

export interface Document {
  _id: string;
  filename: string;
  originalName: string;
  filePath: string;
  size?: number;
  mimeType?: string;
  createdAt: string;
}

interface DocumentState {
  documents: Document[];
  loading: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  documents: [],
  loading: false,
  error: null,
};

const documentSlice = createSlice({
    name: 'document',
    initialState,
    reducers:{},
    extraReducers(builder) {
        // Document fetching
        builder.addCase(fetchDocumentsThunk.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchDocumentsThunk.fulfilled, (state, action: PayloadAction<Document[]>)=>{
            state.loading = false;
            state.documents = action.payload
        })
        .addCase(fetchDocumentsThunk.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload || "Error fetching documents";
        })
        // Document Uploading
        .addCase(uploadDocumentsThunk.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(uploadDocumentsThunk.fulfilled, (state)=>{
            state.loading = false;
        })
        .addCase(uploadDocumentsThunk.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload || "Error while uploading documents";
        })
        // Deleting Documents
        .addCase(deleteDocumentsThunk.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteDocumentsThunk.fulfilled, (state, action)=>{
            state.loading = false;
            state.documents = state.documents.filter((doc)=>doc.filename!=action.payload)
        })
        .addCase(deleteDocumentsThunk.rejected,(state, action)=>{
            state.loading = false;
            state.error = action.payload || "Error while deleting documents";
        })
    },
})

export default documentSlice.reducer;