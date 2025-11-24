import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import "./Sidebar.css";

export default function Sidebar({ open, close }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard Geral", icon: "🏠", path: "/admin" },
    { name: "Faturamento", icon: "📊", path: "/admin/faturamento" },
    { name: "Lojas", icon: "🏬", path: "/admin/lojas" },
    { name: "Tempo e Status", icon: "⏱️", path: "/admin/tempo" },
    { name: "Simulador de Campanhas", icon: "🧪", path: "/admin/simulador" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <aside className={`sidebar ${open ? "sidebar-mobile-open" : ""}`}>
      
      {/* botão fechar no mobile */}
      <button className="sidebar-close-btn" onClick={close}>
        <X size={22} />
      </button>

      <div>
        

        <ul>
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={location.pathname === item.path ? "active" : ""}
              onClick={close}
            >
              <Link to={item.path}>
                <span>{item.icon}</span> {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <button className="logout" onClick={handleLogout}>
        <span>🚪</span> Sair
      </button>
    </aside>
  );
}
