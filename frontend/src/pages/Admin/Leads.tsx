import React, { useEffect, useState } from "react";
import LeadItem from "../../components/Admin/LeadItem"
import { useAppDispatch, useAppSelector } from "../../redux/app/hooks"
import { getAllLeadsThunk } from "../../redux/thunks/leadThunk";
import type { Lead } from "../../redux/slices/leadSlice";

function Leads() {
    const {leads} = useAppSelector((state)=>state.lead);
    const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
    const dispatch = useAppDispatch();
    useEffect(() => {
        setFilteredLeads(leads)
    }, [leads]);
    useEffect(()=>{
        dispatch(getAllLeadsThunk());
      },[]);
    
    const onChangeFilter = (e: React.ChangeEvent<HTMLSelectElement>)=>{
        if (e.target.value==='all') {
            setFilteredLeads(leads);
        }else{
            setFilteredLeads(leads.filter(lead=>lead.status===e.target.value))
        }
    }
  return (
    <div className="dashboard-page">
        <h1>Leads</h1>
        <div className="action-container">
            <div className="lead-actions">
                <button>+ Create Lead</button>
            </div>
            <div className="filter-action">
                <select onChange={onChangeFilter} name="filter" id="filter-lead" title="Filter leads">
                    <option value="all">All ({leads.length})</option>
                    <option value="converted">Converted ({leads.filter(lead=>lead.status==='converted').length})</option>
                    <option value="new">New ({leads.filter(lead=>lead.status==='new').length})</option>
                    <option value="replied">Replied ({leads.filter(lead=>lead.status==='replied').length})</option>
                </select>
            </div>
        </div>
        {
            (!filteredLeads || filteredLeads.length === 0) && <div className="no-data">No Leads Found</div>
        }
        <div className="lead-list">
            {filteredLeads.map(lead=><LeadItem key={lead._id} _id={lead._id} email={lead.email} status={lead.status} date={lead.createdAt} updatedDate={lead.updatedAt}/>)}
        </div>
    </div>
  )
}

export default Leads