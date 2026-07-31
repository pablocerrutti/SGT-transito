// =====================================
// SGT - CAMBIO DE CONTRASEÑA
// =====================================


const API_CAMBIO =
"https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";



let usuarioActual = null;




// =====================================
// INICIO
// =====================================


window.onload=function(){


usuarioActual = JSON.parse(

localStorage.getItem("usuarioActual")

);



console.log("USUARIO SESION:", usuarioActual);



if(!usuarioActual){


window.location="login.html";


return;


}





let nombre = document.querySelector(".usuarioNombre");



if(nombre){


nombre.innerHTML =
usuarioActual.Nombre ||
usuarioActual.nombre ||
usuarioActual.Usuario ||
usuarioActual.usuario;


}



};









// =====================================
// CAMBIAR PASSWORD
// =====================================


async function cambiarPassword(){



let nueva = document
.getElementById("nuevaPassword")
.value
.trim();



let repetir = document
.getElementById("repetirPassword")
.value
.trim();





if(nueva==="" || repetir===""){


alert("Complete todos los campos");


return;


}





if(nueva !== repetir){


alert("Las contraseñas no coinciden");


return;


}





if(nueva.length < 6){


alert("La contraseña debe tener mínimo 6 caracteres");


return;


}







// OBTENER USUARIO CORRECTO

let usuarioEnviar =

usuarioActual.Usuario ||

usuarioActual.usuario;





console.log(
"USUARIO ENVIADO:",
usuarioEnviar
);







if(!usuarioEnviar){


alert(
"No se encontró usuario en la sesión"
);


return;


}







try{



let respuesta = await fetch(

API_CAMBIO,

{


method:"POST",


headers:{


"Content-Type":
"application/x-www-form-urlencoded;charset=UTF-8"


},


body:new URLSearchParams({


accion:"cambiarPassword",


usuario:usuarioEnviar,


password:nueva


})


}



);






let resultado = await respuesta.json();





console.log(
"RESPUESTA CAMBIO:",
resultado
);







if(resultado.ok){





// actualizar sesión local


if(usuarioActual.Password){

usuarioActual.Password=nueva;

}
else{

usuarioActual.password=nueva;

}





if(usuarioActual.DebeCambiar !== undefined){

usuarioActual.DebeCambiar=false;

}



if(usuarioActual.cambiarClave !== undefined){

usuarioActual.cambiarClave=false;

}






localStorage.setItem(

"usuarioActual",

JSON.stringify(usuarioActual)

);






alert(
"Contraseña actualizada correctamente"
);






redireccionarRol(

usuarioActual.Rol ||
usuarioActual.rol

);




}

else{


alert(

resultado.mensaje ||

"No se pudo cambiar la contraseña"

);


}





}

catch(error){


console.error(
"ERROR:",
error
);


alert(
"Error comunicando con servidor"
);


}



}









// =====================================
// REDIRECCION POR ROL
// =====================================


function redireccionarRol(rol){



console.log(
"ROL:",
rol
);



switch(rol){



case "SuperAdministrador":


case "Supervisor":


window.location="admin/dashboard.html";


break;





case "Movilidad":


window.location="movilidad/dashboard.html";


break;





case "Inspector":


window.location="inspector/dashboard.html";


break;





default:


window.location="login.html";


}



}









// =====================================
// CERRAR SESION
// =====================================


function cerrarSesion(){


localStorage.removeItem(
"usuarioActual"
);



window.location="login.html";


}