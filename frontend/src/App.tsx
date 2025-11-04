import './App.css'
import './Admin.css'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import UserLayout from './layouts/UserLayout'
import Chat from './pages/Chat'
import AdminLayout from './layouts/AdminLayout'
import DashboardHome from './pages/Admin/DashboardHome'
import Leads from './pages/Admin/Leads'
import LeadsDetails from './pages/Admin/LeadDetails'

function App() {

  return (
   <Router>
      <Routes>
      {/* User Routes */}
      <Route path='/' element={<UserLayout />}>
        <Route index element={<Chat />} />
      </Route>
      {/* Admin Route */}
      <Route path='/admin' element={<AdminLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path='leads' element={<Leads />} >
        </Route>
          <Route path='lead-details' element={<LeadsDetails />}/>
        <Route path='employees' element={<DashboardHome />} />
      </Route>
      </Routes>
   </Router>
  )
}

export default App
