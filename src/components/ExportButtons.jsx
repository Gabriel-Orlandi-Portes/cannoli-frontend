import React from "react";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ExportButtons({ data }) {
  const exportCSV = () => {
    const csv = [
      ["Mês", "Valor (R$)"],
      ...data.map((d) => [d.month, d.amount.toFixed(2)]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "relatorio_cannoli.csv";
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Gastos - Cannoli", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [["Mês", "Valor (R$)"]],
      body: data.map((d) => [d.month, d.amount.toFixed(2)]),
    });
    doc.save("relatorio_cannoli.pdf");
  };

  return (
    <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
      <button
        onClick={exportCSV}
        style={{
          padding: "8px 12px",
          borderRadius: "6px",
          background: "#00E676",
          color: "#000",
          border: "none",
          cursor: "pointer",
        }}
      >
        <Download size={16} /> Exportar CSV
      </button>

      <button
        onClick={exportPDF}
        style={{
          padding: "8px 12px",
          borderRadius: "6px",
          background: "#7C4DFF",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        <Download size={16} /> Exportar PDF
      </button>
    </div>
  );
}
