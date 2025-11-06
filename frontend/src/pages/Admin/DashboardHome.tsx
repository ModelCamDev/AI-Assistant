import { useEffect } from "react";
import OverviewCard from "../../components/Admin/OverviewCard"
import { useAppDispatch, useAppSelector } from "../../redux/app/hooks"
import { getAllLeadsThunk } from "../../redux/thunks/leadThunk";

function DashboardHome() {
  const dispatch = useAppDispatch();
  const { leads } = useAppSelector((state)=>state.lead);
  useEffect(()=>{
    dispatch(getAllLeadsThunk());
  },[]);
  return (
    <div className="dashboard-page">
      <h1>Overview</h1>
      <div className="card-container">
        <OverviewCard title="Total" value={leads.length}/>
        <OverviewCard title="New" value={(leads.filter(lead=>lead.status=='new')).length}/>
        <OverviewCard title="Replied" value={(leads.filter(lead=>lead.status=='replied')).length}/>
        <OverviewCard title="Converted" value={(leads.filter(lead=>lead.status=='converted')).length}/>
      </div>
    </div>
  )
}

export default DashboardHome