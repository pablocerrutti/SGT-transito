//==================================================
// SGT - INFORMES / ELEMENTOS INSPECCIONADOS
//==================================================
(function(){
    let catalogo=[];
    let inspecciones=[];
    let grupos=[];
    let seleccionado=null;

    function normalizar(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
    function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
    function fechaValor(v){
        const s=String(v||'').trim();
        if(!s)return 0;
        const m=s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
        if(m)return new Date(Number(m[3]),Number(m[2])-1,Number(m[1]),Number(m[4]||0),Number(m[5]||0),Number(m[6]||0)).getTime();
        const d=Date.parse(s);return Number.isFinite(d)?d:0;
    }
    function elementoDe(i){
        const id=String(i.elementoId||'').trim(),codigo=normalizar(i.codigoElemento);
        return catalogo.find(e=>String(e.id||'').trim()===id) || catalogo.find(e=>codigo&&normalizar(e.codigo)===codigo) || {id:id,codigo:i.codigoElemento||'',tipo:'Elemento',nombre:'Elemento inspeccionado',direccion:'',localidad:'',estado:'',caracteristicas:''};
    }
    function construirGrupos(){
        const mapa={};
        inspecciones.filter(i=>String(i.elementoId||'').trim()).forEach(i=>{
            const clave=String(i.elementoId||'').trim();
            if(!mapa[clave] || fechaValor(i.fecha)>=fechaValor(mapa[clave].inspeccion.fecha)) mapa[clave]={elemento:elementoDe(i),inspeccion:i};
        });
        grupos=Object.keys(mapa).map(k=>mapa[k]).sort((a,b)=>normalizar(a.elemento.nombre||a.elemento.codigo).localeCompare(normalizar(b.elemento.nombre||b.elemento.codigo),'es'));
    }
    async function iniciar(){
        const seccion=document.getElementById('seccionInspecciones');
        if(!seccion)return;
        try{
            const [ce,ci]=await Promise.all([apiObtenerCatalogoElementosInformables(),apiObtenerInspecciones()]);
            catalogo=Array.isArray(ce&&ce.datos)?ce.datos:[];
            inspecciones=Array.isArray(ci&&ci.datos)?ci.datos:[];
            construirGrupos();renderLista();
            const buscar=document.getElementById('buscarInspeccion');if(buscar)buscar.addEventListener('input',renderLista);
        }catch(e){mostrarMensaje(e.message||'No fue posible cargar los elementos inspeccionados.','error');}
    }
    function renderLista(){
        const cont=document.getElementById('listaElementosInspeccionados');if(!cont)return;
        const q=normalizar(document.getElementById('buscarInspeccion')?.value||'');
        const lista=grupos.filter(g=>!q||normalizar([g.elemento.codigo,g.elemento.tipo,g.elemento.nombre,g.elemento.direccion,g.elemento.localidad,g.inspeccion.incidencia].join(' ')).includes(q));
        if(!lista.length){cont.innerHTML='<div class="sin-inspecciones">No hay elementos con inspecciones registradas.</div>';return;}
        cont.innerHTML=lista.map((g,idx)=>{
            const i=g.inspeccion,e=g.elemento,res=normalizar(i.incidenciaEstado||'pendiente')==='resuelta';
            return '<article class="elemento-inspeccionado '+(seleccionado&&seleccionado.inspeccion.id===i.id?'seleccionado':'')+'" data-idx="'+idx+'"><div class="codigo">'+esc(e.codigo||i.codigoElemento||'Sin código')+'</div><strong>'+esc(e.nombre||'Sin nombre')+'</strong><div class="meta">'+esc(e.tipo||'Sin tipo')+' · '+esc(e.direccion||'Sin dirección')+'</div><div class="meta">Última inspección: '+esc(i.fecha||'Sin fecha')+'</div><span class="estado-incidencia '+(res?'estado-resuelta':'estado-pendiente')+'">'+(res?'INCIDENCIA RESUELTA':'INCIDENCIA PENDIENTE')+'</span></article>';
        }).join('');
        Array.from(cont.querySelectorAll('.elemento-inspeccionado')).forEach(card=>card.addEventListener('click',()=>seleccionar(lista[Number(card.dataset.idx)])));
    }
    function seleccionar(g){seleccionado=g;renderLista();renderFicha();}
    function renderFicha(){
        const cont=document.getElementById('fichaInspeccion');if(!cont||!seleccionado)return;
        const e=seleccionado.elemento,i=seleccionado.inspeccion,res=normalizar(i.incidenciaEstado||'pendiente')==='resuelta';
        const foto=i.documentoUrl||i.fotoUrl||'';const fotoFinal=i.fotoResolucionUrl||'';
        cont.innerHTML='<h3>'+esc(e.nombre||e.codigo||'Elemento inspeccionado')+'</h3>'+
        '<div class="ficha-grid"><div class="ficha-dato"><strong>Tipo de elemento</strong>'+esc(e.tipo||'-')+'</div><div class="ficha-dato"><strong>Código</strong>'+esc(e.codigo||i.codigoElemento||'-')+'</div><div class="ficha-dato"><strong>Nombre</strong>'+esc(e.nombre||'-')+'</div><div class="ficha-dato"><strong>Dirección</strong>'+esc(e.direccion||'-')+'</div><div class="ficha-dato"><strong>Localidad</strong>'+esc(e.localidad||'-')+'</div><div class="ficha-dato"><strong>Fecha del reporte</strong>'+esc(i.fecha||'-')+'</div><div class="ficha-dato"><strong>Inspector</strong>'+esc(i.inspector||'-')+'</div><div class="ficha-dato"><strong>Número de serie</strong>'+esc(i.numeroSerie||i.id||'-')+'</div><div class="ficha-dato"><strong>Estado de la incidencia</strong>'+esc(res?'RESUELTA':'PENDIENTE')+'</div>'+(res?'<div class="ficha-dato"><strong>Fecha de resolución</strong>'+esc(i.fechaResolucion||'-')+'</div><div class="ficha-dato"><strong>Usuario que resolvió</strong>'+esc(i.usuarioResolucion||'-')+'</div>':'')+'</div>'+
        '<div class="ficha-detalle"><strong>INSPECCIÓN / INCIDENCIA</strong><br>'+esc(i.incidencia||i.detalle||'Sin detalle')+'</div>'+
        '<div class="evidencia-inspeccion">'+(foto?'<figure><img src="'+esc(foto)+'" alt="Fotografía de la inspección"><figcaption>Fotografía original de la inspección</figcaption></figure>':'')+(fotoFinal?'<figure><img src="'+esc(fotoFinal)+'" alt="Fotografía de incidencia resuelta"><figcaption>Fotografía de la incidencia finalizada</figcaption></figure>':'')+'</div>'+
        '<div class="acciones-incidencia"><button type="button" id="btnPdfInspeccion" class="btn-incidencia btn-pdf-inspeccion">🖨 Imprimir PDF</button>'+(res?'':'<button type="button" id="btnResolverInspeccion" class="btn-incidencia btn-resolver-inspeccion">✓ Incidencia resuelta</button>')+'</div>'+(res?'':'<div id="panelResolverInspeccion" class="resolucion-panel" hidden><label for="fotoResolucion">Fotografía obligatoria de la incidencia finalizada</label><input id="fotoResolucion" type="file" accept="image/*" capture="environment"><div class="acciones-incidencia"><button type="button" id="btnConfirmarResolucion" class="btn-incidencia btn-resolver-inspeccion">Confirmar resolución</button></div></div>')+'<p id="mensajeInspeccionFicha" class="mensaje-inspecciones"></p>';
        document.getElementById('btnPdfInspeccion').onclick=imprimirPDF;
        if(!res)document.getElementById('btnResolverInspeccion').onclick=()=>{document.getElementById('panelResolverInspeccion').hidden=false;};
        if(!res)document.getElementById('btnConfirmarResolucion').onclick=resolver;
    }
    async function imprimirPDF(){
        const btn=document.getElementById('btnPdfInspeccion');if(btn)btn.disabled=true;
        try{const r=await apiGenerarPdfActuacionExistente(seleccionado.inspeccion.id);if(!r||!r.ok)throw new Error(r?.mensaje||'No fue posible generar el PDF.');if(r.pdfUrl)window.open(r.pdfUrl,'_blank','noopener,noreferrer');else throw new Error('El servidor no devolvió el PDF.');}
        catch(e){mostrarMensaje(e.message||'No fue posible generar el PDF.','error');}
        finally{if(btn)btn.disabled=false;}
    }
    async function resolver(){
        const input=document.getElementById('fotoResolucion'),btn=document.getElementById('btnConfirmarResolucion');
        if(!input||!input.files||!input.files[0]){mostrarMensajeFicha('Debe adjuntar una fotografía de la incidencia finalizada.','error');return;}
        const archivo=input.files[0];if(!archivo.type.startsWith('image/')){mostrarMensajeFicha('La evidencia final debe ser una imagen.','error');return;}
        btn.disabled=true;btn.textContent='Subiendo fotografía…';
        try{
            const base64=await leerBase64(archivo);const subida=await apiSubirArchivo({archivoBase64:base64,nombreArchivo:'resolucion-'+seleccionado.inspeccion.id+'-'+archivo.name,mimeType:archivo.type});
            if(!subida||!subida.ok)throw new Error(subida?.mensaje||'No fue posible subir la fotografía.');
            btn.textContent='Registrando resolución…';
            const r=await apiResolverIncidencia({id:seleccionado.inspeccion.id,fotoResolucionUrl:subida.url});
            if(!r||!r.ok)throw new Error(r?.mensaje||'No fue posible registrar la resolución.');
            seleccionado.inspeccion.incidenciaEstado='RESUELTA';seleccionado.inspeccion.fotoResolucionUrl=subida.url;seleccionado.inspeccion.fechaResolucion=r.fechaResolucion||'';seleccionado.inspeccion.usuarioResolucion=r.usuarioResolucion||'';seleccionado.inspeccion.pdfUrl=r.pdfUrl||seleccionado.inspeccion.pdfUrl;
            mostrarMensajeFicha('Incidencia marcada como RESUELTA correctamente.','exito');renderLista();renderFicha();
        }catch(e){btn.disabled=false;btn.textContent='Confirmar resolución';mostrarMensajeFicha(e.message||'No fue posible cerrar la incidencia.','error');}
    }
    function leerBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=reject;r.readAsDataURL(file);});}
    function mostrarMensaje(t,c){const el=document.getElementById('mensajeInspecciones');if(el){el.textContent=t;el.className='mensaje-inspecciones '+(c||'');}}
    function mostrarMensajeFicha(t,c){const el=document.getElementById('mensajeInspeccionFicha');if(el){el.textContent=t;el.className='mensaje-inspecciones '+(c||'');}}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
})();
