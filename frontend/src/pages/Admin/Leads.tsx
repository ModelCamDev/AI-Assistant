import { useEffect } from "react";
import LeadItem from "../../components/Admin/LeadItem"
import { useAppDispatch, useAppSelector } from "../../redux/app/hooks"
import { getAllLeadsThunk } from "../../redux/thunks/leadThunk";

function Leads() {
    const {leads} = useAppSelector((state)=>state.lead);
    const dispatch = useAppDispatch();
    useEffect(()=>{
        dispatch(getAllLeadsThunk());
      },[]);
  return (
    <div className="dashboard-page">
        <h1>Leads</h1>
        <div className="action-container">
            <div className="lead-actions">
                <button>+ Create Lead</button>
            </div>
            <div className="filter-action">
                <select name="filter" id="filter-lead" title="Filter leads">
                    <option value="all">All</option>
                    <option value="converted">Converted</option>
                    <option value="new">New</option>
                    <option value="replied">Replied</option>
                    <option value="pending">Pending</option>
                </select>
            </div>
        </div>
        <div className="lead-list">
            {leads.map(lead=><LeadItem key={lead._id} _id={lead._id} email={lead.email} status={lead.status} date={lead.createdAt}/>)}
        </div>
    </div>
  )
}

export default Leads