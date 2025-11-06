import { NavLink } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../redux/app/hooks"
import { logoutAdmin } from "../../redux/slices/adminSlice";

function Sidebar() {
  const {isLoggedIn} = useAppSelector((state)=>state.admin);
  const dispatch = useAppDispatch();
  const handleLogout = ()=>{
    dispatch(logoutAdmin());
  }

  return (
    <>
    <div className="sidebar-items-list">
    <NavLink to={'/admin'} end className={({isActive})=> isActive ? 'selected': 'unselected'}>Overview</NavLink>
    <NavLink to={'leads'} className={({isActive})=> isActive ? 'selected': 'unselected'}>Leads</NavLink>
    <NavLink to={'employees'} className={({isActive})=> isActive ? 'selected': 'unselected'}>Employees</NavLink>
    </div>
    <button onClick={handleLogout} className="logout">{isLoggedIn?"Logout":"Login"}</button>
    </>
  )
}

export default Sidebar