import { NavLink } from "react-router-dom"

const Dataset = () => {
    return (
        <div className="dashboard-page">
            <div className="dataset-head">
                <h1>Dataset</h1>
                <NavLink to={'upload'} className="upload-nav">Upload Data</NavLink>
            </div>
            <div className="document-list">
                <div className="document-list-item">
                    <span>File name</span>
                    <span>file/type</span>
                    <span>delete</span>
                </div>
                <div className="document-list-item">
                    <span>Document name</span>
                    <span>file/type</span>
                    <span>delete</span>
                </div>
            </div>
        </div>
    )
}

export default Dataset
