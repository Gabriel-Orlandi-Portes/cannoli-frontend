import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import Chart from "react-apexcharts";
import "../styles/theme.css";
import "../styles/Dashboard.css";

export default function Lojas() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/analytics/stores");
        setData(res.data);
      } catch (err) {
        console.error("Erro ao carregar lojas", err);
      }
    }
    load();
  }, []);

  if (!data) return <div className="loading">Carregando...</div>;

  const top5 = data.ranking.slice(0, 5);

  const toBRL = (v) =>
    Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="dashboard-content">
        <h1 className="dashboard-title">🏪 Lojas — Ranking</h1>
        <h2 className="dashboard-subtitle">
          Veja o desempenho de todas as lojas da plataforma
        </h2>

        {/* ===================== TOP 5 ===================== */}
        <div className="chart-full wide-chart">
          <h3 className="chart-title">Top 5 Lojas Mais Rentáveis</h3>

          <Chart
            type="bar"
            height={380}
            series={[
              {
                name: "Faturamento",
                data: top5.map((s) => Number(s.revenue.toFixed(2))),
              },
            ]}
            options={{
              chart: { toolbar: { show: false } },
              xaxis: {
                categories: top5.map((s) => s.store),
                labels: { style: { colors: "#ccc", fontSize: "14px" } },
              },
              tooltip: {
                y: {
                  formatter: (value) => toBRL(value),
                },
              },
              plotOptions: {
                bar: {
                  horizontal: true,
                  borderRadius: 8,
                  barHeight: "60%",
                },
              },
              colors: ["#00c8ff"],
              theme: { mode: "dark" },
              grid: { borderColor: "#222" },
            }}
          />
        </div>

        {/* ===================== LISTA COMPLETA ===================== */}
        <div className="chart-full wide-chart">
          <h3 className="chart-title">📋 Lista Completa</h3>

          <table className="ranking-table table-orders">
            <thead>
              <tr>
                <th>Loja</th>
                <th>Faturamento</th>
                <th>Pedidos</th>
                <th>Ticket Médio</th>
              </tr>
            </thead>

            <tbody>
              {data.ranking.map((l, i) => (
                <tr key={i}>
                  <td>{l.store}</td>
                  <td>{toBRL(l.revenue)}</td>
                  <td>{l.orders}</td>
                  <td>{toBRL(l.avgTicket)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
