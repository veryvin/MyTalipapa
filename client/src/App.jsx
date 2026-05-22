import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landingpage from './pages/Landingpage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}