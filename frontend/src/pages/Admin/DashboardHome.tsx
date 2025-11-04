import OverviewCard from "../../components/Admin/OverviewCard"

function DashboardHome() {

  return (
    <div className="dashboard-page">
      <h1>Overview</h1>
      <div className="card-container">
        <OverviewCard title="Total" value={8}/>
        <OverviewCard title="New" value={3}/>
        <OverviewCard title="Replied" value={1}/>
        <OverviewCard title="Converted" value={4}/>
        <OverviewCard title="Pending" value={0}/>
      </div>
    </div>
  )
}

export default DashboardHome