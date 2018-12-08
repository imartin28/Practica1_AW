"use strict";
const express = require("express");
const mysql = require("mysql");
const login = express.Router();
const config = require("../config");
const DAOUser = require("../integracion/DAOUser");

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);


/* Muestra página principal de login */
login.get("/login", function(request, response) {
    response.render("login", {mensajeDeError : null});
});



/* Recibe el email y la contraseña del usuario, redireccionando al perfil o mostrando un mensaje de error */
login.post("/login", function(request, response, next) {
    let email = request.body.email;
    let password = request.body.password;   

    daoUser.loginUser(email, password, (err, estaLogueado) => {
        if(err){
            next(err);
        } else if (estaLogueado) {
            request.session.currentUser = email;
            response.redirect("my_profile");
        } else {
            response.render("login", {mensajeDeError : "Dirección de correo y/o contraseña no válidos"});
        }
    });
});


/* Cierra la sesión */
login.get("/logout", function(request, response) {
    request.session.destroy();
    response.redirect("login");
}); 


module.exports = login;