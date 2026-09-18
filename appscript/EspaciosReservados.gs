/********************************************************
 * SGT - ESPACIOS RESERVADOS
 * Misma lógica de CORDÓN ROJO.
 * Representación visual: línea amarilla en el frontend.
 * Hoja: EspaciosReservados
 *
 * Estructura:
 * ID, Código, Tipo, Serie, Nombre, Descripción, Dirección,
 * Estado, Características, Localidad, Coordenadas, FechaAlta,
 * UsuarioAlta, FechaMod, UsuarioMod, Activo.
 ********************************************************/

const TIPO_ESPACIO_RESERVADO = 'ESPACIO RESERVADO';

function hojaEspaciosReservados_(){
  let sh = bd().getSheetByName('EspaciosReservados');
  if(!sh){
    sh = bd().insertSheet('EspaciosReservados');
    sh.appendRow([
      'ID','Código','Tipo','Serie','Nombre','Descripción','Dirección',
      'Estado','Características','Localidad','Coordenadas','FechaAlta',
      'UsuarioAlta','FechaMod','UsuarioMod','Activo'
    ]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function obtenerEspaciosReservados(e){
  try{
    const sh = hojaEspaciosReservados_();
    const ultimaFila = sh.getLastRow();
    if(ultimaFila < 2) return {ok:true,datos:[]};

    const datos = sh.getRange(2,1,ultimaFila-1,16).getDisplayValues();
    const incluirInactivos = String(((e && e.parameter)||{}).incluirInactivos||'NO').trim().toUpperCase() === 'SI';

    const lista = datos
      .filter(function(f){ return String(f[0]||'').trim() !== ''; })
      .map(function(f){
        let localidad = String(f[9]||'').trim();

        if(!localidad || localidad.toLowerCase() === 'sin localidad'){
          try{
            const puntos = leerPuntosCordon_(f[10]);
            if(puntos.length) localidad = determinarLocalidadCordon_(puntos);
          }catch(_){}
        }

        return {
          id:f[0],
          codigo:f[1],
          tipo:TIPO_ESPACIO_RESERVADO,
          serie:f[3],
          nombre:f[4],
          descripcion:f[5],
          direccion:f[6],
          estado:f[7],
          caracteristicas:f[8],
          localidad:localidad,
          localidadNombre:localidad,
          coordenadas:f[10],
          fechaAlta:f[11],
          usuarioAlta:f[12],
          fechaModificacion:f[13],
          usuarioModificacion:f[14],
          activo:f[15]
        };
      });

    return {
      ok:true,
      datos:incluirInactivos ? lista : lista.filter(function(x){
        return normalizarActivoCordon_(x.activo) === 'SI';
      })
    };
  }catch(error){
    return {
      ok:false,
      datos:[],
      mensaje:'No fue posible obtener los espacios reservados: '+(error.message||error)
    };
  }
}

function guardarEspacioReservado(e){
  const p = (e && e.parameter) || {};
  const tipo = TIPO_ESPACIO_RESERVADO;
  const coordenadas = String(p.coordenadas||'').trim();
  const nombre = String(p.nombre||'').trim();

  if(!nombre){
    return {ok:false,mensaje:'Debe indicar un nombre para el espacio reservado.'};
  }

  if(!coordenadas){
    return {ok:false,mensaje:'Seleccione puntos en el mapa para definir el espacio reservado.'};
  }

  const puntos = leerPuntosCordon_(coordenadas);
  if(puntos.length < 2){
    return {ok:false,mensaje:'El espacio reservado debe contener al menos 2 puntos válidos.'};
  }

  const bloqueo = LockService.getScriptLock();
  try{
    bloqueo.waitLock(30000);

    const sh = hojaEspaciosReservados_();
    const serie = obtenerSiguienteSerieEnHoja_(sh,tipo);
    const prefijo = obtenerPrefijoEspacioReservado_();
    const codigo = prefijo+'-'+('000000'+serie).slice(-6);
    const usuario = String(p.usuario||p.usuarioAlta||'admin').trim() || 'admin';
    const localidad = determinarLocalidadCordon_(puntos);

    sh.appendRow([
      generarID('ER'),
      codigo,
      tipo,
      serie,
      nombre,
      String(p.descripcion||'').trim(),
      String(p.direccion||'').trim(),
      String(p.estado||'Activo').trim(),
      String(p.caracteristicas||'').trim(),
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
      mensaje:'Espacio reservado guardado correctamente.',
      codigo:codigo,
      serie:serie,
      localidad:localidad
    };
  }catch(error){
    return {
      ok:false,
      mensaje:'No fue posible guardar el espacio reservado: '+(error.message||error)
    };
  }finally{
    if(bloqueo.hasLock()) bloqueo.releaseLock();
  }
}

function eliminarEspacioReservado(e){
  const id = String(((e && e.parameter)||{}).id||'').trim();
  if(!id) return {ok:false,mensaje:'Falta el identificador del espacio reservado.'};

  try{
    const sh = hojaEspaciosReservados_();
    const fila = buscarFila(sh,id);
    if(fila === -1) return {ok:false,mensaje:'Espacio reservado no encontrado.'};

    const columnaActivo = buscarColumnaEspaciosReservados_('Activo');
    if(columnaActivo === -1){
      return {ok:false,mensaje:'La hoja EspaciosReservados no contiene la columna Activo.'};
    }

    sh.getRange(fila,columnaActivo).setValue('NO');
    SpreadsheetApp.flush();

    return {
      ok:true,
      mensaje:'Espacio reservado desactivado correctamente.',
      id:id
    };
  }catch(error){
    return {
      ok:false,
      mensaje:'No fue posible desactivar el espacio reservado: '+(error.message||error)
    };
  }
}

function buscarColumnaEspaciosReservados_(nombre){
  const sh = hojaEspaciosReservados_();
  const ultimaColumna = sh.getLastColumn();
  if(ultimaColumna < 1) return -1;

  const encabezados = sh.getRange(1,1,1,ultimaColumna).getDisplayValues()[0];
  const buscado = normalizarTextoCordon_(nombre);

  for(let i=0;i<encabezados.length;i++){
    if(normalizarTextoCordon_(encabezados[i]) === buscado) return i+1;
  }
  return -1;
}

function obtenerPrefijoEspacioReservado_(){
  return 'ER';
}
