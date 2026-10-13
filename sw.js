/*
=========================================
SERVICE WORKER - FUNCIONAMIENTO SIN CONEXION
=========================================
Estrategia: "stale-while-revalidate". Responde al instante desde la
copia local y la actualiza en segundo plano; los cambios se ven en
la siguiente apertura.

Si cambias la lista de ARCHIVOS, sube también el número de VERSION.
=========================================
*/

const VERSION = "v3";
const CACHE = "nomina-contact-center-2026-" + VERSION;

const ARCHIVOS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/styles.css",
    "./js/vendor/chart.umd.js",
    "./js/vendor/jspdf.umd.min.js",
    "./js/convenio2026.js",
    "./js/irpf.js",
    "./js/seguridadsocial.js",
    "./js/historico.js",
    "./js/festivos.js",
    "./js/calendario.js",
    "./js/backup.js",
    "./js/pdf.js",
    "./js/calculadora.js",
    "./js/app.js",
    "./icons/icon.svg",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/apple-touch-icon.png"
];

self.addEventListener("install", evento => {
    evento.waitUntil(
        caches.open(CACHE)
            .then(cache => cache.addAll(ARCHIVOS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", evento => {
    evento.waitUntil(
        caches.keys()
            .then(claves => Promise.all(
                claves
                    .filter(c => c !== CACHE)
                    .map(c => caches.delete(c))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", evento => {

    const peticion = evento.request;

    if (peticion.method !== "GET") return;

    const url = new URL(peticion.url);

    if (url.origin !== self.location.origin) return;

    evento.respondWith(
        caches.open(CACHE).then(async cache => {

            const guardada = await cache.match(peticion, { ignoreSearch: true });

            const red = fetch(peticion)
                .then(respuesta => {
                    if (respuesta && respuesta.ok) {
                        cache.put(peticion, respuesta.clone());
                    }
                    return respuesta;
                })
                .catch(() => null);

            if (guardada) {
                evento.waitUntil(red);
                return guardada;
            }

            const respuesta = await red;

            if (respuesta) return respuesta;

            // Sin red y sin copia: para navegación, devolver la página principal
            if (peticion.mode === "navigate") {
                return cache.match("./index.html");
            }

            return new Response("", { status: 504, statusText: "Sin conexión" });
        })
    );
});
