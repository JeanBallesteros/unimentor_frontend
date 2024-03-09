import React from 'react'
import LoginForm from './Components/LoginForm/LoginForm.jsx'
import MonitorHome from './pages/MonitorHome/MonitorHome.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />}></Route>
        <Route path="/dashboard" element={<MonitorHome />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App