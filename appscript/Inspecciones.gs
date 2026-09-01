/********************************************************
 * SGT - ACTUACIONES DE TRANSITO
 * Fiscalizacion + Movilidad
 * PDF con marca de agua SGT, logo rojo y descarga local.
 ********************************************************/

const CARPETA_ACTUACIONES_ID_ = "1sUXE34S_Vnt2c55HmkB3M9l18tPXfZJP";
const SGT_ICON_URL_ = "https://raw.githubusercontent.com/pablocerrutti/SGT-transito/main/img/sgt.ico";
const SGT_LOGO_URL_ = "https://raw.githubusercontent.com/pablocerrutti/SGT-transito/main/img/logo.png";

function hojaInspecciones_(){
  const ss=bd();
  let sh=ss.getSheetByName("Inspecciones");
  if(!sh){
    sh=ss.insertSheet("Inspecciones");
    sh.appendRow(["ID","Elemento ID","Código elemento","Inspector","Beta","Fecha","Matrícula","Tipo actuación","Número boleta","Nombre infractor","Cédula","Incidencia","Video URL","Foto/boleta URL","Estado","Activo","Rol","Usuario","Número serie","PDF URL"]);
    sh.setFrozenRows(1);
  }else asegurarColumnasInspecciones_(sh);
  return sh;
}

function asegurarColumnasInspecciones_(sh){
  const req=["ID","Elemento ID","Código elemento","Inspector","Beta","Fecha","Matrícula","Tipo actuación","Número boleta","Nombre infractor","Cédula","Incidencia","Video URL","Foto/boleta URL","Estado","Activo","Rol","Usuario","Número serie","PDF URL"];
  let enc=sh.getRange(1,1,1,Math.max(sh.getLastColumn(),1)).getDisplayValues()[0].map(v=>String(v||"").trim());
  if(!enc[0]){sh.getRange(1,1,1,req.length).setValues([req]);return;}
  req.forEach(n=>{if(enc.indexOf(n)===-1){sh.getRange(1,enc.length+1).setValue(n);enc.push(n);}});
}

function obtenerInspecciones(e){
  try{
    const p=(e&&e.parameter)||{}, id=String(p.id||"").trim(), sh=hojaInspecciones_();
    if(sh.getLastRow()<2)return {ok:true,datos:[]};
    const v=sh.getDataRange().getDisplayValues(), h=v[0].map(x=>String(x||"").trim()), m={};
    h.forEach((x,i)=>{if(x)m[x]=i;});
    const val=(f,n)=>{for(const x of n)if(m[x]!==undefined)return String(f[m[x]]||"").trim();return "";};
    const datos=[];
    for(let i=1;i<v.length;i++){
      const f=v[i], rid=val(f,["ID","Id","id"]); if(!rid)continue;
      const eid=val(f,["Elemento ID"]); if(id&&eid!==id)continue;
      const activo=val(f,["Activo"]); if(["NO","N","FALSE","FALSO","0","INACTIVO"].includes(activo.toUpperCase()))continue;
      const incidencia=val(f,["Incidencia","Detalle","Descripción","Descripcion"]);
      datos.push({id:rid,elementoId:eid,codigoElemento:val(f,["Código elemento","Codigo elemento"]),inspector:val(f,["Inspector"]),beta:val(f,["Beta"]),fecha:val(f,["Fecha"]),matricula:val(f,["Matrícula","Matricula"]),tipoActuacion:val(f,["Tipo actuación","Tipo de actuación"]),numeroBoleta:val(f,["Número boleta","Numero boleta"]),nombreInfractor:val(f,["Nombre infractor"]),cedula:val(f,["Cédula","Cedula"]),incidencia:incidencia,detalle:incidencia,videoUrl:val(f,["Video URL"]),documentoUrl:val(f,["Foto/boleta URL","Documento URL"]),estado:val(f,["Estado"]),activo:activo||"SI",rol:val(f,["Rol"]),usuario:val(f,["Usuario"]),numeroSerie:val(f,["Número serie","Numero serie","Serie"]),pdfUrl:val(f,["PDF URL"])});
    }
    return {ok:true,datos:datos};
  }catch(error){return {ok:false,mensaje:"No fue posible obtener inspecciones: "+(error.message||error)};}
}

function guardarInspeccion(e){
  const p=(e&&e.parameter)||{};
  try{
    const inspector=String(p.inspector||"Inspector").trim(), beta=String(p.beta||"").trim(), rol=normalizarRolInspeccion_(p.rol||""), usuario=String(p.usuario||p.usuarioLogin||"").trim();
    const matricula=String(p.matricula||p.matriculaVehiculo||"").trim().toUpperCase(), tipoActuacion=String(p.tipoActuacion||p.tipo||"").trim();
    const numeroBoleta=String(p.numeroBoleta||"").trim(), nombreInfractor=String(p.nombreInfractor||"").trim(), cedula=String(p.cedula||"").trim();
    const incidencia=String(p.detalle||p.incidencia||"").trim(), elementoId=String(p.elementoId||"").trim(), codigoElemento=String(p.codigoElemento||"").trim();
    const videoUrl=String(p.videoUrl||"").trim(), documentoUrl=String(p.documentoUrl||p.fotoUrl||"").trim(), estado=String(p.estado||"Registrada").trim();
    if(!tipoActuacion)return {ok:false,mensaje:"Debe seleccionar el tipo de actuación."};
    if(rol==="fiscalizacion"){
      if(!beta)return {ok:false,mensaje:"No tiene Número Beta asignado."};
      if(!matricula)return {ok:false,mensaje:"Debe ingresar la matrícula."};
      if(!nombreInfractor)return {ok:false,mensaje:"Debe ingresar el nombre del infractor."};
      if(!cedula)return {ok:false,mensaje:"Debe ingresar la cédula de identidad."};
      if(!incidencia)return {ok:false,mensaje:"Debe ingresar el detalle de la actuación."};
    }
    const betaFinal=rol==="movilidad"?"No posee":beta, inspectorFinal=inspector||usuario||"Movilidad";
    const lock=LockService.getScriptLock(); lock.waitLock(30000);
    try{
      const sh=hojaInspecciones_(), mapa=mapaColumnasInspecciones_(sh), id=generarID("INS"), numeroSerie=generarNumeroSerieActuacion_(), fecha=ahoraSeguro_();
      const valores={"ID":id,"Elemento ID":elementoId,"Código elemento":codigoElemento,"Inspector":inspectorFinal,"Beta":betaFinal,"Fecha":fecha,"Matrícula":matricula,"Tipo actuación":tipoActuacion,"Número boleta":numeroBoleta,"Nombre infractor":nombreInfractor,"Cédula":cedula,"Incidencia":incidencia,"Video URL":videoUrl,"Foto/boleta URL":documentoUrl,"Estado":estado,"Activo":"SI","Rol":rol||"fiscalizacion","Usuario":usuario||inspectorFinal,"Número serie":numeroSerie,"PDF URL":""};
      const fila=new Array(sh.getLastColumn()).fill(""); Object.keys(valores).forEach(c=>{if(mapa[c])fila[mapa[c]-1]=valores[c];}); sh.appendRow(fila); SpreadsheetApp.flush();
      try{
        const pdf=generarPdfActuacion_(valores);
        valores["PDF URL"]=pdf.url; if(mapa["PDF URL"])sh.getRange(sh.getLastRow(),mapa["PDF URL"]).setValue(pdf.url); SpreadsheetApp.flush();
        return {ok:true,mensaje:"Actuación registrada y reporte PDF generado correctamente.",id:id,numeroSerie:numeroSerie,pdfUrl:pdf.url,pdfDownloadUrl:pdf.downloadUrl,pdfNombre:pdf.nombre,datos:{id:id,numeroSerie:numeroSerie,matricula:matricula,tipoActuacion:tipoActuacion,inspector:inspectorFinal,beta:betaFinal,rol:rol,usuario:usuario||inspectorFinal,videoUrl:videoUrl,documentoUrl:documentoUrl,pdfUrl:pdf.url,pdfDownloadUrl:pdf.downloadUrl}};
      }catch(pdfError){return {ok:false,mensaje:"La actuación fue guardada, pero no se pudo generar el PDF: "+(pdfError.message||pdfError),id:id,numeroSerie:numeroSerie};}
    }finally{lock.releaseLock();}
  }catch(error){return {ok:false,mensaje:"No fue posible guardar la actuación: "+(error.message||error)};}
}

function generarNumeroSerieActuacion_(){
  const props=PropertiesService.getScriptProperties(), actual=Number(props.getProperty("SGT_CONTADOR_ACTUACIONES")||"0"), siguiente=actual+1;
  props.setProperty("SGT_CONTADOR_ACTUACIONES",String(siguiente)); return "ACT-"+String(siguiente).padStart(6,"0");
}

function normalizarRolInspeccion_(valor){return String(valor||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();}

function generarPdfActuacion_(datos){
  const folder=DriveApp.getFolderById(CARPETA_ACTUACIONES_ID_), serie=String(datos["Número serie"]||"ACT"), tipo=String(datos["Tipo actuación"]||datos.tipoActuacion||"Actuación"), titulo=tipo+" - "+serie;
  // El ICO se convierte en PNG en tiempo de ejecución para que el PDF nunca dependa de soporte ICO del renderizador.
  const watermark=dataUriRepositorio_(SGT_ICON_URL_,"image/x-icon",true), logo=dataUriRepositorio_(SGT_LOGO_URL_,"image/png",false);
  const fotoHtml=construirFotosPdf_(datos["Foto/boleta URL"]||""), videoHtml=construirLinksPdf_(datos["Video URL"]||"","Video / multimedia"), fotoLinksHtml=construirLinksPdf_(datos["Foto/boleta URL"]||"","Abrir fotografía / documento en Drive");
  const esc=escHtml_;
  const html='<!DOCTYPE html><html><head><meta charset="UTF-8"><style>'+ 
  '@page{size:A4;margin:18mm 15mm 25mm 15mm;}'+
  'html,body{margin:0;padding:0;background:#fff;}body{font-family:Arial,sans-serif;color:#202124;font-size:11px;line-height:1.45;}'+
  '.watermark{position:fixed;z-index:0;top:45mm;left:2.5%;width:95%;height:auto;opacity:.075;}'+
  '.content{position:relative;z-index:2;background:transparent;}'+
  '.header{border-bottom:2px solid #b40000;padding-bottom:8px;margin-bottom:14px;}'+
  '.title{font-size:19px;font-weight:bold;color:#b40000;margin:0 0 4px;}'+
  '.sub{font-size:11px;color:#555;}'+
  '.section{font-size:13px;font-weight:bold;color:#b40000;margin:16px 0 7px;border-bottom:1px solid #b40000;padding-bottom:3px;}'+
  'table{width:100%;border-collapse:collapse;margin-bottom:10px;}td{border:1px solid #d1d5db;padding:6px;vertical-align:top;background:rgba(255,255,255,.82);}td.label{width:32%;font-weight:bold;background:rgba(245,245,245,.9);}'+
  '.description{border:1px solid #d1d5db;padding:9px;white-space:pre-wrap;min-height:35px;background:rgba(255,255,255,.82);}'+
  '.photo{display:block;max-width:170mm;max-height:105mm;width:auto;height:auto;margin:8px auto 3px;object-fit:contain;}'+
  '.photo-caption{text-align:center;font-size:9px;color:#555;margin-bottom:10px;}'+
  '.links a{color:#1155cc;text-decoration:underline;}'+
  '.footer{position:fixed;z-index:3;bottom:-17mm;left:0;right:0;height:13mm;border-top:1px solid #b40000;font-size:8px;color:#555;text-align:center;padding-top:3px;background:#fff;}'+
  '.footer img{height:9mm;width:auto;vertical-align:middle;margin-right:8px;filter:brightness(0) saturate(100%) invert(16%) sepia(96%) saturate(5747%) hue-rotate(352deg) brightness(82%) contrast(119%);}'+
  '</style></head><body>'+
  (watermark?'<img class="watermark" src="'+watermark+'">':'')+
  '<div class="content"><div class="header"><div class="title">'+esc(titulo)+'</div><div class="sub">SGT - SISTEMA DE GESTIÓN DE TRÁNSITO</div></div>'+ 
  '<table><tr><td class="label">Número de serie</td><td>'+esc(datos.Fecha?serie:serie)+'</td></tr><tr><td class="label">Fecha y hora</td><td>'+esc(datos.Fecha||"")+'</td></tr><tr><td class="label">Responsable</td><td>'+esc(datos.Inspector||"")+'</td></tr><tr><td class="label">Usuario</td><td>'+esc(datos.Usuario||"")+'</td></tr><tr><td class="label">Rol</td><td>'+esc(datos.Rol||"")+'</td></tr></table>'+ 
  '<div class="section">DATOS DE LA ACTUACIÓN</div><table><tr><td class="label">Tipo de actuación</td><td>'+esc(tipo)+'</td></tr><tr><td class="label">Número Beta</td><td>'+esc(datos.Beta||"No posee")+'</td></tr><tr><td class="label">Matrícula</td><td>'+esc(datos["Matrícula"]||"No informada")+'</td></tr><tr><td class="label">Número de boleta</td><td>'+esc(datos["Número boleta"]||"No informado")+'</td></tr><tr><td class="label">Nombre del infractor</td><td>'+esc(datos["Nombre infractor"]||"No informado")+'</td></tr><tr><td class="label">Cédula</td><td>'+esc(datos["Cédula"]||"No informada")+'</td></tr></table>'+ 
  '<div class="section">DESCRIPCIÓN / DETALLE</div><div class="description">'+esc(datos.Incidencia||"Sin descripción adicional.")+'</div>'+ 
  '<div class="section">EVIDENCIA FOTOGRÁFICA</div>'+(fotoHtml||'<p>No se adjuntaron fotografías.</p>')+
  '<div class="section">ENLACES A MULTIMEDIA</div><div class="links">'+(fotoLinksHtml||'')+(videoHtml||'')+((fotoLinksHtml||videoHtml)?'':'No se adjuntó multimedia.')+'</div></div>'+ 
  (logo?'<div class="footer"><img src="'+logo+'"><span>SGT - Sistema de Gestión de Tránsito | Documento generado automáticamente para auditoría</span></div>':'<div class="footer">SGT - Sistema de Gestión de Tránsito | Documento generado automáticamente para auditoría</div>')+
  '</body></html>';
  const pdfBlob=Utilities.newBlob(html,'text/html',titulo+'.html').getAs(MimeType.PDF).setName(titulo+'.pdf');
  const pdfFile=folder.createFile(pdfBlob), id=pdfFile.getId();
  return {ok:true,id:id,url:pdfFile.getUrl(),downloadUrl:"https://drive.google.com/uc?export=download&id="+encodeURIComponent(id),nombre:pdfFile.getName()};
}

function dataUriRepositorio_(url,mimeFallback,convertirAPng){
  try{
    const response=UrlFetchApp.fetch(url,{muteHttpExceptions:true,followRedirects:true});
    const code=response.getResponseCode(); if(code<200||code>=300)throw new Error("HTTP "+code+" al cargar "+url);
    let blob=response.getBlob();
    if(convertirAPng){try{blob=blob.getAs(MimeType.PNG);}catch(e){console.warn("No fue posible convertir ICO a PNG; se usará el recurso original.",e);}}
    return 'data:'+(blob.getContentType()||mimeFallback)+';base64,'+Utilities.base64Encode(blob.getBytes());
  }catch(error){console.error("No se pudo cargar recurso gráfico:",url,error);return '';}
}

function extraerIdDrive_(url){const s=String(url||"").trim();if(!s)return "";let m=s.match(/\/d\/([a-zA-Z0-9_-]{10,})/);if(m)return m[1];m=s.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);if(m)return m[1];m=s.match(/[-_a-zA-Z0-9]{20,}/);return m?m[0]:"";}
function listaUrls_(texto){return String(texto||"").split(/[\n,;]+/).map(v=>v.trim()).filter(Boolean);}
function construirFotosPdf_(texto){
  const urls=listaUrls_(texto), partes=[];
  urls.forEach(function(url){try{const id=extraerIdDrive_(url);if(!id)return;const file=DriveApp.getFileById(id),blob=file.getBlob(),mime=blob.getContentType()||"image/jpeg";if(mime.indexOf("image/")!==0)return;const data='data:'+mime+';base64,'+Utilities.base64Encode(blob.getBytes());partes.push('<img class="photo" src="'+data+'"><div class="photo-caption">'+escHtml_(file.getName())+'</div>');}catch(error){console.error("No se pudo insertar foto en PDF:",url,error);}});return partes.join('');
}
function construirLinksPdf_(texto,etiqueta){const urls=listaUrls_(texto);if(!urls.length)return '';return urls.map((url,i)=>'<p><a href="'+escHtml_(url)+'">'+escHtml_(etiqueta+(urls.length>1?' '+(i+1):''))+'</a></p>').join('');}
function escHtml_(valor){return String(valor==null?"":valor).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/\n/g,'<br>');}

function subirArchivo(e){
  const p=(e&&e.parameter)||{};
  try{
    const base64=String(p.archivoBase64||"").trim(), nombreOriginal=String(p.nombreArchivo||"").trim();
    if(!base64)return {ok:false,mensaje:"No se recibió el contenido del archivo."};
    if(!nombreOriginal)return {ok:false,mensaje:"No se recibió el nombre del archivo."};
    const nombreLimpio=nombreOriginal.replace(/[\\/:*?"<>|]/g,"_"), nombre=Utilities.formatDate(new Date(),Session.getScriptTimeZone(),"yyyyMMdd-HHmmss")+"-"+Utilities.getUuid().slice(0,8)+"-"+nombreLimpio;
    const mime=String(p.mimeType||"application/octet-stream"), blob=Utilities.newBlob(Utilities.base64Decode(base64),mime,nombre), archivo=DriveApp.getFolderById(CARPETA_ACTUACIONES_ID_).createFile(blob);
    return {ok:true,url:archivo.getUrl(),id:archivo.getId(),nombre:archivo.getName(),mimeType:archivo.getMimeType(),size:archivo.getSize()};
  }catch(error){return {ok:false,mensaje:"No fue posible subir el archivo a Drive: "+(error.message||error)};}
}
function mapaColumnasInspecciones_(sh){const h=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0],m={};h.forEach((v,i)=>{const n=String(v||"").trim();if(n)m[n]=i+1;});return m;}
function ahoraSeguro_(){if(typeof ahora==="function")return ahora();if(typeof fecha==="function")return fecha();return Utilities.formatDate(new Date(),Session.getScriptTimeZone(),"dd/MM/yyyy HH:mm:ss");}
