/********************************************************
 SGT
 Sistema de Gestión de Tránsito
 API PRINCIPAL
********************************************************/

function doGet(e) {
  e=e||{parameter:{}}; e.parameter=e.parameter||{};
  const accion=String(e.parameter.accion||'').trim();
  try{
    switch(accion){
      case 'login': return json(login(e));
      case 'obtenerUsuarios': return json(obtenerUsuarios());
      case 'guardarUsuario': return json(guardarUsuario(e));
      case 'eliminarUsuario': return json(eliminarUsuario(e));
      case 'obtenerCategorias': return json(obtenerCategorias());
      case 'obtenerLocalidades': return json(obtenerLocalidades());
      case 'obtenerElementos': return json(obtenerElementos());
      case 'guardarElemento': return json(bloquearConsultaMapaApi_(e) || guardarElemento(e));
      case 'actualizarElemento': return json(bloquearConsultaMapaApi_(e) || actualizarElemento(e));
      case 'eliminarElemento': return json(bloquearConsultaMapaApi_(e) || eliminarElemento(e));
      case 'obtenerZonasEstacionamiento': return json(obtenerZonasEstacionamiento(e));
      case 'guardarZonaEstacionamiento': return json(bloquearConsultaMapaApi_(e) || guardarZonaEstacionamiento(e));
      case 'eliminarZonaEstacionamiento': return json(bloquearConsultaMapaApi_(e) || eliminarZonaEstacionamiento(e));
      case 'obtenerCordonesRojos': return json(obtenerCordonesRojos(e));
      case 'guardarCordonRojo': return json(bloquearConsultaMapaApi_(e) || guardarCordonRojo(e));
      case 'eliminarCordonRojo': return json(bloquearConsultaMapaApi_(e) || eliminarCordonRojo(e));
      case 'obtenerCatalogoElementosInformables': return json(obtenerCatalogoElementosInformables());
      case 'obtenerInspecciones': return json(obtenerInspecciones(e));
      case 'guardarInspeccion': return json(bloquearConsultaMapaApi_(e) || guardarInspeccion(e));
      case 'subirArchivo': return json(subirArchivo(e));
      case 'registrarAuditoria': return json(registrarAuditoria(e));
      case 'obtenerAuditoria': return json(obtenerAuditoria(e));
      case 'obtenerInformesAuditoria': return json(obtenerInformesAuditoria(e));
      case 'ping': return json({ok:true,mensaje:'API SGT funcionando correctamente.',fecha:new Date().toISOString()});
      default: return json({ok:false,mensaje:'Acción inválida: '+accion});
    }
  }catch(error){ console.error('ERROR API SGT:',error); return json({ok:false,mensaje:error&&error.message?error.message:'Error interno del servidor.'}); }
}
function doPost(e){ return doGet(e); }

function bloquearConsultaMapaApi_(e){
  const p=(e&&e.parameter)||{};
  const rol=String(p.rol||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  if(rol==='supervisor movilidad' || rol==='consulta movilidad'){
    return {ok:false,codigo:'PERMISO_DENEGADO',mensaje:rol==='consulta movilidad' ? 'Consulta Movilidad solo puede consultar el mapa y generar informes. No puede crear, modificar, eliminar elementos ni registrar actuaciones.' : 'Supervisor Movilidad solo puede consultar el mapa y generar informes. No puede modificar, eliminar ni registrar actuaciones.'};
  }
  return null;
}

//======================================================
// CATÁLOGO ACTUAL PARA INFORMES
//======================================================
function obtenerCatalogoElementosInformables() {
  try {
    const datos=[];
    const elementos=obtenerElementosDirectosParaInforme_();
    elementos.forEach(function(elemento){
      if(!elemento||!String(elemento.id||'').trim())return;
      if(!esElementoNormalVigente_(elemento.activo))return;
      datos.push({tipoElemento:'ELEMENTO',id:String(elemento.id||'').trim(),codigo:String(elemento.codigo||'').trim(),tipo:String(elemento.tipo||'').trim(),serie:String(elemento.serie||'').trim(),nombre:String(elemento.nombre||'').trim(),descripcion:String(elemento.descripcion||'').trim(),direccion:String(elemento.direccion||'').trim(),estado:String(elemento.estado||'').trim(),caracteristicas:String(elemento.caracteristicas||'').trim(),ciudad:String(elemento.ciudad||'').trim(),localidad:String(elemento.localidad||elemento.localidadNombre||elemento.ciudad||'').trim(),zona:String(elemento.zona||'').trim(),latitud:String(elemento.latitud||'').trim(),longitud:String(elemento.longitud||'').trim(),coordenadas:construirCoordenadasPunto_(elemento.latitud,elemento.longitud),geometria:'PUNTO',fechaAlta:String(elemento.fechaAlta||'').trim(),usuarioAlta:String(elemento.usuarioAlta||'').trim(),activo:'SI'});
    });
    const zonas=obtenerZonasEstacionamiento({parameter:{incluirInactivos:'NO'}});
    if(zonas&&zonas.ok&&Array.isArray(zonas.datos))zonas.datos.forEach(function(zona){if(!zona||!String(zona.id||'').trim()||!esActivoCatalogo_(zona.activo))return;datos.push({tipoElemento:'ZONA_ESTACIONAMIENTO',id:String(zona.id||'').trim(),codigo:String(zona.codigo||'').trim(),tipo:String(zona.tipo||'Estacionamiento Tarifado').trim(),serie:String(zona.serie||'').trim(),nombre:String(zona.nombre||'').trim(),descripcion:String(zona.descripcion||'').trim(),direccion:String(zona.direccion||'').trim(),estado:String(zona.estado||'').trim(),caracteristicas:String(zona.caracteristicas||'').trim(),ciudad:String(zona.ciudad||'').trim(),localidad:String(zona.localidad||zona.localidadNombre||'').trim(),zona:String(zona.zona||'').trim(),coordenadas:String(zona.coordenadas||'[]').trim(),geometria:'LINEA',fechaAlta:String(zona.fechaAlta||'').trim(),usuarioAlta:String(zona.usuarioAlta||'').trim(),activo:'SI'});});
    const cordones=obtenerCordonesRojos({parameter:{incluirInactivos:'NO'}});
    if(cordones&&cordones.ok&&Array.isArray(cordones.datos))cordones.datos.forEach(function(cordon){if(!cordon||!String(cordon.id||'').trim()||!esActivoCatalogo_(cordon.activo))return;datos.push({tipoElemento:'CORDON_ROJO',id:String(cordon.id||'').trim(),codigo:String(cordon.codigo||'').trim(),tipo:String(cordon.tipo||'Cordón Rojo').trim(),serie:String(cordon.serie||'').trim(),nombre:String(cordon.nombre||'').trim(),descripcion:String(cordon.descripcion||'').trim(),direccion:String(cordon.direccion||'').trim(),estado:String(cordon.estado||'').trim(),caracteristicas:String(cordon.caracteristicas||'').trim(),ciudad:String(cordon.ciudad||'').trim(),localidad:String(cordon.localidad||cordon.localidadNombre||'').trim(),zona:String(cordon.zona||'').trim(),coordenadas:String(cordon.coordenadas||'[]').trim(),geometria:'LINEA',fechaAlta:String(cordon.fechaAlta||'').trim(),usuarioAlta:String(cordon.usuarioAlta||'').trim(),activo:'SI'});});
    const vistos={},resultado=[]; datos.forEach(function(elemento){const clave=String(elemento.tipoElemento||'')+'|'+String(elemento.id||'').trim();if(!clave||vistos[clave])return;vistos[clave]=true;resultado.push(elemento);});
    return {ok:true,datos:resultado,cantidad:resultado.length};
  }catch(error){console.error('ERROR catálogo informable:',error);return {ok:false,datos:[],cantidad:0,mensaje:error&&error.message?error.message:'No fue posible obtener el catálogo informable.'};}
}
function obtenerElementosDirectosParaInforme_(){
  const sh=hoja('Elementos'),ultimaFila=sh.getLastRow(),ultimaColumna=sh.getLastColumn();
  if(ultimaFila<2||ultimaColumna<1)return [];
  const valores=sh.getRange(1,1,ultimaFila,ultimaColumna).getDisplayValues(),encabezados=valores[0].map(v=>String(v||'').trim()),indice={};
  encabezados.forEach(function(encabezado,i){const clave=normalizarEncabezadoInforme_(encabezado);if(clave&&indice[clave]===undefined)indice[clave]=i;});
  function valorFila_(fila,nombres){for(let i=0;i<nombres.length;i++){const idx=indice[normalizarEncabezadoInforme_(nombres[i])];if(idx!==undefined&&String(fila[idx]==null?'':fila[idx]).trim()!=='')return fila[idx];}return '';}
  return valores.slice(1).filter(fila=>String(valorFila_(fila,['ID'])||'').trim()!=='').map(fila=>({id:valorFila_(fila,['ID']),codigo:valorFila_(fila,['Código','Codigo']),tipo:valorFila_(fila,['Tipo']),serie:valorFila_(fila,['Serie']),nombre:valorFila_(fila,['Nombre']),descripcion:valorFila_(fila,['Descripción','Descripcion']),latitud:valorFila_(fila,['Latitud']),longitud:valorFila_(fila,['Longitud']),direccion:valorFila_(fila,['Dirección','Direccion']),estado:valorFila_(fila,['Estado']),caracteristicas:valorFila_(fila,['Características','Caracteristicas']),fechaAlta:valorFila_(fila,['Fecha alta','Fecha Alta']),usuarioAlta:valorFila_(fila,['Usuario alta','Usuario Alta']),activo:valorFila_(fila,['Activo']),ciudad:valorFila_(fila,['Ciudad']),localidad:valorFila_(fila,['Localidad']),zona:valorFila_(fila,['Zona'])}));
}
function normalizarEncabezadoInforme_(valor){return String(valor||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();}
function construirCoordenadasPunto_(latitud,longitud){const lat=String(latitud==null?'':latitud).trim(),lng=String(longitud==null?'':longitud).trim();if(!lat||!lng)return '';return lat+', '+lng;}
function esElementoNormalVigente_(valor){const texto=String(valor==null?'':valor).trim().toUpperCase();return ['NO','N','FALSE','FALSO','INACTIVO','0'].indexOf(texto)===-1;}
function esActivoCatalogo_(valor){const texto=String(valor==null?'':valor).trim().toUpperCase();return ['SI','SÍ','YES','TRUE','VERDADERO','ACTIVO','1'].indexOf(texto)!==-1;}
function json(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
