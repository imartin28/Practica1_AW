"use strict";
const express = require("express");
const mysql = require("mysql");
const login = express.Router();
const config = require("../config");
const DAOUser = require("../integracion/DAOUser");
const DAONotifications = require("../integracion/DAONotifications");
const validadorFormularios = require("../validadoresDeFormularios");
const renderizador = require("../renderizador");
// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);
const daoNotifications = new DAONotifications(pool);


/* Muestra página principal de login */
login.get("/", function(request, response) {
    response.render("login", {errores : null, mensajeDeError : null});
});


/* Recibe el email y la contraseña del usuario, redireccionando al perfil o mostrando un mensaje de error */
login.post("/login", function(request, response, next) {
    let email = request.body.email;
    let password = request.body.password;   

    validadorFormularios.validarFormularioLogin(request);

    request.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            response.render("login", {errores : result.mapped(), mensajeDeError : null});     
        } else {
            daoUser.loginUser(email, password, (err, user) => {
                if (err) {
                    next(err);
                } else if (user) {
                    request.session.currentUser = email;
                    request.session.points = user.points;
                    request.session.profile_img = user.profile_img;
                    daoNotifications.readNotifications(email, (err, notifications) =>{
                        if (err) {
                            next(err);
                        } else {
                            renderizador.renderMyProfile(request, response, next, notifications, null, null, true, email, true);
                        }
                    });
                    
                } else {
                    response.render("login", {errores : result.mapped(), mensajeDeError:"Email y/o contraseña no valida"});
                }
            });
        }
    });
});


/* Cierra la sesión */
login.get("/logout", function(request, response) {
    let email = request.session.currentUser;
    request.session.destroy();
    daoNotifications.deleteNotifications(email, (err) =>{
        if(err){
            next(err);
        }else{
            response.redirect("/");
        }
    });
    

}); 


module.exports = login;