import { useNavigate } from "react-router-dom";

interface props{
    _id: string;
    email: string;
    status: string;
}
// Change '_id: _' to '_id' when _id is needed
function LeadItem({_id: _, email, status}:props){
    const navigate = useNavigate();
    const handleOnclick = ()=>{
        navigate('/admin/lead-details', {state: {email, status}})
    }
    return <div onClick={handleOnclick} className="lead-item">
        <div className="lead-email">{email}</div>
        <div className="lead-status">{status}</div>
    </div>
}

export default LeadItem