// =====================================
// SGT - CONFIGURACION FIREBASE
// Dirección de Tránsito y Transportes
// =====================================


// Importar Firebase

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { 
getDatabase 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
getAuth
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";




// Configuración del proyecto


const firebaseConfig = {


apiKey: "AIzaSyDGhweC-oj1cXuqGY-llCJyedwtvGKn5OU",


authDomain: "sgt-transito-995b2.firebaseapp.com",


databaseURL:
"https://sgt-transito-995b2-default-rtdb.firebaseio.com",


projectId: "sgt-transito-995b2",


storageBucket:
"sgt-transito-995b2.firebasestorage.app",


messagingSenderId:
"595006398122",


appId:
"1:595006398122:web:5729f2e49213c168a67ad3"



};





// Inicializar


const app = initializeApp(firebaseConfig);





// Base de datos

const db = getDatabase(app);





// Autenticación

const auth = getAuth(app);





export {
app,
db,
auth
};