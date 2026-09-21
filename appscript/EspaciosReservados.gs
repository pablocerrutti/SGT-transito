/* SGT - ESPACIOS RESERVADOS - versión autónoma */
const TIPO_ESPACIO_RESERVADO = 'ESPACIO RESERVADO';

function hojaEspaciosReservados_(){
  let sh=bd().getSheetByName('EspaciosReservados');
  if(!sh){
    sh=bd().insertSheet('EspaciosReservados');
    sh.appendRow(['ID','Código','Tipo','Serie','Nombre','Descripción','Dirección','Estado','Características','Localidad','Coordenadas','FechaAlta','UsuarioAlta','FechaMod','UsuarioMod','Activo']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function leerPuntosEspacioReservado_(valor){
  let puntos=valor;
  if(typeof puntos==='string'){
    try{ puntos=JSON.parse(puntos); }catch(error){ return []; }
  }
  if(!Array.isArray(puntos)) return [];
  const resultado=[];
  puntos.forEach(function(p){
    if(!Array.isArray(p)||p.length<2) return;
    const lat=Number(String(p[0]).replace(',','.'));
    const lng=Number(String(p[1]).replace(',','.'));
    if(Number.isFinite(lat)&&lat>=-90&&lat<=90&&Number.isFinite(lng)&&lng>=-180&&lng<=180){
      resultado.push([lat,lng]);
    }
  });
  return resultado;
}

function normalizarTextoEspacioReservado_(valor){
  return String(valor==null?'':valor).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
}

function normalizarActivoEspacioReservado_(valor){
  const t=String(valor==null?'':valor).trim().toUpperCase();
  return ['SI','SÍ','YES','TRUE','VERDADERO','ACTIVO','1'].indexOf(t)!==-1?'SI':'NO';
}

function determinarLocalidadEspacioReservado_(puntos){
  if(!Array.isArray(puntos)||!puntos.length) return 'Sin localidad';
  if(typeof obtenerLocalidadPorCoordenadas!=='function') return 'Sin localidad';

  const candidatos=[puntos[0]];
  if(puntos.length>1) candidatos.push(puntos[puntos.length-1]);
  const medio=puntos[Math.floor(puntos.length/2)];
  if(medio) candidatos.push(medio);

  const encontrados=[];
  candidatos.forEach(function(p){
    try{
      const r=obtenerLocalidadPorCoordenadas(p[0],p[1]);
      if(r&&r.nombre&&normalizarTextoEspacioReservado_(r.nombre)!=='sin localidad') encontrados.push(r);
    }catch(error){}
  });

  if(!encontrados.length) return 'Sin localidad';
  const conteo={};
  encontrados.forEach(function(x){
    const k=normalizarTextoEspacioReservado_(x.nombre);
    conteo[k]=(conteo[k]||0)+1;
  });
  let mejor=encontrados[0], mayor=0;
  encontrados.forEach(function(x){
    const n=conteo[normalizarTextoEspacioReservado_(x.nombre)]||0;
    if(n>mayor){ mayor=n; mejor=x; }
  });
  return String(mejor.nombre||'Sin localidad').trim()||'Sin localidad';
}

function obtenerEspaciosReservados(e){
  try{
    const sh=hojaEspaciosReservados_(), ultimaFila=sh.getLastRow();
    if(ultimaFila<2) return {ok:true,datos:[]};
    const datos=sh.getRange(2,1,ultimaFila-1,16).getDisplayValues();
    const incluir=String(((e&&e.parameter)||{}).incluirInactivos||'NO').trim().toUpperCase()==='SI';

    const lista=datos.filter(function(f){return String(f[0]||'').trim()!=='';}).map(function(f){
      let localidad=String(f[9]||'').trim();
      if(!localidad||normalizarTextoEspacioReservado_(localidad)==='sin localidad'){
        const puntos=leerPuntosEspacioReservado_(f[10]);
        if(puntos.length) localidad=determinarLocalidadEspacioReservado_(puntos);
      }
      return {id:f[0],codigo:f[1],tipo:TIPO_ESPACIO_RESERVADO,serie:f[3],nombre:f[4],descripcion:f[5],direccion:f[6],estado:f[7],caracteristicas:f[8],localidad:localidad,localidadNombre:localidad,coordenadas:f[10],fechaAlta:f[11],usuarioAlta:f[12],fechaModificacion:f[13],usuarioModificacion:f[14],activo:f[15]};
    });

    return {ok:true,datos:incluir?lista:lista.filter(function(x){return normalizarActivoEspacioReservado_(x.activo)==='SI';})};
  }catch(error){
    return {ok:false,datos:[],mensaje:'No fue posible obtener los espacios reservados: '+(error.message||error)};
  }
}

function guardarEspacioReservado(e){
  const p=(e&&e.parameter)||{};
  const nombre=String(p.nombre||'').trim();
  const coordenadas=String(p.coordenadas||'').trim();

  if(!nombre) return {ok:false,mensaje:'Debe indicar un nombre para el espacio reservado.'};
  if(!coordenadas) return {ok:false,mensaje:'Seleccione puntos en el mapa para definir el espacio reservado.'};

  const puntos=leerPuntosEspacioReservado_(coordenadas);
  if(puntos.length<2) return {ok:false,mensaje:'El espacio reservado debe contener al menos 2 puntos válidos.'};

  const bloqueo=LockService.getScriptLock();
  try{
    bloqueo.waitLock(30000);
    const sh=hojaEspaciosReservados_();
    const serie=obtenerSiguienteSerieEnHoja_(sh,TIPO_ESPACIO_RESERVADO);
    const codigo='ER-'+('000000'+serie).slice(-6);
    const usuario=String(p.usuario||p.usuarioAlta||'admin').trim()||'admin';
    const localidad=determinarLocalidadEspacioReservado_(puntos);

    sh.appendRow([
      generarID('ER'),codigo,TIPO_ESPACIO_RESERVADO,serie,nombre,
      String(p.descripcion||'').trim(),String(p.direccion||'').trim(),
      String(p.estado||'Activo').trim(),String(p.caracteristicas||'').trim(),
      localidad,JSON.stringify(puntos),ahora(),usuario,'','', 'SI'
    ]);
    SpreadsheetApp.flush();

    return {ok:true,mensaje:'Espacio reservado guardado correctamente.',codigo:codigo,serie:serie,localidad:localidad};
  }catch(error){
    return {ok:false,mensaje:'No fue posible guardar el espacio reservado: '+(error.message||error)};
  }finally{
    try{if(bloqueo.hasLock()) bloqueo.releaseLock();}catch(errorLiberacion){}
  }
}

function eliminarEspacioReservado(e){
  const id=String(((e&&e.parameter)||{}).id||'').trim();
  if(!id) return {ok:false,mensaje:'Falta el identificador del espacio reservado.'};
  try{
    const sh=hojaEspaciosReservados_(), fila=buscarFila(sh,id);
    if(fila===-1) return {ok:false,mensaje:'Espacio reservado no encontrado.'};
    const col=buscarColumnaEspaciosReservados_('Activo');
    if(col===-1) return {ok:false,mensaje:'La hoja EspaciosReservados no contiene la columna Activo.'};
    sh.getRange(fila,col).setValue('NO'); SpreadsheetApp.flush();
    return {ok:true,mensaje:'Espacio reservado desactivado correctamente.',id:id};
  }catch(error){
    return {ok:false,mensaje:'No fue posible desactivar el espacio reservado: '+(error.message||error)};
  }
}

function buscarColumnaEspaciosReservados_(nombre){
  const sh=hojaEspaciosReservados_(), ultima=sh.getLastColumn();
  if(ultima<1) return -1;
  const encabezados=sh.getRange(1,1,1,ultima).getDisplayValues()[0];
  const buscado=normalizarTextoEspacioReservado_(nombre);
  for(let i=0;i<encabezados.length;i++) if(normalizarTextoEspacioReservado_(encabezados[i])===buscado) return i+1;
  return -1;
}

function obtenerPrefijoEspacioReservado_(){ return 'ER'; }
