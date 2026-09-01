/********************************************************
 * SGT - ACTUACIONES DE TRANSITO
 * Fiscalizacion + Movilidad
 * Compatible con registros existentes.
 ********************************************************/

const CARPETA_ACTUACIONES_ID_ = "1sUXE34S_Vnt2c55HmkB3M9l18tPXfZJP";

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

    // Fiscalización mantiene sus campos obligatorios originales.
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
        return {
          ok:false,
          mensaje:"La actuación fue guardada, pero no se pudo generar el PDF: "+(pdfError.message||pdfError),
          id:id, numeroSerie:numeroSerie
        };
      }
      SpreadsheetApp.flush();
      return {
        ok:true,
        mensaje:"Actuación registrada y reporte PDF generado correctamente.",
        id:id, numeroSerie:numeroSerie, pdfUrl:pdf.url,
        datos:{id:id,numeroSerie:numeroSerie,matricula:matricula,tipoActuacion:tipoActuacion,
          inspector:inspectorFinal,beta:betaFinal,rol:rol,usuario:usuario||inspectorFinal,
          videoUrl:videoUrl,documentoUrl:documentoUrl,pdfUrl:pdf.url}
      };
    }finally{ lock.releaseLock(); }
  }catch(error){
    console.error("Error guardarInspeccion:",error);
    return {ok:false,mensaje:"No fue posible guardar la actuación: "+(error.message||error)};
  }
}

function generarNumeroSerieActuacion_(){
  const props=PropertiesService.getScriptProperties();
  const actual=Number(props.getProperty("SGT_CONTADOR_ACTUACIONES")||"0");
  const siguiente=actual+1;
  props.setProperty("SGT_CONTADOR_ACTUACIONES",String(siguiente));
  return "ACT-"+String(siguiente).padStart(6,"0");
}

function normalizarRolInspeccion_(valor){
  return String(valor||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
}

function generarPdfActuacion_(datos){
  const folder=DriveApp.getFolderById(CARPETA_ACTUACIONES_ID_);
  const serie=String(datos["Número serie"]||"ACT");
  const tipo=String(datos["Tipo actuación"]||datos.tipoActuacion||"Actuación");
  const titulo=tipo+" - "+serie;
  const doc=DocumentApp.create(titulo);
  const docFile=DriveApp.getFileById(doc.getId());
  try{
    docFile.moveTo(folder);
    const body=doc.getBody();
    body.clear();
    body.appendParagraph("SGT - SISTEMA DE GESTIÓN DE TRÁNSITO").setHeading(DocumentApp.ParagraphHeading.TITLE);
    body.appendParagraph(titulo).setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph("Número de serie: "+serie);
    body.appendParagraph("Fecha y hora: "+(datos.Fecha||""));
    body.appendParagraph("Responsable: "+(datos.Inspector||""));
    body.appendParagraph("Usuario: "+(datos.Usuario||""));
    body.appendParagraph("Rol: "+(datos.Rol||""));
    body.appendHorizontalRule();
    body.appendParagraph("DATOS DE LA ACTUACIÓN").setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph("Tipo de actuación: "+tipo);
    body.appendParagraph("Número Beta: "+(datos.Beta||"No posee"));
    body.appendParagraph("Matrícula: "+(datos["Matrícula"]||"No informada"));
    body.appendParagraph("Número de boleta: "+(datos["Número boleta"]||"No informado"));
    body.appendParagraph("Nombre del infractor: "+(datos["Nombre infractor"]||"No informado"));
    body.appendParagraph("Cédula: "+(datos["Cédula"]||"No informada"));
    body.appendParagraph("DESCRIPCIÓN / DETALLE").setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph(datos.Incidencia||"Sin descripción adicional.");
    body.appendParagraph("EVIDENCIA MULTIMEDIA").setHeading(DocumentApp.ParagraphHeading.HEADING2);
    if(datos["Foto/boleta URL"]){
      const pf=body.appendParagraph("Fotografía / boleta - abrir en Drive");
      pf.setLinkUrl(datos["Foto/boleta URL"]);
    }else body.appendParagraph("Fotografía / boleta: No adjunta");
    if(datos["Video URL"]){
      const pv=body.appendParagraph("Video - abrir en Drive");
      pv.setLinkUrl(datos["Video URL"]);
    }else body.appendParagraph("Video: No adjunto");
    body.appendHorizontalRule();
    body.appendParagraph("Documento generado automáticamente por SGT para auditoría de actuaciones.");
    doc.saveAndClose();
    const pdfBlob=docFile.getAs(MimeType.PDF).setName(titulo+".pdf");
    const pdfFile=folder.createFile(pdfBlob);
    docFile.setTrashed(true);
    return {ok:true,id:pdfFile.getId(),url:pdfFile.getUrl(),nombre:pdfFile.getName()};
  }catch(error){
    try{docFile.setTrashed(true);}catch(_){ }
    throw new Error("No fue posible generar el PDF de la actuación: "+(error.message||error));
  }
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
