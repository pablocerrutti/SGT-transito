/********************************************************
 * SGT - ESPACIOS RESERVADOS
 * Misma lógica de CORDÓN ROJO.
 * Diferencia funcional: representación amarilla en frontend.
 * Hoja: EspaciosReservados
 ********************************************************/

const TIPO_ESPACIO_RESERVADO = 'ESPACIO RESERVADO';

function hojaEspaciosReservados_(){
  let sh=bd().getSheetByName('EspaciosReservados');
  if(!sh){
    sh=bd().insertSheet('EspaciosReservados');
    sh.appendRow([
      'ID','Código','Tipo','Serie','Nombre','Descripción','Dirección',
      'Estado','Características','Localidad','Coordenadas','FechaAlta',
      'UsuarioAlta','FechaMod','UsuarioMod','Activo'
    ]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function obtenerEspaciosReservados(){
  try{
    const sh=hojaEspaciosReservados_();
    const ultimaFila=sh.getLastRow();
    if(ultimaFila<2)return {ok:true,datos:[]};

    const datos=sh.getRange(2,1,ultimaFila-1,16).getDisplayValues();

    return {
      ok:true,
      datos:datos
        .filter(function(f){return String(f[0]||'').trim()!=='';})
        .map(function(f){
          let localidad=String(f[9]||'').trim();
          if(!localidad||localidad.toLowerCase()==='sin localidad'){
            try{
              const puntos=JSON.parse(String(f[10]||'[]'));
              if(Array.isArray(puntos)&&puntos.length){
                localidad=determinarLocalidadCordon_(puntos);
              }
            }catch(_){ }
          }
          return {
            id:f[0],
            codigo:f[1],
            tipo:f[2]||TIPO_ESPACIO_RESERVADO,
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
        })
        .filter(function(x){return normalizarActivoCordon_(x.activo)==='SI';})
    };
  }catch(error){
    return {ok:false,datos:[],mensaje:'No fue posible obtener los espacios reservados: '+(error.message||error)};
  }
}

function guardarEspacioReservado(e){
  const bloqueoRol=bloquearMutacionSupervisorMovilidad_(e,'Este rol no puede crear espacios reservados.');
  if(bloqueoRol)return bloqueoRol;

  const p=(e&&e.parameter)||{};
  const coordenadas=String(p.coordenadas||'').trim();
  if(!coordenadas)return {ok:false,mensaje:'Seleccione al menos dos puntos en el mapa para definir el espacio reservado.'};

  const puntos=leerPuntosCordon_(coordenadas);

  // Igual que el dibujo de CORDÓN ROJO: exactamente 2 puntos.
  if(puntos.length!==2)return {ok:false,mensaje:'El espacio reservado debe contener exactamente 2 puntos válidos.'};

  const bloqueo=LockService.getScriptLock();
  try{
    bloqueo.waitLock(30000);

    const sh=hojaEspaciosReservados_();
    const serie=obtenerSiguienteSerieEnHoja_(sh,TIPO_ESPACIO_RESERVADO);
    const codigo='ER-'+('000000'+serie).slice(-6);
    const usuario=String(p.usuario||p.usuarioAlta||'admin').trim()||'admin';
    const localidad=determinarLocalidadCordon_(puntos);

    sh.appendRow([
      generarID('ER'),
      codigo,
      TIPO_ESPACIO_RESERVADO,
      serie,
      String(p.nombre||'').trim(),
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
    return {ok:false,mensaje:'No fue posible guardar el espacio reservado: '+(error.message||error)};
  }finally{
    if(bloqueo.hasLock())bloqueo.releaseLock();
  }
}

function eliminarEspacioReservado(e){
  const bloqueoRol=bloquearMutacionSupervisorMovilidad_(e,'Este rol no puede eliminar espacios reservados.');
  if(bloqueoRol)return bloqueoRol;

  const id=String(((e&&e.parameter)||{}).id||'').trim();
  if(!id)return {ok:false,mensaje:'Falta el identificador del espacio reservado.'};

  try{
    const sh=hojaEspaciosReservados_();
    const ultimaFila=sh.getLastRow();
    if(ultimaFila<2)return {ok:false,mensaje:'No existen espacios reservados.'};

    // Igual que CORDÓN ROJO: eliminación lógica, no se borra la fila.
    const encabezados=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
    let columnaId=-1;
    let columnaActivo=-1;

    encabezados.forEach(function(encabezado,indice){
      const nombre=String(encabezado||'').trim().toLowerCase();
      if(nombre==='id')columnaId=indice+1;
      if(nombre==='activo')columnaActivo=indice+1;
    });

    if(columnaId===-1||columnaActivo===-1){
      return {ok:false,mensaje:'La hoja EspaciosReservados no contiene las columnas necesarias.'};
    }

    const ids=sh.getRange(2,columnaId,ultimaFila-1,1).getValues();

    for(let i=0;i<ids.length;i++){
      if(String(ids[i][0]||'').trim()===id){
        sh.getRange(i+2,columnaActivo).setValue('NO');
        SpreadsheetApp.flush();
        return {ok:true,mensaje:'Espacio reservado desactivado correctamente.',id:id};
      }
    }

    return {ok:false,mensaje:'No se encontró el espacio reservado indicado.'};
  }catch(error){
    return {ok:false,mensaje:'No fue posible desactivar el espacio reservado: '+(error.message||error)};
  }
}

function obtenerPrefijoEspacioReservado_(){return 'ER';}
