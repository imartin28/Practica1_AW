"use strict";
const express = require("express");
const mysql = require("mysql");
const login = express.Router();
const config = require("./config");
const DAOUser = require("./DAOUser");



// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);






login.get("/login", function(request, response) {
    response.status(200);
    response.render("login", {mensajeDeError : null});
});


login.post("/login", function(request, response) {
    let email = request.body.email;
    let password = request.body.password;

    daoUser.loginUser(email, password, (err, estaLogueado) => {
        if (estaLogueado) {
            request.session.currentUser = email;
            response.redirect("my_profile");
        } else {
            response.render("login", {mensajeDeError : "Dirección de correo y/o contraseña no válidos"});
        }
    });

});


login.get("/my_profile", function(request, response){
    let email = request.session.currentUser;
    daoUser.readUser(email, (err, user) => {
        response.status(200);
        response.render("my_profile", {name : user.name, 
            gender: user.gender, 
            points: user.points });

    });
});

login.get("/logout", function(request, response) {
    request.session.destroy();
    response.redirect("login");
}); 


module.exports = login;