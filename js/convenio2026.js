/*
=========================================
CONVENIO CONTACT CENTER 2026
=========================================
Fuente:
nomina_call_center_2026.xlsx

Datos extraídos de la hoja:
Tablas_2026
=========================================
*/

const CONVENIO_2026 = {

    niveles: {

        1: {
            categoria: "Directivo/a",
            salarioAnual: 41801.45,
            festivoNormal: 109.10,
            festivoEspecial: 231.16,
            domingo: 37.62
        },

        2: {
            categoria: "Jefe/a de Departamento o Área",
            salarioAnual: 37882.25,
            festivoNormal: 98.87,
            festivoEspecial: 209.49,
            domingo: 34.09
        },

        3: {
            categoria: "Jefe/a de Proyecto / Analista funcional",
            salarioAnual: 32662.92,
            festivoNormal: 85.25,
            festivoEspecial: 180.63,
            domingo: 29.40
        },

        4: {
            categoria: "Responsable de Servicio / Supervisor/a A",
            salarioAnual: 27443.59,
            festivoNormal: 71.64,
            festivoEspecial: 151.77,
            domingo: 24.70
        },

        5: {
            categoria: "Supervisor/a B",
            salarioAnual: 24179.17,
            festivoNormal: 63.11,
            festivoEspecial: 133.71,
            domingo: 21.76
        },

        6: {
            categoria: "Supervisor/a B (nivel inferior) / Coordinador sénior",
            salarioAnual: 20624.78,
            festivoNormal: 53.79,
            festivoEspecial: 114.06,
            domingo: 18.52
        },

        7: {
            categoria: "Coordinador/a, Formador/a, Quality, Oficial Administrativo",
            salarioAnual: 19689.43,
            festivoNormal: 51.37,
            festivoEspecial: 108.88,
            domingo: 17.70
        },

        8: {
            categoria: "Gestor/a telefónico/a",
            salarioAnual: 18707.27,
            festivoNormal: 48.77,
            festivoEspecial: 103.44,
            domingo: 16.81
        },

        9: {
            categoria: "Teleoperador/a - Operador/a especialista",
            salarioAnual: 18052.54,
            festivoNormal: 47.06,
            festivoEspecial: 99.81,
            domingo: 16.22
        },

        10: {
            categoria: "Teleoperador/a - Operador/a",
            salarioAnual: 17139.58,
            festivoNormal: 44.51,
            festivoEspecial: 94.39,
            domingo: 15.33
        }

    },

    complementos: {

        plusIdiomaMensual: 130.95,

        plusNocturnidadHora: 1.96,

        plusTransporteDia: 6.56

    },

    teletrabajo: {

        jornadaMayorIgual30h: 1.34,

        jornadaMenor30h: 1.05

    },

    dietas: {

        unaComida: 17.96,

        dosComidas: 31.65

    },

    kilometraje: {

        importeKm: 0.24

    }

};

/*
=========================================
FUNCIONES AUXILIARES
=========================================
*/

function obtenerNivel(nivel) {
    return CONVENIO_2026.niveles[nivel];
}

function obtenerCategoria(nivel) {
    return CONVENIO_2026.niveles[nivel].categoria;
}

function obtenerSalarioAnual(nivel) {
    return CONVENIO_2026.niveles[nivel].salarioAnual;
}

function obtenerFestivoNormal(nivel) {
    return CONVENIO_2026.niveles[nivel].festivoNormal;
}

function obtenerFestivoEspecial(nivel) {
    return CONVENIO_2026.niveles[nivel].festivoEspecial;
}

function obtenerDomingo(nivel) {
    return CONVENIO_2026.niveles[nivel].domingo;
}

function obtenerPlusIdioma() {
    return CONVENIO_2026.complementos.plusIdiomaMensual;
}

function obtenerPlusNocturnidad() {
    return CONVENIO_2026.complementos.plusNocturnidadHora;
}

function obtenerPlusTransporte() {
    return CONVENIO_2026.complementos.plusTransporteDia;
}

function obtenerTeletrabajo(jornadaSemanal) {

    return jornadaSemanal >= 30
        ? CONVENIO_2026.teletrabajo.jornadaMayorIgual30h
        : CONVENIO_2026.teletrabajo.jornadaMenor30h;
}

function obtenerDietaUnaComida() {
    return CONVENIO_2026.dietas.unaComida;
}

function obtenerDietaDosComidas() {
    return CONVENIO_2026.dietas.dosComidas;
}

function obtenerKilometraje() {
    return CONVENIO_2026.kilometraje.importeKm;
}
