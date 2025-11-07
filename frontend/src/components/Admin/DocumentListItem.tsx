import { useState } from "react";

interface DocumentProps{
    fileName: string;
    fileType: string;
    index: number;
    handleDeleteDocument: (idx: number)=>void
}

const DocumentListItem = ({fileName, fileType, index, handleDeleteDocument}: DocumentProps) => {
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const handleConfirmDelete = ()=>{
        handleDeleteDocument(index);
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
            <span>{fileName}</span>
            <span>{fileType}</span>
            {isConfirmed?<span><span onClick={handleCancelDelete}>cancel</span><span onClick={handleConfirmDelete}>delete</span></span>:<span onClick={handleDelete}>delete</span>}
        </div>
    )
}

export default DocumentListItem
