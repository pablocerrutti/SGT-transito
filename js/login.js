// =====================================
// SGT - LOGIN
// =====================================


const API_USUARIOS =
"https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";




// =====================================
// INGRESAR
// =====================================


async function ingresar(){


let usuario = document.getElementById("usuario").value.trim();

let password = document.getElementById("password").value.trim();



if(usuario==="" || password===""){


alert("Ingrese usuario y contraseña");

return;


}



try{


let respuesta = await fetch(
API_USUARIOS + "?accion=usuarios"
);



let usuarios = await respuesta.json();



console.log("Usuarios recibidos:",usuarios);




let encontrado = usuarios.find(function(u){


return (

String(u.usuario).trim() === usuario &&

String(u.password).trim() === password

);


});





if(!encontrado){


alert("Usuario o contraseña incorrectos");

return;


}






// ================================
// GUARDAR SESION
// ================================


localStorage.setItem(

"usuarioActual",

JSON.stringify(encontrado)

);




console.log(
"Sesion guardada:",
localStorage.getItem("usuarioActual")
);






// ================================
// CAMBIO DE CLAVE
// ================================


if(

encontrado.cambiarClave===true ||

String(encontrado.cambiarClave)==="true"

){


window.location.href="cambiar-password.html";

return;


}





// ================================
// REDIRECCION
// ================================


switch(encontrado.rol){



case "SuperAdministrador":


window.location.href="admin/dashboard.html";


break;



case "Supervisor":


window.location.href="admin/dashboard.html";


break;



case "Movilidad":


window.location.href="movilidad/dashboard.html";


break;



case "Inspector":


window.location.href="inspector/dashboard.html";


break;



default:


alert(
"Rol no configurado: "+encontrado.rol
);


}




}



catch(error){


console.error(error);


alert(
"Error conectando con el servidor"
);


}



}







// =====================================
// CERRAR SESION
// =====================================


function cerrarSesion(){


localStorage.removeItem(
"usuarioActual"
);


window.location.href="login.html";


}






// =====================================
// ENTER
// =====================================


document.addEventListener(

"keydown",

function(e){


if(e.key==="Enter"){


ingresar();


}


}

);
