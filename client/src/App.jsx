import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landingpage from './pages/Landingpage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ContractorDashboard from './pages/Contractor/ContractorDashboard'
import ContractorProfile from './pages/Contractor/ContractorProfile'
import RenterDashboard from './pages/Renter/RenterDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contractor/dashboard" element={<ContractorDashboard />} />
        <Route path="/contractor/profile" element={<ContractorProfile />} />
        <Route path="/contractor/*" element={<ContractorDashboard />} />
        <Route path="/renter/dashboard" element={<RenterDashboard />} />
        <Route path="/renter/*" element={<RenterDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}