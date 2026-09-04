//==================================================
// SGT - ROL CONSULTA MOVILIDAD
// Solo consulta del mapa + acceso a Informes.
// No modifica la lógica de los demás roles.
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

    function aplicarConsultaMovilidad() {
        const usuario = obtenerUsuario();
        if (!usuario || normalizarRol(usuario.rol) !== 'consulta movilidad') return;

        // Ocultar todo lo relacionado con creación/edición.
        const selectoresOcultar = [
            '.panel',
            '#btnNuevaZona',
            '#btnCancelarZona',
            '#btnNuevoCordon',
            '#btnCancelarCordon'
        ];

        selectoresOcultar.forEach(function (selector) {
            document.querySelectorAll(selector).forEach(function (elemento) {
                elemento.style.display = 'none';
            });
        });

        // Las barras geométricas pueden contener elementos auxiliares.
        document.querySelectorAll('.zonaEstacionamientoBarra').forEach(function (barra) {
            barra.style.display = 'none';
        });

        // El rol de consulta no necesita Dashboard.
        const dashboard = document.getElementById('btnDashboard');
        if (dashboard) dashboard.style.display = 'none';

        // El mapa ocupa todo el espacio disponible, sin alterar la estética general.
        const contenedor = document.querySelector('.contenedorPrincipal');
        if (contenedor) {
            contenedor.style.gridTemplateColumns = '1fr';
        }

        // Mensaje contextual sin cambiar el diseño del módulo.
        const descripcion = document.querySelector('header p');
        if (descripcion) {
            descripcion.textContent = 'Consulta de elementos existentes. Utilice los filtros o seleccione un elemento para consultar su información.';
        }

        // Bloqueo adicional: aunque alguien intente disparar el formulario por código,
        // este rol nunca puede guardar un elemento desde esta pantalla.
        const formulario = document.getElementById('formElemento');
        if (formulario) {
            formulario.addEventListener('submit', function (evento) {
                evento.preventDefault();
                evento.stopImmediatePropagation();
                mostrarAvisoConsulta();
            }, true);
        }

        // Bloqueo adicional de botones de creación si algún otro script los vuelve a mostrar.
        document.addEventListener('click', function (evento) {
            const objetivo = evento.target && evento.target.closest
                ? evento.target.closest('#btnNuevaZona, #btnNuevoCordon, #btnGuardarElemento')
                : null;
            if (!objetivo) return;
            evento.preventDefault();
            evento.stopImmediatePropagation();
            mostrarAvisoConsulta();
        }, true);
    }

    function mostrarAvisoConsulta() {
        const mensaje = document.getElementById('mensajeMapa');
        if (!mensaje) return;
        mensaje.textContent = 'Este usuario tiene permisos únicamente de consulta.';
        mensaje.className = 'mensaje error';
        setTimeout(function () {
            mensaje.textContent = '';
        }, 2500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', aplicarConsultaMovilidad);
    } else {
        aplicarConsultaMovilidad();
    }
})();
