import { useEffect, useState } from "react";
import type { Document } from "../../redux/slices/documentSlice";
import { useAppSelector } from "../../redux/app/hooks";

interface DocumentProps{
    document: Document;
    handleDeleteDocument: (fileName: string)=>void
}

const DocumentListItem = ({document, handleDeleteDocument}: DocumentProps) => {
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const { loading } = useAppSelector((state)=>state.document);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(()=>{
        if (isLoading && !loading) {
            setIsLoading(false)
        }
    },[ isLoading, loading ])
    const handleConfirmDelete = ()=>{
        handleDeleteDocument(document.filename);
        setIsConfirmed(false);
        setIsLoading(true)
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
            <button className="delete-document" disabled={isLoading} onClick={handleDelete}>{isLoading?'Deleting':'Delete'}</button>
            }
        </div>
    )
}

export default DocumentListItem
