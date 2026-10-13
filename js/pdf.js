/*
=========================================
EXPORTAR NOMINA A PDF (jsPDF)
=========================================
*/

function exportarPDF(r) {

    if (!r) {
        alert("Primero calcula la nómina.");
        return;
    }

    if (!window.jspdf) {
        alert("No se pudo cargar la librería de PDF. Comprueba la conexión.");
        return;
    }

    const doc = new window.jspdf.jsPDF();
    const f = n => n.toFixed(2).replace(".", ",") + " EUR";

    let y = 20;

    const linea = (texto, importe, negrita = false) => {
        doc.setFont("helvetica", negrita ? "bold" : "normal");
        doc.text(texto, 20, y);
        if (importe !== undefined) doc.text(f(importe), 190, y, { align: "right" });
        y += 8;
    };

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Simulacion de nomina - Contact Center 2026", 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(r.categoria, 20, y);
    y += 6;
    doc.text("Fecha: " + new Date().toLocaleDateString("es-ES"), 20, y);
    y += 12;

    doc.setFontSize(11);

    linea("Salario base mensual", r.salarioBaseMes);

    const c = r.complementos;
    [
        ["Plus idioma", c.plusIdioma],
        ["Nocturnidad", c.nocturnidad],
        ["Plus transporte", c.transporte],
        ["Festivos normales", c.festivosNormales],
        ["Festivos especiales", c.festivosEspeciales],
        ["Domingos", c.domingos],
        ["Horas extra", c.horasExtra],
        ["Otros complementos", c.otros]
    ].forEach(([t, v]) => linea(t, v));

    linea("Total devengado salarial", r.brutoSalarial, true);
    y += 4;

    linea("Contingencias comunes", r.ss.contingenciasComunes);
    linea("Desempleo", r.ss.desempleo);
    linea("Formacion profesional", r.ss.formacionProfesional);
    linea("MEI", r.ss.mei);
    linea("Total Seguridad Social", r.ss.total, true);
    y += 4;

    linea(`IRPF (${r.irpf.tipo.toFixed(2).replace(".", ",")} %)`, r.irpf.retencion, true);
    y += 4;

    linea("Teletrabajo", r.noSalarial.teletrabajo);
    linea("Total no salariales", r.noSalarial.total, true);
    y += 4;

    doc.setFontSize(13);
    linea("LIQUIDO A PERCIBIR", r.neto, true);

    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(
        "Documento orientativo. No sustituye a la nomina oficial de la empresa.",
        20, 280
    );

    doc.save("nomina-contact-center-2026.pdf");
}
