"use strict";
const express = require("express");
const mysql = require("mysql");
const profile = express.Router();
const config = require("./config");
const DAOUser = require("./DAOUser");
const utils = require("./utils.js");


// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);


profile.get("/my_profile", function(request, response){
    let email = request.session.currentUser;
    daoUser.readUser(email, (err, user) => {
        response.status(200);
        
        let age = utils.calcularEdad(user.birth_date);
        
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

profile.get("/modify_profile", function(request, response){
    let email = request.session.currentUser;

    daoUser.readUser(email, (err, user) => {
        response.status(200);   

        response.render("modify_profile", {
            name : user.name, 
            password : user.password,
            gender: user.gender, 
            points: user.points,
            birth_date : JSON.stringify(user.birth_date).slice(1, 11), //Primero se convierte a string y después se recorta para quedarse solo con año, mes y día
            profile_img : user.profile_img
        });
    });
});


module.exports = profile;