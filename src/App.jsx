import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ClienteDashboard from "./pages/ClienteDashboard";
import CampaignSimulator from "./pages/CampaignSimulator";
import Faturamento from "./pages/Faturamento";
import Lojas from "./pages/Lojas";
import TempoStatus from "./pages/TempoStatus";
import ClientePedidos from "./pages/ClientePedidos";
import ClientePerfil from "./pages/ClientePerfil";
import ClientePromocoes from "./pages/ClientePromocoes";

export default function App() { 
  return (  
    <Routes>  
      <Route path="/" element={<Login />} />

      <Route path="/admin" element={<AdminDashboard />} />

      <Route path="/cliente" element={<ClienteDashboard />} />
      <Route path="/cliente/pedidos" element={<ClientePedidos />} />
      <Route path="/cliente/perfil" element={<ClientePerfil />} />
      <Route path="/cliente/promocoes" element={<ClientePromocoes />} />

      <Route path="/admin/simulador" element={<CampaignSimulator />} />
      <Route path="/admin/faturamento" element={<Faturamento />} />
      <Route path="/admin/lojas" element={<Lojas />} />
      <Route path="/admin/tempo" element={<TempoStatus />} />
    </Routes>
  );
}
