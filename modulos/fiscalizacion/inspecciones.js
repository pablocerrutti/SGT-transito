/********************************************************
 SGT - MODULO FISCALIZACION
 Fiscalizacion + Movilidad + consulta de Supervisor
********************************************************/

let usuario=null;
let rol="";
let actuacionesCargadas=[];

try{usuario=JSON.parse(localStorage.getItem("usuarioActual"));}catch(e){usuario=null;}
rol=String((usuario||{}).rol||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();

const ROLES_FISCALIZACION=["super admin","supervisor","fiscalizacion","movilidad"];

if(!usuario){location.href="../../index.html";}
else if(!ROLES_FISCALIZACION.includes(rol)){location.href="../../pages/dashboard.html";}
else{
  const usuarioNombre=document.getElementById("usuarioNombre");
  if(usuarioNombre)usuarioNombre.textContent=(usuario.nombre||usuario.usuario||"")+" — "+(usuario.rol||"");
  iniciar();
}

function iniciar(){
  const btnVolver=document.getElementById("btnVolver");
  if(btnVolver)btnVolver.onclick=()=>location.href="../../pages/dashboard.html";

  const esSupervisor=rol==="supervisor";
  const formulario=document.getElementById("formularioActuacion");
  const filtros=document.getElementById("filtrosSupervisor");

  if(esSupervisor){
    if(formulario)formulario.style.display="none";
    if(filtros)filtros.style.display="grid";
    configurarFiltrosSupervisor();
  }else{
    cargarInspector();
    if(formulario)formulario.style.display="";
    if(formulario)formulario.querySelector("form").onsubmit=guardar;
    actualizarCamposPorRol();
  }

  cargar();
}

function cargarInspector(){
  const beta=document.getElementById("beta"), inspector=document.getElementById("inspector"), esMovilidad=rol==="movilidad";
  if(inspector)inspector.value=usuario.nombre||usuario.usuario||"";
  if(beta)beta.value=esMovilidad?"No posee":(usuario.beta||"");
  if(rol==="fiscalizacion"&&!usuario.beta)mensaje("El inspector no tiene Número Beta asignado. Contacte al administrador.","error");
}

function actualizarCamposPorRol(){
  const matricula=document.getElementById("matricula"),nombre=document.getElementById("nombreInfractor"),cedula=document.getElementById("cedula"),detalle=document.getElementById("detalle"),esMovilidad=rol==="movilidad";
  if(matricula)matricula.required=!esMovilidad;
  if(nombre)nombre.required=!esMovilidad;
  if(cedula)cedula.required=!esMovilidad;
  if(detalle)detalle.required=!esMovilidad;
  if(esMovilidad)mensaje("Modo Movilidad: puede registrar la actuación sin Número Beta y completar los datos que correspondan.","info");
}

async function archivoBase64(file,max){
  if(!file)return "";
  if(file.size>max)throw new Error(file.name+" supera el tamaño permitido.");
  const data=await new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(",")[1]);r.onerror=no;r.readAsDataURL(file);});
  const respuesta=await apiSubirArchivo({archivoBase64:data,nombreArchivo:file.name,mimeType:file.type});
  if(!respuesta||!respuesta.ok)throw new Error(respuesta?.mensaje||"No fue posible subir el archivo.");
  return respuesta.url;
}

async function guardar(ev){
  ev.preventDefault();
  const boton=ev.submitter;if(boton)boton.disabled=true;
  try{
    if(rol==="fiscalizacion"&&!usuario.beta)throw new Error("No tiene Número Beta asignado.");
    const tipo=document.getElementById("tipoActuacion").value;if(!tipo)throw new Error("Debe seleccionar el tipo de actuación.");
    const requiereFoto=tipo==="Multa"||tipo==="Apercibimiento",esMovilidad=rol==="movilidad";
    const video=await archivoBase64(document.getElementById("video").files[0],30*1024*1024);
    const documento=await archivoBase64(document.getElementById("documento").files[0],10*1024*1024);
    if(requiereFoto&&!esMovilidad&&!documento)throw new Error("Debe adjuntar fotografía de la actuación.");
    const datos={beta:esMovilidad?"No posee":(usuario.beta||""),inspector:usuario.nombre||usuario.usuario||"",usuario:usuario.usuario||"",rol:rol,matricula:document.getElementById("matricula").value.trim().toUpperCase(),tipoActuacion:tipo,numeroBoleta:document.getElementById("numeroBoleta").value.trim(),nombreInfractor:document.getElementById("nombreInfractor").value.trim(),cedula:document.getElementById("cedula").value.trim(),detalle:document.getElementById("detalle").value.trim(),videoUrl:video,documentoUrl:documento};
    const r=await apiGuardarInspeccion(datos);
    if(!r||!r.ok)throw new Error(r?.mensaje||"No fue posible guardar la actuación.");
    mostrarReporteGuardado(r);
    ev.target.reset();cargarInspector();actualizarCamposPorRol();await cargar();
  }catch(error){console.error("Error guardando actuación:",error);mensaje(error.message||"No fue posible guardar la actuación.","error");}
  finally{if(boton)boton.disabled=false;}
}

function configurarFiltrosSupervisor(){
  const btnFiltrar=document.getElementById("btnFiltrar");
  const btnLimpiar=document.getElementById("btnLimpiarFiltro");
  const desde=document.getElementById("fechaDesde");
  const hasta=document.getElementById("fechaHasta");

  if(btnFiltrar)btnFiltrar.onclick=renderizarActuaciones;
  if(btnLimpiar)btnLimpiar.onclick=function(){
    if(desde)desde.value="";
    if(hasta)hasta.value="";
    renderizarActuaciones();
  };

  [desde,hasta].forEach(function(control){
    if(control)control.addEventListener("change",renderizarActuaciones);
  });
}

function parsearFechaActuacion(valor){
  const s=String(valor||"").trim();
  if(!s)return null;

  // Formato habitual de Apps Script: yyyy-MM-dd HH:mm:ss
  let m=s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if(m)return new Date(Number(m[1]),Number(m[2])-1,Number(m[3]),Number(m[4]||0),Number(m[5]||0),Number(m[6]||0));

  // También admite dd/MM/yyyy HH:mm:ss por registros anteriores.
  m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if(m)return new Date(Number(m[3]),Number(m[2])-1,Number(m[1]),Number(m[4]||0),Number(m[5]||0),Number(m[6]||0));

  const d=new Date(s);
  return Number.isNaN(d.getTime())?null:d;
}

function dentroDeRango(fecha,desde,hasta){
  const d=parsearFechaActuacion(fecha);
  if(!d)return false;
  if(desde){
    const inicio=new Date(desde+"T00:00:00");
    if(d<inicio)return false;
  }
  if(hasta){
    const fin=new Date(hasta+"T23:59:59");
    if(d>fin)return false;
  }
  return true;
}

function renderizarActuaciones(){
  const lista=document.getElementById("lista");
  if(!lista)return;

  const esSupervisor=rol==="supervisor";
  const desde=document.getElementById("fechaDesde")?.value||"";
  const hasta=document.getElementById("fechaHasta")?.value||"";

  if(esSupervisor && desde && hasta && desde>hasta){
    lista.replaceChildren();
    const resumen=document.getElementById("resumenActuaciones");
    if(resumen)resumen.textContent="El rango de fechas no es válido: la fecha Desde no puede ser posterior a Hasta.";
    return;
  }

  let datos=actuacionesCargadas.slice();
  if(esSupervisor && (desde||hasta))datos=datos.filter(i=>dentroDeRango(i.fecha,desde,hasta));

  lista.replaceChildren();

  datos.forEach(function(i){
    const x=document.createElement("article");
    x.className="inspeccion";

    const titulo=(i.numeroSerie||i.id||"")+" - "+(i.matricula||"Sin matrícula")+" - "+(i.tipoActuacion||"");
    const pdf=i.pdfUrl||i.pdfDownloadUrl||"";
    const fecha=String(i.fecha||"");

    x.innerHTML='<strong>'+esc(titulo)+'</strong>'+\
      '<p>'+esc(i.detalle||i.incidencia||"")+'</p>'+\
      '<small>'+esc(i.inspector||"")+(i.beta?" - Beta "+esc(i.beta):"")+" - "+esc(i.rol||"")+" - "+esc(fecha)+'</small>';

    if(pdf){
      const acciones=document.createElement("div");
      acciones.className="acciones-pdf-actuacion";

      const ver=document.createElement("button");
      ver.type="button";
      ver.className="btn-pdf-actuacion";
      ver.textContent="📄 Ver PDF";
      ver.onclick=function(){abrirPdfActuacion(i,"ver");};

      const imprimir=document.createElement("button");
      imprimir.type="button";
      imprimir.className="btn-pdf-actuacion";
      imprimir.textContent="🖨 Imprimir PDF";
      imprimir.onclick=function(){abrirPdfActuacion(i,"imprimir");};

      acciones.appendChild(ver);
      acciones.appendChild(imprimir);
      x.appendChild(acciones);
    }

    if(i.videoUrl){
      const video=document.createElement("a");
      video.target="_blank";video.rel="noopener noreferrer";video.href=i.videoUrl;video.textContent="Video";
      x.appendChild(document.createElement("br"));x.appendChild(video);
    }

    if(i.documentoUrl){
      const foto=document.createElement("a");
      foto.target="_blank";foto.rel="noopener noreferrer";foto.href=i.documentoUrl;foto.textContent="Fotografía / boleta";
      x.appendChild(document.createElement("br"));x.appendChild(foto);
    }

    lista.appendChild(x);
  });

  const resumen=document.getElementById("resumenActuaciones");
  if(resumen){
    if(esSupervisor && (desde||hasta))resumen.textContent="Mostrando "+datos.length+" actuación(es) entre "+(desde||"el inicio")+" y "+(hasta||"hoy")+".";
    else resumen.textContent="Mostrando "+datos.length+" actuación(es).";
  }
}

function abrirPdfActuacion(actuacion,modo){
  const url=actuacion.pdfUrl||actuacion.pdfDownloadUrl||"";
  if(!url)return;

  try{
    if(typeof apiRegistrarAuditoria==='function'){
      apiRegistrarAuditoria({
        usuario:usuario.usuario||"",
        nombre:usuario.nombre||"",
        rol:usuario.rol||"",
        accionRealizada:modo==="imprimir"?"Impresión de actuación PDF":"Consulta de actuación PDF",
        modulo:"Fiscalización",
        detalle:"Consulta del PDF de actuación "+(actuacion.numeroSerie||actuacion.id||""),
        referencia:String(actuacion.id||actuacion.numeroSerie||"")
      });
    }
  }catch(_){ }

  const ventana=window.open(url,"_blank","noopener,noreferrer");
  if(modo==="imprimir" && ventana){
    // Los visores PDF del navegador son los encargados de mostrar la opción de impresión.
    try{ventana.focus();}catch(_){ }
  }
}

async function cargar(){
  try{
    const r=await apiObtenerInspecciones();
    if(!r||!r.ok){
      mensaje(r?.mensaje||"No fue posible cargar las actuaciones.","error");
      return;
    }

    actuacionesCargadas=Array.isArray(r.datos)?r.datos:[];
    renderizarActuaciones();
  }catch(error){
    console.error("Error cargando actuaciones:",error);
    mensaje("Error cargando las actuaciones.","error");
  }
}

function descargarPdfLocal_(r){
  const url=r.pdfDownloadUrl||r.pdfUrl;
  if(!url)return false;
  const a=document.createElement("a");a.href=url;a.download=r.pdfNombre||((r.numeroSerie||"ACT")+".pdf");a.target="_blank";a.rel="noopener noreferrer";a.style.display="none";document.body.appendChild(a);
  try{a.click();}catch(e){window.open(url,"_blank","noopener,noreferrer");}
  window.setTimeout(()=>a.remove(),1500);return true;
}

function mostrarReporteGuardado(r){
  const existente=document.getElementById("reporteGuardadoOverlay");if(existente)existente.remove();
  const overlay=document.createElement("div");overlay.id="reporteGuardadoOverlay";overlay.className="reporte-guardado-overlay";
  const caja=document.createElement("div");caja.className="reporte-guardado-caja";
  const icono=document.createElement("div");icono.className="reporte-guardado-icono";icono.textContent="✓";
  const titulo=document.createElement("div");titulo.className="reporte-guardado-titulo";titulo.textContent="REPORTE GUARDADO CON ÉXITO";
  const detalle=document.createElement("div");detalle.className="reporte-guardado-detalle";
  let texto=r.mensaje||"La actuación fue registrada correctamente.";
  if(r.numeroSerie)texto+="\nSerie: "+r.numeroSerie;
  if(r.pdfUrl)texto+="\nPDF generado y guardado en Drive.";
  detalle.textContent=texto;
  caja.appendChild(icono);caja.appendChild(titulo);caja.appendChild(detalle);
  if(r.pdfUrl){
    const enlace=document.createElement("a");enlace.href=r.pdfUrl;enlace.target="_blank";enlace.rel="noopener noreferrer";enlace.className="reporte-guardado-pdf";enlace.textContent="Abrir reporte PDF";caja.appendChild(enlace);
    const descarga=document.createElement("a");descarga.href=r.pdfDownloadUrl||r.pdfUrl;descarga.download=r.pdfNombre||((r.numeroSerie||"ACT")+".pdf");descarga.className="reporte-guardado-pdf";descarga.textContent="Descargar copia PDF";caja.appendChild(descarga);
  }
  overlay.appendChild(caja);document.body.appendChild(overlay);
  if(r.pdfDownloadUrl||r.pdfUrl)window.setTimeout(()=>descargarPdfLocal_(r),250);
  window.setTimeout(()=>{overlay.classList.add("ocultando");window.setTimeout(()=>overlay.remove(),350);},5000);
}

function mensaje(t,c=""){const e=document.getElementById("mensaje");if(!e)return;e.textContent=t;e.className=c;}
function esc(v){return String(v||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
