import { useNavigate } from "react-router-dom";

interface props{
    email: string;
    status: string;
}
function LeadItem({email, status}:props){
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