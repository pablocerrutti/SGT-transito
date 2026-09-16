//==================================================
// SGT - ESPACIO RESERVADO
// Misma logica de dibujo, datos y guardado que CORDON ROJO.
// Unica diferencia geometrica: color amarillo.
//==================================================
(function(){
  'use strict';
  const TIPO='ESPACIO RESERVADO';
  const COLOR='#FFD400';
  let capa=null,espacios=[],dibujando=false,puntos=[],lineaTemporal=null,instalado=false;

  function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  function usuario(){try{return JSON.parse(localStorage.getItem('usuarioActual')||'null')||{};}catch(_){return {};}}
  function soloConsulta(){const r=norm(usuario().rol);return r==='supervisor movilidad'||r==='consulta movilidad'||r==='supervisor';}
  function disponible(){return typeof mapa!=='undefined'&&mapa&&typeof L!=='undefined';}
  function mensaje(t,c){if(typeof mostrarMensaje==='function')mostrarMensaje(t,c||'');}

  function leerPuntos(v){
    let a=v;
    if(typeof a==='string'){try{a=JSON.parse(a);}catch(_){return [];}}
    if(!Array.isArray(a))return [];
    return a.map(function(p){
      if(!Array.isArray(p)||p.length<2)return null;
      const lat=Number(String(p[0]).replace(',','.'));
      const lng=Number(String(p[1]).replace(',','.'));
      if(!Number.isFinite(lat)||lat<-90||lat>90||!Number.isFinite(lng)||lng<-180||lng>180)return null;
      return [lat,lng];
    }).filter(Boolean);
  }

  function activo(v){
    const s=String(v==null?'':v).trim().toUpperCase();
    return ['SI','SÍ','YES','TRUE','VERDADERO','ACTIVO','1'].includes(s);
  }

  function asegurarCapa(){
    if(!disponible())return null;
    if(!capa)capa=L.layerGroup().addTo(mapa);
    return capa;
  }

  function asegurarCategoria(){
    const tipo=document.getElementById('tipo');
    const filtro=document.getElementById('filtroTipo');
    [tipo,filtro].forEach(function(sel){
      if(!sel)return;
      if(!Array.from(sel.options).some(function(o){return norm(o.value||o.text)===norm(TIPO);}))sel.add(new Option(TIPO,TIPO));
    });
  }

  function observarSelectores(){
    ['tipo','filtroTipo'].forEach(function(id){
      const sel=document.getElementById(id);
      if(!sel||sel.dataset.espacioReservadoObserver==='1')return;
      new MutationObserver(function(){asegurarCategoria();}).observe(sel,{childList:true});
      sel.dataset.espacioReservadoObserver='1';
    });
  }

  async function cargar(){
    try{
      const r=await api('obtenerEspaciosReservados');
      if(!r||r.ok===false){console.warn('SGT: espacios reservados',r);return;}
      espacios=Array.isArray(r.datos)?r.datos:[];
      dibujar();
    }catch(e){console.error('SGT: espacios reservados',e);}
  }

  function dibujar(){
    const grupo=asegurarCapa();
    if(!grupo)return;
    grupo.clearLayers();
    const filtro=(document.getElementById('filtroTipo')||{}).value||'';
    const localidad=norm((document.getElementById('filtroLocalidad')||{}).value||'');
    const texto=norm((document.getElementById('buscar')||{}).value||'');
    if(filtro&&norm(filtro)!==norm(TIPO))return;

    espacios.filter(function(e){return activo(e.activo);}).forEach(function(e){
      if(localidad&&norm(e.localidad||e.localidadNombre||'')!==localidad)return;
      const cadena=norm([e.id,e.codigo,e.tipo,e.serie,e.nombre,e.descripcion,e.direccion,e.estado,e.caracteristicas,e.localidad].join(' '));
      if(texto&&!cadena.includes(texto))return;
      const p=leerPuntos(e.coordenadas);
      if(p.length<2)return;
      const linea=L.polyline(p,{color:COLOR,weight:6,opacity:.95,lineCap:'round',lineJoin:'round'});
      if(typeof crearPopup==='function')linea.bindPopup(crearPopup({
        id:e.id,codigo:e.codigo||'',tipo:TIPO,serie:e.serie||'',nombre:e.nombre||'',
        descripcion:e.descripcion||'',direccion:e.direccion||'',estado:e.estado||'Activo',
        caracteristicas:e.caracteristicas||'',localidadNombre:e.localidad||e.localidadNombre||''
      }));
      linea.addTo(grupo);
    });
  }

  function cancelar(){
    if(disponible())mapa.off('click',capturar);
    dibujando=false;puntos=[];
    if(lineaTemporal){lineaTemporal.remove();lineaTemporal=null;}
  }

  function iniciar(){
    if(soloConsulta()){mensaje('Este rol solo puede consultar el mapa y generar informes.','error');return;}
    if(!disponible())return;
    asegurarCategoria();
    cancelar();
    dibujando=true;puntos=[];
    mensaje('Marque exactamente 2 puntos para definir el espacio reservado. El segundo punto finaliza automaticamente.','');
    mapa.on('click',capturar);
  }

  function capturar(e){
    if(!dibujando||puntos.length>=2)return;
    puntos.push([Number(e.latlng.lat.toFixed(7)),Number(e.latlng.lng.toFixed(7))]);
    if(lineaTemporal)lineaTemporal.remove();
    lineaTemporal=L.polyline(puntos,{color:COLOR,weight:6,dashArray:puntos.length===1?'8,8':null,opacity:.95,lineCap:'round',lineJoin:'round'}).addTo(mapa);
    if(puntos.length===1){mensaje('Punto 1 registrado. Seleccione el segundo punto.','');return;}
    mensaje('Dos puntos definidos. Guardando espacio reservado...','');
    guardar();
  }

  async function guardar(){
    if(puntos.length!==2){mensaje('El espacio reservado debe definirse con exactamente 2 puntos.','error');return;}
    try{
      const u=usuario();
      const val=function(id){const x=document.getElementById(id);return x?x.value:'';};
      const datos={
        tipo:TIPO,
        nombre:val('nombre'),
        descripcion:val('descripcion'),
        direccion:val('direccion'),
        estado:val('estado')||'Activo',
        caracteristicas:val('caracteristicas'),
        coordenadas:JSON.stringify(puntos),
        localidad:val('filtroLocalidad'),
        usuario:u.usuario||u.nombre||'admin',
        usuarioAlta:u.usuario||u.nombre||'admin',
        rol:u.rol||''
      };
      const r=await api('guardarEspacioReservado',datos);
      if(!r||!r.ok)throw new Error((r&&r.mensaje)||'No fue posible guardar el espacio reservado.');
      try{await apiRegistrarAuditoria({usuario:u.usuario||'',nombre:u.nombre||'',rol:u.rol||'',accionRealizada:'Creacion de espacio reservado',modulo:'Movilidad',detalle:'Creacion de ESPACIO RESERVADO mediante exactamente dos puntos.',referencia:r.codigo||''});}catch(_){ }
      mensaje('Espacio reservado '+(r.codigo||'')+' guardado correctamente.','exito');
      cancelar();
      await cargar();
    }catch(e){mensaje(e.message||'No fue posible guardar el espacio reservado.','error');cancelar();}
  }

  function instalar(){
    if(instalado)return;
    if(!disponible()){setTimeout(instalar,200);return;}
    instalado=true;
    asegurarCategoria();
    observarSelectores();
    const tipo=document.getElementById('tipo');
    const filtro=document.getElementById('filtroTipo');
    if(tipo)tipo.addEventListener('change',function(){if(norm(tipo.value)===norm(TIPO))iniciar();});
    if(filtro)filtro.addEventListener('change',function(){setTimeout(dibujar,0);});
    const buscar=document.getElementById('buscar');
    if(buscar)buscar.addEventListener('input',function(){setTimeout(dibujar,0);});
    const loc=document.getElementById('filtroLocalidad');
    if(loc)loc.addEventListener('change',function(){setTimeout(dibujar,0);});
    const actualizar=document.getElementById('btnActualizar');
    if(actualizar)actualizar.addEventListener('click',function(){setTimeout(cargar,500);});
    cargar();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',instalar);else instalar();
  window.sgtEspaciosReservados={cargar:cargar,dibujar:dibujar,iniciarDibujo:iniciar};
})();
