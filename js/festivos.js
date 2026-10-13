/*
=========================================
CALENDARIO LABORAL - ANDALUCIA Y JEREZ DE LA FRONTERA
=========================================
Fuentes oficiales:
- 2026: Decreto 101/2025, de 14 de mayo (BOJA nº 93, 19/05/2025).
        Fiestas locales: Resolución de 6 de octubre de 2025, de la
        Dirección General de Trabajo, Seguridad y Salud Laboral
        (BOJA nº 197, 14/10/2025): Jerez de la Frontera,
        11 de mayo y 24 de septiembre.
- 2027: Decreto 84/2026, de 29 de abril (BOJA nº 84, 05/05/2026).
        Las fiestas locales de 2027 se publicarán en una resolución
        posterior: cuando salgan, añadirlas en FIESTAS_LOCALES_JEREZ.

"especial": festivos especiales del art. 49.2 del Convenio de Contact
Center (25 de diciembre, 1 y 6 de enero). Los días 24 y 31 de
diciembre desde las 20:00 también lo son, pero dependen de la hora
y no se calculan aquí.
=========================================
*/

const FIESTAS_ANDALUCIA = {

    2026: [
        { fecha: "2026-01-01", nombre: "Año Nuevo", ambito: "Nacional", especial: true },
        { fecha: "2026-01-06", nombre: "Epifanía del Señor", ambito: "Nacional", especial: true },
        { fecha: "2026-02-28", nombre: "Día de Andalucía", ambito: "Andalucía" },
        { fecha: "2026-04-02", nombre: "Jueves Santo", ambito: "Andalucía" },
        { fecha: "2026-04-03", nombre: "Viernes Santo", ambito: "Nacional" },
        { fecha: "2026-05-01", nombre: "Fiesta del Trabajo", ambito: "Nacional" },
        { fecha: "2026-08-15", nombre: "Asunción de la Virgen", ambito: "Nacional" },
        { fecha: "2026-10-12", nombre: "Fiesta Nacional de España", ambito: "Nacional" },
        { fecha: "2026-11-02", nombre: "Todos los Santos (trasladado del 1 de nov.)", ambito: "Nacional" },
        { fecha: "2026-12-07", nombre: "Día de la Constitución (trasladado del 6 de dic.)", ambito: "Nacional" },
        { fecha: "2026-12-08", nombre: "Inmaculada Concepción", ambito: "Nacional" },
        { fecha: "2026-12-25", nombre: "Natividad del Señor", ambito: "Nacional", especial: true }
    ],

    2027: [
        { fecha: "2027-01-01", nombre: "Año Nuevo", ambito: "Nacional", especial: true },
        { fecha: "2027-01-06", nombre: "Epifanía del Señor", ambito: "Nacional", especial: true },
        { fecha: "2027-03-01", nombre: "Día de Andalucía (trasladado del 28 de feb.)", ambito: "Andalucía" },
        { fecha: "2027-03-25", nombre: "Jueves Santo", ambito: "Andalucía" },
        { fecha: "2027-03-26", nombre: "Viernes Santo", ambito: "Nacional" },
        { fecha: "2027-05-01", nombre: "Fiesta del Trabajo", ambito: "Nacional" },
        { fecha: "2027-08-16", nombre: "Asunción de la Virgen (trasladado del 15 de ago.)", ambito: "Nacional" },
        { fecha: "2027-10-12", nombre: "Fiesta Nacional de España", ambito: "Nacional" },
        { fecha: "2027-11-01", nombre: "Todos los Santos", ambito: "Nacional" },
        { fecha: "2027-12-06", nombre: "Día de la Constitución", ambito: "Nacional" },
        { fecha: "2027-12-08", nombre: "Inmaculada Concepción", ambito: "Nacional" },
        { fecha: "2027-12-25", nombre: "Natividad del Señor", ambito: "Nacional", especial: true }
    ]
};

const FIESTAS_LOCALES_JEREZ = {

    2026: [
        { fecha: "2026-05-11", nombre: "Lunes de Feria (fiesta local de Jerez)", ambito: "Local" },
        { fecha: "2026-09-24", nombre: "Ntra. Sra. de la Merced (fiesta local de Jerez)", ambito: "Local" }
    ],

    2027: []   // pendientes de publicación en el BOJA
};

/*
=========================================
CONSULTAS
=========================================
*/

function festivosDelAnio(anio) {

    const mapa = {};

    [
        ...(FIESTAS_ANDALUCIA[anio] || []),
        ...(FIESTAS_LOCALES_JEREZ[anio] || [])
    ].forEach(f => { mapa[f.fecha] = f; });

    return mapa;
}

function notaFestivos(anio) {

    if (anio === 2026) {
        return "Calendario laboral 2026: Andalucía (Decreto 101/2025) y fiestas " +
               "locales de Jerez de la Frontera (BOJA nº 197, 14/10/2025).";
    }

    if (anio === 2027) {
        return "Calendario laboral 2027: Andalucía (Decreto 84/2026). Las fiestas " +
               "locales de Jerez de 2027 aún no están publicadas en el BOJA.";
    }

    return "No hay festivos cargados para " + anio + ".";
}

if (typeof module !== "undefined") {
    module.exports = { FIESTAS_ANDALUCIA, FIESTAS_LOCALES_JEREZ, festivosDelAnio };
}
