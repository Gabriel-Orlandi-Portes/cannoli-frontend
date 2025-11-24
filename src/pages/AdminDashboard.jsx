import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import Sidebar from "../components/Sidebar";
import ExportButtons from "../components/ExportButtons";
import api from "../services/api";
import "../styles/theme.css";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // filtro rápido
  const [periodo, setPeriodo] = useState("30");

  // filtro personalizado
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // IA
  const [prediction, setPrediction] = useState(null);
  const [anomalies, setAnomalies] = useState([]);

  const toBRL = (v) =>
    Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  async function loadDashboard() {
    setLoading(true);
    try {
      // ---------- monta URL do dashboard ----------
      let urlDashboard = `/dashboard?dias=${periodo}`;
      let diasIA = Number(periodo);

      // se tiver período personalizado, usa as datas
      if (startDate && endDate) {
        urlDashboard = `/dashboard?start=${startDate}&end=${endDate}`;

        const ini = new Date(startDate);
        const fim = new Date(endDate);
        const diffMs = fim - ini;
        const diffDays = Math.max(
          1,
          Math.ceil(diffMs / (1000 * 60 * 60 * 24))
        );
        diasIA = diffDays;
      }

      // dados principais do dashboard
      const res = await api.get(urlDashboard);
      setData(res.data);

      // IA – previsão e anomalias usando o mesmo período
      const [predRes, anRes] = await Promise.all([
        api.get(`/ml/predict-revenue?dias=${diasIA}`),
        api.get(`/ml/anomalies?dias=${diasIA}`),
      ]);

      setPrediction(predRes.data.previsaoProximoPeriodo);
      setAnomalies(anRes.data.anomalies || []);
    } catch (err) {
      console.error("❌ Erro ao carregar dashboard admin:", err);
    } finally {
      setLoading(false);
    }
  }

  // carrega quando muda o filtro rápido
  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo]);

  function aplicarFiltroPersonalizado() {
    if (!startDate || !endDate) {
      alert("Escolha as duas datas!");
      return;
    }
    loadDashboard();
  }

  if (loading || !data) return <div className="loading">Carregando dados...</div>;

  let { summary, topStores, revenueByMonth } = data;

  // ---------- ordenação dos meses ----------
  const ordemMeses = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];

  const normalizeMonth = (m) => m.toLowerCase().replace(".", "").trim();

  revenueByMonth = [...revenueByMonth].sort(
    (a, b) =>
      ordemMeses.indexOf(normalizeMonth(a.month)) -
      ordemMeses.indexOf(normalizeMonth(b.month))
  );

  revenueByMonth = revenueByMonth.map((m) => ({
    ...m,
    amount: Number(m.amount.toFixed(2)),
  }));

  topStores = [...topStores]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((s) => ({ ...s, amount: Number(s.amount.toFixed(2)) }));

  const chartLabels = revenueByMonth.map((r) => r.month);
  const chartData = revenueByMonth.map((r) => r.amount);

  const formatAlertDate = (label) => {
    // label vem como "2025-10-13"
    const d = new Date(label);
    if (Number.isNaN(d.getTime())) return label;
    return d.toLocaleDateString("pt-BR");
  };

  const topAnomalies = anomalies.slice(0, 5);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h1 className="dashboard-title">📊 Painel do Administrador</h1>
        <h2 className="dashboard-subtitle">
          Visão geral do desempenho da plataforma Cannoli
        </h2>

        {/* ===== FILTROS ===== */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          {/* filtro rápido */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label>Filtro rápido:</label>
            <select
              value={periodo}
              onChange={(e) => {
                // limpando datas customizadas ao trocar filtro rápido
                setStartDate("");
                setEndDate("");
                setPeriodo(e.target.value);
              }}
              className="period-filter"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 3 meses</option>
              <option value="365">Último ano</option>
            </select>
          </div>

          <span style={{ opacity: 0.7 }}>ou</span>

          {/* filtro personalizado */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span>Período personalizado:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>até</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button onClick={aplicarFiltroPersonalizado} className="btn-date">
              Aplicar
            </button>
          </div>
        </div>

        <ExportButtons data={revenueByMonth} />

        {/* ===== KPIs ===== */}
        <div className="kpi-grid">
          <div className="kpi-card orange">
            <h3>💰 Receita</h3>
            <p>{toBRL(summary.revenueMonth)}</p>
            {prediction !== null && (
              <small style={{ color: "#ddd" }}>
                🔮 Previsão IA: {toBRL(prediction)}
              </small>
            )}
          </div>

          <div className="kpi-card blue">
            <h3>📦 Pedidos (período)</h3>
            <p>{summary.ordersYear}</p>
          </div>

          <div className="kpi-card purple">
            <h3>🎟️ Ticket Médio</h3>
            <p>{toBRL(summary.avgTicket)}</p>
          </div>
        </div>

        {/* ===== ALERTAS IA ===== */}
        <div className="chart-full wide-chart">
          <h3>⚠️ Alertas Inteligentes (IA)</h3>
          {topAnomalies.length ? (
            <ul style={{ color: "#ffcc00", fontSize: "15px", lineHeight: 1.7 }}>
              {topAnomalies.map((a, i) => (
                <li key={i}>
                  <strong>{formatAlertDate(a.label)}</strong> —{" "}
                  {toBRL(a.amount)} (
                  {a.tipo === "acima" ? "📈 acima" : "📉 abaixo"} do esperado)
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "#ccc" }}>Nenhuma anomalia detectada ✔</p>
          )}
        </div>

        {/* ===== GRÁFICO RECEITA ===== */}
        <div className="chart-full wide-chart">
          <h3>📈 Receita Mensal</h3>
          <Chart
            type="line"
            height={380}
            options={{
              chart: { toolbar: { show: false } },
              stroke: { curve: "smooth", width: 4 },
              xaxis: {
                categories: chartLabels,
                labels: { style: { colors: "#ccc", fontSize: "14px" } },
              },
              yaxis: {
                labels: { style: { colors: "#ccc", fontSize: "14px" } },
              },
              markers: { size: 5 },
              grid: { padding: { right: 30 } },
              colors: ["#00e676"],
              theme: { mode: "dark" },
            }}
            series={[{ name: "Faturamento", data: chartData }]}
          />
        </div>

        {/* ===== TOP LOJAS ===== */}
        <div className="chart-full wide-chart">
          <h3>🏪 Lojas Mais Rentáveis (Top 5)</h3>
          <Chart
            type="bar"
            height={450}
            options={{
              chart: { toolbar: { show: false } },
              plotOptions: { bar: { horizontal: true, borderRadius: 6 } },
              xaxis: {
                categories: topStores.map((s) => s.store),
                labels: { style: { colors: "#ccc", fontSize: "13px" } },
              },
              theme: { mode: "dark" },
              colors: ["#00c8ff"],
            }}
            series={[
              {
                name: "Faturamento",
                data: topStores.map((s) => s.amount),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
