import { NavLink } from "react-router-dom"
import DocumentListItem from "../../components/Admin/DocumentListItem"
import { useState } from "react"
const docList = [
        {fileName:"FileName", fileType:"application/pdf"},
        {fileName:"FileName", fileType:"application/pdf"},
        {fileName:"FileName", fileType:"application/pdf"},
        {fileName:"FileName", fileType:"application/pdf"},
        {fileName:"FileName", fileType:"application/pdf"},
        {fileName:"FileName", fileType:"application/pdf"},
        {fileName:"FileName", fileType:"application/pdf"},
        {fileName:"FileName", fileType:"application/pdf"},
        {fileName:"FileName", fileType:"application/pdf"}
    ]
const Dataset = () => {
    const [docs, setDocs] = useState<{fileName:string, fileType: string}[]>(docList);
    const handleDeleteDocument = (index: number)=>{
        setDocs(prevDocs=>
            prevDocs.filter((_,idx)=>idx!=index)
        )
    }
    return (
        <div className="dashboard-page">
            <div className="dataset-head">
                <h1>Dataset</h1>
                <NavLink to={'upload'} className="upload-nav">Upload Data</NavLink>
            </div>
            <div className="document-list">
                {docs.map((doc, idx)=><DocumentListItem key={idx} fileName={doc.fileName} fileType={doc.fileType} index={idx} handleDeleteDocument={handleDeleteDocument}/>)}
            </div>
        </div>
    )
}

export default Dataset
