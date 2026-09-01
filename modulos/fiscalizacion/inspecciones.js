/********************************************************
 SGT - MODULO FISCALIZACION
 Fiscalizacion + Movilidad
********************************************************/

let usuario=null;
let rol="";
try{usuario=JSON.parse(localStorage.getItem("usuarioActual"));}catch(e){usuario=null;}
rol=String((usuario||{}).rol||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();

if(!usuario){location.href="../../index.html";}
else if(!["super admin","supervisor","fiscalizacion","movilidad"].includes(rol)){location.href="../../pages/dashboard.html";}
else{
  const usuarioNombre=document.getElementById("usuarioNombre");
  if(usuarioNombre)usuarioNombre.textContent=usuario.nombre||usuario.usuario||"";
  iniciar();
}

function iniciar(){
  const btnVolver=document.getElementById("btnVolver");
  if(btnVolver)btnVolver.onclick=()=>location.href="../../pages/dashboard.html";
  cargarInspector();
  const formulario=document.getElementById("formInspeccion");
  if(formulario)formulario.onsubmit=guardar;
  actualizarCamposPorRol();
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

function descargarPdfLocal_(r){
  const url=r.pdfDownloadUrl||r.pdfUrl;
  if(!url)return false;
  const a=document.createElement("a");
  a.href=url;
  a.download=r.pdfNombre||((r.numeroSerie||"ACT")+".pdf");
  a.target="_blank";
  a.rel="noopener noreferrer";
  a.style.display="none";
  document.body.appendChild(a);
  try{a.click();}catch(e){window.open(url,"_blank","noopener,noreferrer");}
  window.setTimeout(()=>a.remove(),1500);
  return true;
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
  // La copia local se descarga automáticamente una vez que el servidor confirma que el PDF existe.
  if(r.pdfDownloadUrl||r.pdfUrl)window.setTimeout(()=>descargarPdfLocal_(r),250);
  window.setTimeout(()=>{overlay.classList.add("ocultando");window.setTimeout(()=>overlay.remove(),350);},5000);
}

async function cargar(){
  try{
    const r=await apiObtenerInspecciones(),lista=document.getElementById("lista");if(!lista)return;
    lista.replaceChildren();
    if(!r||!r.ok){mensaje(r?.mensaje||"No fue posible cargar las actuaciones.","error");return;}
    (r.datos||[]).forEach(i=>{const x=document.createElement("article");x.className="inspeccion";x.innerHTML=`<strong>${esc(i.numeroSerie||i.id||"")} - ${esc(i.matricula||"Sin matrícula")} - ${esc(i.tipoActuacion||"")}</strong><p>${esc(i.detalle||"")}</p><small>${esc(i.inspector||"")} ${i.beta?" - Beta "+esc(i.beta):""} - ${esc(i.rol||"")} - ${esc(i.fecha||"")}</small>${i.pdfUrl?`<br><a target="_blank" rel="noopener noreferrer" href="${esc(i.pdfUrl)}">Reporte PDF</a>`:""}${i.videoUrl?`<br><a target="_blank" rel="noopener noreferrer" href="${esc(i.videoUrl)}">Video</a>`:""}${i.documentoUrl?`<br><a target="_blank" rel="noopener noreferrer" href="${esc(i.documentoUrl)}">Fotografía / boleta</a>`:""}`;lista.appendChild(x);});
  }catch(error){console.error("Error cargando actuaciones:",error);mensaje("Error cargando las actuaciones.","error");}
}
function mensaje(t,c=""){const e=document.getElementById("mensaje");if(!e)return;e.textContent=t;e.className=c;}
function esc(v){return String(v||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
