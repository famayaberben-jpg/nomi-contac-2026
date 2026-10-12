/*
=========================================
APP - PESTAÑAS, EVENTOS Y GRAFICO
=========================================
*/

let ultimoResultado = null;
let ultimosDatos = null;
let graficoNeto = null;

function activarPestana(nombre) {

    document.querySelectorAll(".tab").forEach(t =>
        t.classList.toggle("active", t.id === nombre)
    );

    document.querySelectorAll("nav button").forEach(b =>
        b.classList.toggle("active", b.dataset.tab === nombre)
    );

    if (nombre === "historico") mostrarHistorico();
    if (nombre === "calendario") mostrarCalendario();
    if (nombre === "estadisticas") mostrarGrafico();
}

function mostrarGrafico() {

    const canvas = document.getElementById("graficoNeto");

    if (!canvas || typeof Chart === "undefined") return;

    const lista = leerHistorico();

    const etiquetas = lista.map(h =>
        new Date(h.fecha).toLocaleDateString("es-ES")
    );

    if (graficoNeto) graficoNeto.destroy();

    graficoNeto = new Chart(canvas, {
        type: "bar",
        data: {
            labels: etiquetas,
            datasets: [
                { label: "Bruto", data: lista.map(h => h.bruto), backgroundColor: "#90caf9" },
                { label: "Neto", data: lista.map(h => h.neto), backgroundColor: "#2e7d32" }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: lista.length === 0,
                    text: "Calcula y guarda nóminas para ver la evolución"
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll("nav button").forEach(b =>
        b.addEventListener("click", () => activarPestana(b.dataset.tab))
    );

    document.getElementById("btnCalcular").addEventListener("click", () => {
        try {
            ultimosDatos = leerFormulario();
            ultimoResultado = calcularNomina(ultimosDatos);
            mostrarResultado(ultimoResultado);
            guardarEnHistorico(ultimoResultado, ultimosDatos);
        } catch (e) {
            alert("Error en el cálculo: " + e.message);
        }
    });

    document.getElementById("btnPDF").addEventListener("click", () =>
        exportarPDF(ultimoResultado)
    );

    document.getElementById("btnExportar").addEventListener("click",
        exportarCopiaSeguridad
    );

    const inputImportar = document.getElementById("archivoImportar");

    document.getElementById("btnImportar").addEventListener("click", () =>
        inputImportar.click()
    );

    inputImportar.addEventListener("change", async () => {
        await importarCopiaSeguridad(inputImportar.files[0]);
        inputImportar.value = "";
    });

    activarPestana("nomina");
});
