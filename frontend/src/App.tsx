import './App.css'
import './Admin.css'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import UserLayout from './layouts/UserLayout'
import Chat from './pages/Chat'
import AdminLayout from './layouts/AdminLayout'
import DashboardHome from './pages/Admin/DashboardHome'
import Leads from './pages/Admin/Leads'
import LeadsDetails from './pages/Admin/LeadDetails'
import AdminLogin from './pages/Admin/AdminLogin'
import AdminProtectedRoute from './components/Admin/AdminProtectedRoute'
import { ToastContainer } from 'react-toastify';

function App() {

  return (
    <>
      <Router>
        <Routes>
          {/* User Routes */}
          <Route path='/' element={<UserLayout />}>
            <Route index element={<Chat />} />
          </Route>
          {/* Admin Route */}
          <Route path='/admin' element={<AdminLayout />}>
            <Route index element={<AdminProtectedRoute><DashboardHome /></AdminProtectedRoute>} />
            <Route path='leads' element={<AdminProtectedRoute><Leads /> </AdminProtectedRoute>} />
            <Route path='lead-details' element={<AdminProtectedRoute><LeadsDetails /></AdminProtectedRoute>} />
            <Route path='employees' element={<AdminProtectedRoute><DashboardHome /> </AdminProtectedRoute>} />
            <Route path='login' element={<AdminLogin />} />
            <Route path='register' element={<AdminLogin />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  )
}

export default App
