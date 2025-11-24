import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import Chart from "react-apexcharts";
import "../styles/theme.css";

export default function CampaignSimulator() {
  const [form, setForm] = useState({
    discount: 0.1,
    channel: "IFOOD",
    storeName: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "discount" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await api.post("/campaign/simulate", form);
      setResult(res.data);
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Erro ao simular campanha. Verifique os dados."
      );
    } finally {
      setLoading(false);
    }
  }

  const hasResult = !!result;

  function percentColor(value) {
    if (value > 0) return "#6DFF8A";
    if (value < 0) return "#ff7676";
    return "#ccc";
  }

  const toBRL = (v) =>
    Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="dashboard-content" style={{ maxWidth: "1100px" }}>
        <h1 className="dashboard-title">🎯 Simulador de Campanhas</h1>
        <p className="dashboard-subtitle">
          Avalie o impacto de campanhas promocionais antes de aplicá-las.
        </p>

        {/* FORM CONFIG */}
        <div className="chart-full" style={{ padding: "25px", marginBottom: "20px" }}>
          <h3 className="chart-title">Configuração da campanha</h3>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              marginTop: "15px",
            }}
          >
            {/* CANAL */}
            <div className="form-group">
              <label>Canal da campanha</label>
              <select
                name="channel"
                value={form.channel}
                onChange={handleChange}
                className="input-dark"
              >
                <option value="IFOOD">iFood</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="DELIVERYVIP">Delivery VIP</option>
                <option value="SMS">SMS</option>
                <option value="EMAIL">E-mail</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>

            {/* DESCONTO */}
            <div className="form-group">
              <label>Desconto (%)</label>
              <input
                type="number"
                min="0"
                max="70"
                step="1"
                name="discount"
                value={form.discount * 100}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "discount",
                      value: Number(e.target.value) / 100,
                    },
                  })
                }
                className="input-dark"
                placeholder="0 a 70%"
              />
            </div>

            {/* LOJA */}
            <div className="form-group" style={{ flex: 1 }}>
              <label>Loja alvo (opcional)</label>
              <input
                name="storeName"
                placeholder="Ex.: Masseria di Paolo"
                value={form.storeName}
                onChange={handleChange}
                className="input-dark"
              />
              <small style={{ color: "#888" }}>
                Deixe vazio para aplicar em todas as lojas.
              </small>
            </div>

            <div style={{ width: "100%", marginTop: "10px" }}>
              <button className="btn-green" disabled={loading}>
                {loading ? "Simulando..." : "Simular impacto"}
              </button>
            </div>
          </form>
        </div>

        {/* RESULTADOS */}
        {hasResult && (
          <>
            {/* KPIs ATUAIS */}
            <div className="kpi-grid">
              <div className="kpi-card orange">
                <h3>💰 Receita atual</h3>
                <p>{toBRL(result.baseline.revenue)}</p>
              </div>
              <div className="kpi-card blue">
                <h3>📦 Pedidos atuais</h3>
                <p>{result.baseline.orders}</p>
              </div>
              <div className="kpi-card purple">
                <h3>🎟 Ticket médio atual</h3>
                <p>{toBRL(result.baseline.avgTicket)}</p>
              </div>
            </div>

            {/* KPIs PREVISTOS */}
            <div className="kpi-grid" style={{ marginTop: "15px" }}>
              <div className="kpi-card green">
                <h3>🚀 Receita prevista</h3>
                <p>
                  {toBRL(result.simulated.revenue)}{" "}
                  <span style={{ color: percentColor(result.deltas.revenuePercent) }}>
                    ({result.deltas.revenuePercent}%)
                  </span>
                </p>
              </div>

              <div className="kpi-card blue">
                <h3>📈 Pedidos previstos</h3>
                <p>
                  {result.simulated.orders}{" "}
                  <span style={{ color: percentColor(result.deltas.ordersPercent) }}>
                    ({result.deltas.ordersPercent}%)
                  </span>
                </p>
              </div>

              <div className="kpi-card purple">
                <h3>🎟 Ticket médio previsto</h3>
                <p>{toBRL(result.simulated.avgTicket)}</p>
              </div>
            </div>

            {/* GRÁFICO */}
            <div className="chart-full" style={{ marginTop: "30px" }}>
              <h3 className="chart-title">Comparativo de Receita</h3>
              <Chart
                type="bar"
                height={330}
                options={{
                  chart: { toolbar: { show: false } },
                  xaxis: { categories: ["Atual", "Prevista"] },
                  colors: ["#00e676"],
                  theme: { mode: "dark" },
                }}
                series={[
                  {
                    name: "Receita",
                    data: [
                      result.baseline.revenue,
                      result.simulated.revenue,
                    ],
                  },
                ]}
              />
            </div>

            {/* INSIGHT */}
            <div
              className="chart-full"
              style={{
                marginTop: "25px",
                borderLeft: "4px solid #00E676",
                padding: "15px 20px",
              }}
            >
              <h3 className="chart-title">🧠 Insight da simulação</h3>
              <p style={{ color: "#ccc", fontSize: "15px" }}>
                {result.explanation}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
  