import React, { useState } from "react";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // 🧠 Logins fixos
    if (email === "admin@gmail.com" && password === "admin123") {
      localStorage.setItem("role", "admin");
      localStorage.setItem("name", "Administrador Cannoli");
      window.location.href = "/cannoli-frontend/admin";
    } else if (email === "cliente@gmail.com" && password === "cliente123") {
      localStorage.setItem("role", "cliente");
      localStorage.setItem("name", "Cliente Cannoli");
      window.location.href = "/cannoli-frontend/cliente";
    } else {
      setError("Usuário ou senha incorretos. Tente novamente.");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-box">li</div>
          <div className="logo-text">
            CANNOLI <br /> DASHBOARD
          </div>
        </div>

        <h1>Bem-vindo 👋</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Senha</label>
          <input
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit">Entrar</button>
        </form>

        <div className="info">
          <p>🧾 Use um dos logins fixos:</p>
          <p><b>Admin:</b> admin@gmail.com / admin123</p>
          <p><b>Cliente:</b> cliente@gmail.com / cliente123</p>
        </div>
      </div>
    </div>
  );
}
