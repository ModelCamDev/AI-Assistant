import { useLocation } from "react-router-dom"


function LeadsDetails() {
    const location = useLocation();
    const {email, status, date, updatedDate} = location.state;
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
                <span className="lead-details-title">Name </span>
                <span>{'Unknown'}</span>
            </div>
            <div className="lead-detail-item">
                <span className="lead-details-title">Email </span>
                <span>{email || 'Unknown'}</span>
            </div>
            <div className="lead-detail-item">
                <span className="lead-details-title">Status </span>
                <span style={{textTransform:'capitalize'}}>{status || 'Unknown'}</span>
            </div>
            <div className="lead-detail-item">
                <span className="lead-details-title">Last updated </span>
                <span>
                    {`${(new Date(updatedDate).toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit', hour12: true}))} | ${(new Date(updatedDate).toLocaleDateString('en-GB',{day:'2-digit', month:'long', year: 'numeric'}))}` || 'Not Available'}
                </span>
            </div>
            <div className="lead-detail-item" style={{borderBottom: 'none', paddingBottom: '0'}}>
                <span className="lead-details-title">Created at </span>
                <span>
                    {`${(new Date(date).toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit', hour12: true}))} | ${(new Date(date).toLocaleDateString('en-GB',{day:'2-digit', month:'long', year: 'numeric'}))}` || 'Not Available'}
                </span>
            </div>
        </div>
    </div>
  )
}

export default LeadsDetails