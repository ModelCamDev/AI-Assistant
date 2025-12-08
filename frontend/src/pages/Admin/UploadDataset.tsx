import React, { useRef, useState } from "react"
import { FaX } from "react-icons/fa6";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../redux/app/hooks";
import { uploadDocumentsThunk } from "../../redux/thunks/documentThunk";

const UploadDataset = () => {
    const {loading} = useAppSelector(state => state.document)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const inputUploadRef = useRef<HTMLInputElement>(null);
    const dispatch = useAppDispatch();
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        console.log("Inside onchange");
        
        if (e.target.files) {
            console.log("Found file");
            
            setSelectedFiles(Array.from(e.target.files));
        }
    }
    const handleRemoveFile = (index: number)=>{
        setSelectedFiles(prevFiles=>
            prevFiles.filter((_,idx)=>idx!=index)
        )
    }
    const handleUploadDataset = async()=>{
        if(!selectedFiles.length){
            toast.error("Please select at least one file.")
        }else{
            await dispatch(uploadDocumentsThunk(selectedFiles));
            setSelectedFiles([])
            if (inputUploadRef.current) {
                inputUploadRef.current.value='';
            }
        }
    }
    return (
        <div className="dashboard-page">
                <h1>Upload Dataset</h1>
            <div className="upload-section">
                <div className="upload-input-container">
                    <label className="file-input-label" htmlFor="file-input">
                        Select Files
                        <input 
                        ref={inputUploadRef}
                        type="file" 
                        accept="application/pdf, .txt" 
                        multiple id="file-input"
                        onChange={handleFileChange} 
                        />
                    </label>
                    
                    <button disabled={loading} onClick={handleUploadDataset}>{loading?"Uploading...":"Upload Files"}</button>
                </div>
                <div className="upload-list">
                    {(!selectedFiles || selectedFiles.length === 0) && <div className="no-data" style={{margin:'auto 0'}}>No documents selected</div>}
                    {selectedFiles && selectedFiles.map((file, idx)=> (
                        <div key={idx} className="file-list-item">
                            {file.name}
                            <button onClick={()=>{handleRemoveFile(idx)}}><FaX /></button>
                        </div>
                ))}
                </div>
            </div>
        </div>
    )
}

export default UploadDataset
