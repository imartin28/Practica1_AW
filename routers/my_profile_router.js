"use strict";
const express = require("express");
const mysql = require("mysql");
const path = require("path");
const profile = express.Router();
const config = require("../config");
const DAOUser = require("../integracion/DAOUser");
const utils = require("../utils.js");
const multer = require("multer");
const multerFactory = multer({ dest: path.join(__dirname, "..", "profile_imgs")});
// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);


/* Muestra el perfil del usuario actual */
profile.get("/my_profile", function(request, response, next){
    let email = request.session.currentUser;
    daoUser.readUser(email, (err, user) => {
        if(err){
            next(err);
        }else{ 
            response.status(200);            
            let age = utils.calcularEdad(user.birth_date);
            
            request.session.profile_img = user.profile_img;
            request.session.points = user.points;
            console.log(age);
            response.render("my_profile", {
                name : user.name, 
                gender: user.gender, 
                points: user.points,
                age : age,
                profile_img : user.profile_img,
                profile_modifiable : true
            });
        }
    });
});



/* Muestra la pagina modify_profile.ejs */
profile.get("/modify_profile", function(request, response, next){
    let email = request.session.currentUser;

    daoUser.readUser(email, (err, user) => {
        if (err) {
            next(err);
        } else {
            console.log(user.birth_date);
            console.log(JSON.stringify(user.birth_date).slice(1, 11));
 

            response.render("modify_profile", {
                name : user.name, 
                password : user.password,
                gender: user.gender, 
                points: user.points,
                birth_date : JSON.stringify(user.birth_date).slice(1, 11), //Primero se convierte a string y después se recorta para quedarse solo con año, mes y día
                profile_img : user.profile_img
            });
        }
    });   
});



/* Modifica los datos del perfil del usuario actual */
profile.post("/modify_profile", multerFactory.single("profile_img"), function(request, response, next){
    let user = { 
        email: request.session.currentUser,
        password : request.body.password,
        name : request.body.name,
        gender : request.body.gender,
        birth_date: request.body.birth_date
    };

    if(request.file){
        user.profile_img = request.file.filename;
    }

    daoUser.updateUser(user, (err) =>{
        if(err){
            next(err);
        }else{
            response.redirect("my_profile");
        }
    });
});


module.exports = profile;