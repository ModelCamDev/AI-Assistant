import { useState } from "react";
import type { Document } from "../../redux/slices/documentSlice";

interface DocumentProps{
    document: Document;
    handleDeleteDocument: (fileName: string)=>void
}

const DocumentListItem = ({document, handleDeleteDocument}: DocumentProps) => {
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const handleConfirmDelete = ()=>{
        handleDeleteDocument(document.filename);
        setIsConfirmed(false)
    }
    const handleCancelDelete = ()=>{
        setIsConfirmed(false)
    }
    const handleDelete = ()=>{
        setIsConfirmed(true)
    }
    return (
        <div className="document-list-item">
            <span>{document.originalName}</span>
            <span className="file-type">{document.mimeType?.split('/')[1] || "Unknown"}</span>
            {
            isConfirmed?
            <span className="document-action-container">
                <span className="delete-document" onClick={handleConfirmDelete}>Confirm</span>
                <span className="cancel-delete-document" onClick={handleCancelDelete}>Cancel</span>
            </span>:
            <span className="delete-document" onClick={handleDelete}>Delete</span>
            }
        </div>
    )
}

export default DocumentListItem
