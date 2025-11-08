import { Outlet } from "react-router-dom"
import Header from "../components/Admin/Header";
function UserLayout() {

  return (
    <div className="user-layout">
        <div className="admin-header">
            <Header/>
        </div>
        <div className="user-page">
            <Outlet />
        </div>
    </div>
  )
}

export default UserLayout