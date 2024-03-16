import React from 'react'
import './index.css'
import LoginForm from './Components/LoginForm/LoginForm.jsx'
import MonitorHome from './pages/MonitorHome/MonitorHome.jsx'
import Documentacion from './pages/Documentacion/Documentacion.jsx'
import Horas from './pages/Horas/Horas.jsx'

import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />}></Route>
        <Route path="/dashboard" element={<MonitorHome />}></Route>
        <Route path="/documentacion" element={<Documentacion />}></Route>
        <Route path="/horas" element={<Horas />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App