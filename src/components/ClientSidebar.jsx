import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./sidebar.css";

export default function ClientSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menu = [
    { path: "/cliente", label: "Meu Painel", icon: "🏠" },
    { path: "/cliente/pedidos", label: "Meus Pedidos", icon: "📦" },
    { path: "/cliente/perfil", label: "Meu Perfil", icon: "👤" },
    { path: "/cliente/promocoes", label: "Promoções", icon: "🏷️" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div>
       

        <ul>
          {menu.map((item) => (
            <li
              key={item.path}
              className={location.pathname === item.path ? "active" : ""}
            >
              <Link to={item.path}>
                <span>{item.icon}</span> {item.label}
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
