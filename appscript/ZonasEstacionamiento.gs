/**
 * SGT - ZONAS DE ESTACIONAMIENTO TARIFADO
 *
 * Hoja real "ZonasEstacionamiento":
 * A = id
 * B = nombre
 * C = direccion
 * D = coordenadas
 * E = localidad
 * F = usuario
 * G = fechaAlta
 * H = activo
 * I = codigo
 * J = usuarioAlta
 * K = Descripcion
 * L = Direccion
 * M = Caracteristicas
 *
 * Se mantiene compatibilidad con registros antiguos y con encabezados
 * en distinto orden mediante búsqueda por nombre de encabezado.
 */

function hojaZonasEstacionamiento_() {
  const ss = bd();
  if (!ss) {
    throw new Error('No se pudo abrir la base de datos configurada.');
  }

  const sh = ss.getSheetByName('ZonasEstacionamiento');

  if (!sh) {
    throw new Error('No existe la hoja "ZonasEstacionamiento" en la planilla configurada.');
  }

  return sh;
}

function obtenerColumnasZonasEstacionamiento_(sh) {
  const ultimaColumna = Math.max(sh.getLastColumn(), 1);
  const encabezados = sh.getRange(1, 1, 1, ultimaColumna).getDisplayValues()[0];

  const normalizar = function(valor) {
    return String(valor || '')
      .normalize('NFD')
      .replace(/[\\u0300-\\u036f]/g, '')
      .trim()
      .toLowerCase();
  };

  const buscar = function(nombres) {
    for (let i = 0; i < encabezados.length; i++) {
      const h = normalizar(encabezados[i]);
      if (nombres.some(function(nombre) { return h === normalizar(nombre); })) {
        return i;
      }
    }
    return -1;
  };

  return {
    encabezados: encabezados,
    id: buscar(['id']),
    nombre: buscar(['nombre']),
    direccionAntigua: buscar(['direccion']),
    coordenadas: buscar(['coordenadas', 'coordenada']),
    localidad: buscar(['localidad']),
    usuario: buscar(['usuario']),
    fechaAlta: buscar(['fechaAlta', 'fecha alta']),
    activo: buscar(['activo']),
    codigo: buscar(['codigo']),
    usuarioAlta: buscar(['usuarioAlta', 'usuario alta']),
    descripcion: buscar(['Descripcion', 'Descripción']),
    direccion: buscar(['Direccion', 'Dirección']),
    caracteristicas: buscar(['Caracteristicas', 'Características'])
  };
}

function valorColumnaZona_(fila, indice) {
  return indice >= 0 && indice < fila.length ? fila[indice] : '';
}

function obtenerDireccionZona_(fila, cols) {
  // En la hoja actual existen dos campos de dirección:
  // C = direccion (antiguo)
  // L = Direccion (campo actual)
  // Se prioriza L y se usa C como respaldo.
  const actual = String(valorColumnaZona_(fila, cols.direccion) || '').trim();
  if (actual) return actual;

  return String(valorColumnaZona_(fila, cols.direccionAntigua) || '').trim();
}

function obtenerZonasEstacionamiento() {
  try {
    const sh = hojaZonasEstacionamiento_();
    const cols = obtenerColumnasZonasEstacionamiento_(sh);
    const ultimaFila = sh.getLastRow();

    if (ultimaFila < 2) {
      return {
        ok: true,
        datos: [],
        cantidad: 0,
        filasLeidas: 0,
        hoja: 'ZonasEstacionamiento'
      };
    }

    const ultimaColumna = Math.max(sh.getLastColumn(), 1);
    const datos = sh.getRange(2, 1, ultimaFila - 1, ultimaColumna).getDisplayValues();

    const lista = datos
      .filter(function(fila) {
        return String(valorColumnaZona_(fila, cols.id) || '').trim() !== '';
      })
      .map(function(fila) {
        let localidad = String(
          valorColumnaZona_(fila, cols.localidad) || ''
        ).trim();

        const coordenadasTexto = String(
          valorColumnaZona_(fila, cols.coordenadas) || ''
        ).trim();

        // Compatibilidad con registros antiguos sin localidad.
        if (!localidad || localidad.toLowerCase() === 'sin localidad') {
          try {
            const puntos = JSON.parse(coordenadasTexto || '[]');

            if (Array.isArray(puntos) && puntos.length) {
              localidad = determinarLocalidadCordon_(puntos);
            }
          } catch (_) {}
        }

        return {
          id: valorColumnaZona_(fila, cols.id),
          codigo: valorColumnaZona_(fila, cols.codigo),
          tipo: 'Estacionamiento Tarifado',
          serie: '',
          nombre: valorColumnaZona_(fila, cols.nombre),
          descripcion: valorColumnaZona_(fila, cols.descripcion),
          direccion: obtenerDireccionZona_(fila, cols),
          estado: 'Activo',
          caracteristicas: valorColumnaZona_(fila, cols.caracteristicas),
          localidad: localidad,
          localidadNombre: localidad,
          coordenadas: coordenadasTexto,
          fechaAlta: valorColumnaZona_(fila, cols.fechaAlta),
          usuarioAlta: valorColumnaZona_(fila, cols.usuarioAlta),
          usuario: valorColumnaZona_(fila, cols.usuario),
          activo: valorColumnaZona_(fila, cols.activo)
        };
      });

    const activos = lista.filter(function(zona) {
      const estado = String(zona.activo || '')
        .trim()
        .toUpperCase();

      return [
        'SI',
        'SÍ',
        'YES',
        'TRUE',
        'VERDADERO',
        'ACTIVO',
        '1'
      ].indexOf(estado) !== -1;
    });

    return {
      ok: true,
      datos: activos,
      cantidad: activos.length,
      filasLeidas: lista.length,
      hoja: 'ZonasEstacionamiento'
    };

  } catch (error) {
    return {
      ok: false,
      mensaje:
        'No fue posible obtener las zonas de estacionamiento: ' +
        error.message
    };
  }
}

function guardarZonaEstacionamiento(e) {
  const p = (e && e.parameter) || {};
  const tipo = 'Estacionamiento Tarifado';
  const coordenadasTexto = String(p.coordenadas || '').trim();

  if (!coordenadasTexto) {
    return {
      ok: false,
      mensaje:
        'Debe seleccionar exactamente 2 puntos en el mapa para definir el tramo.'
    };
  }

  let coordenadas;

  try {
    coordenadas = JSON.parse(coordenadasTexto);
  } catch (error) {
    return {
      ok: false,
      mensaje: 'Las coordenadas no tienen un formato válido.'
    };
  }

  if (!Array.isArray(coordenadas) || coordenadas.length !== 2) {
    return {
      ok: false,
      mensaje:
        'Estacionamiento Tarifado debe definirse con exactamente 2 puntos. No se permiten 3 o más puntos.'
    };
  }

  try {
    coordenadas = coordenadas.map(function(punto) {
      if (!Array.isArray(punto) || punto.length < 2) {
        throw new Error('Los puntos deben contener latitud y longitud.');
      }

      const lat = Number(String(punto[0]).replace(',', '.'));
      const lng = Number(String(punto[1]).replace(',', '.'));

      if (
        !Number.isFinite(lat) ||
        lat < -90 ||
        lat > 90 ||
        !Number.isFinite(lng) ||
        lng < -180 ||
        lng > 180
      ) {
        throw new Error('Las coordenadas no son válidas.');
      }

      return [lat, lng];
    });
  } catch (error) {
    return {
      ok: false,
      mensaje: error.message
    };
  }

  const bloqueo = LockService.getScriptLock();

  try {
    bloqueo.waitLock(30000);

    const sh = hojaZonasEstacionamiento_();
    const cols = obtenerColumnasZonasEstacionamiento_(sh);

    const serie = obtenerSiguienteSerieEnHoja_(sh, tipo);
    const prefijo = obtenerPrefijoZona_();
    const codigo = prefijo + '-' + ('000000' + serie).slice(-6);
    const usuario =
      String(p.usuario || p.usuarioAlta || 'admin').trim() || 'admin';

    const localidad = determinarLocalidadCordon_(coordenadas);
    const direccion = String(p.direccion || '').trim();
    const descripcion = String(p.descripcion || '').trim();
    const caracteristicas = String(p.caracteristicas || '').trim();
    const nombre = String(p.nombre || '').trim();

    const fila = new Array(cols.encabezados.length).fill('');

    function poner(indice, valor) {
      if (indice >= 0) fila[indice] = valor;
    }

    poner(cols.id, generarID('ZE'));
    poner(cols.nombre, nombre);

    // La hoja tiene dos columnas de dirección. Se mantienen ambas
    // sincronizadas para no perder información de registros nuevos.
    poner(cols.direccionAntigua, direccion);
    poner(cols.direccion, direccion);

    poner(cols.coordenadas, JSON.stringify(coordenadas));
    poner(cols.localidad, localidad);
    poner(cols.usuario, usuario);
    poner(cols.fechaAlta, ahora());
    poner(cols.activo, 'SI');
    poner(cols.codigo, codigo);
    poner(cols.usuarioAlta, usuario);
    poner(cols.descripcion, descripcion);
    poner(cols.caracteristicas, caracteristicas);

    sh.appendRow(fila);

    return {
      ok: true,
      mensaje: 'Zona de estacionamiento guardada correctamente.',
      codigo: codigo,
      serie: serie,
      localidad: localidad
    };

  } catch (error) {
    return {
      ok: false,
      mensaje:
        'No fue posible guardar la zona de estacionamiento: ' +
        error.message
    };
  } finally {
    if (bloqueo.hasLock()) {
      bloqueo.releaseLock();
    }
  }
}

function eliminarZonaEstacionamiento(e) {
  const id = String(((e && e.parameter) || {}).id || '').trim();

  if (!id) {
    return {
      ok: false,
      mensaje: 'Falta el identificador de la zona.'
    };
  }

  try {
    const sh = hojaZonasEstacionamiento_();
    const fila = buscarFila(sh, id);

    if (fila === -1) {
      return {
        ok: false,
        mensaje: 'Zona de estacionamiento no encontrada.'
      };
    }

    sh.deleteRow(fila);

    return {
      ok: true,
      mensaje: 'Zona de estacionamiento eliminada.'
    };

  } catch (error) {
    return {
      ok: false,
      mensaje:
        'No fue posible eliminar la zona: ' +
        error.message
    };
  }
}

function obtenerPrefijoZona_() {
  return 'ET';
}
