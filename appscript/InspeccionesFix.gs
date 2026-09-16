/********************************************************
 * SGT - FIX INSPECCIONES / INCIDENCIAS
 *
 * No modifica Inspecciones.gs existente.
 * Agrega endpoints seguros para:
 * - visualizar fotos privadas de Drive
 * - generar PDF de actuaciones con fotografías
 * - resolver incidencias y regenerar PDF
 ********************************************************/

function obtenerFotoInspeccionSeguro_(e){
  try{
    const p=(e&&e.parameter)||{};
    const id=String(p.id||'').trim();
    if(!id)return {ok:false,mensaje:'No se recibió el ID del archivo.'};

    const file=DriveApp.getFileById(id);
    if(file.isTrashed())return {ok:false,mensaje:'El archivo ya no está disponible.'};

    const blob=file.getBlob();
    const mime=blob.getContentType()||file.getMimeType()||'';
    if(mime.indexOf('image/')!==0){
      return {ok:false,mensaje:'El archivo indicado no es una imagen.'};
    }

    return {
      ok:true,
      id:id,
      nombre:file.getName(),
      mimeType:mime,
      imagen:'data:'+mime+';base64,'+Utilities.base64Encode(blob.getBytes())
    };
  }catch(error){
    console.error('ERROR obtenerFotoInspeccionSeguro_:',error);
    return {ok:false,mensaje:'No fue posible obtener la fotografía: '+(error.message||error)};
  }
}

function asegurarColumnasInspeccionesSeguro_(sh){
  const requeridas=[
    'ID','Elemento ID','Código elemento','Inspector','Beta','Fecha',
    'Matrícula','Tipo actuación','Número boleta','Nombre infractor','Cédula',
    'Incidencia','Video URL','Foto/boleta URL','Estado','Activo','Rol','Usuario',
    'Número serie','PDF URL','Incidencia Estado','Foto Resolución URL',
    'Fecha Resolución','Usuario Resolución','PDF Resolución URL'
  ];

  let encabezados=sh.getRange(1,1,1,Math.max(sh.getLastColumn(),1))
    .getDisplayValues()[0].map(v=>String(v||'').trim());

  requeridas.forEach(function(nombre){
    if(encabezados.indexOf(nombre)===-1){
      sh.getRange(1,encabezados.length+1).setValue(nombre);
      encabezados.push(nombre);
    }
  });
}

function mapaInspeccionesSeguro_(sh){
  const h=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];
  const m={};
  h.forEach(function(v,i){
    const n=String(v||'').trim();
    if(n)m[n]=i+1;
  });
  return m;
}

function valorInspeccionSeguro_(fila,mapa,nombres){
  for(let i=0;i<nombres.length;i++){
    const col=mapa[nombres[i]];
    if(col!==undefined)return String(fila[col-1]||'').trim();
  }
  return '';
}

function idDriveSeguro_(url){
  const s=String(url||'').trim();
  if(!s)return '';

  let m=s.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if(m)return m[1];

  m=s.match(/drive\.google\.com\/thumbnail\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/i);
  if(m)return m[1];

  m=s.match(/drive\.google\.com\/uc\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/i);
  if(m)return m[1];

  m=s.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if(m)return m[1];

  m=s.match(/\/d\/([a-zA-Z0-9_-]+)/i);
  if(m)return m[1];

  if(/^[a-zA-Z0-9_-]{20,}$/.test(s))return s;
  return '';
}

function urlsInspeccionSeguro_(texto){
  const s=String(texto||'').trim();
  if(!s)return [];
  const encontrados=s.match(/(?:https?:\/\/|data:image\/)[^\s,;]+/gi);
  if(encontrados&&encontrados.length)return encontrados.map(v=>v.trim()).filter(Boolean);
  return s.split(/[\n\r,;]+/).map(v=>v.trim()).filter(Boolean);
}

function archivoImagenSeguro_(url){
  const resultado={ok:false,nombre:'Fotografía',mimeType:'',data:''};
  const s=String(url||'').trim();
  if(!s)return resultado;

  try{
    if(s.indexOf('data:image/')===0){
      const sep=s.indexOf(',');
      if(sep<0)throw new Error('Data URI inválido.');
      const cab=s.substring(0,sep);
      const match=cab.match(/^data:([^;]+);base64$/i);
      resultado.mimeType=match?match[1]:'image/jpeg';
      resultado.data=s;
      resultado.ok=true;
      return resultado;
    }

    const id=idDriveSeguro_(s);
    let blob=null;

    if(id){
      const file=DriveApp.getFileById(id);
      if(file.isTrashed())throw new Error('El archivo está en la papelera.');
      blob=file.getBlob();
      resultado.nombre=file.getName();
    }else if(/^https?:\/\//i.test(s)){
      const response=UrlFetchApp.fetch(s,{muteHttpExceptions:true,followRedirects:true});
      const code=response.getResponseCode();
      if(code<200||code>=300)throw new Error('HTTP '+code+' al descargar la imagen.');
      blob=response.getBlob();
    }else{
      throw new Error('No se reconoció la ubicación de la imagen.');
    }

    const mime=blob.getContentType()||'';
    if(mime.indexOf('image/')!==0)throw new Error('El archivo no es una imagen. Tipo: '+mime);

    resultado.mimeType=mime;
    resultado.data='data:'+mime+';base64,'+Utilities.base64Encode(blob.getBytes());
    resultado.ok=true;
    return resultado;
  }catch(error){
    console.error('ERROR archivoImagenSeguro_:',s,error);
    resultado.error=error.message||String(error);
    return resultado;
  }
}

function construirFotosPdfSeguro_(texto,descripcion){
  const urls=urlsInspeccionSeguro_(texto);
  if(!urls.length)return '';

  const partes=[];
  urls.forEach(function(url){
    const foto=archivoImagenSeguro_(url);
    if(foto.ok){
      partes.push(
        '<div style="page-break-inside:avoid;margin-bottom:12px;">'+
        '<img class="photo" src="'+foto.data+'">'+
        '<div class="photo-caption">'+escHtml_(foto.nombre||'Fotografía')+'</div>'+ 
        (descripcion?'<div class="photo-description">'+escHtml_(descripcion)+'</div>':'')+
        '</div>'
      );
    }else{
      partes.push(
        '<div style="border:1px solid #ccc;padding:8px;margin:8px 0;font-size:9px;color:#777;">'+
        'Fotografía no disponible para inserción en el PDF.'+
        '</div>'
      );
    }
  });
  return partes.join('');
}

function generarPdfActuacionExistenteSeguro_(e){
  const p=(e&&e.parameter)||{};
  const id=String(p.id||p.actuacionId||'').trim();
  if(!id)return {ok:false,mensaje:'Falta el identificador de la actuación.'};

  try{
    const sh=hojaInspecciones_();
    asegurarColumnasInspeccionesSeguro_(sh);
    const valores=sh.getDataRange().getDisplayValues();
    if(valores.length<2)return {ok:false,mensaje:'No existen actuaciones registradas.'};

    const mapa=mapaInspeccionesSeguro_(sh);
    let fila=null;
    let numeroFila=-1;

    for(let i=1;i<valores.length;i++){
      const rid=valorInspeccionSeguro_(valores[i],mapa,['ID','Id','id']);
      if(rid===id){
        fila=valores[i];
        numeroFila=i+1;
        break;
      }
    }

    if(!fila)return {ok:false,mensaje:'Actuación no encontrada.'};

    const datos={
      'ID':valorInspeccionSeguro_(fila,mapa,['ID']),
      'Elemento ID':valorInspeccionSeguro_(fila,mapa,['Elemento ID']),
      'Código elemento':valorInspeccionSeguro_(fila,mapa,['Código elemento','Codigo elemento']),
      'Inspector':valorInspeccionSeguro_(fila,mapa,['Inspector']),
      'Beta':valorInspeccionSeguro_(fila,mapa,['Beta']),
      'Fecha':valorInspeccionSeguro_(fila,mapa,['Fecha']),
      'Matrícula':valorInspeccionSeguro_(fila,mapa,['Matrícula','Matricula']),
      'Tipo actuación':valorInspeccionSeguro_(fila,mapa,['Tipo actuación','Tipo de actuación']),
      'Número boleta':valorInspeccionSeguro_(fila,mapa,['Número boleta','Numero boleta']),
      'Nombre infractor':valorInspeccionSeguro_(fila,mapa,['Nombre infractor']),
      'Cédula':valorInspeccionSeguro_(fila,mapa,['Cédula','Cedula']),
      'Incidencia':valorInspeccionSeguro_(fila,mapa,['Incidencia','Detalle','Descripción','Descripcion']),
      'Video URL':valorInspeccionSeguro_(fila,mapa,['Video URL']),
      'Foto/boleta URL':valorInspeccionSeguro_(fila,mapa,['Foto/boleta URL','Documento URL']),
      'Estado':valorInspeccionSeguro_(fila,mapa,['Estado']),
      'Rol':valorInspeccionSeguro_(fila,mapa,['Rol']),
      'Usuario':valorInspeccionSeguro_(fila,mapa,['Usuario']),
      'Número serie':valorInspeccionSeguro_(fila,mapa,['Número serie','Numero serie','Serie']),
      'Incidencia Estado':valorInspeccionSeguro_(fila,mapa,['Incidencia Estado']),
      'Foto Resolución URL':valorInspeccionSeguro_(fila,mapa,['Foto Resolución URL']),
      'Fecha Resolución':valorInspeccionSeguro_(fila,mapa,['Fecha Resolución']),
      'Usuario Resolución':valorInspeccionSeguro_(fila,mapa,['Usuario Resolución'])
    };

    const folder=DriveApp.getFolderById(CARPETA_ACTUACIONES_ID_);
    const serie=datos['Número serie']||'ACT';
    const tipo=datos['Tipo actuación']||'Actuación';
    const titulo=tipo+' - '+serie;
    const watermark=dataUriRepositorio_(SGT_WATERMARK_URL_,'image/png');
    const logo=dataUriRepositorio_(SGT_LOGO_URL_,'image/png');
    const fotoHtml=construirFotosPdfSeguro_(datos['Foto/boleta URL'],datos.Incidencia);
    const fotoResolucionHtml=construirFotosPdfSeguro_(datos['Foto Resolución URL'],'Incidencia finalizada');

    const html='<!DOCTYPE html><html><head><meta charset="UTF-8"><style>'+ 
      '@page{size:A4;margin:18mm 15mm 22mm 15mm;}'+
      'body{font-family:Arial,sans-serif;color:#202124;font-size:11px;line-height:1.45;}'+
      '.watermark{position:fixed;top:42mm;left:7%;width:86%;opacity:.075;}'+
      '.content{position:relative;z-index:2;}'+
      '.header{border-bottom:2px solid #b40000;padding-bottom:8px;margin-bottom:14px;}'+
      '.title{font-size:19px;font-weight:bold;color:#b40000;margin-bottom:4px;}'+
      '.sub{font-size:11px;color:#555;}'+
      '.section{font-size:13px;font-weight:bold;color:#b40000;margin:16px 0 7px;border-bottom:1px solid #b40000;padding-bottom:3px;}'+
      'table{width:100%;border-collapse:collapse;margin-bottom:10px;}'+
      'td{border:1px solid #d1d5db;padding:6px;vertical-align:top;}'+
      'td.label{width:32%;font-weight:bold;background:#f5f5f5;}'+
      '.description{border:1px solid #d1d5db;padding:9px;white-space:pre-wrap;min-height:35px;}'+
      '.photo{display:block;max-width:170mm;max-height:105mm;width:auto;height:auto;margin:8px auto 3px;}'+
      '.photo-caption{text-align:center;font-size:9px;color:#555;}'+
      '.photo-description{text-align:center;font-size:10px;color:#444;margin-bottom:10px;}'+
      '.resolution{page-break-inside:avoid;}'+
      '.footer{position:fixed;bottom:-16mm;left:0;right:0;border-top:1px solid #b40000;font-size:8px;color:#555;padding-top:2mm;}'+
      '</style></head><body>'+ 
      (watermark?'<img class="watermark" src="'+watermark+'">':'')+
      '<div class="content"><div class="header"><div class="title">'+escHtml_(titulo)+'</div><div class="sub">SGT - SISTEMA DE GESTIÓN DE TRÁNSITO</div></div>'+ 
      '<table><tr><td class="label">Número de serie</td><td>'+escHtml_(serie)+'</td></tr>'+ 
      '<tr><td class="label">Fecha y hora</td><td>'+escHtml_(datos.Fecha)+'</td></tr>'+ 
      '<tr><td class="label">Responsable</td><td>'+escHtml_(datos.Inspector)+'</td></tr>'+ 
      '<tr><td class="label">Usuario</td><td>'+escHtml_(datos.Usuario)+'</td></tr>'+ 
      '<tr><td class="label">Rol</td><td>'+escHtml_(datos.Rol)+'</td></tr></table>'+ 
      '<div class="section">DATOS DE LA ACTUACIÓN</div>'+ 
      '<table><tr><td class="label">Tipo de actuación</td><td>'+escHtml_(tipo)+'</td></tr>'+ 
      '<tr><td class="label">Número Beta</td><td>'+escHtml_(datos.Beta||'No posee')+'</td></tr>'+ 
      '<tr><td class="label">Matrícula</td><td>'+escHtml_(datos['Matrícula']||'No informada')+'</td></tr>'+ 
      '<tr><td class="label">Número de boleta</td><td>'+escHtml_(datos['Número boleta']||'No informado')+'</td></tr>'+ 
      '<tr><td class="label">Nombre del infractor</td><td>'+escHtml_(datos['Nombre infractor']||'No informado')+'</td></tr>'+ 
      '<tr><td class="label">Cédula</td><td>'+escHtml_(datos['Cédula']||'No informada')+'</td></tr></table>'+ 
      '<div class="section">DESCRIPCIÓN / DETALLE</div><div class="description">'+escHtml_(datos.Incidencia||'Sin descripción adicional.')+'</div>'+ 
      '<div class="section">EVIDENCIA FOTOGRÁFICA</div>'+(fotoHtml||'<p>No se adjuntaron fotografías.</p>')+
      (fotoResolucionHtml?'<div class="section">EVIDENCIA DE RESOLUCIÓN</div><div class="resolution">'+fotoResolucionHtml+'</div>':'')+
      '<div class="footer">SGT - Sistema de Gestión de Tránsito | Documento generado automáticamente | Serie: '+escHtml_(serie)+'</div>'+ 
      '</div></body></html>';

    const pdfBlob=Utilities.newBlob(html,'text/html',titulo+'.html').getAs(MimeType.PDF).setName(titulo+'.pdf');
    const pdfFile=folder.createFile(pdfBlob);

    if(mapa['PDF URL'])sh.getRange(numeroFila,mapa['PDF URL']).setValue(pdfFile.getUrl());
    SpreadsheetApp.flush();

    return {
      ok:true,
      mensaje:'PDF generado correctamente.',
      id:id,
      numeroSerie:serie,
      pdfUrl:pdfFile.getUrl(),
      pdfDownloadUrl:'https://drive.google.com/uc?export=download&id='+encodeURIComponent(pdfFile.getId()),
      pdfNombre:pdfFile.getName()
    };
  }catch(error){
    console.error('ERROR generarPdfActuacionExistenteSeguro_:',error);
    return {ok:false,mensaje:'No fue posible generar el PDF: '+(error.message||error)};
  }
}

function resolverIncidenciaSeguro_(e){
  const p=(e&&e.parameter)||{};
  const id=String(p.id||'').trim();
  const fotoUrl=String(p.fotoResolucionUrl||'').trim();
  if(!id)return {ok:false,mensaje:'Falta el identificador de la actuación.'};
  if(!fotoUrl)return {ok:false,mensaje:'Debe adjuntar la fotografía de resolución.'};

  try{
    const sh=hojaInspecciones_();
    asegurarColumnasInspeccionesSeguro_(sh);
    const mapa=mapaInspeccionesSeguro_(sh);
    const datos=sh.getDataRange().getDisplayValues();
    let fila=-1;

    for(let i=1;i<datos.length;i++){
      if(valorInspeccionSeguro_(datos[i],mapa,['ID'])===id){fila=i+1;break;}
    }
    if(fila<0)return {ok:false,mensaje:'Actuación no encontrada.'};

    const usuario=String(p.usuario||p.usuarioLogin||p.actorUsuario||'').trim();
    const fecha=ahoraSeguro_();

    if(mapa['Incidencia Estado'])sh.getRange(fila,mapa['Incidencia Estado']).setValue('RESUELTA');
    if(mapa['Foto Resolución URL'])sh.getRange(fila,mapa['Foto Resolución URL']).setValue(fotoUrl);
    if(mapa['Fecha Resolución'])sh.getRange(fila,mapa['Fecha Resolución']).setValue(fecha);
    if(mapa['Usuario Resolución'])sh.getRange(fila,mapa['Usuario Resolución']).setValue(usuario);
    SpreadsheetApp.flush();

    const pdf=generarPdfActuacionExistenteSeguro_({parameter:{id:id}});

    if(pdf.ok&&mapa['PDF Resolución URL'])sh.getRange(fila,mapa['PDF Resolución URL']).setValue(pdf.pdfUrl||pdf.url||'');
    if(pdf.ok&&mapa['PDF URL'])sh.getRange(fila,mapa['PDF URL']).setValue(pdf.pdfUrl||pdf.url||'');
    SpreadsheetApp.flush();

    return {
      ok:true,
      mensaje:'Incidencia resuelta correctamente.',
      fechaResolucion:fecha,
      usuarioResolucion:usuario,
      pdfUrl:pdf.pdfUrl||'',
      pdfDownloadUrl:pdf.pdfDownloadUrl||''
    };
  }catch(error){
    console.error('ERROR resolverIncidenciaSeguro_:',error);
    return {ok:false,mensaje:'No fue posible resolver la incidencia: '+(error.message||error)};
  }
}
