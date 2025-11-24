import React, { useEffect, useState } from "react";
import ClientSidebar from "../components/ClientSidebar";
import api from "../services/api";
import Chart from "react-apexcharts";
import "../styles/theme.css";

export default function ClientePromocoes() {
  const [lista, setLista] = useState([]);

  useEffect(() => {
    api
      .get("/client-dashboard/promocoes?email=barbosaleandro@cunha.br")
      .then((res) => setLista(res.data))
      .catch(console.error);
  }, []);

  const ativas = lista.filter((p) => p.status === "Ativa").length;
  const finalizadas = lista.length - ativas;

  const chartData = {
    series: [ativas, finalizadas],
    options: {
      labels: ["Ativas", "Finalizadas"],
      colors: ["#00e676", "#ff5252"],
      legend: {
        labels: { colors: "#fff" },
        position: "bottom",
      },
      dataLabels: {
        style: { colors: ["#000"] }
      },
      stroke: {
        width: 2,
        colors: ["#0e1118"]
      },
      theme: { mode: "dark" }
    },
  };

  return (
    <div className="dashboard-container">
      <ClientSidebar />

      <div className="dashboard-content">
        <h1 className="dashboard-title">🏷️ Promoções da Loja</h1>
        <h2 className="dashboard-subtitle">Gerencie suas campanhas e acompanhe resultados</h2>

        {/* GRÁFICO */}
        <div className="chart-full" style={{ maxWidth: 420, marginBottom: 30 }}>
          <h3>📊 Distribuição de Promoções</h3>
          <Chart type="donut" series={chartData.series} options={chartData.options} height={280} />
        </div>

        {/* CARDS */}
        <div className="promo-grid">
          {lista.map((promo, i) => (
            <div className="promo-card" key={i}>
              <div className="promo-header">
                <h3>{promo.nome}</h3>
                <span
                  className={`tag ${
                    promo.status === "Ativa" ? "tag-active" : "tag-ended"
                  }`}
                >
                  {promo.status}
                </span>
              </div>

              <p className="promo-type">Tipo: {promo.tipo}</p>

              <button className="promo-btn">
                Ver detalhes
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
