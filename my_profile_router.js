"use strict";
const express = require("express");
const mysql = require("mysql");
const profile = express.Router();
const config = require("./config");
const DAOUser = require("./DAOUser");

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);


function calcularEdad(fechaCumpleaños) {
    let fechaActual = new Date();
    let fechaNacimiento = new Date(fechaCumpleaños);

    let edad = fechaActual - fechaNacimiento;
    edad = Math.floor(edad / (1000*60*60*24*365));

    return edad;
}


profile.get("/my_profile", function(request, response){
    let email = request.session.currentUser;
    daoUser.readUser(email, (err, user) => {
        response.status(200);
        
        let age = calcularEdad(user.birth_date);
        
        request.session.profile_img = user.profile_img;
        request.session.points = user.points;
        
        response.render("my_profile", {name : user.name, 
            gender: user.gender, 
            points: user.points,
            age : age,
            profile_img : user.profile_img
        });
    });
});



module.exports = profile;