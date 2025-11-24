import React, { useEffect, useState } from "react";
import ClientSidebar from "../components/ClientSidebar";
import api from "../services/api";
import "../styles/theme.css";

export default function ClientePerfil() {
  const [info, setInfo] = useState(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api
      .get("/client-dashboard/perfil?email=barbosaleandro@cunha.br")
      .then((res) => {
        setInfo(res.data);
        setForm(res.data);
      })
      .catch(console.error);
  }, []);

  if (!info) return <div className="loading">Carregando...</div>;

  const salvar = () => {
    setInfo(form);
    setEditando(false);
    alert("Perfil atualizado com sucesso! (simulação)");
  };

  return (
    <div className="dashboard-container">
      <ClientSidebar />

      <div className="dashboard-content">
        <h1 className="dashboard-title">👤 Meu Perfil</h1>

        <div
          className="chart-full"
          style={{
            maxWidth: "650px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {!editando ? (
            <>
              <p><strong>🧁 Loja:</strong> {info.storeName}</p>
              <p><strong>📍 Endereço:</strong> {info.address}</p>
              <p><strong>📞 Telefone:</strong> {info.phone}</p>
              <p><strong>📧 Email:</strong> {info.email}</p>
              <p>
                <strong>📅 Desde:</strong>{" "}
                {new Date(info.createdAt).toLocaleDateString("pt-BR")}
              </p>

              <button className="btn-edit" onClick={() => setEditando(true)}>
                ✏ Editar perfil
              </button>
            </>
          ) : (
            <>
              <label>Nome da loja:</label>
              <input
                className="input-dark"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              />

              <label>Endereço:</label>
              <input
                className="input-dark"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />

              <label>Telefone:</label>
              <input
                className="input-dark"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button className="btn-green" onClick={salvar}>
                  💾 Salvar
                </button>
                <button className="btn-red" onClick={() => setEditando(false)}>
                  ✖ Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
