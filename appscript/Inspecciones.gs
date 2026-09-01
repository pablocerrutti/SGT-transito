/********************************************************
 * SGT - ACTUACIONES DE TRANSITO
 * Fiscalizacion + Movilidad
 * Compatible con registros existentes.
 * PDF con marca de agua SGT + logo en pie.
 ********************************************************/

const CARPETA_ACTUACIONES_ID_ = "1sUXE34S_Vnt2c55HmkB3M9l18tPXfZJP";

// Recursos gráficos públicos del repositorio SGT.
const SGT_ICON_URL_ = "https://raw.githubusercontent.com/pablocerrutti/SGT-transito/main/img/sgt.ico";
const SGT_LOGO_URL_ = "https://raw.githubusercontent.com/pablocerrutti/SGT-transito/main/img/logo.png";

function hojaInspecciones_(){
  const ss = bd();
  let sh = ss.getSheetByName("Inspecciones");
  if(!sh){
    sh = ss.insertSheet("Inspecciones");
    sh.appendRow([
      "ID","Elemento ID","Código elemento","Inspector","Beta","Fecha",
      "Matrícula","Tipo actuación","Número boleta","Nombre infractor","Cédula",
      "Incidencia","Video URL","Foto/boleta URL","Estado","Activo",
      "Rol","Usuario","Número serie","PDF URL"
    ]);
    sh.setFrozenRows(1);
  } else {
    asegurarColumnasInspecciones_(sh);
  }
  return sh;
}

function asegurarColumnasInspecciones_(sh){
  const requeridas = [
    "ID","Elemento ID","Código elemento","Inspector","Beta","Fecha",
    "Matrícula","Tipo actuación","Número boleta","Nombre infractor","Cédula",
    "Incidencia","Video URL","Foto/boleta URL","Estado","Activo",
    "Rol","Usuario","Número serie","PDF URL"
  ];
  let ultima = Math.max(sh.getLastColumn(),1);
  let encabezados = sh.getRange(1,1,1,ultima).getDisplayValues()[0].map(v=>String(v||"").trim());
  if(!encabezados[0]){
    sh.getRange(1,1,1,requeridas.length).setValues([requeridas]);
    return;
  }
  requeridas.forEach(nombre=>{
    if(encabezados.indexOf(nombre)===-1){
      sh.getRange(1,encabezados.length+1).setValue(nombre);
      encabezados.push(nombre);
    }
  });
}

function obtenerInspecciones(e){
  try{
    const p=(e&&e.parameter)||{};
    const id=String(p.id||"").trim();
    const sh=hojaInspecciones_();
    if(sh.getLastRow()<2) return {ok:true,datos:[]};
    const valores=sh.getRange(1,1,sh.getLastRow(),sh.getLastColumn()).getDisplayValues();
    const encabezados=valores[0].map(v=>String(v||"").trim());
    const mapa={};
    encabezados.forEach((v,i)=>{if(v) mapa[v]=i;});
    const valor=(f,nombres)=>{
      for(const n of nombres){ if(mapa[n]!==undefined) return String(f[mapa[n]]||"").trim(); }
      return "";
    };
    const datos=[];
    for(let i=1;i<valores.length;i++){
      const f=valores[i];
      const idRegistro=valor(f,["ID","Id","id"]);
      if(!idRegistro) continue;
      const elementoId=valor(f,["Elemento ID"]);
      if(id && elementoId!==id) continue;
      const activo=valor(f,["Activo"]);
      if(["NO","N","FALSE","FALSO","0","INACTIVO"].includes(activo.toUpperCase())) continue;
      const incidencia=valor(f,["Incidencia","Detalle","Descripción","Descripcion"]);
      datos.push({
        id:idRegistro, elementoId:elementoId,
        codigoElemento:valor(f,["Código elemento","Codigo elemento"]),
        inspector:valor(f,["Inspector"]), beta:valor(f,["Beta"]), fecha:valor(f,["Fecha"]),
        matricula:valor(f,["Matrícula","Matricula"]),
        tipoActuacion:valor(f,["Tipo actuación","Tipo de actuación"]),
        numeroBoleta:valor(f,["Número boleta","Numero boleta"]),
        nombreInfractor:valor(f,["Nombre infractor"]),
        cedula:valor(f,["Cédula","Cedula"]), incidencia:incidencia, detalle:incidencia,
        videoUrl:valor(f,["Video URL"]), documentoUrl:valor(f,["Foto/boleta URL","Documento URL"]),
        estado:valor(f,["Estado"]), activo:activo||"SI", rol:valor(f,["Rol"]), usuario:valor(f,["Usuario"]),
        numeroSerie:valor(f,["Número serie","Numero serie","Serie"]), pdfUrl:valor(f,["PDF URL"])
      });
    }
    return {ok:true,datos:datos};
  }catch(error){
    console.error("Error obtenerInspecciones:",error);
    return {ok:false,mensaje:"No fue posible obtener inspecciones: "+(error.message||error)};
  }
}

function guardarInspeccion(e){
  const p=(e&&e.parameter)||{};
  try{
    const inspector=String(p.inspector||"Inspector").trim();
    const beta=String(p.beta||"").trim();
    const rol=normalizarRolInspeccion_(p.rol||"");
    const usuario=String(p.usuario||p.usuarioLogin||"").trim();
    const matricula=String(p.matricula||p.matriculaVehiculo||"").trim().toUpperCase();
    const tipoActuacion=String(p.tipoActuacion||p.tipo||"").trim();
    const numeroBoleta=String(p.numeroBoleta||"").trim();
    const nombreInfractor=String(p.nombreInfractor||"").trim();
    const cedula=String(p.cedula||"").trim();
    const incidencia=String(p.detalle||p.incidencia||"").trim();
    const elementoId=String(p.elementoId||"").trim();
    const codigoElemento=String(p.codigoElemento||"").trim();
    const videoUrl=String(p.videoUrl||"").trim();
    const documentoUrl=String(p.documentoUrl||p.fotoUrl||"").trim();
    const estado=String(p.estado||"Registrada").trim();

    if(!tipoActuacion) return {ok:false,mensaje:"Debe seleccionar el tipo de actuación."};
    if(rol==="fiscalizacion"){
      if(!beta) return {ok:false,mensaje:"No tiene Número Beta asignado."};
      if(!matricula) return {ok:false,mensaje:"Debe ingresar la matrícula."};
      if(!nombreInfractor) return {ok:false,mensaje:"Debe ingresar el nombre del infractor."};
      if(!cedula) return {ok:false,mensaje:"Debe ingresar la cédula de identidad."};
      if(!incidencia) return {ok:false,mensaje:"Debe ingresar el detalle de la actuación."};
    }

    const betaFinal=rol==="movilidad" ? "No posee" : beta;
    const inspectorFinal=inspector||usuario||"Movilidad";
    const lock=LockService.getScriptLock();
    lock.waitLock(30000);
    try{
      const sh=hojaInspecciones_();
      const mapa=mapaColumnasInspecciones_(sh);
      const id=generarID("INS");
      const numeroSerie=generarNumeroSerieActuacion_();
      const fecha=ahoraSeguro_();
      const valores={
        "ID":id,"Elemento ID":elementoId,"Código elemento":codigoElemento,
        "Inspector":inspectorFinal,"Beta":betaFinal,"Fecha":fecha,"Matrícula":matricula,
        "Tipo actuación":tipoActuacion,"Número boleta":numeroBoleta,"Nombre infractor":nombreInfractor,
        "Cédula":cedula,"Incidencia":incidencia,"Video URL":videoUrl,"Foto/boleta URL":documentoUrl,
        "Estado":estado,"Activo":"SI","Rol":rol||"fiscalizacion",
        "Usuario":usuario||inspectorFinal,"Número serie":numeroSerie,"PDF URL":""
      };
      const fila=new Array(sh.getLastColumn()).fill("");
      Object.keys(valores).forEach(campo=>{if(mapa[campo]) fila[mapa[campo]-1]=valores[campo];});
      sh.appendRow(fila);
      SpreadsheetApp.flush();

      let pdf;
      try{
        pdf=generarPdfActuacion_(valores);
        valores["PDF URL"]=pdf.url;
        if(mapa["PDF URL"]) sh.getRange(sh.getLastRow(),mapa["PDF URL"]).setValue(pdf.url);
      }catch(pdfError){
        console.error("PDF actuación:",pdfError);
        return {ok:false,mensaje:"La actuación fue guardada, pero no se pudo generar el PDF: "+(pdfError.message||pdfError),id:id,numeroSerie:numeroSerie};
      }
      SpreadsheetApp.flush();
      return {
        ok:true,mensaje:"Actuación registrada y reporte PDF generado correctamente.",id:id,numeroSerie:numeroSerie,pdfUrl:pdf.url,
        datos:{id:id,numeroSerie:numeroSerie,matricula:matricula,tipoActuacion:tipoActuacion,inspector:inspectorFinal,beta:betaFinal,rol:rol,usuario:usuario||inspectorFinal,videoUrl:videoUrl,documentoUrl:documentoUrl,pdfUrl:pdf.url}
      };
    }finally{ lock.releaseLock(); }
  }catch(error){
    console.error("Error guardarInspeccion:",error);
    return {ok:false,mensaje:"No fue posible guardar la actuación: "+(error.message||error)};
  }
}

function generarNumeroSerieActuacion_(){
  const props=PropertiesService.getScriptProperties();
  const lock=LockService.getScriptLock();
  const actual=Number(props.getProperty("SGT_CONTADOR_ACTUACIONES")||"0");
  const siguiente=actual+1;
  props.setProperty("SGT_CONTADOR_ACTUACIONES",String(siguiente));
  return "ACT-"+String(siguiente).padStart(6,"0");
}

function normalizarRolInspeccion_(valor){
  return String(valor||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
}

//==================================================
// PDF DE ACTUACIÓN
//==================================================
// Se genera como HTML convertido a PDF para poder colocar:
//  - sgt.ico como marca de agua a todo el ancho de la página
//  - logo.png en el pie de página
//  - fotografía embebida dentro del PDF
//  - links clickeables para fotos/videos
//==================================================
function generarPdfActuacion_(datos){
  const folder=DriveApp.getFolderById(CARPETA_ACTUACIONES_ID_);
  const serie=String(datos["Número serie"]||"ACT");
  const tipo=String(datos["Tipo actuación"]||datos.tipoActuacion||"Actuación");
  const titulo=tipo+" - "+serie;

  const watermark=dataUriRepositorio_(SGT_ICON_URL_,"image/x-icon");
  const logo=dataUriRepositorio_(SGT_LOGO_URL_,"image/png");
  const fotoHtml=construirFotosPdf_(datos["Foto/boleta URL"]||"");
  const videoHtml=construirLinksPdf_(datos["Video URL"]||"","Video / multimedia");
  const fotoLinksHtml=construirLinksPdf_(datos["Foto/boleta URL"]||"","Abrir fotografía / documento en Drive");

  const esc=escHtml_;
  const html='<!DOCTYPE html><html><head><meta charset="UTF-8">'+
    '<style>'+ 
    '@page{size:A4;margin:18mm 15mm 25mm 15mm;}'+
    'body{font-family:Arial,sans-serif;color:#1f2937;font-size:11px;line-height:1.45;margin:0;}'+
    '.watermark{position:fixed;z-index:-1;top:45mm;left:0;width:100%;opacity:.055;}'+
    '.header{border-bottom:2px solid #1f2937;padding-bottom:8px;margin-bottom:14px;}'+
    '.title{font-size:19px;font-weight:bold;margin:0 0 4px;}'+
    '.sub{font-size:11px;color:#4b5563;}'+
    '.section{font-size:13px;font-weight:bold;margin:16px 0 7px;border-bottom:1px solid #9ca3af;padding-bottom:3px;}'+
    'table{width:100%;border-collapse:collapse;margin-bottom:10px;}'+
    'td{border:1px solid #d1d5db;padding:6px;vertical-align:top;}'+
    'td.label{width:32%;font-weight:bold;background:#f3f4f6;}'+
    '.description{border:1px solid #d1d5db;padding:9px;white-space:pre-wrap;min-height:35px;}'+
    '.photo{display:block;max-width:170mm;max-height:105mm;width:auto;height:auto;margin:8px auto 3px;object-fit:contain;}'+
    '.photo-caption{text-align:center;font-size:9px;color:#4b5563;margin-bottom:10px;}'+
    '.links a{color:#1155cc;text-decoration:underline;}'+
    '.footer{position:fixed;bottom:-17mm;left:0;right:0;height:13mm;border-top:1px solid #9ca3af;font-size:8px;color:#4b5563;text-align:center;padding-top:3px;}'+
    '.footer img{height:9mm;width:auto;vertical-align:middle;margin-right:8px;}'+
    '.page{page-break-after:auto;}'+
    '</style></head><body>'+ 
    '<img class="watermark" src="'+watermark+'">'+
    '<div class="header"><div class="title">'+esc(titulo)+'</div><div class="sub">SGT - SISTEMA DE GESTIÓN DE TRÁNSITO</div></div>'+ 
    '<table><tr><td class="label">Número de serie</td><td>'+esc(serie)+'</td></tr>'+ 
    '<tr><td class="label">Fecha y hora</td><td>'+esc(datos.Fecha||"")+'</td></tr>'+ 
    '<tr><td class="label">Responsable</td><td>'+esc(datos.Inspector||"")+'</td></tr>'+ 
    '<tr><td class="label">Usuario</td><td>'+esc(datos.Usuario||"")+'</td></tr>'+ 
    '<tr><td class="label">Rol</td><td>'+esc(datos.Rol||"")+'</td></tr></table>'+ 
    '<div class="section">DATOS DE LA ACTUACIÓN</div>'+ 
    '<table><tr><td class="label">Tipo de actuación</td><td>'+esc(tipo)+'</td></tr>'+ 
    '<tr><td class="label">Número Beta</td><td>'+esc(datos.Beta||"No posee")+'</td></tr>'+ 
    '<tr><td class="label">Matrícula</td><td>'+esc(datos["Matrícula"]||"No informada")+'</td></tr>'+ 
    '<tr><td class="label">Número de boleta</td><td>'+esc(datos["Número boleta"]||"No informado")+'</td></tr>'+ 
    '<tr><td class="label">Nombre del infractor</td><td>'+esc(datos["Nombre infractor"]||"No informado")+'</td></tr>'+ 
    '<tr><td class="label">Cédula</td><td>'+esc(datos["Cédula"]||"No informada")+'</td></tr></table>'+ 
    '<div class="section">DESCRIPCIÓN / DETALLE</div>'+ 
    '<div class="description">'+esc(datos.Incidencia||"Sin descripción adicional.")+'</div>'+ 
    '<div class="section">EVIDENCIA FOTOGRÁFICA</div>'+ 
    (fotoHtml||'<p>No se adjuntaron fotografías.</p>')+
    '<div class="section">ENLACES A MULTIMEDIA</div>'+ 
    '<div class="links">'+(fotoLinksHtml||'')+(videoHtml||'')+(fotoLinksHtml||videoHtml?'':'No se adjuntó multimedia.')+'</div>'+ 
    '<div class="footer"><img src="'+logo+'"><span>SGT - Sistema de Gestión de Tránsito | Documento generado automáticamente para auditoría</span></div>'+ 
    '</body></html>';

  try{
    const htmlBlob=Utilities.newBlob(html,'text/html',titulo+'.html');
    const pdfBlob=htmlBlob.getAs(MimeType.PDF).setName(titulo+'.pdf');
    const pdfFile=folder.createFile(pdfBlob);
    return {ok:true,id:pdfFile.getId(),url:pdfFile.getUrl(),nombre:pdfFile.getName()};
  }catch(error){
    throw new Error("No fue posible generar el PDF de la actuación: "+(error.message||error));
  }
}

function dataUriRepositorio_(url,mimeFallback){
  try{
    const response=UrlFetchApp.fetch(url,{muteHttpExceptions:true,followRedirects:true});
    const code=response.getResponseCode();
    if(code<200||code>=300) throw new Error("HTTP "+code+" al cargar "+url);
    const blob=response.getBlob();
    const mime=blob.getContentType()||mimeFallback;
    return 'data:'+mime+';base64,'+Utilities.base64Encode(blob.getBytes());
  }catch(error){
    console.error("No se pudo cargar recurso gráfico:",url,error);
    return '';
  }
}

function extraerIdDrive_(url){
  const s=String(url||"").trim();
  if(!s) return "";
  let m=s.match(/\/d\/([a-zA-Z0-9_-]{10,})/); if(m) return m[1];
  m=s.match(/[?&]id=([a-zA-Z0-9_-]{10,})/); if(m) return m[1];
  m=s.match(/[-_a-zA-Z0-9]{20,}/); return m?m[0]:"";
}

function listaUrls_(texto){
  return String(texto||"").split(/[\n,;]+/).map(v=>v.trim()).filter(Boolean);
}

function construirFotosPdf_(texto){
  const urls=listaUrls_(texto);
  const partes=[];
  urls.forEach(function(url){
    try{
      const id=extraerIdDrive_(url);
      if(!id) return;
      const file=DriveApp.getFileById(id);
      const blob=file.getBlob();
      const mime=blob.getContentType()||"image/jpeg";
      if(mime.indexOf("image/")!==0) return;
      const data='data:'+mime+';base64,'+Utilities.base64Encode(blob.getBytes());
      partes.push('<img class="photo" src="'+data+'"><div class="photo-caption">'+escHtml_(file.getName())+'<br>Descripción: '+escHtml_("")+'</div>');
    }catch(error){
      console.error("No se pudo insertar foto en PDF:",url,error);
    }
  });
  return partes.join('');
}

function construirLinksPdf_(texto,etiqueta){
  const urls=listaUrls_(texto);
  if(!urls.length) return '';
  return urls.map(function(url,i){
    const nombre=etiqueta+(urls.length>1?' '+(i+1):'');
    return '<p><a href="'+escHtml_(url)+'">'+escHtml_(nombre)+'</a></p>';
  }).join('');
}

function escHtml_(valor){
  return String(valor==null?"":valor).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/\n/g,'<br>');
}

function subirArchivo(e){
  const p=(e&&e.parameter)||{};
  try{
    const base64=String(p.archivoBase64||"").trim();
    const nombreOriginal=String(p.nombreArchivo||"").trim();
    if(!base64) return {ok:false,mensaje:"No se recibió el contenido del archivo."};
    if(!nombreOriginal) return {ok:false,mensaje:"No se recibió el nombre del archivo."};
    const nombreLimpio=nombreOriginal.replace(/[\\/:*?"<>|]/g,"_");
    const nombre=Utilities.formatDate(new Date(),Session.getScriptTimeZone(),"yyyyMMdd-HHmmss")+"-"+Utilities.getUuid().slice(0,8)+"-"+nombreLimpio;
    const mime=String(p.mimeType||"application/octet-stream");
    const blob=Utilities.newBlob(Utilities.base64Decode(base64),mime,nombre);
    const archivo=DriveApp.getFolderById(CARPETA_ACTUACIONES_ID_).createFile(blob);
    return {ok:true,url:archivo.getUrl(),id:archivo.getId(),nombre:archivo.getName(),mimeType:archivo.getMimeType(),size:archivo.getSize()};
  }catch(error){
    console.error("Error subirArchivo:",error);
    return {ok:false,mensaje:"No fue posible subir el archivo a Drive: "+(error.message||error)};
  }
}

function mapaColumnasInspecciones_(sh){
  const encabezados=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];
  const mapa={};
  encabezados.forEach((v,i)=>{const n=String(v||"").trim();if(n) mapa[n]=i+1;});
  return mapa;
}

function ahoraSeguro_(){
  if(typeof ahora==="function") return ahora();
  if(typeof fecha==="function") return fecha();
  return Utilities.formatDate(new Date(),Session.getScriptTimeZone(),"dd/MM/yyyy HH:mm:ss");
}
