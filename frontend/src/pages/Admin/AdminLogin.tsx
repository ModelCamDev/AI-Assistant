import type React from "react"
import { useAppDispatch } from "../../redux/app/hooks"
import { loginAdmin } from "../../redux/slices/adminSlice";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
   const handleOnSubmit = (e: React.FormEvent)=>{
        e.preventDefault()
        dispatch(loginAdmin({email: 'aditya@gmail.com'}))
        navigate('/admin')
   }
  return (
    <div className="dashboard-page">
      <h1 className="auth-head">Login</h1>
      <form onSubmit={handleOnSubmit} className="auth-form">
        <input type="email" name="email" id="email" placeholder="Enter email"/>
        <input type="password" name="password" id="password" placeholder="Enter password"/>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default AdminLogin
