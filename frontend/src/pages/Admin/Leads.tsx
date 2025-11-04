import LeadItem from "../../components/Admin/LeadItem"

function Leads() {

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
            <LeadItem email="aditya@example.com" status="converted"/>
            <LeadItem email="aditya@example.com" status="converted"/>
            <LeadItem email="aditya@example.com" status="converted"/>
            <LeadItem email="aditya@example.com" status="converted"/>
            <LeadItem email="aditya@example.com" status="converted"/>
            <LeadItem email="aditya@example.com" status="converted"/>
        </div>
    </div>
  )
}

export default Leads