import React, { useEffect, useState } from "react";
import ClientSidebar from "../components/ClientSidebar";
import api from "../services/api";
import Chart from "react-apexcharts";
import "../styles/theme.css";

export default function ClienteDashboard() {
  const [data, setData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [periodoIA, setPeriodoIA] = useState("");
  const [anomalies, setAnomalies] = useState([]);

  // === FILTRO RÁPIDO ===
  const [periodo, setPeriodo] = useState("30");

  // === FILTRO PERSONALIZADO ===
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const toBRL = (v) =>
    Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  async function loadDashboard() {
  try {
    let url = `/client-dashboard?email=barbosaleandro@cunha.br&dias=${periodo}`;

    let diasIA = Number(periodo);

    if (startDate && endDate) {
      url = `/client-dashboard?email=barbosaleandro@cunha.br&start=${startDate}&end=${endDate}`;

      const ini = new Date(startDate);
      const fim = new Date(endDate);

      const diffMs = fim - ini;
      diasIA = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    const res = await api.get(url);
    setData(res.data);

    const store = encodeURIComponent(res.data.summary?.name || "");

    const [pred, an] = await Promise.all([
      api.get(`/ml/predict-revenue?dias=${diasIA}&storeName=${store}`),
      api.get(`/ml/anomalies?dias=${diasIA}&storeName=${store}`)
    ]);

    setPrediction(pred.data.previsaoProximoPeriodo);
    setPeriodoIA(pred.data.periodo);
    setAnomalies(an.data.anomalies || []);

  } catch (err) {
    console.log("Erro ao carregar ClienteDashboard:", err);
  }
}


  useEffect(() => {
    loadDashboard();
  }, [periodo]);

  function aplicarFiltroPersonalizado() {
    if (!startDate || !endDate) {
      alert("Escolha o período completo!");
      return;
    }
    loadDashboard();
  }

  if (!data) return <div className="loading">Carregando...</div>;

  const { summary, chartData, pedidosRecentes, campanhasRecentes } = data;

  // === ORDENAR MESES ===
  const ordemMeses = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez"
  ];

  const normalize = (m) => m.toLowerCase().replace(".", "").trim();

  const chartSorted = chartData.sort(
    (a, b) =>
      ordemMeses.indexOf(normalize(a.month)) -
      ordemMeses.indexOf(normalize(b.month))
  );

  return (
    <div className="dashboard-container">
      <ClientSidebar />

      <div className="dashboard-content">
        <h1 className="dashboard-title">👋 Olá, {summary.name}!</h1>
        <h2 className="dashboard-subtitle">Visão geral da sua loja</h2>

        {/* ===================== FILTROS ===================== */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          
          <div>
            <label>Filtro rápido:</label>
            <select
              className="period-filter"
              value={periodo}
              onChange={(e) => {
                setStartDate("");
                setEndDate("");
                setPeriodo(e.target.value);
              }}
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 3 meses</option>
              <option value="365">Último ano</option>
            </select>
          </div>

          <div>
            <label>Período personalizado:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span style={{ margin: "0 10px" }}>até</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <button className="btn-date" onClick={aplicarFiltroPersonalizado}>Aplicar</button>
          </div>
        </div>

        {/* ===================== KPIs ===================== */}
        <div className="kpi-grid">
          <div className="kpi-card orange">
            <h3>💸 Faturamento</h3>
            <p>{toBRL(summary.totalSpent)}</p>
            <small style={{ color: "#eee" }}>
              🔮 Previsão IA ({periodoIA}): {toBRL(prediction)}
            </small>
          </div>

          <div className="kpi-card blue">
            <h3>📦 Pedidos</h3>
            <p>{summary.totalOrders}</p>
          </div>

          <div className="kpi-card purple">
            <h3>⭐ Categoria</h3>
            <p>{summary.fidelity}</p>
          </div>
        </div>

        {/* ===================== ALERTAS ===================== */}
        <div className="chart-full">
          <h3>⚠️ Alertas Inteligentes (IA)</h3>
          {anomalies.length ? (
            <ul style={{ color: "#ffc107" }}>
              {anomalies.map((a, i) => (
                <li key={i}>
                  Dia {a.label} — {toBRL(a.amount)} (
                  {a.tipo === "acima" ? "📈 acima" : "📉 abaixo"})
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "#ccc" }}>Nenhum alerta detectado ✔</p>
          )}
        </div>

        {/* ===================== GRÁFICO ===================== */}
        <div className="chart-full">
          <h3>📈 Faturamento Mensal</h3>
          <Chart
            type="line"
            height={320}
            series={[
              {
                name: "Faturamento (R$)",
                data: chartSorted.map((m) => m.amount),
              },
            ]}
            options={{
              xaxis: {
                categories: chartSorted.map((m) => m.month),
                labels: { style: { colors: "#fff" } },
              },
              colors: ["#4CAF50"],
              stroke: { curve: "smooth", width: 3 },
              theme: { mode: "dark" },
            }}
          />
        </div>

        {/* ===================== ÚLTIMOS PEDIDOS ===================== */}
        <div className="chart-full">
          <h3>🛍️ Últimos pedidos</h3>
          {pedidosRecentes.length ? (
            <table className="table-orders">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {pedidosRecentes.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>{toBRL(p.value)}</td>
                    <td>{p.status}</td>
                    <td>{new Date(p.date).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-orders">Nenhum pedido recente.</p>
          )}
        </div>

        {/* ===================== CAMPANHAS ===================== */}
        <div className="chart-full">
          <h3>💡 Campanhas Recentes</h3>
          <ul style={{ color: "#ccc" }}>
            {campanhasRecentes.map((c, idx) => (
              <li key={idx}>
                <strong>{c.nome}</strong> — {c.tipo} ({c.status})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
