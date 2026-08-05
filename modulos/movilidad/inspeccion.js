let usuario;

try {
    usuario = JSON.parse(localStorage.getItem("usuarioActual"));
} catch (_) {}

const rol = String((usuario || {}).rol || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

if (!usuario) {
    location.href = "../../index.html";
}

document.getElementById("usuarioNombre").textContent =
    usuario.nombre || usuario.usuario || "";

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {

    // Botón volver
    document.getElementById("btnVolver").onclick = () => {
        location.href = "../../pages/dashboard.html";
    };

    // Guardar
    document.getElementById("formInspeccion").addEventListener("submit", guardar);

    // Cargar elementos
    await cargarElementos();

    // Cargar historial
    await cargarInspecciones();
}

async function cargarElementos() {

    const combo = document.getElementById("elemento");

    combo.innerHTML = "";

    combo.add(new Option("Seleccione un elemento...", ""));

    const respuesta = await apiObtenerElementos();

    if (!respuesta.ok) {

        mensaje(respuesta.mensaje, "error");

        return;
    }

    (respuesta.datos || []).forEach(e => {

        combo.add(

            new Option(

                `${e.codigo} - ${e.nombre || e.tipo}`,

                e.id

            )

        );

    });

}

async function archivoBase64(file, maximo) {

    if (!file) return "";

    if (file.size > maximo)
        throw new Error(file.name + " supera el tamaño permitido.");

    const base64 = await new Promise((ok, error) => {

        const reader = new FileReader();

        reader.onload = () =>
            ok(reader.result.split(",")[1]);

        reader.onerror = error;

        reader.readAsDataURL(file);

    });

    const subida = await apiSubirArchivo({

        archivoBase64: base64,

        nombreArchivo: file.name,

        mimeType: file.type

    });

    if (!subida.ok)
        throw new Error(subida.mensaje);

    return subida.url;

}

async function guardar(ev) {

    ev.preventDefault();

    const boton = ev.submitter;

    boton.disabled = true;

    try {

        const elemento = document.getElementById("elemento");

        const video = await archivoBase64(

            document.getElementById("video").files[0],

            30 * 1024 * 1024

        );

        const documento = await archivoBase64(

            document.getElementById("documento").files[0],

            10 * 1024 * 1024

        );

        const respuesta = await apiGuardarInspeccion({

            elementoId: elemento.value,

            codigoElemento:

                elemento.options[elemento.selectedIndex].text,

            inspector:

                usuario.nombre || usuario.usuario,

            incidencia:

                document.getElementById("incidencia").value.trim(),

            videoUrl: video,

            documentoUrl: documento

        });

        if (!respuesta.ok)
            throw new Error(respuesta.mensaje);

        mensaje(respuesta.mensaje, "exito");

        ev.target.reset();

        await cargarElementos();

        await cargarInspecciones();

    } catch (err) {

        mensaje(err.message, "error");

    }

    boton.disabled = false;

}

async function cargarInspecciones() {

    const respuesta = await apiObtenerInspecciones();

    const lista = document.getElementById("lista");

    lista.innerHTML = "";

    if (!respuesta.ok)
        return;

    (respuesta.datos || []).forEach(i => {

        const art = document.createElement("article");

        art.className = "inspeccion";

        art.innerHTML = `

            <strong>${esc(i.codigoElemento)}</strong>

            <p>${esc(i.incidencia)}</p>

            <small>

                ${esc(i.inspector)}

                -

                ${esc(i.fecha)}

            </small>

            ${i.videoUrl ? `<br><a target="_blank" href="${i.videoUrl}">🎥 Ver video</a>` : ""}

            ${i.documentoUrl ? `<br><a target="_blank" href="${i.documentoUrl}">📄 Ver documento</a>` : ""}

        `;

        lista.appendChild(art);

    });

}

function mensaje(texto, clase) {

    const m = document.getElementById("mensaje");

    m.textContent = texto;

    m.className = clase;

}

function esc(valor) {

    return String(valor || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

}
