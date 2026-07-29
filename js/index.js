const barra=document.getElementById("progreso");

const porcentaje=document.getElementById("porcentaje");

const mensaje=document.getElementById("mensaje");

const mensajes=[

"Inicializando sistema...",

"Verificando servicios...",

"Cargando cartografía...",

"Conectando base de datos...",

"Inicializando módulos...",

"Verificando usuarios...",

"Sistema listo."

];

let progreso=0;

let indice=0;

const carga=setInterval(()=>{

progreso++;

barra.style.width=progreso+"%";

porcentaje.innerHTML=progreso+"%";

if(progreso%15===0 && indice<mensajes.length-1){

indice++;

mensaje.innerHTML=mensajes[indice];

}

if(progreso>=100){

clearInterval(carga);

setTimeout(()=>{

window.location="login.html";

},800);

}

},45);