import { useEffect } from "react";
import { Cliente, RazonSocial, Venta } from "../Interfaces/Interfaces";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logoAkha from "@/src/assets/img/logoakha.png";
import { convertirPesos } from "../utils/constantes";

interface FormatoResumenProps {
  venta: Venta;
  razonSocial: RazonSocial;
  contribuyente: Cliente;
}

const ReciboPago = ({ venta, razonSocial, contribuyente }: FormatoResumenProps) => {
  useEffect(() => {
    const doc = new jsPDF({ format: "letter" });
    const fecha = venta.FechaRegistro
      ? new Date(venta.FechaRegistro).toLocaleDateString("es-MX", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

    // === Logo ===
    doc.addImage(logoAkha.src, "PNG", 20, 10, 40, 20);

    // === Título ===
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("RECIBO DE PAGO", 105, 20, { align: "center" });

    // === Datos empresa ===
    doc.setFontSize(11);
    doc.text(razonSocial.RazonSocial || "", 105, 28, { align: "center" });
    doc.text(`RFC: ${razonSocial.RFC || ""}`, 105, 34, { align: "center" });

    // === Datos del recibo ===
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Folio: ${venta.Folio || "N/A"}`, 160, 15);
    doc.text(`Fecha: ${fecha}`, 160, 21);

    // === Datos del cliente (si es diferente a la empresa) ===
    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", 20, 45);
    doc.setFont("helvetica", "normal");
    doc.text(contribuyente.RazonSocial || "", 20, 50);
    doc.text(`RFC: ${contribuyente.RFC || ""}`, 20, 55);

    // === Tabla de pagos ===
    const tablaPagos =
      venta.Pagos?.map((pago) => [
        pago.Descripcion || "",
        convertirPesos(pago.Subtotal || 0),
        convertirPesos(pago.IVA || 0),
        convertirPesos(pago.Cantidad || 0),
      ]) || [];

    autoTable(doc, {
      startY: 65,
      head: [["Descripción", "Subtotal", "IVA", "Cantidad"]],
      body: [
        ...tablaPagos,
        ["", "", "Total", convertirPesos(venta.Total || 0)],
      ],
      theme: "grid",
      styles: {
        fontSize: 10,
        halign: "right",
      },
      columnStyles: {
        0: { halign: "left", fontStyle: "bold", cellWidth: 100 },
        1: { cellWidth: "auto" },
        2: { cellWidth: "auto" },
        3: { cellWidth: "auto" },
      },
      headStyles: {
        fillColor: [0, 51, 153],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
    });

    // === Leyenda de pago recibido ===
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "normal");
    doc.text("Este recibo no tiene validez fiscal y no lo exime de sus responsabilidades antereiores o posteriores.", 20, finalY);

    // === Descargar PDF ===
    doc.save(`recibo_pago_${venta.Folio || "venta"}.pdf`);
  }, []);

  return null;
};

export default ReciboPago;
