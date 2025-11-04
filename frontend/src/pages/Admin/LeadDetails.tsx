import { useLocation } from "react-router-dom"


function LeadsDetails() {
    const location = useLocation();
    const {email, status} = location.state;
  return (
    <div className="dashboard-page">
        <h1>Lead Details</h1>
        <div className="action-container">
            <div className="lead-actions">
                <button>Update Lead</button>
            </div>
            <div className="lead-actions">
                <button>Delete Lead</button>
            </div>
        </div>
        <div className="lead-details">
            <div className="lead-detail-item">
                <span>Name: </span><span>{'Unknown'}</span>
            </div>
            <div className="lead-detail-item">
                <span>email: </span><span>{email || 'Unknown'}</span>
            </div>
            <div className="lead-detail-item">
                <span>status: </span><span>{status || 'Unknown'}</span>
            </div>
        </div>
    </div>
  )
}

export default LeadsDetails