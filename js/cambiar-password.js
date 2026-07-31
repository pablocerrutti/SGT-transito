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





if(!usuarioActual){


window.location="login.html";


return;


}






let nombre=document.querySelector(".usuarioNombre");



if(nombre){


nombre.innerHTML = usuarioActual.nombre;


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


alert("Complete ambos campos");


return;


}







if(nueva!==repetir){


alert("Las contraseñas no coinciden");


return;


}







if(nueva.length < 6){


alert(
"La contraseña debe tener mínimo 6 caracteres"
);


return;


}







try{





let respuesta = await fetch(

API_CAMBIO,

{


method:"POST",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify({


accion:"cambiarPassword",


usuario:usuarioActual.usuario,


password:nueva



})


}


);







let resultado = await respuesta.json();







console.log(resultado);







if(resultado.ok){





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

resultado.mensaje || 
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
// REDIRECCION POR ROL
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


window.location="inspector/dashboard.html";


break;





default:


window.location="login.html";


}



}
