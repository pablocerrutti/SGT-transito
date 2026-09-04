/********************************************************
 * SGT - PDF DE ACTUACIONES EXISTENTES
 * Permite regenerar el PDF de una actuación histórica
 * cuando el registro no tiene PDF URL válido.
 ********************************************************/
function generarPdfActuacionExistente(e){
  const p=(e&&e.parameter)||{};
  const id=String(p.id||p.actuacionId||'').trim();
  if(!id)return {ok:false,mensaje:'Falta el identificador de la actuación.'};
  try{
    const sh=hojaInspecciones_();
    const valores=sh.getDataRange().getDisplayValues();
    if(valores.length<2)return {ok:false,mensaje:'No existen actuaciones registradas.'};
    const h=valores[0].map(x=>String(x||'').trim()),idx={};
    h.forEach((x,i)=>{if(x)idx[x]=i;});
    let fila=null;
    for(let i=1;i<valores.length;i++){
      const rid=String(valores[i][idx['ID']]||'').trim();
      if(rid===id){fila=valores[i];break;}
    }
    if(!fila)return {ok:false,mensaje:'Actuación no encontrada.'};
    const get=nombres=>{for(const n of nombres){if(idx[n]!==undefined)return String(fila[idx[n]]||'').trim();}return '';};
    const datos={
      'ID':get(['ID']),
      'Elemento ID':get(['Elemento ID']),
      'Código elemento':get(['Código elemento','Codigo elemento']),
      'Inspector':get(['Inspector']),
      'Beta':get(['Beta']),
      'Fecha':get(['Fecha']),
      'Matrícula':get(['Matrícula','Matricula']),
      'Tipo actuación':get(['Tipo actuación','Tipo de actuación']),
      'Número boleta':get(['Número boleta','Numero boleta']),
      'Nombre infractor':get(['Nombre infractor']),
      'Cédula':get(['Cédula','Cedula']),
      'Incidencia':get(['Incidencia','Detalle','Descripción','Descripcion']),
      'Video URL':get(['Video URL']),
      'Foto/boleta URL':get(['Foto/boleta URL','Documento URL']),
      'Estado':get(['Estado']),
      'Rol':get(['Rol']),
      'Usuario':get(['Usuario']),
      'Número serie':get(['Número serie','Numero serie','Serie'])
    };
    const pdf=generarPdfActuacion_(datos);
    if(idx['PDF URL']!==undefined)sh.getRange(valores.indexOf(fila)+1,idx['PDF URL']+1).setValue(pdf.url);
    SpreadsheetApp.flush();
    return {ok:true,mensaje:'PDF generado correctamente.',id:id,numeroSerie:datos['Número serie'],pdfUrl:pdf.url,pdfDownloadUrl:pdf.downloadUrl,pdfNombre:pdf.nombre};
  }catch(error){return {ok:false,mensaje:'No fue posible generar el PDF: '+(error.message||error)};}
}
