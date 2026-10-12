/*
=========================================
IRPF 2026 - RETENCIONES SOBRE RENDIMIENTOS DEL TRABAJO
=========================================
Base legal:
- Ley 35/2006 (LIRPF): arts. 19, 20, 57 y 63
- RD 439/2007 (Reglamento IRPF): arts. 81 a 86

La escala de retenciones (art. 85 RIRPF) es la suma de la
escala estatal (art. 63 LIRPF) y de la autonómica, que a
efectos de retención se fija en el mismo importe que la estatal:
cada tipo es el doble del tipo estatal (9,5 -> 19, 12 -> 24...).

REVISAR cada año: LIMITE_EXCLUYENTE y, si cambian, las escalas.
=========================================
*/

const IRPF_2026 = {

    // Art. 85 RIRPF. Cada tramo: desde, cuota acumulada hasta ese punto, tipo
    escala: [
        { desde: 0,      cuota: 0,          tipo: 0.19 },
        { desde: 12450,  cuota: 2365.50,    tipo: 0.24 },
        { desde: 20200,  cuota: 4225.50,    tipo: 0.30 },
        { desde: 35200,  cuota: 8725.50,    tipo: 0.37 },
        { desde: 60000,  cuota: 17901.50,   tipo: 0.45 },
        { desde: 300000, cuota: 125901.50,  tipo: 0.47 }
    ],

    // Art. 57 LIRPF
    minimoContribuyente: 5550,

    // Art. 19.2.f LIRPF
    otrosGastos: 2000,

    // Art. 81 RIRPF: contribuyente sin hijos en situacion 3.a.
    // Comprobar el importe vigente en el cuadro del art. 81.
    limiteExcluyente: 15876,

    // Art. 85.3 RIRPF
    limiteCuotaTipo: 0.43,
    limiteCuotaRetribucion: 35200,

    // Art. 86.2 RIRPF: contratos de duracion inferior a un ano
    tipoMinimoTemporal: 2
};

/*
=========================================
APLICAR ESCALA
=========================================
*/

function aplicarEscalaIRPF(base) {

    if (base <= 0) return 0;

    const escala = IRPF_2026.escala;
    let tramo = escala[0];

    for (const t of escala) {
        if (base > t.desde) tramo = t;
    }

    return tramo.cuota + (base - tramo.desde) * tramo.tipo;
}

/*
=========================================
REDUCCION POR RENDIMIENTOS DEL TRABAJO
=========================================
Art. 20 LIRPF y art. 83.3.d RIRPF
=========================================
*/

function reduccionRendimientosTrabajo(rendimientoNeto) {

    let reduccion = 0;

    if (rendimientoNeto <= 14852) {
        reduccion = 7302;
    } else if (rendimientoNeto <= 17673.52) {
        reduccion = 7302 - 1.75 * (rendimientoNeto - 14852);
    } else if (rendimientoNeto < 19747.5) {
        reduccion = 2364.34 - 1.14 * (rendimientoNeto - 17673.52);
    }

    return Math.max(0, Math.min(reduccion, rendimientoNeto));
}

/*
=========================================
TIPO DE RETENCION
=========================================
retribucionAnual : retribuciones dinerarias previsibles del año
ssAnual          : cotizaciones a la Seguridad Social del año
tipoContrato     : "indefinido" | "temporal"
=========================================
*/

function calcularTipoIRPF(
    retribucionAnual,
    ssAnual,
    tipoContrato = "indefinido"
) {

    const C = IRPF_2026;

    if (retribucionAnual <= C.limiteExcluyente) {
        // Art. 81.3 RIRPF: el limite excluyente no impide aplicar
        // el tipo minimo del art. 86.2 a contratos inferiores a un año
        const minimo =
            tipoContrato === "temporal" ? C.tipoMinimoTemporal : 0;

        return {
            tipo: minimo,
            cuotaAnual: 0,
            baseRetencion: 0,
            reduccion: 0,
            motivo: "Por debajo del límite excluyente de retener"
        };
    }

    // Art. 83.3 RIRPF
    const rendimientoNeto = retribucionAnual - ssAnual;

    const reduccion =
        reduccionRendimientosTrabajo(rendimientoNeto);

    const gastos =
        Math.min(C.otrosGastos, rendimientoNeto);

    const baseRetencion =
        Math.max(0, rendimientoNeto - gastos - reduccion);

    // Art. 85.1 RIRPF
    let cuota =
        aplicarEscalaIRPF(baseRetencion) -
        aplicarEscalaIRPF(C.minimoContribuyente);

    cuota = Math.max(0, cuota);

    // Art. 85.3 RIRPF
    if (retribucionAnual <= C.limiteCuotaRetribucion) {

        const tope =
            C.limiteCuotaTipo *
            Math.max(0, retribucionAnual - C.limiteExcluyente);

        cuota = Math.min(cuota, tope);
    }

    // Art. 86.1 RIRPF: dos decimales
    let tipo =
        Math.round((cuota / retribucionAnual) * 10000) / 100;

    // Art. 86.2 RIRPF
    if (
        tipoContrato === "temporal" &&
        tipo < C.tipoMinimoTemporal
    ) {
        tipo = C.tipoMinimoTemporal;
    }

    return {
        tipo,
        cuotaAnual: Number(cuota.toFixed(2)),
        baseRetencion: Number(baseRetencion.toFixed(2)),
        reduccion: Number(reduccion.toFixed(2)),
        motivo: ""
    };
}

/*
=========================================
IMPORTE DE LA RETENCION
=========================================
*/

function calcularIRPF(
    brutoMensual,
    retribucionAnual,
    ssAnual,
    tipoContrato = "indefinido"
) {

    const r = calcularTipoIRPF(
        retribucionAnual,
        ssAnual,
        tipoContrato
    );

    return {
        ...r,
        retencion: Number(
            (brutoMensual * r.tipo / 100).toFixed(2)
        )
    };
}

if (typeof module !== "undefined") {
    module.exports = {
        IRPF_2026,
        aplicarEscalaIRPF,
        reduccionRendimientosTrabajo,
        calcularTipoIRPF,
        calcularIRPF
    };
}
