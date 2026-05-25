import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/Landingpage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ContractorDashboard from './pages/Contractor/ContractorDashboard'
import ContractorRecords from './pages/Contractor/ContractorRecords'
import ContractorApplications from './pages/Contractor/ContractorApplications'
import ContractorStalls from './pages/Contractor/ContractorStalls'
import ContractorProfile from './pages/Contractor/ContractorProfile'
import RenterLayout from './pages/Renter/RenterLayout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contractor/dashboard" element={<ContractorDashboard />} />
        <Route path="/contractor/profile" element={<ContractorProfile />} />
        <Route path="/contractor/records" element={<ContractorRecords />} />
        <Route path="/contractor/applications" element={<ContractorApplications />} />
        <Route path="/contractor/stalls" element={<ContractorStalls />} />
        <Route path="/contractor/*" element={<ContractorDashboard />} />
        <Route path="/renter/*" element={<RenterLayout />} />
      </Routes>
    </BrowserRouter>
  )
}