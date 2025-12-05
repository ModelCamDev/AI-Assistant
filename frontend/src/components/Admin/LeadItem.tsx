import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/app/hooks";
import { updateLeadThunk } from "../../redux/thunks/leadThunk";
// import { toast } from "react-toastify";

interface props{
    _id: string;
    email: string;
    status: string;
}
// Change '_id: _' to '_id' when _id is needed
function LeadItem({_id: id, email, status}:props){
    const [isChanging, setIsChanging] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const {loading} = useAppSelector((state)=>state.lead)
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (updateLoading && !loading) {
            setUpdateLoading(false)
        }
    }, [updateLoading, loading]);

    const handleOnclick = ()=>{
        navigate('/admin/lead-details', {state: {email, status}})
    }
    const handleChangeRequest = (e: React.MouseEvent<HTMLButtonElement>)=>{
        e.stopPropagation();
        setIsChanging(true);
    }
    const handleCancel = (e: React.MouseEvent<HTMLButtonElement>)=>{
        e.stopPropagation();
        setIsChanging(false);
    }
    const handleStatusChange = (e: React.MouseEvent<HTMLButtonElement>, updatedStatus: string)=>{
        e.stopPropagation();
        if (updatedStatus!==status) {
            dispatch(updateLeadThunk({id, status: updatedStatus}))
        }else{
            // toast.warn('Nothing to update')
        }
        setIsChanging(false);
        setUpdateLoading(true)
    }
    return <div onClick={handleOnclick} className="lead-item">
        <div className="lead-email">{email}</div>
        {
            isChanging ?
                <span className="lead-action-container">
                    <button className="lead-status new" onClick={(e)=>{handleStatusChange(e, 'new')}}>New</button>
                    <button className="lead-status replied" onClick={(e)=>{handleStatusChange(e, 'replied')}}>Replied</button>
                    <button className="lead-status converted" onClick={(e)=>{handleStatusChange(e, 'converted')}}>Converted</button>
                    <button className="lead-status cancel" onClick={handleCancel}>Cancel</button>
                </span> :
                <button className={`lead-status ${status}`} disabled={updateLoading} onClick={handleChangeRequest}>{updateLoading?'Updating':status}</button>
        }
    </div>
}

export default LeadItem