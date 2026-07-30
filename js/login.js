// =====================================
// SGT - LOGIN
// Dirección de Tránsito y Transportes
// =====================================



const usuarios = [


{
usuario:"Pcerrutti",
clave:"SGT12345",
rol:"Administrador",
cambiarPassword:true
},


{
usuario:"Mperez",
clave:"SGT12345",
rol:"Administrador",
cambiarPassword:true
},


{
usuario:"Gbentancur",
clave:"SGT12345",
rol:"Administrador",
cambiarPassword:true
},


{
usuario:"movilidad",
clave:"123456",
rol:"Movilidad Urbana",
cambiarPassword:true
},


{
usuario:"inspector",
clave:"123456",
rol:"Inspector",
cambiarPassword:true
}


];






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





// OBLIGAR CAMBIO DE CONTRASEÑA


if(encontrado.cambiarPassword===true){


window.location="cambiar-password.html";


return;


}






entrarSistema(encontrado);



}








function entrarSistema(usuario){



if(usuario.rol==="Administrador"){


window.location="admin/dashboard.html";


}



else if(usuario.rol==="Movilidad Urbana"){


window.location="movilidad/dashboard.html";


}



else if(usuario.rol==="Inspector"){


window.location="inspector/dashboard.html";


}



}