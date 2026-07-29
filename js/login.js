// =====================================
// SGT - LOGIN
// Dirección de Tránsito y Transportes
// =====================================


// Usuarios provisionales
// Luego serán reemplazados por Google Sheets

const usuarios = [

{
usuario:"Pcerrutti",
clave:"SGT12345",
rol:"Administrador"
},

{
usuario:"Mperez",
clave:"SGT12345",
rol:"Administrador"
},

{
usuario:"Gbentancur",
clave:"SGT12345",
rol:"Administrador"
},


{
usuario:"movilidad",
clave:"123456",
rol:"Movilidad Urbana"
},


{
usuario:"inspector",
clave:"123456",
rol:"Inspector"
}


];





// ================================
// LOGIN USUARIO
// ================================


document
.querySelector(".btnUsuario")
.addEventListener("click",function(){


let usuario =
document.querySelectorAll("input")[0]
.value;


let clave =
document.querySelectorAll("input")[1]
.value;



validarLogin(usuario,clave);


});






// ================================
// LOGIN ADMIN
// ================================


document
.querySelector(".btnAdmin")
.addEventListener("click",function(){



let usuario =
document.querySelectorAll("input")[2]
.value;



let clave =
document.querySelectorAll("input")[3]
.value;



validarLogin(usuario,clave);


});








// ================================
// VALIDAR
// ================================


function validarLogin(usuario,clave){



let encontrado =
usuarios.find(function(u){


return (

u.usuario.toLowerCase()
===
usuario.toLowerCase()

&&

u.clave
===
clave

);


});





if(!encontrado){


alert("Usuario o contraseña incorrectos");

return;


}





localStorage.setItem(

"usuarioActual",

JSON.stringify(encontrado)

);





if(encontrado.rol==="Administrador"){


window.location="admin/dashboard.html";


}



else if(encontrado.rol==="Movilidad Urbana"){


window.location="movilidad/dashboard.html";


}



else if(encontrado.rol==="Inspector"){


window.location="inspector/dashboard.html";


}



}