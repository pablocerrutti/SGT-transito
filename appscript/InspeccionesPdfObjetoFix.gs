/********************************************************
 * SGT - PDF ORDEN DE TRABAJO + OBJETO ASOCIADO
 *
 * El PDF se alimenta de dos fuentes:
 * 1) Inspecciones: datos de la incidencia/actuación.
 * 2) Catálogo de elementos informables: datos del objeto.
 *
 * El vínculo se realiza por Elemento ID y, como respaldo,
 * por Código elemento.
 ********************************************************/

function generarPdfActuacionOrdenTrabajoConObjeto_(e){
  const p=(e&&e.parameter)||{};
  const id=String(p.id||p.actuacionId||'').trim();
  if(!id)return {ok:false,mensaje:'Falta el identificador de la incidencia.'};

  let tempDocId='';
  try{
    const sh=hojaInspecciones_();
    asegurarColumnasInspeccionesSeguro_(sh);
    const valores=sh.getDataRange().getDisplayValues();
    if(valores.length<2)return {ok:false,mensaje:'No existen incidencias registradas.'};

    const encabezados=valores[0].map(function(v){return String(v||'').trim();});
    const indice={};
    encabezados.forEach(function(h,i){if(h)indice[h]=i;});

    let fila=null,numeroFila=-1;
    for(let i=1;i<valores.length;i++){
      const rid=valorOrdenTrabajo_(valores[i],indice,['ID','Id','id']);
      if(rid===id){fila=valores[i];numeroFila=i+1;break;}
    }
    if(!fila)return {ok:false,mensaje:'Incidencia no encontrada.'};

    const dato=function(nombres){return valorOrdenTrabajo_(fila,indice,nombres);};
    const elementoId=dato(['Elemento ID']);
    const codigoElemento=dato(['Código elemento','Codigo elemento']);
    const objeto=buscarObjetoOrdenTrabajo_(elementoId,codigoElemento);
    const serie=dato(['Número serie','Numero serie','Serie'])||'ACT';
    const tipo=dato(['Tipo actuación','Tipo de actuación'])||'Actuación';
    const titulo='ORDEN DE TRABAJO - '+tipo+' - '+serie;

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

    agregarSeccionOrdenObjeto_(body,'IDENTIFICACIÓN DE LA INCIDENCIA');
    agregarTablaCamposOrden_(body,[
      ['Número de serie',serie],['ID de incidencia',dato(['ID'])],['Fecha y hora',dato(['Fecha'])],
      ['Tipo de actuación',tipo],['Inspector / responsable',dato(['Inspector'])],['Usuario',dato(['Usuario'])],
      ['Rol',dato(['Rol'])],['Estado',dato(['Estado'])],['Estado de incidencia',dato(['Incidencia Estado'])]
    ]);

    agregarSeccionOrdenObjeto_(body,'OBJETO ASOCIADO A LA INCIDENCIA');
    if(objeto.encontrado){
      agregarTablaCamposOrden_(body,[
        ['Tipo de objeto',objeto.tipo],['Código',objeto.codigo],['ID del objeto',objeto.id],
        ['Nombre',objeto.nombre],['Número de serie',objeto.serie],['Dirección',objeto.direccion],
        ['Localidad',objeto.localidad],['Ciudad',objeto.ciudad],['Zona',objeto.zona],
        ['Estado del objeto',objeto.estado],['Características',objeto.caracteristicas],
        ['Descripción',objeto.descripcion],['Coordenadas',objeto.coordenadas],['Geometría',objeto.geometria],
        ['Fecha de alta',objeto.fechaAlta],['Usuario de alta',objeto.usuarioAlta]
      ]);
    }else{
      agregarTablaCamposOrden_(body,[
        ['Elemento ID',elementoId],['Código del elemento',codigoElemento],
        ['Estado de vinculación','No se encontró el objeto en el catálogo actual.']
      ]);
    }

    agregarSeccionOrdenObjeto_(body,'DATOS DE LA ACTUACIÓN');
    agregarTablaCamposOrden_(body,[
      ['Elemento ID',elementoId],['Código del elemento',codigoElemento],['Número Beta',dato(['Beta'])||'No posee'],
      ['Matrícula',dato(['Matrícula','Matricula'])],['Número de boleta',dato(['Número boleta','Numero boleta'])],
      ['Nombre del infractor',dato(['Nombre infractor'])],['Cédula',dato(['Cédula','Cedula'])]
    ]);

    agregarSeccionOrdenObjeto_(body,'DESCRIPCIÓN / DETALLE DE LA INCIDENCIA');
    body.appendParagraph(dato(['Incidencia','Detalle','Descripción','Descripcion'])||'Sin descripción registrada.');

    const usados={
      'ID':1,'Elemento ID':1,'Código elemento':1,'Inspector':1,'Beta':1,'Fecha':1,'Matrícula':1,
      'Tipo actuación':1,'Número boleta':1,'Nombre infractor':1,'Cédula':1,'Incidencia':1,
      'Estado':1,'Rol':1,'Usuario':1,'Número serie':1,'Incidencia Estado':1,'Foto/boleta URL':1,
      'Foto Resolución URL':1,'PDF URL':1,'PDF Resolución URL':1,'Video URL':1,'Activo':1
    };
    const adicionales=[];
    encabezados.forEach(function(h,i){
      if(!h||usados[h])return;
      const v=String(fila[i]||'').trim();
      if(v)adicionales.push([h,v]);
    });
    if(adicionales.length){
      agregarSeccionOrdenObjeto_(body,'OTROS DATOS REGISTRADOS');
      agregarTablaCamposOrden_(body,adicionales);
    }

    agregarSeccionOrdenObjeto_(body,'EVIDENCIA FOTOGRÁFICA');
    const urls=[];
    urls.concat(urlsOrdenTrabajo_(dato(['Foto/boleta URL','Documento URL']))).forEach(function(u){if(urls.indexOf(u)<0)urls.push(u);});
    urlsOrdenTrabajo_(dato(['Foto Resolución URL'])).forEach(function(u){if(urls.indexOf(u)<0)urls.push(u);});
    let fotosInsertadas=0;
    urls.forEach(function(url){
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
        if(foto.nombre){const cap=body.appendParagraph(foto.nombre);cap.setAlignment(DocumentApp.HorizontalAlignment.CENTER);cap.editAsText().setItalic(true);}
        fotosInsertadas++;
      }catch(err){console.error('No se pudo insertar fotografía:',url,err);}
    });
    if(!fotosInsertadas)body.appendParagraph('No se adjuntaron fotografías a esta incidencia.');

    const video=dato(['Video URL']);
    if(video){
      agregarSeccionOrdenObjeto_(body,'EVIDENCIA DIGITAL / VIDEO');
      const pv=body.appendParagraph(video);pv.editAsText().setForegroundColor('#1155CC').setUnderline(true);
    }

    if(dato(['Foto Resolución URL'])||dato(['Fecha Resolución'])||dato(['Usuario Resolución'])){
      agregarSeccionOrdenObjeto_(body,'DATOS DE RESOLUCIÓN');
      agregarTablaCamposOrden_(body,[
        ['Fecha de resolución',dato(['Fecha Resolución'])],['Usuario de resolución',dato(['Usuario Resolución'])],
        ['Fotografía de resolución',dato(['Foto Resolución URL'])?'Adjunta':'No adjunta']
      ]);
    }

    const pie=body.appendParagraph('SGT - Sistema de Gestión de Tránsito | Documento generado para impresión y orden de trabajo | Serie: '+serie);
    pie.setFontSize(8);pie.setForegroundColor('#666666');pie.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    doc.saveAndClose();
    Utilities.sleep(700);

    const docFile=DriveApp.getFileById(tempDocId);
    const pdfBlob=docFile.getAs(MimeType.PDF).setName(titulo+'.pdf');
    const folder=DriveApp.getFolderById(CARPETA_ACTUACIONES_ID_);
    const pdfFile=folder.createFile(pdfBlob);
    if(indice['PDF URL']!==undefined){sh.getRange(numeroFila,indice['PDF URL']+1).setValue(pdfFile.getUrl());SpreadsheetApp.flush();}
    try{docFile.setTrashed(true);}catch(_){ }

    return {ok:true,mensaje:'PDF de orden de trabajo generado correctamente.',id:id,numeroSerie:serie,pdfUrl:pdfFile.getUrl(),pdfDownloadUrl:'https://drive.google.com/uc?export=download&id='+encodeURIComponent(pdfFile.getId()),pdfNombre:pdfFile.getName(),fotografias:fotosInsertadas,objetoAsociado:objeto.encontrado,objetoId:objeto.id||elementoId,objetoCodigo:objeto.codigo||codigoElemento};
  }catch(error){
    if(tempDocId){try{DriveApp.getFileById(tempDocId).setTrashed(true);}catch(_){}}
    console.error('ERROR generarPdfActuacionOrdenTrabajoConObjeto_:',error);
    return {ok:false,mensaje:'No fue posible generar el PDF de la orden de trabajo: '+(error.message||error)};
  }
}

function buscarObjetoOrdenTrabajo_(elementoId,codigo){
  const salida={encontrado:false,id:'',codigo:String(codigo||''),tipo:'',serie:'',nombre:'',descripcion:'',direccion:'',estado:'',caracteristicas:'',ciudad:'',localidad:'',zona:'',coordenadas:'',geometria:'',fechaAlta:'',usuarioAlta:''};
  try{
    const r=obtenerCatalogoElementosInformables();
    const datos=r&&Array.isArray(r.datos)?r.datos:[];
    let obj=datos.find(function(x){return String(x.id||'').trim()===String(elementoId||'').trim();});
    if(!obj&&codigo)obj=datos.find(function(x){return normalizarOrdenObjeto_(x.codigo)===normalizarOrdenObjeto_(codigo);});
    if(!obj)return salida;
    salida.encontrado=true;
    salida.id=String(obj.id||'');salida.codigo=String(obj.codigo||codigo||'');salida.tipo=String(obj.tipo||'');
    salida.serie=String(obj.serie||'');salida.nombre=String(obj.nombre||'');salida.descripcion=String(obj.descripcion||'');
    salida.direccion=String(obj.direccion||'');salida.estado=String(obj.estado||'');salida.caracteristicas=String(obj.caracteristicas||'');
    salida.ciudad=String(obj.ciudad||'');salida.localidad=String(obj.localidad||'');salida.zona=String(obj.zona||'');
    salida.coordenadas=String(obj.coordenadas||'');salida.geometria=String(obj.geometria||'');salida.fechaAlta=String(obj.fechaAlta||'');salida.usuarioAlta=String(obj.usuarioAlta||'');
  }catch(error){console.error('ERROR buscando objeto asociado:',error);}
  return salida;
}

function normalizarOrdenObjeto_(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
function agregarSeccionOrdenObjeto_(body,titulo){const p=body.appendParagraph(titulo);p.setHeading(DocumentApp.ParagraphHeading.HEADING1);}
