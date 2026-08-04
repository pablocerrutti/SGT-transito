// SGT - MOVILIDAD URBANA / MAPA
const TIPOS = ['Semáforo','Radar','Cruce Peatonal','Lomo de Burro','Cartel','Señal Vertical','Señal Horizontal','Cámara','Otro'];
const CONFIG_ICONOS = {
  'Semáforo': {simbolo:'🚦',clase:'semaforo'}, 'Radar': {simbolo:'📡',clase:'radar'},
  'Cruce Peatonal': {simbolo:'🚸',clase:'cruce'}, 'Lomo de Burro': {simbolo:'⚠️',clase:'lomo'},
  'Cartel': {simbolo:'🪧',clase:'cartel'}, 'Señal Vertical': {simbolo:'🚧',clase:'vertical'},
  'Señal Horizontal': {simbolo:'↔',clase:'horizontal'}, 'Cámara': {simbolo:'📷',clase:'camara'},
  'Otro': {simbolo:'•',clase:'otro'}
};
let mapa, marcadorNuevo = null, capaMarcadores, elementos = [];

document.addEventListener('DOMContentLoaded', iniciarPagina);
function iniciarPagina() {
  if (!comprobarSesion()) return;
  iniciarMapa(); cargarTipos(); enlazarEventos(); cargarElementos();
}
function comprobarSesion() {
  let usuario;
  try { usuario = JSON.parse(localStorage.getItem('usuarioActual')); } catch (_) { usuario = null; }
  if (!usuario) { window.location.href = '../../index.html'; return false; }
  document.getElementById('usuarioActual').textContent = usuario.nombre || usuario.usuario || '';
  return true;
}
function iniciarMapa() {
  mapa = L.map('map').setView([-34.0997, -56.2140], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution:'© OpenStreetMap', maxZoom:19}).addTo(mapa);
  capaMarcadores = L.layerGroup().addTo(mapa);
  mapa.on('click', seleccionarUbicacion);
  setTimeout(function() { mapa.invalidateSize(); }, 150);
}
function enlazarEventos() {
  document.getElementById('formElemento').addEventListener('submit', guardarElemento);
  document.getElementById('btnActualizar').addEventListener('click', cargarElementos);
  document.getElementById('filtroTipo').addEventListener('change', renderizarMarcadores);
  document.getElementById('buscar').addEventListener('input', renderizarMarcadores);
  document.getElementById('btnDashboard').addEventListener('click', function() { window.location.href = '../../pages/dashboard.html'; });
  document.getElementById('btnSalir').addEventListener('click', salir);
}
function cargarTipos() {
  const tipo = document.getElementById('tipo'); const filtro = document.getElementById('filtroTipo');
  tipo.replaceChildren(); filtro.replaceChildren(new Option('Todos los elementos', ''));
  TIPOS.forEach(function(nombre) { tipo.add(new Option(nombre, nombre)); filtro.add(new Option(nombre, nombre)); });
}
function seleccionarUbicacion(evento) {
  const {lat, lng} = evento.latlng;
  document.getElementById('lat').value = lat.toFixed(7); document.getElementById('lng').value = lng.toFixed(7);
  if (marcadorNuevo) mapa.removeLayer(marcadorNuevo);
  marcadorNuevo = L.marker([lat, lng], {icon:crearIcono('Otro', true), draggable:true}).addTo(mapa).bindTooltip('Ubicación del nuevo elemento').openTooltip();
  marcadorNuevo.on('dragend', function(e) { const p = e.target.getLatLng(); document.getElementById('lat').value = p.lat.toFixed(7); document.getElementById('lng').value = p.lng.toFixed(7); });
  mostrarMensaje('Ubicación seleccionada. Complete el formulario y guarde.', 'exito');
}
async function cargarElementos() {
  const boton = document.getElementById('btnActualizar'); boton.disabled = true;
  mostrarMensaje('Actualizando elementos…');
  const respuesta = await apiObtenerElementos(); boton.disabled = false;
  if (!respuesta || !respuesta.ok) { mostrarMensaje((respuesta && respuesta.mensaje) || 'No se pudieron cargar los elementos.', 'error'); return; }
  elementos = Array.isArray(respuesta.datos) ? respuesta.datos : [];
  renderizarMarcadores(); mostrarMensaje('');
}
function renderizarMarcadores() {
  if (!capaMarcadores) return;
  const tipo = document.getElementById('filtroTipo').value;
  const texto = normalizar(document.getElementById('buscar').value);
  const visibles = elementos.filter(function(elemento) {
    if (tipo && elemento.tipo !== tipo) return false;
    return !texto || normalizar([elemento.codigo, elemento.nombre, elemento.direccion, elemento.tipo, elemento.estado].join(' ')).includes(texto);
  });
  capaMarcadores.clearLayers();
  visibles.forEach(function(elemento) {
    const lat = coordenada(elemento.latitud), lng = coordenada(elemento.longitud);
    if (lat === null || lng === null) return;
    L.marker([lat, lng], {icon:crearIcono(elemento.tipo)}).bindPopup(crearPopup(elemento), {maxWidth:360}).addTo(capaMarcadores);
  });
  document.getElementById('contadorResultados').textContent = visibles.length + ' de ' + elementos.length + ' elemento' + (elementos.length === 1 ? '' : 's');
}
function crearIcono(tipo, pendiente) {
  const config = CONFIG_ICONOS[tipo] || CONFIG_ICONOS.Otro;
  return L.divIcon({className:'icono-elemento ' + config.clase + (pendiente ? ' pendiente' : ''), html:'<span aria-hidden="true">' + config.simbolo + '</span>', iconSize:[34,34], iconAnchor:[17,34], popupAnchor:[0,-34]});
}
function crearPopup(e) {
  return '<article class="popup-elemento"><h3>' + escapar(e.codigo || 'Sin código') + '</h3>' +
    campoPopup('Tipo', e.tipo) + campoPopup('Serie', e.serie) + campoPopup('Nombre', e.nombre) +
    campoPopup('Estado', e.estado, 'estado-' + normalizar(e.estado).replace(/\s+/g,'-')) +
    campoPopup('Dirección', e.direccion) + campoPopup('Descripción', e.descripcion) +
    campoPopup('Características', e.caracteristicas) + campoPopup('Fecha de alta', e.fechaAlta) +
    campoPopup('Usuario de alta', e.usuarioAlta) + campoPopup('Última modificación', e.fechaModificacion) + '</article>';
}
function campoPopup(etiqueta, valor, clase) { if (valor === undefined || valor === null || String(valor).trim() === '') return ''; return '<p' + (clase ? ' class="' + clase + '"' : '') + '><strong>' + escapar(etiqueta) + ':</strong> ' + escapar(valor) + '</p>'; }
async function guardarElemento(evento) {
  evento.preventDefault();
  const latitud = document.getElementById('lat').value, longitud = document.getElementById('lng').value;
  if (!latitud || !longitud) { mostrarMensaje('Seleccione la ubicación del elemento en el mapa.', 'error'); return; }
  const usuario = (() => { try { const u = JSON.parse(localStorage.getItem('usuarioActual')); return u && (u.nombre || u.usuario); } catch (_) { return ''; } })();
  const elemento = {tipo:valor('tipo'),nombre:valor('nombre'),descripcion:valor('descripcion'),latitud:latitud,longitud:longitud,direccion:valor('direccion'),estado:valor('estado'),caracteristicas:valor('caracteristicas'),usuario:usuario};
  const boton = document.querySelector('#formElemento button[type="submit"]'); boton.disabled = true;
  const respuesta = await apiGuardarElemento(elemento); boton.disabled = false;
  if (!respuesta || !respuesta.ok) { mostrarMensaje((respuesta && respuesta.mensaje) || 'No fue posible guardar el elemento.', 'error'); return; }
  document.getElementById('codigo').value = respuesta.codigo || ''; document.getElementById('serie').value = respuesta.serie || '';
  document.getElementById('formElemento').reset();
  // Se vuelven a mostrar los datos generados después del reset del formulario.
  document.getElementById('codigo').value = respuesta.codigo || ''; document.getElementById('serie').value = respuesta.serie || '';
  if (marcadorNuevo) { mapa.removeLayer(marcadorNuevo); marcadorNuevo = null; }
  mostrarMensaje('Elemento guardado: ' + (respuesta.codigo || '') + ' (serie ' + (respuesta.serie || '') + ').', 'exito');
  await cargarElementos();
}
function valor(id) { return document.getElementById(id).value.trim(); }
function coordenada(valor) { const numero = Number(String(valor == null ? '' : valor).replace(',', '.')); return Number.isFinite(numero) ? numero : null; }
function normalizar(valor) { return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
function escapar(valor) { return String(valor == null ? '' : valor).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }
function mostrarMensaje(texto, tipo) { const mensaje = document.getElementById('mensajeMapa'); mensaje.textContent = texto; mensaje.className = 'mensaje' + (tipo ? ' ' + tipo : ''); }
function salir() { localStorage.removeItem('usuarioActual'); window.location.href = '../../index.html'; }
