import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import Chart from "react-apexcharts";

export default function TempoStatus() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await api.get("/analytics/timing");

      // ======= PADRONIZAÇÃO DOS STATUS =======
      const mapPadrao = {
        CONCLUDED: "Concluído",
        CONCLUÍDO: "Concluído",

        CONFIRMED: "Confirmado",
        CONFIRMADO: "Confirmado",

        DISPATCHED: "Despachado",
        DESPACHADO: "Despachado",

        PLACED: "Pedido Recebido",

        DELIVERED: "Entregue",
        ENTREGUE: "Entregue",

        CANCELED: "Cancelado",
        CANCELADO: "Cancelado",
      };

      const statusOriginal = res.data.statusCounts;
      const statusUnificado = {};

      Object.entries(statusOriginal).forEach(([status, count]) => {
        const novoStatus = mapPadrao[status] || status; 
        statusUnificado[novoStatus] =
          (statusUnificado[novoStatus] || 0) + count;
      });

      setData({
        ...res.data,
        statusCounts: statusUnificado,
      });
    }
    load();
  }, []);

  if (!data) return <div>Carregando...</div>;

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="dashboard-content">
        <h1 className="dashboard-title">⏱ Tempo & Status</h1>

        <div className="kpi-grid">
          <div className="kpi-card blue">
            <h3>⏳ Tempo Médio Preparo</h3>
            <p>{data.avgPrep.toFixed(1)} min</p>
          </div>

          <div className="kpi-card purple">
            <h3>🚚 Tempo Médio Entrega</h3>
            <p>{data.avgDelivery.toFixed(1)} min</p>
          </div>
        </div>

        <div className="chart-full">
          <h3>Status dos Pedidos</h3>

          <Chart
            type="pie"
            height={350}
            options={{
              labels: Object.keys(data.statusCounts),
              theme: { mode: "dark" },
            }}
            series={Object.values(data.statusCounts)}
          />
        </div>

        <div className="chart-full">
          <h3>🧠 Insight Automático</h3>
          <p style={{ color: "#ccc" }}>
            {data.avgDelivery > 50
              ? "⚠ O tempo de entrega está muito alto. Avalie gargalos nas lojas."
              : "🟢 O tempo médio está dentro do esperado."}
          </p>
        </div>
      </div>
    </div>
  );
}
