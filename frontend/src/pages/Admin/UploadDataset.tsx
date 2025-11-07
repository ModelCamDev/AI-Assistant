import React, { useState } from "react"
import { FaX } from "react-icons/fa6";
import { toast } from "react-toastify";

const UploadDataset = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    }
    const handleRemoveFile = (index: number)=>{
        setSelectedFiles(prevFiles=>
            prevFiles.filter((_,idx)=>idx!=index)
        )
    }
    const handleUploadDataset = ()=>{
        if(!selectedFiles.length){
            toast.error("Please select at least one file.")
        }else{
            toast.success("Files uploaded successfully")
            setSelectedFiles([])
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
                        type="file" 
                        accept="application/pdf, .txt" 
                        multiple id="file-input"
                        onChange={handleFileChange} 
                        />
                    </label>
                    
                    <button onClick={handleUploadDataset}>Upload Files</button>
                </div>
                <div className="upload-list">
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
