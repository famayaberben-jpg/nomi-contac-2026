/*
=========================================
CALCULADORA DE NOMINA - CONTACT CENTER 2026
=========================================
Depende de: convenio2026.js, irpf.js, seguridadsocial.js

Reglas del convenio (art. 47):
las tablas anuales incluyen 12 mensualidades + 2 pagas
extraordinarias (junio y diciembre), prorrateables.
=========================================
*/

const JORNADA_COMPLETA_SEMANAL = 39;

// Base maxima de cotizacion mensual. REVISAR cada año.
const BASE_MAXIMA_COTIZACION = 5101.20;

function redondear(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

/*
=========================================
CALCULO PRINCIPAL
=========================================
datos = {
  nivel, contrato, jornada, prorrata ("si"/"no"),
  plusIdioma (bool), horasNocturnas,
  diasTransporte, festivosNormales, festivosEspeciales,
  domingos, horasExtra, precioHoraExtra, otrosComplementos,
  diasTeletrabajo
}
=========================================
*/

function calcularNomina(datos) {

    const nivel = obtenerNivel(datos.nivel);

    if (!nivel) {
        throw new Error("Nivel profesional no válido");
    }

    const factor =
        (Number(datos.jornada) || JORNADA_COMPLETA_SEMANAL) /
        JORNADA_COMPLETA_SEMANAL;

    const num = v => Number(v) || 0;

    // ---- Salario base
    const salarioAnual =
        redondear(nivel.salarioAnual * factor);

    const prorrata = datos.prorrata === "si";

    const salarioBaseMes =
        redondear(salarioAnual / (prorrata ? 12 : 14));

    // ---- Complementos salariales del mes
    const plusIdioma =
        datos.plusIdioma
            ? redondear(obtenerPlusIdioma() * factor)
            : 0;

    const nocturnidad =
        redondear(num(datos.horasNocturnas) * obtenerPlusNocturnidad());

    const transporte =
        redondear(num(datos.diasTransporte) * obtenerPlusTransporte());

    const festivosNormales =
        redondear(num(datos.festivosNormales) * nivel.festivoNormal);

    const festivosEspeciales =
        redondear(num(datos.festivosEspeciales) * nivel.festivoEspecial);

    const domingos =
        redondear(num(datos.domingos) * nivel.domingo);

    const horasExtra =
        redondear(num(datos.horasExtra) * num(datos.precioHoraExtra));

    const otros = redondear(num(datos.otrosComplementos));

    const complementos =
        plusIdioma + nocturnidad + transporte +
        festivosNormales + festivosEspeciales +
        domingos + horasExtra + otros;

    const brutoSalarial =
        redondear(salarioBaseMes + complementos);

    // ---- Percepciones no salariales
    const teletrabajo =
        redondear(
            num(datos.diasTeletrabajo) *
            obtenerTeletrabajo(num(datos.jornada))
        );

    const noSalarial =
        redondear(teletrabajo);

    // ---- Seguridad Social
    // La base siempre incluye la parte proporcional de las extras.
    const baseCotizacion =
        Math.min(
            redondear(salarioAnual / 12 + complementos),
            BASE_MAXIMA_COTIZACION
        );

    const ss = calcularSeguridadSocial(
        baseCotizacion,
        datos.contrato
    );

    // ---- IRPF (proyeccion anual)
    const retribucionAnual =
        redondear(salarioAnual + complementos * 12);

    const irpf = calcularIRPF(
        brutoSalarial,
        retribucionAnual,
        ss.total * 12,
        datos.contrato
    );

    // ---- Neto
    const neto = redondear(
        brutoSalarial - ss.total - irpf.retencion + noSalarial
    );

    return {
        categoria: nivel.categoria,
        salarioAnual,
        salarioBaseMes,
        prorrata,
        complementos: {
            plusIdioma, nocturnidad, transporte,
            festivosNormales, festivosEspeciales,
            domingos, horasExtra, otros
        },
        brutoSalarial,
        noSalarial: { teletrabajo, total: noSalarial },
        ss,
        irpf,
        retribucionAnual,
        neto
    };
}

/*
=========================================
LECTURA DEL FORMULARIO
=========================================
*/

function leerFormulario() {

    const val = id => document.getElementById(id).value;

    return {
        nivel: val("nivel"),
        contrato: val("contrato"),
        jornada: val("jornada"),
        prorrata: val("prorrata"),
        plusIdioma: document.getElementById("plusIdioma").checked,
        horasNocturnas: val("horasNocturnas"),
        diasTransporte: val("diasTransporte"),
        festivosNormales: val("festivosNormales"),
        festivosEspeciales: val("festivosEspeciales"),
        domingos: val("domingos"),
        horasExtra: val("horasExtra"),
        precioHoraExtra: val("precioHoraExtra"),
        otrosComplementos: val("otrosComplementos"),
        diasTeletrabajo: val("diasTeletrabajo")
    };
}

/*
=========================================
PINTAR RESULTADO
=========================================
*/

function euros(n) {
    return n.toFixed(2).replace(".", ",") + " €";
}

function linea(texto, importe, clase = "") {
    return `
        <div class="linea ${clase}">
            <span>${texto}</span>
            <span>${euros(importe)}</span>
        </div>`;
}

function generarDetalleNomina(r) {

    const c = r.complementos;
    let html = `<h3>${r.categoria}</h3><hr>`;

    html += linea(
        r.prorrata
            ? "Salario base (con pagas prorrateadas)"
            : "Salario base mensual",
        r.salarioBaseMes
    );

    const filas = [
        ["Plus idioma", c.plusIdioma],
        ["Nocturnidad", c.nocturnidad],
        ["Plus transporte", c.transporte],
        ["Festivos normales", c.festivosNormales],
        ["Festivos especiales", c.festivosEspeciales],
        ["Domingos", c.domingos],
        ["Horas extra", c.horasExtra],
        ["Otros complementos", c.otros]
    ];

    // Los pluses se muestran siempre, aunque valgan 0
    filas.forEach(([t, v]) => {
        html += linea(t, v);
    });

    html += linea("Total devengado salarial", r.brutoSalarial, "total");
    html += "<hr>";

    html += generarHTMLSeguridadSocial(r.ss);

    html += `<hr>` + linea(
        `IRPF (${r.irpf.tipo.toFixed(2).replace(".", ",")} %)`,
        r.irpf.retencion,
        "red"
    );

    html += "<hr>";
    html += linea("Teletrabajo", r.noSalarial.teletrabajo);
    html += linea("Total no salarial", r.noSalarial.total);

    html += "<hr>" + linea("LÍQUIDO A PERCIBIR", r.neto, "total green");

    return html;
}

function mostrarResultado(r) {

    document.getElementById("bruto").textContent =
        euros(r.brutoSalarial);

    document.getElementById("ss").textContent =
        euros(r.ss.total);

    document.getElementById("irpf").textContent =
        euros(r.irpf.retencion);

    document.getElementById("neto").textContent =
        euros(r.neto);

    document.getElementById("detalleNomina").innerHTML =
        generarDetalleNomina(r);
}

if (typeof module !== "undefined") {
    module.exports = { calcularNomina, BASE_MAXIMA_COTIZACION };
}
