// =====================================
// SGT - LOGIN
// Dirección de Tránsito y Transportes
// =====================================


// URL API GOOGLE SHEETS

const API_URL =
"https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";




// =====================================
// BOTON USUARIO
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
// BOTON ADMIN
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
// VALIDAR LOGIN
// =====================================


function validarLogin(usuario,clave){



fetch(
API_URL+"?accion=usuarios"
)



.then(r=>r.json())



.then(usuarios=>{



if(!Array.isArray(usuarios)){


alert(
"Error cargando usuarios"
);


return;


}





let encontrado =
usuarios.find(function(u){



return (

String(u.Usuario || u.usuario)
.toLowerCase()

===

usuario.toLowerCase()


&&


String(u.Password || u.password)

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





let sesion={


id:
encontrado.ID,


usuario:
encontrado.Usuario || encontrado.usuario,


nombre:
encontrado.Nombre || encontrado.nombre,


rol:
encontrado.Rol || encontrado.rol,


debeCambiarPassword:


String(
encontrado.DebeCambiar ||
encontrado.debeCambiar

)

.toUpperCase()

==="SI"



};







localStorage.setItem(

"usuarioActual",

JSON.stringify(sesion)

);







if(sesion.debeCambiarPassword){


window.location="cambiar-password.html";


return;


}






entrarSistema(sesion);




})



.catch(error=>{


console.error(error);


alert(
"No se pudo conectar con el servidor"
);


});



}








// =====================================
// REDIRECCION SEGUN ROL
// =====================================


function entrarSistema(usuario){



switch(usuario.rol){



case "Administrador":



window.location="admin/dashboard.html";


break;





case "Movilidad":



window.location="movilidad/dashboard.html";


break;





case "Inspector":



window.location="inspector/dashboard.html";


break;





default:



alert(
"Rol no reconocido"
);



}



}
