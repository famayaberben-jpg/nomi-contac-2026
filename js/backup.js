/*
=========================================
COPIA DE SEGURIDAD (EXPORTAR / IMPORTAR)
=========================================
Guarda y recupera en un archivo JSON:
- el histórico de nóminas
- el calendario laboral
=========================================
*/

const BACKUP_APP = "nomina-contact-center-2026";
const BACKUP_VERSION = 1;

function exportarCopiaSeguridad() {

    const copia = {
        app: BACKUP_APP,
        version: BACKUP_VERSION,
        fecha: new Date().toISOString(),
        historico: leerHistorico(),
        calendario: leerCalendario()
    };

    const blob = new Blob(
        [JSON.stringify(copia, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download =
        "copia-seguridad-nomina-" +
        new Date().toISOString().slice(0, 10) +
        ".json";

    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function validarCopiaSeguridad(copia) {

    if (!copia || typeof copia !== "object") {
        return "El archivo no tiene un formato válido.";
    }

    if (copia.app !== BACKUP_APP) {
        return "El archivo no es una copia de seguridad de esta aplicación.";
    }

    if (copia.version > BACKUP_VERSION) {
        return "La copia es de una versión más reciente de la aplicación.";
    }

    if (!Array.isArray(copia.historico)) {
        return "La copia no contiene un histórico válido.";
    }

    if (
        !copia.calendario ||
        typeof copia.calendario !== "object" ||
        Array.isArray(copia.calendario)
    ) {
        return "La copia no contiene un calendario válido.";
    }

    const camposHistorico = ["id", "fecha", "nivel", "categoria", "bruto", "ss", "irpf", "tipoIrpf", "neto"];

    const historicoOk = copia.historico.every(h =>
        h && camposHistorico.every(c => c in h)
    );

    if (!historicoOk) {
        return "Hay registros del histórico incompletos.";
    }

    const calendarioOk = Object.entries(copia.calendario).every(
        ([k, v]) =>
            /^\d{4}-\d{2}-\d{2}$/.test(k) &&
            TIPOS_DIA.includes(v)
    );

    if (!calendarioOk) {
        return "Hay días del calendario con datos no válidos.";
    }

    return null;
}

async function importarCopiaSeguridad(archivo) {

    if (!archivo) return;

    let copia;

    try {
        copia = JSON.parse(await archivo.text());
    } catch (e) {
        alert("No se pudo leer el archivo: no es un JSON válido.");
        return;
    }

    const error = validarCopiaSeguridad(copia);

    if (error) {
        alert(error);
        return;
    }

    const confirmar = confirm(
        "Se van a SUSTITUIR los datos actuales por los de la copia:\n\n" +
        `• ${copia.historico.length} nóminas en el histórico\n` +
        `• ${Object.keys(copia.calendario).length} días marcados en el calendario\n\n` +
        "¿Continuar?"
    );

    if (!confirmar) return;

    escribirHistorico(copia.historico);
    escribirCalendario(copia.calendario);

    mostrarHistorico();
    mostrarCalendario();

    if (typeof mostrarGrafico === "function") mostrarGrafico();

    alert("Copia de seguridad importada correctamente.");
}
