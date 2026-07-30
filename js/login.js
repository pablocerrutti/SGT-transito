// =====================================
// SGT - LOGIN
// Google Sheets API
// =====================================


const API_URL = "https://script.google.com/macros/s/AKfycbzYU8xREGRuJ3-8ZrK-dbYUZNzVBhPiIceVWU3OftmxvO6fNCBFcFwrnurmWofjkFxR/exec";




// LOGIN USUARIO

document
.querySelector(".btnUsuario")
.addEventListener("click",function(){


let usuario =
document.querySelectorAll("input")[0].value;


let clave =
document.querySelectorAll("input")[1].value;


validarLogin(usuario,clave);


});






// LOGIN ADMIN

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
// VALIDAR CONTRA GOOGLE SHEETS
// =====================================


function validarLogin(usuario,clave){



fetch(

API_URL+"?accion=usuarios"

)



.then(r=>r.json())



.then(usuarios=>{



console.log(
"USUARIOS:",
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







let sesion={



id:
encontrado.id,



nombre:
encontrado.nombre,



usuario:
encontrado.usuario,



rol:
encontrado.rol



};







localStorage.setItem(

"usuarioActual",

JSON.stringify(sesion)

);







entrarSistema(sesion);



})




.catch(error=>{


console.error(error);


alert(
"No se pudo conectar con la base de datos"
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





default:


alert(

"Rol no configurado: "+usuario.rol

);



}



}
