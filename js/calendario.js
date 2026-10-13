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

/*
Cuenta, para el mes indicado, lo que se paga en nómina según el convenio
(art. 49): festivos normales y especiales trabajados, y domingos trabajados.
Un día cuenta como trabajado si está marcado como Oficina o Teletrabajo.
No se acumulan domingo y festivo especial: prevalece el especial.
*/
function resumenMes(anio, mes, datos) {

    const fest = festivosDelAnio(anio);

    const r = { tele: 0, festivosNormales: 0, festivosEspeciales: 0, domingos: 0 };

    const dias = new Date(anio, mes + 1, 0).getDate();

    for (let d = 1; d <= dias; d++) {

        const clave = claveDia(anio, mes, d);
        const tipo = datos[clave];

        if (tipo !== "oficina" && tipo !== "teletrabajo") continue;

        if (tipo === "teletrabajo") r.tele++;

        const f = fest[clave];
        const esDomingo = new Date(anio, mes, d).getDay() === 0;

        if (f && f.especial) {
            r.festivosEspeciales++;
        } else {
            if (f) r.festivosNormales++;
            if (esDomingo) r.domingos++;
        }
    }

    return r;
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
            <strong>${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)}</strong>
            <button data-mes="1">▶</button>
        </div>`;

    ["L", "M", "X", "J", "V", "S", "D"].forEach(d => {
        html += `<div style="text-align:center;font-weight:700">${d}</div>`;
    });

    for (let i = 0; i < primerDia; i++) html += "<div></div>";

    const fest = festivosDelAnio(anio);

    for (let d = 1; d <= diasMes; d++) {
        const clave = claveDia(anio, mes, d);
        const tipo = datos[clave] || "";
        const f = fest[clave];
        html += `
            <div class="dia ${tipo}${f ? " festivo" : ""}" data-dia="${d}"${f ? ` title="${f.nombre}"` : ""}>
                <strong>${d}</strong><br>
                <small>${ETIQUETAS_DIA[tipo] || ""}</small>
                ${f ? `<small class="nombre-festivo">${f.nombre}</small>` : ""}
            </div>`;
    }

    // Lista de festivos del mes
    const prefijo = `${anio}-${String(mes + 1).padStart(2, "0")}-`;
    const festivosMes = Object.keys(fest).filter(k => k.startsWith(prefijo)).sort();

    html += `<div style="grid-column:1/-1">
        <h3 style="margin:10px 0 6px">Festivos del mes</h3>`;

    if (festivosMes.length === 0) {
        html += "<p>Este mes no tiene festivos.</p>";
    } else {
        festivosMes.forEach(k => {
            const f = fest[k];
            const dia = new Date(anio, mes, Number(k.slice(8))).toLocaleDateString(
                "es-ES", { weekday: "long", day: "numeric" }
            );
            html += `
                <div class="linea">
                    <span style="text-transform:capitalize;white-space:nowrap">${dia}</span>
                    <span style="text-align:right">${f.nombre} · ${f.ambito}${f.especial ? " · especial" : ""}</span>
                </div>`;
        });
    }

    html += `<p style="margin-top:8px;font-size:.8rem;color:var(--text-light)">
        Borde rojo = festivo. ${notaFestivos(anio)}</p></div>`;

    // Resumen para la nómina
    const r = resumenMes(anio, mes, datos);

    html += `
        <div style="grid-column:1/-1">
            <div class="linea"><span>Días de teletrabajo</span><strong>${r.tele}</strong></div>
            <div class="linea"><span>Festivos normales trabajados</span><strong>${r.festivosNormales}</strong></div>
            <div class="linea"><span>Festivos especiales trabajados</span><strong>${r.festivosEspeciales}</strong></div>
            <div class="linea"><span>Domingos trabajados</span><strong>${r.domingos}</strong></div>
            <p style="margin:6px 0;font-size:.8rem;color:var(--text-light)">
                Cuentan como trabajados los días marcados como Oficina o Teletrabajo.
                Los días 24 y 31 de diciembre desde las 20:00 no se calculan solos.
            </p>
            <button id="btnVolcarTele" style="width:100%;padding:12px;border:none;border-radius:10px;background:var(--primary);color:#fff;font-weight:700;cursor:pointer">
                Usar en la nómina
            </button>
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
            document.getElementById("diasTeletrabajo").value = r.tele;
            document.getElementById("festivosNormales").value = r.festivosNormales;
            document.getElementById("festivosEspeciales").value = r.festivosEspeciales;
            document.getElementById("domingos").value = r.domingos;
            alert(
                "Copiado a la pestaña Nómina:\n\n" +
                `• Teletrabajo: ${r.tele} días\n` +
                `• Festivos normales: ${r.festivosNormales}\n` +
                `• Festivos especiales: ${r.festivosEspeciales}\n` +
                `• Domingos: ${r.domingos}`
            );
        });
    }
}
