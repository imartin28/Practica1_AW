const mysql = require("mysql");
const config = require("./config");
const DAOUsers = require("./DAOUser");


// Crear el pool de conexiones
const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});
let daoUser = new DAOUsers(pool);

function callbackInsertUser(err){
    if(err){
        console.log(err.message);
    }
    else{
        console.log("Se ha insertado el usuario correctamente");
    }
}


function callbackLoginUser(err){
    if(err){
        console.log(err.message);
    }
    else{
        console.log("Se ha logueado!!");
    }
}


function callbackModifyUser(err){
    if(err){
        console.log(err.message);
    }
    else{
        console.log("Se ha modificado correctamente");
    }
}
let usuario = {
    email : "sergio@sergio.es",
    password : "sergio00000",
    name : "Irene",
    gender : "M",
    birth_date: "1990-05-29"
}

//daoUser.insertUser(usuario, callbackInsertUser);
//daoUser.loginUser("sergio@sergio.es", "sergio", callbackLoginUser);
daoUser.modifyUser(usuario, callbackModifyUser);