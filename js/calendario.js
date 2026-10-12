/*
=========================================
CALENDARIO LABORAL
=========================================
Pulsa un dia para cambiar su tipo:
oficina > teletrabajo > vacaciones > libre > baja > formacion > (vacio)
Se guarda en localStorage. Los dias de teletrabajo se pueden
volcar al campo "Dias teletrabajo" de la nomina.
=========================================
*/

const CLAVE_CALENDARIO = "nomina_calendario_2026";

const TIPOS_DIA = [
    "", "oficina", "teletrabajo", "vacaciones",
    "libre", "baja", "formacion"
];

const ETIQUETAS_DIA = {
    oficina: "Oficina",
    teletrabajo: "Teletrabajo",
    vacaciones: "Vacaciones",
    libre: "Libre",
    baja: "Baja",
    formacion: "Formación"
};

let calendarioFecha = new Date();

function leerCalendario() {
    try {
        return JSON.parse(
            localStorage.getItem(CLAVE_CALENDARIO) || "{}"
        );
    } catch (e) {
        return {};
    }
}

function escribirCalendario(datos) {
    try {
        localStorage.setItem(
            CLAVE_CALENDARIO,
            JSON.stringify(datos)
        );
    } catch (e) {
        console.warn("No se pudo guardar el calendario", e);
    }
}

function claveDia(anio, mes, dia) {
    return `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function contarTeletrabajoMes(anio, mes) {
    const datos = leerCalendario();
    const prefijo = `${anio}-${String(mes + 1).padStart(2, "0")}-`;
    return Object.keys(datos).filter(
        k => k.startsWith(prefijo) && datos[k] === "teletrabajo"
    ).length;
}

function cambiarMesCalendario(delta) {
    calendarioFecha = new Date(
        calendarioFecha.getFullYear(),
        calendarioFecha.getMonth() + delta,
        1
    );
    mostrarCalendario();
}

function mostrarCalendario() {

    const cont = document.getElementById("calendarioContainer");
    if (!cont) return;

    const anio = calendarioFecha.getFullYear();
    const mes = calendarioFecha.getMonth();
    const datos = leerCalendario();

    const nombreMes = calendarioFecha.toLocaleDateString(
        "es-ES", { month: "long", year: "numeric" }
    );

    const primerDia = (new Date(anio, mes, 1).getDay() + 6) % 7; // lunes = 0
    const diasMes = new Date(anio, mes + 1, 0).getDate();

    let html = `
        <div style="grid-column:1/-1" class="linea">
            <button data-mes="-1">◀</button>
            <strong style="text-transform:capitalize">${nombreMes}</strong>
            <button data-mes="1">▶</button>
        </div>`;

    ["L", "M", "X", "J", "V", "S", "D"].forEach(d => {
        html += `<div style="text-align:center;font-weight:700">${d}</div>`;
    });

    for (let i = 0; i < primerDia; i++) html += "<div></div>";

    for (let d = 1; d <= diasMes; d++) {
        const tipo = datos[claveDia(anio, mes, d)] || "";
        html += `
            <div class="dia ${tipo}" data-dia="${d}">
                <strong>${d}</strong><br>
                <small>${ETIQUETAS_DIA[tipo] || ""}</small>
            </div>`;
    }

    const tele = contarTeletrabajoMes(anio, mes);

    html += `
        <div style="grid-column:1/-1" class="linea">
            <span>Días de teletrabajo este mes: <strong>${tele}</strong></span>
            <button id="btnVolcarTele">Usar en la nómina</button>
        </div>`;

    cont.innerHTML = html;

    cont.querySelectorAll("[data-mes]").forEach(b =>
        b.addEventListener("click", () =>
            cambiarMesCalendario(Number(b.dataset.mes))
        )
    );

    cont.querySelectorAll("[data-dia]").forEach(el =>
        el.addEventListener("click", () => {
            const k = claveDia(anio, mes, Number(el.dataset.dia));
            const actual = TIPOS_DIA.indexOf(datos[k] || "");
            const siguiente = TIPOS_DIA[(actual + 1) % TIPOS_DIA.length];
            if (siguiente) datos[k] = siguiente; else delete datos[k];
            escribirCalendario(datos);
            mostrarCalendario();
        })
    );

    const btn = document.getElementById("btnVolcarTele");
    if (btn) {
        btn.addEventListener("click", () => {
            document.getElementById("diasTeletrabajo").value = tele;
            alert(`Se han copiado ${tele} días de teletrabajo a la pestaña Nómina.`);
        });
    }
}
