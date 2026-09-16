/********************************************************
 * SGT - PDF DE ORDEN DE TRABAJO / INCIDENCIA
 *
 * Genera el PDF a partir de la fila REAL de Inspecciones.
 * Se utiliza Google Docs como motor intermedio para evitar
 * PDFs vacíos producidos por la conversión HTML directa.
 *
 * Incluye todos los campos cargados de la incidencia y,
 * cuando existen, incorpora las fotografías de Drive.
 ********************************************************/

function generarPdfActuacionOrdenTrabajo_(e){
  const p=(e&&e.parameter)||{};
  const id=String(p.id||p.actuacionId||'').trim();
  if(!id)return {ok:false,mensaje:'Falta el identificador de la incidencia.'};

  let tempDocId='';

  try{
    const sh=hojaInspecciones_();
    asegurarColumnasInspeccionesSeguro_(sh);

    const rango=sh.getDataRange();
    const valores=rango.getDisplayValues();
    if(valores.length<2)return {ok:false,mensaje:'No existen incidencias registradas.'};

    const encabezados=valores[0].map(function(v){return String(v||'').trim();});
    const indice={};
    encabezados.forEach(function(h,i){if(h)indice[h]=i;});

    let fila=null;
    let numeroFila=-1;
    for(let i=1;i<valores.length;i++){
      const rid=valorOrdenTrabajo_(valores[i],indice,['ID','Id','id']);
      if(rid===id){fila=valores[i];numeroFila=i+1;break;}
    }

    if(!fila)return {ok:false,mensaje:'Incidencia no encontrada.'};

    const dato=function(nombres){return valorOrdenTrabajo_(fila,indice,nombres);};
    const serie=dato(['Número serie','Numero serie','Serie'])||'ACT';
    const tipo=dato(['Tipo actuación','Tipo de actuación'])||'Actuación';
    const titulo='ORDEN DE TRABAJO - '+tipo+' - '+serie;

    // Crear documento temporal y usarlo como motor de composición PDF.
    const doc=DocumentApp.create(titulo);
    tempDocId=doc.getId();
    const body=doc.getBody();
    body.clear();
    body.setMarginTop(36).setMarginBottom(42).setMarginLeft(42).setMarginRight(42);

    const tituloPar=body.appendParagraph('ORDEN DE TRABAJO');
    tituloPar.setHeading(DocumentApp.ParagraphHeading.TITLE);
    tituloPar.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    const sub=body.appendParagraph('SGT - SISTEMA DE GESTIÓN DE TRÁNSITO');
    sub.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    sub.editAsText().setBold(true);

    body.appendHorizontalRule();

    const identificacion=body.appendParagraph('IDENTIFICACIÓN DE LA INCIDENCIA');
    identificacion.setHeading(DocumentApp.ParagraphHeading.HEADING1);

    agregarTablaCamposOrden_(body,[
      ['Número de serie',serie],
      ['ID de incidencia',dato(['ID'])],
      ['Fecha y hora',dato(['Fecha'])],
      ['Tipo de actuación',tipo],
      ['Inspector / responsable',dato(['Inspector'])],
      ['Usuario',dato(['Usuario'])],
      ['Rol',dato(['Rol'])],
      ['Estado',dato(['Estado'])],
      ['Incidencia estado',dato(['Incidencia Estado'])]
    ]);

    const actuacion=body.appendParagraph('DATOS DE LA ACTUACIÓN');
    actuacion.setHeading(DocumentApp.ParagraphHeading.HEADING1);

    agregarTablaCamposOrden_(body,[
      ['Elemento ID',dato(['Elemento ID'])],
      ['Código del elemento',dato(['Código elemento','Codigo elemento'])],
      ['Número Beta',dato(['Beta'])||'No posee'],
      ['Matrícula',dato(['Matrícula','Matricula'])],
      ['Número de boleta',dato(['Número boleta','Numero boleta'])],
      ['Nombre del infractor',dato(['Nombre infractor'])],
      ['Cédula',dato(['Cédula','Cedula'])]
    ]);

    const detalle=body.appendParagraph('DESCRIPCIÓN / DETALLE DE LA INCIDENCIA');
    detalle.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    const desc=body.appendParagraph(dato(['Incidencia','Detalle','Descripción','Descripcion'])||'Sin descripción registrada.');
    desc.setSpacingAfter(12);

    // Todos los demás campos que existan en la hoja y no hayan sido
    // presentados arriba. Esto hace que el PDF siga incluyendo campos
    // nuevos que se agreguen posteriormente a Inspecciones.
    const usados={
      'ID':1,'Elemento ID':1,'Código elemento':1,'Inspector':1,'Beta':1,
      'Fecha':1,'Matrícula':1,'Tipo actuación':1,'Número boleta':1,
      'Nombre infractor':1,'Cédula':1,'Incidencia':1,'Estado':1,'Rol':1,
      'Usuario':1,'Número serie':1,'Incidencia Estado':1,
      'Foto/boleta URL':1,'Foto Resolución URL':1,'PDF URL':1,
      'PDF Resolución URL':1,'Video URL':1,'Activo':1
    };

    const adicionales=[];
    encabezados.forEach(function(h,i){
      if(!h||usados[h])return;
      const v=String(fila[i]||'').trim();
      if(v)adicionales.push([h,v]);
    });

    if(adicionales.length){
      const extra=body.appendParagraph('OTROS DATOS REGISTRADOS');
      extra.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      agregarTablaCamposOrden_(body,adicionales);
    }

    const multimedia=body.appendParagraph('EVIDENCIA FOTOGRÁFICA');
    multimedia.setHeading(DocumentApp.ParagraphHeading.HEADING1);

    const urls=[];
    urls.concat(urlsOrdenTrabajo_(dato(['Foto/boleta URL','Documento URL'])));
    urls.concat(urlsOrdenTrabajo_(dato(['Foto Resolución URL'])));

    let fotosInsertadas=0;
    urls.forEach(function(url,idx){
      try{
        const foto=archivoImagenOrdenTrabajo_(url);
        if(!foto.ok)return;

        const pFoto=body.appendParagraph('Fotografía '+(fotosInsertadas+1));
        pFoto.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        pFoto.editAsText().setBold(true);

        const par=body.appendParagraph('');
        par.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        const imagen=par.appendInlineImage(foto.blob);
        dimensionarImagenOrdenTrabajo_(imagen,500,650);

        if(foto.nombre){
          const cap=body.appendParagraph(foto.nombre);
          cap.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
          cap.editAsText().setItalic(true);
        }
        fotosInsertadas++;
      }catch(err){
        console.error('No se pudo insertar fotografía en PDF:',url,err);
      }
    });

    if(!fotosInsertadas){
      body.appendParagraph('No se adjuntaron fotografías a esta incidencia.');
    }

    const video=dato(['Video URL']);
    if(video){
      const ev=body.appendParagraph('EVIDENCIA DIGITAL / VIDEO');
      ev.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      const pv=body.appendParagraph(video);
      pv.editAsText().setForegroundColor('#1155CC').setUnderline(true);
    }

    if(dato(['Foto Resolución URL'])||dato(['Fecha Resolución'])||dato(['Usuario Resolución'])){
      const res=body.appendParagraph('DATOS DE RESOLUCIÓN');
      res.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      agregarTablaCamposOrden_(body,[
        ['Fecha de resolución',dato(['Fecha Resolución'])],
        ['Usuario de resolución',dato(['Usuario Resolución'])],
        ['Fotografía de resolución',dato(['Foto Resolución URL'])?'Adjunta':'No adjunta']
      ]);
    }

    const pie=body.appendParagraph('SGT - Sistema de Gestión de Tránsito | Documento generado para impresión y orden de trabajo | Serie: '+serie);
    pie.setFontSize(8);
    pie.setForegroundColor('#666666');
    pie.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    doc.saveAndClose();
    Utilities.sleep(500);

    const docFile=DriveApp.getFileById(tempDocId);
    const pdfBlob=docFile.getAs(MimeType.PDF).setName(titulo+'.pdf');
    const folder=DriveApp.getFolderById(CARPETA_ACTUACIONES_ID_);
    const pdfFile=folder.createFile(pdfBlob);

    if(indice['PDF URL']!==undefined){
      sh.getRange(numeroFila,indice['PDF URL']+1).setValue(pdfFile.getUrl());
      SpreadsheetApp.flush();
    }

    // El documento intermedio no queda expuesto al usuario.
    try{docFile.setTrashed(true);}catch(_){ }

    return {
      ok:true,
      mensaje:'PDF de orden de trabajo generado correctamente.',
      id:id,
      numeroSerie:serie,
      pdfUrl:pdfFile.getUrl(),
      pdfDownloadUrl:'https://drive.google.com/uc?export=download&id='+encodeURIComponent(pdfFile.getId()),
      pdfNombre:pdfFile.getName(),
      fotografias:fotosInsertadas
    };
  }catch(error){
    if(tempDocId){try{DriveApp.getFileById(tempDocId).setTrashed(true);}catch(_){}}
    console.error('ERROR generarPdfActuacionOrdenTrabajo_:',error);
    return {ok:false,mensaje:'No fue posible generar el PDF de la orden de trabajo: '+(error.message||error)};
  }
}

function valorOrdenTrabajo_(fila,indice,nombres){
  for(let i=0;i<nombres.length;i++){
    const idx=indice[nombres[i]];
    if(idx!==undefined)return String(fila[idx]||'').trim();
  }
  return '';
}

function urlsOrdenTrabajo_(texto){
  const s=String(texto||'').trim();
  if(!s)return [];
  const encontrados=s.match(/https?:\/\/[^\s,;]+/gi);
  if(encontrados&&encontrados.length)return encontrados;
  return s.split(/[\n\r,;]+/).map(function(v){return v.trim();}).filter(Boolean);
}

function archivoImagenOrdenTrabajo_(url){
  const s=String(url||'').trim();
  if(!s)return {ok:false};

  try{
    if(s.indexOf('data:image/')===0){
      const sep=s.indexOf(',');
      if(sep<0)return {ok:false};
      const cab=s.substring(0,sep);
      const mime=(cab.match(/^data:([^;]+);base64$/i)||[])[1]||'image/jpeg';
      const bytes=Utilities.base64Decode(s.substring(sep+1));
      return {ok:true,blob:Utilities.newBlob(bytes,mime,'Fotografia'),nombre:'Fotografía'};
    }

    const id=idDriveSeguro_(s);
    if(id){
      const file=DriveApp.getFileById(id);
      if(file.isTrashed())return {ok:false};
      const blob=file.getBlob();
      if(String(blob.getContentType()||'').indexOf('image/')!==0)return {ok:false};
      return {ok:true,blob:blob,nombre:file.getName()};
    }

    if(/^https?:\/\//i.test(s)){
      const r=UrlFetchApp.fetch(s,{muteHttpExceptions:true,followRedirects:true});
      if(r.getResponseCode()<200||r.getResponseCode()>=300)return {ok:false};
      const blob=r.getBlob();
      if(String(blob.getContentType()||'').indexOf('image/')!==0)return {ok:false};
      return {ok:true,blob:blob,nombre:'Fotografía'};
    }
  }catch(error){
    console.error('ERROR archivoImagenOrdenTrabajo_:',error);
  }
  return {ok:false};
}

function dimensionarImagenOrdenTrabajo_(imagen,maxW,maxH){
  try{
    const w=imagen.getWidth();
    const h=imagen.getHeight();
    if(!w||!h)return;
    const escala=Math.min(1,maxW/w,maxH/h);
    imagen.setWidth(Math.max(1,Math.round(w*escala)));
    imagen.setHeight(Math.max(1,Math.round(h*escala)));
  }catch(error){
    console.error('ERROR dimensionando fotografía:',error);
  }
}

function agregarTablaCamposOrden_(body,campos){
  const validos=campos.filter(function(c){return c&&String(c[1]||'').trim()!=='';});
  if(!validos.length)return;

  const tabla=body.appendTable();
  validos.forEach(function(c){
    const fila=tabla.appendTableRow();
    const etiqueta=fila.appendTableCell(String(c[0]||''));
    const valor=fila.appendTableCell(String(c[1]||''));
    etiqueta.setBackgroundColor('#EEEEEE');
    etiqueta.editAsText().setBold(true);
    valor.editAsText().setForegroundColor('#222222');
  });
  tabla.setBorderWidth(1);
}
