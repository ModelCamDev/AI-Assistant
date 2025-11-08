import { Outlet } from "react-router-dom"
import Header from "../components/Admin/Header";
import ChatFloat from "../components/User/ChatFloat";
function UserLayout() {

  return (
    <div className="user-layout">
        <div className="admin-header">
            <Header/>
        </div>
        <div className="user-page">
            <Outlet />
            <ChatFloat/>
        </div>
    </div>
  )
}

export default UserLayout