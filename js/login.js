// =====================================
// SGT - LOGIN
// Google Sheets API
// =====================================


const API_URL = "https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";




// =====================================
// LOGIN USUARIO
// =====================================


document
.querySelector(".btnUsuario")
.addEventListener("click",function(){


let usuario =
document.querySelectorAll("input")[0].value;


let clave =
document.querySelectorAll("input")[1].value;



validarLogin(usuario,clave);



});







// =====================================
// LOGIN ADMIN
// =====================================


document
.querySelector(".btnAdmin")
.addEventListener("click",function(){


let usuario =
document.querySelectorAll("input")[2].value;


let clave =
document.querySelectorAll("input")[3].value;



validarLogin(usuario,clave);



});









// =====================================
// VALIDAR LOGIN CONTRA SHEETS
// =====================================


function validarLogin(usuario,clave){



fetch(

API_URL+"?accion=usuarios"

)



.then(r=>r.json())



.then(usuarios=>{



console.log(

"USUARIOS SGT:",

usuarios

);






let encontrado = usuarios.find(function(u){



return (



String(u.usuario)
.toLowerCase()

===

usuario.toLowerCase()



&&



String(u.password)

===

clave



);



});








if(!encontrado){



alert(

"Usuario o contraseña incorrectos"

);



return;



}









let usuarioSesion={



id:

encontrado.id,



nombre:

encontrado.nombre,



usuario:

encontrado.usuario,



rol:

encontrado.rol,



password:

encontrado.password,



cambiarPassword:false



};









localStorage.setItem(

"usuarioActual",

JSON.stringify(usuarioSesion)

);









entrarSistema(usuarioSesion);






})



.catch(error=>{



console.error(

"ERROR LOGIN:",

error

);



alert(

"No se pudo conectar con la base de datos"

);



});



}










// =====================================
// REDIRECCION
// =====================================


function entrarSistema(usuario){



if(usuario.rol==="Administrador"){


window.location="admin/dashboard.html";


}



else if(usuario.rol==="Movilidad"){


window.location="movilidad/dashboard.html";


}



else if(usuario.rol==="Movilidad Urbana"){


window.location="movilidad/dashboard.html";


}



else if(usuario.rol==="Inspector"){


window.location="inspector/dashboard.html";


}



else{


alert(

"Rol no configurado: "+usuario.rol

);



}



}
