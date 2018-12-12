"use strict";
const express = require("express");
const mysql = require("mysql");
const login = express.Router();
const config = require("../config");
const DAOUser = require("../integracion/DAOUser");
const validadorFormularios = require("../validadoresDeFormularios");
const renderizador = require("../renderizador");
// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);


/* Muestra página principal de login */
login.get("/login", function(request, response) {
    response.render("login", {errores : null});
});


/* Recibe el email y la contraseña del usuario, redireccionando al perfil o mostrando un mensaje de error */
login.post("/login", function(request, response, next) {
    let email = request.body.email;
    let password = request.body.password;   

    validadorFormularios.validarFormularioLogin(request);

    request.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            response.render("login", {errores : result.mapped()});     
        } else {
            daoUser.loginUser(email, password, (err, user) => {
                if (err) {
                    next(err);
                } else if (user) {
                    request.session.currentUser = email;
                    response.redirect("my_profile");
                    //renderizador.renderMyProfile(request, response, next, [], null, null, true, email, true);
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