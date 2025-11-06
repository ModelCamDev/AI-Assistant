import type React from "react"
import { useAppDispatch } from "../../redux/app/hooks"
import { useNavigate } from "react-router-dom";
import { adminLoginThunk } from "../../redux/thunks/adminThunk";

const AdminLogin = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
   const handleOnSubmit = async (e: React.FormEvent)=>{
        e.preventDefault()
        const result = await dispatch(adminLoginThunk({email: 'aditya@example.com', password: 'Aditya'}))
        if (adminLoginThunk.fulfilled.match(result)) {
          navigate('/admin')
        }
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
