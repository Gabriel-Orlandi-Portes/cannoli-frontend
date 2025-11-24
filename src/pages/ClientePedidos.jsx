import React, { useEffect, useState } from "react";
import ClientSidebar from "../components/ClientSidebar";
import api from "../services/api";
import Chart from "react-apexcharts";
import "../styles/theme.css";

export default function ClientePedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [range, setRange] = useState("all");

  useEffect(() => {
    api
      .get("/client-dashboard/pedidos?email=barbosaleandro@cunha.br")
      .then((res) => {
        const normalizados = res.data.map((p) => ({
          ...p,
          statusNorm:
            p.status === "CONFIRMED" ||
            p.status === "CONCLUÍDO" ||
            p.status === "CONCLUIDO"
              ? "CONCLUÍDO"
              : p.status === "DELIVERED" || p.status === "ENTREGUE"
              ? "ENTREGUE"
              : p.status === "CANCELLED" || p.status === "CANCELADO"
              ? "CANCELADO"
              : p.status,
        }));

        setPedidos(normalizados);
        setFiltered(normalizados);
      })
      .catch(console.error);
  }, []);

  const toBRL = (v) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // -------------------------------
  // FILTRO POR DATA
  // -------------------------------
  const filtrar = (valor) => {
    setRange(valor);

    if (valor === "all") {
      setFiltered(pedidos);
      return;
    }

    const dias = Number(valor);
    const limite = new Date();
    limite.setDate(limite.getDate() - dias);

    const novos = pedidos.filter((p) => new Date(p.date) >= limite);
    setFiltered(novos);
  };

  // KPIs
  const concluidos = filtered.filter((p) => p.statusNorm === "CONCLUÍDO").length;
  const cancelados = filtered.filter((p) => p.statusNorm === "CANCELADO").length;
  const entregues = filtered.filter((p) => p.statusNorm === "ENTREGUE").length;

  const totalGasto = filtered.reduce((s, p) => s + p.value, 0);

  const statusChart = {
    series: [concluidos, entregues, cancelados],
    options: {
      labels: ["Concluídos", "Entregues", "Cancelados"],
      colors: ["#4CAF50", "#2196F3", "#F44336"],
      theme: { mode: "dark" },
    },
  };

  return (
    <div className="dashboard-container">
      <ClientSidebar />

      <div className="dashboard-content">
        <h1 className="dashboard-title">📦 Meus Pedidos</h1>
        <h2 className="dashboard-subtitle">Histórico completo dos seus pedidos</h2>

        {/* FILTRO */}
        <div className="chart-full" style={{ marginBottom: 25 }}>
          <h3>🔎 Filtrar por período</h3>

          <select
            className="input-dark"
            value={range}
            onChange={(e) => filtrar(e.target.value)}
            style={{
              width: 220,
              marginTop: 10,
              padding: "8px 12px",
              borderRadius: 8,
              background: "#1a1f2e",
            }}
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="all">Todos os pedidos</option>
          </select>
        </div>

        {/* KPI */}
        <div className="kpi-grid">
          <div className="kpi-card orange">
            <h3>💸 Total gasto</h3>
            <p>{toBRL(totalGasto)}</p>
          </div>

          <div className="kpi-card blue">
            <h3>📦 Total de pedidos</h3>
            <p>{filtered.length}</p>
          </div>

          <div className="kpi-card purple">
            <h3>✔ Concluídos</h3>
            <p>{concluidos}</p>
          </div>
        </div>

        {/* GRAFICO */}
        <div className="chart-full">
          <h3>📊 Status dos pedidos</h3>

          <Chart
            type="pie"
            height={320}
            series={statusChart.series}
            options={statusChart.options}
          />
        </div>

        {/* TABELA */}
        <div className="chart-full">
          <h3>🛍️ Lista completa</h3>

          {filtered.length ? (
            <table className="table-orders">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Loja</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>{p.store}</td>
                    <td>{toBRL(p.value)}</td>
                    <td>{p.statusNorm}</td>
                    <td>{new Date(p.date).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Nenhum pedido encontrado neste período.</p>
          )}
        </div>
      </div>
    </div>
  );
}
