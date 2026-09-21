/********************************************************
 * SGT - CORDONES ROJOS
 * Hoja:
 * ID, Código, Tipo, Serie, Nombre, Descripción, Dirección,
 * Estado, Características, Localidad, Coordenadas, Fecha alta,
 * Usuario alta, Fecha modificación, Usuario modificación, Activo.
 *
 * La localidad se determina automáticamente desde las coordenadas
 * usando la hoja Localidades.
 ********************************************************/

function hojaCordonesRojos_() {
  const ss = bd();
  if (!ss) throw new Error('No se pudo abrir la base de datos configurada.');
  const sh = ss.getSheetByName('CordonesRojos');
  if (!sh) throw new Error('No existe la hoja "CordonesRojos" en la planilla configurada.');
  return sh;
}

function obtenerCordonesRojos() {
  try {
    const ss = bd();
    const sh = ss.getSheetByName('CordonesRojos');

    if (!sh) {
      return {
        ok:false, datos:[], cantidad:0,
        mensaje:'No existe la hoja "CordonesRojos" en la planilla configurada.',
        hoja:'CordonesRojos', spreadsheetId:ss.getId()
      };
    }

    const ultimaFila = sh.getLastRow();
    const ultimaColumna = sh.getLastColumn();
    if (ultimaFila < 2) return {ok:true, datos:[], cantidad:0, hoja:'CordonesRojos'};

    const valores = sh.getRange(1, 1, ultimaFila, Math.max(16, ultimaColumna)).getDisplayValues();
    const datos = [];

    for (let i = 1; i < valores.length; i++) {
      const f = valores[i];
      if (!String(f[0] || '').trim()) continue;

      const coordenadas = String(f[10] || '').trim() || '[]';
      let localidad = String(f[9] || '').trim();

      if (!localidad || normalizarTextoCordon_(localidad) === 'sin localidad') {
        try {
          const puntos = leerPuntosCordon_(coordenadas);
          if (puntos.length) localidad = determinarLocalidadCordon_(puntos);
        } catch (_) {}
      }

      datos.push({
        id:String(f[0] || '').trim(),
        codigo:String(f[1] || '').trim(),
        tipo:'Cordón rojo',
        serie:String(f[3] || '').trim(),
        nombre:String(f[4] || '').trim(),
        descripcion:String(f[5] || '').trim(),
        direccion:String(f[6] || '').trim(),
        estado:String(f[7] || '').trim(),
        caracteristicas:String(f[8] || '').trim(),
        localidad:localidad,
        localidadNombre:localidad,
        coordenadas:coordenadas,
        fechaAlta:String(f[11] || '').trim(),
        usuarioAlta:String(f[12] || '').trim(),
        fechaModificacion:String(f[13] || '').trim(),
        usuarioModificacion:String(f[14] || '').trim(),
        activo:String(f[15] || '').trim()
      });
    }

    const activos = datos.filter(function(c) {
      return normalizarActivoCordon_(c.activo) === 'SI';
    });

    return {ok:true, datos:activos, cantidad:activos.length, hoja:'CordonesRojos'};

  } catch (error) {
    return {
      ok:false, datos:[],
      mensaje:'No fue posible leer la hoja "CordonesRojos": ' + (error && error.message ? error.message : error)
    };
  }
}

function guardarCordonRojo(e) {
  const p = (e && e.parameter) || {};
  const tipo = 'Cordón rojo';
  const coordenadas = String(p.coordenadas || '').trim();

  if (!coordenadas) {
    return {ok:false, mensaje:'Seleccione puntos en el mapa para definir el cordón.'};
  }

  const puntos = leerPuntosCordon_(coordenadas);
  if (puntos.length < 2) {
    return {ok:false, mensaje:'El cordón rojo debe contener al menos 2 puntos válidos.'};
  }

  const bloqueo = LockService.getScriptLock();
  try {
    bloqueo.waitLock(30000);

    const sh = hojaCordonesRojos_();
    const serie = obtenerSiguienteSerieEnHoja_(sh, tipo);
    const prefijo = obtenerPrefijoCordon_();
    const codigo = prefijo + '-' + ('000000' + serie).slice(-6);
    const usuario = String(p.usuario || p.usuarioAlta || 'admin').trim() || 'admin';

    const localidad = determinarLocalidadCordon_(puntos);

    sh.appendRow([
      generarID('CR'),
      codigo,
      tipo,
      serie,
      String(p.nombre || '').trim(),
      String(p.descripcion || '').trim(),
      String(p.direccion || '').trim(),
      String(p.estado || 'Activo').trim(),
      String(p.caracteristicas || '').trim(),
      localidad,
      JSON.stringify(puntos),
      ahora(),
      usuario,
      '',
      '',
      'SI'
    ]);

    return {
      ok:true,
      mensaje:'Cordón rojo guardado correctamente.',
      codigo:codigo,
      serie:serie,
      localidad:localidad
    };

  } catch (error) {
    return {ok:false,mensaje:'No fue posible guardar el cordón rojo: ' + error.message};
  } finally {
    if (bloqueo.hasLock()) bloqueo.releaseLock();
  }
}

//==================================================
// LOCALIDAD DESDE COORDENADAS
//==================================================

function determinarLocalidadCordon_(puntos) {
  if (!Array.isArray(puntos) || !puntos.length) return 'Sin localidad';

  const candidatos = [];
  candidatos.push(puntos[0]);
  if (puntos.length > 1) candidatos.push(puntos[puntos.length - 1]);

  const medio = puntos[Math.floor(puntos.length / 2)];
  if (medio) candidatos.push(medio);

  const encontrados = [];

  candidatos.forEach(function(punto) {
    const resultado = obtenerLocalidadPorCoordenadas(punto[0], punto[1]);
    if (resultado && resultado.nombre && resultado.nombre !== 'Sin localidad') {
      encontrados.push(resultado);
    }
  });

  if (!encontrados.length) return 'Sin localidad';

  const conteo = {};
  encontrados.forEach(function(item) {
    const clave = normalizarTextoCordon_(item.nombre);
    conteo[clave] = (conteo[clave] || 0) + 1;
  });

  let mejor = encontrados[0];
  let mayor = 0;

  encontrados.forEach(function(item) {
    const cantidad = conteo[normalizarTextoCordon_(item.nombre)] || 0;
    if (cantidad > mayor) {
      mayor = cantidad;
      mejor = item;
    }
  });

  return mejor.nombre;
}

function leerPuntosCordon_(valor) {
  let puntos = valor;
  if (typeof puntos === 'string') {
    try { puntos = JSON.parse(puntos); }
    catch (_) { return []; }
  }
  if (!Array.isArray(puntos)) return [];

  const resultado = [];
  puntos.forEach(function(p) {
    if (!Array.isArray(p) || p.length < 2) return;
    const lat = Number(String(p[0]).replace(',', '.'));
    const lng = Number(String(p[1]).replace(',', '.'));
    if (Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lng) && lng >= -180 && lng <= 180) {
      resultado.push([lat, lng]);
    }
  });
  return resultado;
}

function normalizarTextoCordon_(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function normalizarActivoCordon_(valor) {
  const t = String(valor == null ? '' : valor).trim().toUpperCase();
  return ['SI','SÍ','YES','TRUE','VERDADERO','ACTIVO','1'].indexOf(t) !== -1 ? 'SI' : 'NO';
}

function eliminarCordonRojo(e) {
  const id = String(((e && e.parameter) || {}).id || '').trim();
  if (!id) return {ok:false,mensaje:'Falta el identificador del cordón.'};

  try {
    const sh = hojaCordonesRojos_();
    const fila = buscarFila(sh, id);
    if (fila === -1) return {ok:false,mensaje:'Cordón rojo no encontrado.'};

    sh.deleteRow(fila);
    return {ok:true,mensaje:'Cordón rojo eliminado.'};
  } catch (error) {
    return {ok:false,mensaje:'No fue posible eliminar el cordón rojo: ' + error.message};
  }
}

function obtenerPrefijoCordon_() { return 'CR'; }
