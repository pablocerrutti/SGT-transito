// SGT - MOVILIDAD
// Corrección definitiva del filtrado por categoría, localidad y búsqueda.
// Este archivo se carga después de mapa.js.
(function () {
    "use strict";

    const TIPO_ET = "Estacionamiento Tarifado";
    const TIPO_CR = "Cordón Rojo";

    function norm(valor) {
        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function filtroActual(id) {
        const el = document.getElementById(id);
        return el ? String(el.value || "") : "";
    }

    function coincideTexto(objeto, texto) {
        if (!texto) return true;
        const cadena = norm([
            objeto.id,
            objeto.codigo,
            objeto.tipo,
            objeto.nombre,
            objeto.descripcion,
            objeto.direccion,
            objeto.estado,
            objeto.caracteristicas,
            objeto.localidad,
            objeto.localidadNombre,
            objeto.ciudad
        ].join(" "));
        return cadena.includes(norm(texto));
    }

    function coincideLocalidad(objeto, localidad) {
        if (!localidad) return true;
        return norm(
            objeto.localidadNombre ||
            objeto.localidad ||
            objeto.nombreLocalidad ||
            objeto.ciudad
        ) === norm(localidad);
    }

    function esActivo(objeto) {
        return String(objeto.activo || "").toUpperCase() === "SI";
    }

    function puntos(objeto) {
        if (typeof leerCoordenadas === "function") {
            return leerCoordenadas(objeto.coordenadas);
        }
        try {
            const v = Array.isArray(objeto.coordenadas)
                ? objeto.coordenadas
                : JSON.parse(objeto.coordenadas || "[]");
            return Array.isArray(v) ? v : [];
        } catch (_) {
            return [];
        }
    }

    function dibujarEspecialesFiltrados() {
        if (!mapa || !capaZonasEstacionamiento || !capaCordonesRojos) return;

        const tipo = filtroActual("filtroTipo");
        const localidad = filtroActual("filtroLocalidad");
        const texto = filtroActual("buscar");

        // Nunca dejar geometrías especiales visibles cuando se eligió
        // una categoría normal.
        const esET = norm(tipo) === norm(TIPO_ET);
        const esCR = norm(tipo) === norm(TIPO_CR);
        const mostrarTodos = !tipo;

        capaZonasEstacionamiento.clearLayers();
        capaCordonesRojos.clearLayers();

        function dibujarColeccion(coleccion, nombreTipo, capa, color, peso) {
            (Array.isArray(coleccion) ? coleccion : []).forEach(function (objeto) {
                if (!esActivo(objeto)) return;
                if (!mostrarTodos && norm(tipo) !== norm(nombreTipo)) return;
                if (!coincideLocalidad(objeto, localidad)) return;

                const elementoBusqueda = Object.assign({}, objeto, {
                    tipo: nombreTipo
                });
                if (!coincideTexto(elementoBusqueda, texto)) return;

                const coords = puntos(objeto);
                if (coords.length < 2) return;

                const linea = L.polyline(coords, {
                    color: color,
                    weight: peso,
                    opacity: 0.95,
                    lineCap: "round",
                    lineJoin: "round",
                    interactive: true
                });

                linea.bindPopup(crearPopup({
                    id: objeto.id,
                    codigo: objeto.codigo || nombreTipo,
                    tipo: nombreTipo,
                    nombre: objeto.nombre || "",
                    localidadNombre: objeto.localidadNombre || objeto.localidad || "",
                    estado: objeto.estado || "Activo",
                    direccion: objeto.direccion || "",
                    descripcion: objeto.descripcion || "",
                    caracteristicas: objeto.caracteristicas || ""
                }));

                linea.addTo(capa);
            });
        }

        // Si se seleccionó una categoría normal, no dibujar ninguna geometría.
        if (!mostrarTodos && !esET && !esCR) return;

        if (mostrarTodos || esET) {
            dibujarColeccion(
                zonasEstacionamiento,
                TIPO_ET,
                capaZonasEstacionamiento,
                "#4fc3f7",
                6
            );
        }

        if (mostrarTodos || esCR) {
            dibujarColeccion(
                cordonesRojos,
                TIPO_CR,
                capaCordonesRojos,
                "#d50000",
                5
            );
        }
    }

    // mapa.js mantiene sus funciones internas como declaraciones globales.
    // No se reemplazan aquí: se fuerza el estado final de las capas después
    // de cada renderizado, evitando que una categoría quede visible por error.
    const renderOriginal = window.renderizarMapaCompleto;

    window.renderizarMapaCompleto = function () {
        if (typeof renderOriginal === "function") {
            renderOriginal();
        }
        dibujarEspecialesFiltrados();
    };

    // Si cambia un filtro o el texto de búsqueda, aplicar inmediatamente
    // la misma regla, incluso si otro script vuelve a renderizar el mapa.
    ["filtroTipo", "filtroLocalidad", "buscar"].forEach(function (id) {
        const elemento = document.getElementById(id);
        if (!elemento) return;

        elemento.addEventListener("change", function () {
            setTimeout(dibujarEspecialesFiltrados, 0);
        });

        elemento.addEventListener("input", function () {
            setTimeout(dibujarEspecialesFiltrados, 0);
        });
    });

    // Compatibilidad con código existente: las funciones de guardado
    // permanecen en mapa.js y no se sobrescriben.
})();
