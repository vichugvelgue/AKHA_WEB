import { useEffect } from "react";
import { Cliente, ResumenEjecutivo } from "../Interfaces/Interfaces";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logoAkha from "@/src/assets/img/logoakha.png";

interface FormatoResumenProps {
  resumen: ResumenEjecutivo;
  contribuyente: Cliente;
}

const FormatoResumenEjecutivo = ({ resumen,contribuyente }: FormatoResumenProps) => {
  useEffect(() => {
    const doc = new jsPDF({ format: "letter" });
    debugger
      let fecha = resumen.FechaRegistro ? new Date(resumen.FechaRegistro).toLocaleDateString("es-MX", { year: "numeric", month: "long" }) : ""

    // === Logo ===
    doc.addImage(logoAkha.src, "PNG", 80, 10, 50, 20);

    // === Nombre empresa / RFC / Mes ===
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(contribuyente.RazonSocial || "", 105, 40, { align: "center" });
    doc.text(contribuyente.RFC || "", 105, 47, { align: "center" });
    doc.text(fecha.toUpperCase(), 105, 55, { align: "center" });

    // === Encabezado azul ===
    autoTable(doc, {
      startY: 65,
      head: [["Resumen Ejecutivo de tu Contabilidad"]],
      body: [],
      theme: "plain",
      styles: {
        halign: "center",
        valign: "middle",
        fontSize: 12,
        textColor: [255, 255, 255],
        fillColor: [0, 51, 153], // Azul corporativo
      },
      headStyles: {
        halign: "center",
        fillColor: [0, 51, 153],
        fontStyle: "bold",
      },
    });

    // === Tabla de contenido ===
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY,
      body: [
        ["Ingresos", resumen.Ingresos || ""],
        ["Egresos", resumen.Egresos || ""],
        ["Nóminas, IMSS, INFONAVIT", resumen.Nominas || ""],
        ["Pagos de Impuestos Federales", resumen.ImpuestosFederales || ""],
      ],
      theme: "grid",
      styles: {
        fontSize: 10,
        valign: "middle",
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: "bold" }, // primera columna fija
        1: { cellWidth: "auto" }, // segunda columna flexible
      },
    });

    // Descargar el PDF
    doc.save("resumen_ejecutivo.pdf");
  }, [resumen]);

  return null;
};

export default FormatoResumenEjecutivo;
