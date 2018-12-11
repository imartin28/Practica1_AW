"use strict";
const express = require("express");
const mysql = require("mysql");
const login = express.Router();
const config = require("../config");
const DAOUser = require("../integracion/DAOUser");

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);




function camposLoginValidos(request){
    request.checkBody("email", "Debe introducir un email").notEmpty();
    request.checkBody("email", "Dirección de correo no válida").isEmail();

    request.checkBody("password", "Debe introducir una contraseña").notEmpty();
}

/* Muestra página principal de login */
login.get("/login", function(request, response) {
    response.render("login", {errores : null});
});



/* Recibe el email y la contraseña del usuario, redireccionando al perfil o mostrando un mensaje de error */
login.post("/login", function(request, response, next) {
    let email = request.body.email;
    let password = request.body.password;   

    camposLoginValidos(request);


    request.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            response.render("login", {errores : result.mapped()});     
        } else {
            daoUser.loginUser(email, password, (err, estaLogueado) => {
                if(err){
                    next(err);
                } else if (estaLogueado) {
                    request.session.currentUser = email;
                    response.redirect("my_profile");
                } else {
                    response.render("login", {errores : result.mapped()});
                }
            });
        }
    });
});


/* Cierra la sesión */
login.get("/logout", function(request, response) {
    request.session.destroy();
    response.redirect("login");
}); 


module.exports = login;