import type React from "react"
import { useAppDispatch } from "../../redux/app/hooks"
import { useNavigate } from "react-router-dom";
import { adminLoginThunk } from "../../redux/thunks/adminThunk";
import { useState } from "react";

const AdminLogin = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<{email:string, password: string}>({email: 'aditya@example.com', password: 'Aditya'});
    const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
      setFormData(prevState=>
      ({...prevState, [e.target.name]:e.target.value})
      )
    }
   const handleOnSubmit = async (e: React.FormEvent)=>{
        e.preventDefault()
        const result = await dispatch(adminLoginThunk({email: formData.email, password: formData.password}))
        if (adminLoginThunk.fulfilled.match(result)) {
          navigate('/admin')
        }
   }
  return (
    <div className="dashboard-page">
      <h1 className="auth-head">Login</h1>
      <form onSubmit={handleOnSubmit} className="auth-form">
        <input type="email" name="email" id="email" value={formData.email} onChange={handleInputOnChange} placeholder="Enter email"/>
        <input type="password" name="password" id="password" value={formData.password} onChange={handleInputOnChange} placeholder="Enter password"/>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default AdminLogin
