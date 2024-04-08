import React from 'react'
import './index.css'
import LoginForm from './Components/LoginForm/LoginForm.jsx'
import MonitorHome from './pages/MonitorHome/MonitorHome.jsx'
import Documentacion from './pages/Documentacion/Documentacion.jsx'
import Horas from './pages/Horas/Horas.jsx'
import Avales from './pages/Master/Avales/Avales.jsx'
import Monitores from './pages/Master/Monitores/Monitores.jsx'
import Reportes from './pages/Master/Reportes/Reportes.jsx'

import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />}></Route>
        <Route path="/dashboard" element={<MonitorHome />}></Route>
        <Route path="/documentacion" element={<Documentacion />}></Route>
        <Route path="/horas" element={<Horas />}></Route>
        <Route path="/avales" element={<Avales />}></Route>
        <Route path="/monitores" element={<Monitores />}></Route>
        <Route path="/reportes" element={<Reportes />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App