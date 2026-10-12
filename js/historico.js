/*
=========================================
HISTORICO DE NOMINAS
=========================================
Se guarda en localStorage del navegador.
=========================================
*/

const CLAVE_HISTORICO = "nomina_historico_2026";

function leerHistorico() {
    try {
        return JSON.parse(
            localStorage.getItem(CLAVE_HISTORICO) || "[]"
        );
    } catch (e) {
        return [];
    }
}

function escribirHistorico(lista) {
    try {
        localStorage.setItem(
            CLAVE_HISTORICO,
            JSON.stringify(lista)
        );
    } catch (e) {
        console.warn("No se pudo guardar el histórico", e);
    }
}

function guardarEnHistorico(resultado, datos) {

    const lista = leerHistorico();

    lista.push({
        id: Date.now(),
        fecha: new Date().toISOString(),
        nivel: datos.nivel,
        categoria: resultado.categoria,
        bruto: resultado.brutoSalarial,
        ss: resultado.ss.total,
        irpf: resultado.irpf.retencion,
        tipoIrpf: resultado.irpf.tipo,
        neto: resultado.neto
    });

    escribirHistorico(lista);
    mostrarHistorico();
}

function borrarDelHistorico(id) {
    escribirHistorico(
        leerHistorico().filter(h => h.id !== id)
    );
    mostrarHistorico();
}

function mostrarHistorico() {

    const cont = document.getElementById("historicoListado");
    if (!cont) return;

    const lista = leerHistorico().slice().reverse();

    if (lista.length === 0) {
        cont.innerHTML = "<p>Todavía no hay nóminas guardadas.</p>";
        return;
    }

    cont.innerHTML = lista.map(h => `
        <div class="hist-item">
            <div class="linea">
                <strong>${new Date(h.fecha).toLocaleString("es-ES")}</strong>
                <button data-borrar="${h.id}">🗑️</button>
            </div>
            <div>Nivel ${h.nivel} · ${h.categoria}</div>
            <div class="linea"><span>Bruto</span><span>${h.bruto.toFixed(2)} €</span></div>
            <div class="linea"><span>Seguridad Social</span><span>${h.ss.toFixed(2)} €</span></div>
            <div class="linea"><span>IRPF (${h.tipoIrpf.toFixed(2)} %)</span><span>${h.irpf.toFixed(2)} €</span></div>
            <div class="linea total green"><span>Neto</span><span>${h.neto.toFixed(2)} €</span></div>
        </div>
    `).join("");

    cont.querySelectorAll("[data-borrar]").forEach(b => {
        b.addEventListener("click", () =>
            borrarDelHistorico(Number(b.dataset.borrar))
        );
    });
}
