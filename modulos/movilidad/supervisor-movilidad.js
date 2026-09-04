//==================================================
// SGT - SUPERVISOR MOVILIDAD
// Consulta del mapa + creación de informes.
// NO puede crear, modificar ni eliminar elementos.
// NO puede realizar inspecciones desde el popup.
//==================================================

(function () {
    function normalizarRol(valor) {
        return String(valor || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function obtenerUsuario() {
        try {
            return JSON.parse(localStorage.getItem('usuarioActual') || 'null');
        } catch (_) {
            return null;
        }
    }

    function esSupervisorMovilidad() {
        const usuario = obtenerUsuario();
        return !!usuario && normalizarRol(usuario.rol) === 'supervisor movilidad';
    }

    function ocultarEdicion() {
        if (!esSupervisorMovilidad()) return;

        [
            '.panel',
            '#btnNuevaZona',
            '#btnCancelarZona',
            '#btnNuevoCordon',
            '#btnCancelarCordon'
        ].forEach(function (selector) {
            document.querySelectorAll(selector).forEach(function (elemento) {
                elemento.style.display = 'none';
            });
        });

        document.querySelectorAll('.zonaEstacionamientoBarra').forEach(function (barra) {
            barra.style.display = 'none';
        });

        const descripcion = document.querySelector('header p');
        if (descripcion) {
            descripcion.textContent = 'Consulta de elementos. La creación, modificación y eliminación están deshabilitadas para este rol.';
        }

        // Bloqueo de seguridad del formulario aunque otro script intente mostrarlo.
        const formulario = document.getElementById('formElemento');
        if (formulario) {
            formulario.addEventListener('submit', function (evento) {
                evento.preventDefault();
                evento.stopImmediatePropagation();
                mostrarAviso();
            }, true);
        }

        // Evita selección de una ubicación que pudiera preparar un nuevo elemento.
        if (typeof mapa !== 'undefined' && mapa && typeof seleccionarUbicacion === 'function') {
            mapa.off('click', seleccionarUbicacion);
            mapa.off('contextmenu', finalizarDibujoGeometrico);
        }

        // Bloqueo adicional de acciones de creación/eliminación.
        document.addEventListener('click', function (evento) {
            const objetivo = evento.target && evento.target.closest
                ? evento.target.closest('#btnNuevaZona, #btnNuevoCordon, #btnCancelarZona, #btnCancelarCordon, #formElemento button[type="submit"]')
                : null;
            if (!objetivo) return;
            evento.preventDefault();
            evento.stopImmediatePropagation();
            mostrarAviso();
        }, true);
    }

    function instalarPopupSoloCaracteristicas() {
        if (!esSupervisorMovilidad()) return;
        if (typeof window.crearPopup !== 'function') return;

        window.crearPopup = function (elemento) {
            const caracteristicas = escapar(elemento && elemento.caracteristicas ? elemento.caracteristicas : '-');
            return '<div class="popup-card supervisor-movilidad-popup">' +
                '<h2>Características</h2>' +
                '<div class="popup-linea"><strong>Características</strong><br>' + caracteristicas + '</div>' +
                '</div>';
        };
    }

    function mostrarAviso() {
        const mensaje = document.getElementById('mensajeMapa');
        if (!mensaje) return;
        mensaje.textContent = 'Este usuario tiene permisos de consulta y generación de informes. No puede modificar el mapa.';
        mensaje.className = 'mensaje error';
        setTimeout(function () {
            mensaje.textContent = '';
        }, 2800);
    }

    function escapar(valor) {
        return String(valor == null ? '' : valor)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function iniciar() {
        if (!esSupervisorMovilidad()) return;
        instalarPopupSoloCaracteristicas();
        ocultarEdicion();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
