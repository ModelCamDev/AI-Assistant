import { Outlet } from "react-router-dom"
import Header from "../components/Admin/Header"
import Sidebar from "../components/Admin/Sideber"
function AdminLayout() {

  return (
    <div className="admin-layout">
        <div className="admin-header">
            <Header/>
        </div>
        <div className="dashboard-section">
            <aside>
                <Sidebar/>
            </aside>
            <main>
                <Outlet/>
            </main>
        </div>
        
    </div>
  )
}

export default AdminLayout