import { NavLink } from "react-router-dom"
import DocumentListItem from "../../components/Admin/DocumentListItem"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../redux/app/hooks"
import { deleteDocumentsThunk, fetchDocumentsThunk } from "../../redux/thunks/documentThunk"

const Dataset = () => {
    const dispatch = useAppDispatch();
    const {documents} = useAppSelector((state)=>state.document);

    useEffect(()=>{
        dispatch(fetchDocumentsThunk());
    },[])
    const handleDeleteDocument = async(fileName: string)=>{
        await dispatch(deleteDocumentsThunk(fileName))
    }
    return (
        <div className="dashboard-page">
            <div className="dataset-head">
                <h1>Dataset</h1>
                <NavLink to={'upload'} className="upload-nav">Upload Data</NavLink>
            </div>
            <div className="document-list">
                {documents.map((doc, idx)=><DocumentListItem key={idx} document={doc} handleDeleteDocument={handleDeleteDocument}/>)}
            </div>
        </div>
    )
}

export default Dataset
