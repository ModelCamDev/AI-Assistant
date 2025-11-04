import { NavLink } from "react-router-dom"

function Sidebar() {

  return (
    <>
    <NavLink to={'/admin'} end className={({isActive})=> isActive ? 'selected': 'unselected'}>Overview</NavLink>
    <NavLink to={'leads'} className={({isActive})=> isActive ? 'selected': 'unselected'}>Leads</NavLink>
    <NavLink to={'employees'} className={({isActive})=> isActive ? 'selected': 'unselected'}>Employees</NavLink>
    </>
  )
}

export default Sidebar