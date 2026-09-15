//==================================================
// SGT - ZOOM GLOBAL DEL MAPA
// Permite acercar más sin perder las capas base.
// No modifica marcadores, filtros ni permisos.
//==================================================

(function () {
    const ZOOM_MAXIMO = 22;
    const ZOOM_NATIVO = 19;

    function aplicarZoomGlobal() {
        if (typeof mapa === 'undefined' || !mapa || typeof L === 'undefined') {
            return;
        }

        mapa.setMaxZoom(ZOOM_MAXIMO);

        mapa.eachLayer(function (capa) {
            if (!(capa instanceof L.TileLayer)) return;

            capa.options.maxZoom = ZOOM_MAXIMO;

            // Si el proveedor no dispone de teselas para el nivel solicitado,
            // Leaflet amplía la última tesela nativa en lugar de dejar el mapa vacío.
            if (capa.options.maxNativeZoom == null) {
                capa.options.maxNativeZoom = ZOOM_NATIVO;
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        aplicarZoomGlobal();
        setTimeout(aplicarZoomGlobal, 300);
        setTimeout(aplicarZoomGlobal, 1000);
    });
})();
