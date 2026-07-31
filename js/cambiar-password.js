// =====================================
// SGT - CAMBIO DE CONTRASEÑA
// =====================================


const API_CAMBIO =
"https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";






// =====================================
// CARGAR USUARIO
// =====================================


let usuarioActual=null;



window.onload=function(){


usuarioActual=JSON.parse(

localStorage.getItem(
"usuarioActual"
)

);



if(!usuarioActual){


window.location="login.html";


return;


}



let nombre=document.getElementById(
"nombreUsuario"
);



if(nombre){


nombre.innerHTML=

usuarioActual.nombre;


}



};









// =====================================
// CAMBIAR CLAVE
// =====================================


async function cambiarClave(){



let nueva=document.getElementById(

"nuevaClave"

).value.trim();




let repetir=document.getElementById(

"repetirClave"

).value.trim();






if(nueva==="" || repetir===""){



alert(

"Complete los campos"

);



return;


}






if(nueva!==repetir){



alert(

"Las contraseñas no coinciden"

);



return;


}







if(nueva.length<6){



alert(

"La clave debe tener mínimo 6 caracteres"

);



return;


}








try{



let respuesta=await fetch(

API_CAMBIO,

{


method:"POST",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify({



accion:"cambiarClave",



usuario:usuarioActual.usuario,



password:nueva



})


}

);







let resultado=

await respuesta.json();







if(resultado.ok){



// actualizar sesión


usuarioActual.password=nueva;

usuarioActual.cambiarClave=false;




localStorage.setItem(

"usuarioActual",

JSON.stringify(usuarioActual)

);







alert(

"Contraseña actualizada correctamente"

);






redireccionarRol(

usuarioActual.rol

);






}

else{



alert(

"No se pudo cambiar la contraseña"

);



}



}

catch(error){



console.error(error);



alert(

"Error comunicando con servidor"

);



}



}









// =====================================
// REDIRECCION
// =====================================


function redireccionarRol(rol){



switch(rol){



case "SuperAdministrador":



case "Supervisor":



window.location="admin/dashboard.html";

break;





case "Movilidad":



window.location="movilidad/dashboard.html";

break;





case "Inspector":



window.location="inspectores/dashboard.html";

break;





default:



window.location="login.html";



}



}