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
            <span>{document.mimeType}</span>
            {isConfirmed?<span><span onClick={handleConfirmDelete}>confirm</span><span onClick={handleCancelDelete}>cancel</span></span>:<span onClick={handleDelete}>delete</span>}
        </div>
    )
}

export default DocumentListItem
