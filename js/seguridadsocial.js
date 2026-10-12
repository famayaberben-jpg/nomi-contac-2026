/*
=========================================
SEGURIDAD SOCIAL 2026
CONVENIO CONTACT CENTER
=========================================
Fuente:
nomina_call_center_2026.xlsx
=========================================
*/

const SEGURIDAD_SOCIAL_2026 = {

    contingenciasComunes: 0.047,

    desempleoIndefinido: 0.0155,

    desempleoTemporal: 0.016,

    formacionProfesional: 0.001,

    mei: 0.0015

};

/*
=========================================
OBTENER TIPO DE DESEMPLEO
=========================================
*/

function obtenerTipoDesempleo(tipoContrato) {

    return tipoContrato === "temporal"
        ? SEGURIDAD_SOCIAL_2026.desempleoTemporal
        : SEGURIDAD_SOCIAL_2026.desempleoIndefinido;
}

/*
=========================================
CALCULAR SEGURIDAD SOCIAL
=========================================
Devuelve desglose completo
=========================================
*/

function calcularSeguridadSocial(
    baseCotizacion,
    tipoContrato = "indefinido"
) {

    const cc =
        baseCotizacion *
        SEGURIDAD_SOCIAL_2026.contingenciasComunes;

    const desempleo =
        baseCotizacion *
        obtenerTipoDesempleo(tipoContrato);

    const fp =
        baseCotizacion *
        SEGURIDAD_SOCIAL_2026.formacionProfesional;

    const mei =
        baseCotizacion *
        SEGURIDAD_SOCIAL_2026.mei;

    const total =
        cc +
        desempleo +
        fp +
        mei;

    return {

        baseCotizacion,

        contingenciasComunes:
            Number(cc.toFixed(2)),

        desempleo:
            Number(desempleo.toFixed(2)),

        formacionProfesional:
            Number(fp.toFixed(2)),

        mei:
            Number(mei.toFixed(2)),

        total:
            Number(total.toFixed(2))

    };

}

/*
=========================================
TOTAL SIMPLE
=========================================
*/

function calcularSSTotal(
    baseCotizacion,
    tipoContrato = "indefinido"
) {

    return calcularSeguridadSocial(
        baseCotizacion,
        tipoContrato
    ).total;

}

/*
=========================================
BASE ANUAL
=========================================
*/

function calcularSSAnual(
    baseMensual,
    pagasAnuales,
    tipoContrato = "indefinido"
) {

    const ssMensual =
        calcularSSTotal(
            baseMensual,
            tipoContrato
        );

    return Number(
        (
            ssMensual *
            pagasAnuales
        ).toFixed(2)
    );
}

/*
=========================================
FORMATO PARA UI
=========================================
*/

function generarHTMLSeguridadSocial(
    resultado
) {

    return `

        <div class="linea">
            <span>Contingencias comunes</span>
            <span>
                ${resultado.contingenciasComunes.toFixed(2)} €
            </span>
        </div>

        <div class="linea">
            <span>Desempleo</span>
            <span>
                ${resultado.desempleo.toFixed(2)} €
            </span>
        </div>

        <div class="linea">
            <span>Formación profesional</span>
            <span>
                ${resultado.formacionProfesional.toFixed(2)} €
            </span>
        </div>

        <div class="linea">
            <span>MEI</span>
            <span>
                ${resultado.mei.toFixed(2)} €
            </span>
        </div>

        <hr>

        <div class="linea total">
            <span>
                Total Seguridad Social
            </span>

            <span>
                ${resultado.total.toFixed(2)} €
            </span>
        </div>

    `;

}
