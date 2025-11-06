import { NavLink } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../redux/app/hooks"
import { logoutAdmin } from "../../redux/slices/adminSlice";
import { FaArrowRightFromBracket, FaArrowRightToBracket, FaFileArrowUp, FaGrip, FaUserGroup } from 'react-icons/fa6'

function Sidebar() {
  const {isLoggedIn} = useAppSelector((state)=>state.admin);
  const dispatch = useAppDispatch();
  const handleLogout = ()=>{
    dispatch(logoutAdmin());
  }

  return (
    <>
    <div className="sidebar-items-list">
    <NavLink to={'/admin'} end className={({isActive})=> isActive ? 'selected': 'unselected'}><FaGrip size={20} style={{ verticalAlign: "middle", marginRight: '5px' }}/>Overview</NavLink>
    <NavLink to={'leads'} className={({isActive})=> isActive ? 'selected': 'unselected'}><FaUserGroup size={20} style={{ verticalAlign: "middle", marginRight: '5px' }}/>Leads</NavLink>
    <NavLink to={'employees'} className={({isActive})=> isActive ? 'selected': 'unselected'}> <FaFileArrowUp size={20} style={{ verticalAlign: "middle", marginRight: '5px' }}/> Documents</NavLink>
    </div>
    <button onClick={handleLogout} className="logout">{isLoggedIn?<><FaArrowRightFromBracket size={20} style={{ verticalAlign: "middle", marginRight: '5px' }} />Logout</>:<><FaArrowRightToBracket size={20} style={{ verticalAlign: "middle", marginRight: '5px' }}/>Login</>}</button>
    </>
  )
}

export default Sidebar