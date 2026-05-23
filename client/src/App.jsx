import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landingpage from './pages/Landingpage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminDashboard from './pages/Contractor/ContractorDashboard'
import RenterDashboard from './pages/Renter/RenterDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/renter/dashboard" element={<RenterDashboard />} />
        <Route path="/renter/*" element={<RenterDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}