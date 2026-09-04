let usuario=null;
let informes=[];
let auditoria=[];

document.addEventListener('DOMContentLoaded',iniciar);

async function iniciar(){
    try{
        usuario=JSON.parse(localStorage.getItem('usuarioActual')||localStorage.getItem('usuario')||'null');
    }catch(e){usuario=null;}

    if(!usuario){location.href='../index.html';return;}

    const rol=norm(usuario.rol);
    const rolesPermitidos=['super admin','super administrador','superadministrador','supervisor','administrador'];
    if(!rolesPermitidos.includes(rol)){
        location.href='dashboard.html';
        return;
    }

    const nombre=document.getElementById('usuarioNombre');
    if(nombre) nombre.textContent=(usuario.nombre||usuario.usuario||'Usuario')+' · '+(usuario.rol||'');

    document.getElementById('btnDashboard').onclick=()=>location.href='dashboard.html';
    document.getElementById('btnSalir').onclick=()=>{
        localStorage.removeItem('usuarioActual');
        localStorage.removeItem('usuario');
        location.href='../index.html';
    };

    document.getElementById('btnActualizar').onclick=cargar;
    document.getElementById('btnLimpiarInformes').onclick=limpiarFiltrosInformes;
    document.getElementById('btnLimpiarAuditoria').onclick=limpiarFiltrosAuditoria;

    ['buscarInforme','filtroCategoria','fechaDesdeInforme','fechaHastaInforme'].forEach(id=>{
        const el=document.getElementById(id);
        if(el) el.addEventListener('input',renderInformes);
        if(el && el.tagName==='SELECT') el.addEventListener('change',renderInformes);
    });

    ['buscarAuditoria','filtroModulo','filtroAccion','filtroUsuario'].forEach(id=>{
        const el=document.getElementById(id);
        if(el){el.addEventListener('input',renderAuditoria);el.addEventListener('change',renderAuditoria);}
    });

    await cargar();
}

async function cargar(){
    const boton=document.getElementById('btnActualizar');
    if(boton) boton.classList.add('cargando');

    try{
        const resultados=await Promise.all([
            apiObtenerInformesAuditoria(),
            apiObtenerAuditoria()
        ]);

        const ir=resultados[0];
        const ar=resultados[1];

        informes=ir&&ir.ok?ir.datos||[]:[];
        auditoria=ar&&ar.ok?ar.datos||[]:[];

        document.getElementById('contadorInformes').textContent=informes.length;
        document.getElementById('contadorAuditoria').textContent=auditoria.length;

        cargarSelectoresAuditoria();
        renderInformes();
        renderAuditoria();

        const ahora=new Date();
        document.getElementById('ultimaActualizacion').textContent=ahora.toLocaleTimeString('es-UY',{hour:'2-digit',minute:'2-digit'});
    }catch(error){
        mostrarError('tablaInformes','No fue posible cargar los informes.');
        mostrarError('tablaAuditoria','No fue posible cargar el registro de acciones.');
    }finally{
        if(boton) boton.classList.remove('cargando');
    }
}

function renderInformes(){
    const texto=norm(document.getElementById('buscarInforme').value);
    const categoria=norm(document.getElementById('filtroCategoria').value);
    const desde=document.getElementById('fechaDesdeInforme').value;
    const hasta=document.getElementById('fechaHastaInforme').value;

    const filtrados=informes.filter(x=>{
        const cadena=norm([
            x.fecha,x.categoriaInforme,x.numeroSerie,x.usuario,x.inspector,x.rol,
            x.codigoElemento,x.matricula,x.tipoActuacion,x.detalle
        ].join(' '));
        if(texto&&!cadena.includes(texto)) return false;
        if(categoria&&!norm(x.categoriaInforme).includes(categoria)) return false;

        const fecha=fechaComparable(x.fecha);
        if(desde&&fecha&&fecha<desde) return false;
        if(hasta&&fecha&&fecha>hasta) return false;
        return true;
    });

    document.getElementById('contadorInformesFiltrados').textContent=formatearResultados(filtrados.length);
    const tbody=document.getElementById('tablaInformes');

    if(!filtrados.length){
        tbody.innerHTML=estadoVacio('fa-file-circle-xmark','No hay informes que coincidan con los filtros.');
        return;
    }

    tbody.innerHTML=filtrados.map(x=>{
        const cat=norm(x.categoriaInforme);
        let clase='badge-inspeccion',icono='fa-magnifying-glass';
        if(cat.includes('movilidad')){clase='badge-movilidad';icono='fa-road';}
        else if(cat.includes('fiscal')){clase='badge-fiscalizacion';icono='fa-shield-halved';}

        const documento=x.pdfUrl
            ? '<a class="pdf-link" href="'+esc(x.pdfUrl)+'" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-file-pdf"></i> Abrir PDF</a>'
            : '<span class="muted">Sin PDF</span>';

        return '<tr>'+
            '<td>'+esc(x.fecha||'')+'</td>'+
            '<td><span class="badge '+clase+'"><i class="fa-solid '+icono+'"></i>'+esc(x.categoriaInforme||'Sin categoría')+'</span></td>'+
            '<td><span class="ref-code">'+esc(x.numeroSerie||'—')+'</span></td>'+
            '<td>'+esc(x.usuario||x.inspector||'—')+'</td>'+
            '<td>'+esc(x.rol||'—')+'</td>'+
            '<td>'+esc(x.codigoElemento||x.matricula||'—')+'</td>'+
            '<td>'+esc(x.tipoActuacion||x.detalle||'—')+'</td>'+
            '<td>'+documento+'</td>'+
        '</tr>';
    }).join('');
}

function renderAuditoria(){
    const texto=norm(document.getElementById('buscarAuditoria').value);
    const modulo=norm(document.getElementById('filtroModulo').value);
    const accion=norm(document.getElementById('filtroAccion').value);
    const usuarioFiltro=norm(document.getElementById('filtroUsuario').value);

    const filtrados=auditoria.filter(x=>{
        const cadena=norm([x.fecha,x.usuario,x.nombre,x.rol,x.accion,x.modulo,x.detalle,x.referencia].join(' '));
        if(texto&&!cadena.includes(texto)) return false;
        if(modulo&&norm(x.modulo)!==modulo) return false;
        if(accion&&norm(x.accion)!==accion) return false;
        const u=norm(x.usuario||x.nombre);
        if(usuarioFiltro&&u!==usuarioFiltro) return false;
        return true;
    });

    document.getElementById('contadorAccionesFiltradas').textContent=formatearResultados(filtrados.length);
    const tbody=document.getElementById('tablaAuditoria');

    if(!filtrados.length){
        tbody.innerHTML=estadoVacio('fa-clock-rotate-left','No hay acciones que coincidan con los filtros.');
        return;
    }

    tbody.innerHTML=filtrados.map(x=>{
        return '<tr>'+
            '<td>'+esc(x.fecha||'')+'</td>'+
            '<td>'+esc(x.usuario||x.nombre||'—')+'</td>'+
            '<td>'+esc(x.rol||'—')+'</td>'+
            '<td><span class="badge badge-accion"><i class="fa-solid fa-bolt"></i>'+esc(x.accion||'—')+'</span></td>'+
            '<td>'+esc(x.modulo||'—')+'</td>'+
            '<td>'+esc(x.detalle||'—')+'</td>'+
            '<td><span class="ref-code">'+esc(x.referencia||'—')+'</span></td>'+
        '</tr>';
    }).join('');
}

function cargarSelectoresAuditoria(){
    llenarSelector('filtroModulo',auditoria.map(x=>x.modulo));
    llenarSelector('filtroAccion',auditoria.map(x=>x.accion));
    llenarSelector('filtroUsuario',auditoria.map(x=>x.usuario||x.nombre));
}

function llenarSelector(id,valores){
    const select=document.getElementById(id);
    if(!select)return;
    const actual=select.value;
    const unicos=[...new Set(valores.map(v=>String(v||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
    const textoBase=id==='filtroModulo'?'Todos':id==='filtroAccion'?'Todas':'Todos';
    select.innerHTML='<option value="">'+textoBase+'</option>'+unicos.map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');
    if(unicos.includes(actual)) select.value=actual;
}

function limpiarFiltrosInformes(){
    ['buscarInforme','filtroCategoria','fechaDesdeInforme','fechaHastaInforme'].forEach(id=>document.getElementById(id).value='');
    renderInformes();
}

function limpiarFiltrosAuditoria(){
    ['buscarAuditoria','filtroModulo','filtroAccion','filtroUsuario'].forEach(id=>document.getElementById(id).value='');
    renderAuditoria();
}

function fechaComparable(valor){
    const s=String(valor||'').trim();
    if(!s)return '';
    let m=s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if(m)return m[1]+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[3]).padStart(2,'0');
    m=s.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if(m)return m[3]+'-'+String(m[2]).padStart(2,'0')+'-'+String(m[1]).padStart(2,'0');
    return '';
}

function formatearResultados(n){return n+' '+(n===1?'resultado':'resultados');}
function estadoVacio(icono,mensaje){return '<tr><td class="empty-state" colspan="8"><i class="fa-solid '+icono+'"></i>'+esc(mensaje)+'</td></tr>';}
function mostrarError(id,mensaje){document.getElementById(id).innerHTML='<tr><td class="empty-state error-state" colspan="8"><i class="fa-solid fa-triangle-exclamation"></i>'+esc(mensaje)+'</td></tr>';}
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
