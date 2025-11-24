import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Chart from "react-apexcharts";
import api from "../services/api";
import "../styles/Dashboard.css";

export default function DashboardFaturamento() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data))
      .catch(console.error);
  }, []);

  if (!data) return <div className="loading">Carregando...</div>;

  const { summary, revenueByMonth } = data;

  /* ========================
      Ordenação dos meses
  ========================= */
  const ordemMeses = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez"
  ];

  const normalize = (m) => m.toLowerCase().replace(".", "").trim();

  const revenueSorted = [...revenueByMonth].sort(
    (a, b) => ordemMeses.indexOf(normalize(a.month)) -
             ordemMeses.indexOf(normalize(b.month))
  );

  const toBRL = (v) =>
    Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="dashboard-content">

        <h1 className="dashboard-title">📊 Faturamento & Histórico</h1>
        <h2 className="dashboard-subtitle">
          Acompanhe a evolução financeira da plataforma Cannoli
        </h2>

        {/* ================= CARDS ================= */}
        <div className="kpi-grid">

          <div className="kpi-card orange">
            <h3>💰 Receita Total</h3>
            <p>{toBRL(summary.revenueMonth)}</p>
          </div>

          <div className="kpi-card blue">
            <h3>📦 Total de Pedidos</h3>
            <p>{summary.ordersYear}</p>
          </div>

          <div className="kpi-card purple">
            <h3>🎟 Ticket Médio</h3>
            <p>{toBRL(summary.avgTicket)}</p>
          </div>
        </div>

        {/* ================= GRÁFICO ================= */}
        <div className="chart-full wide-chart">
          <h3>📈 Evolução Mensal</h3>

          <Chart
            type="area"
            height={360}
            series={[
              {
                name: "Faturamento",
                data: revenueSorted.map((r) =>
                  Number(r.amount.toFixed(2))
                ),
              },
            ]}
            options={{
              chart: {
                toolbar: { show: false },
              },
              stroke: {
                curve: "smooth",
                width: 3,
              },
              xaxis: {
                categories: revenueSorted.map((r) => r.month),
                labels: {
                  style: { colors: "#ccc", fontSize: "14px" },
                },
              },
              yaxis: {
                labels: {
                  style: { colors: "#ccc", fontSize: "14px" },
                  formatter: (value) => toBRL(value),
                },
              },
              tooltip: {
                theme: "dark",
                y: { formatter: (v) => toBRL(v) },
              },
              fill: {
                type: "gradient",
                gradient: {
                  shadeIntensity: 0.3,
                  opacityFrom: 0.8,
                  opacityTo: 0.1,
                },
              },
              colors: ["#00e676"],
              grid: {
                borderColor: "#222",
              },
              theme: { mode: "dark" },
            }}
          />
        </div>

      </div>
    </div>
  );
}
