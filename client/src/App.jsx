import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/Landingpage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ContractorDashboard from './pages/Contractor/ContractorDashboard'
import ContractorRecords from './pages/Contractor/ContractorRecords'
import ContractorApplications from './pages/Contractor/ContractorApplications'
import ContractorStalls from './pages/Contractor/ContractorStalls'
import ContractorProfile from './pages/Contractor/ContractorProfile'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminRecord from './pages/Admin/AdminRecord'
import AdminApplication from './pages/Admin/AdminApplication'
import AdminStalls from './pages/Admin/AdminStalls'
import AdminProfile from './pages/Admin/AdminProfile'
import RenterLayout from './pages/Renter/Renterlayout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/contractor/dashboard" element={<ContractorDashboard />} />
        <Route path="/contractor/profile" element={<ContractorProfile />} />
        <Route path="/contractor/records" element={<ContractorRecords />} />
        <Route path="/contractor/applications" element={<ContractorApplications />} />
        <Route path="/contractor/stalls" element={<ContractorStalls />} />
        <Route path="/contractor/*" element={<ContractorDashboard />} />
        
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/records" element={<AdminRecord />} />
        <Route path="/admin/applications" element={<AdminApplication />} />
        <Route path="/admin/stalls" element={<AdminStalls />} />
        <Route path="/admin/*" element={<AdminDashboard />} />

        <Route path="/renter/*" element={<RenterLayout />} />
      </Routes>
    </BrowserRouter>
  )
}