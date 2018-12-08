"use strict";

const express = require("express");
const path = require("path");
const mysql = require("mysql");
const new_user = express.Router();
const config = require("../config");
const DAOUser = require("../integracion/DAOUser");
const utils = require("../utils.js");
const multer = require("multer");
const multerFactory = multer({ dest: path.join(__dirname, ".." ,"profile_imgs")});
const ficherosEstaticos = path.join(__dirname, "..", "public");
new_user.use(express.static(ficherosEstaticos));

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);


new_user.get("/new_user", function(request, response)  {    
   
    response.render("new_user", {errores : null});
});


function camposDeFormularioValidos(request) {
    request.checkBody("email", "Debe introducir un email").notEmpty();
    request.checkBody("email", "Dirección de correo no válida").isEmail();

    request.checkBody("password", "Debe introducir una contraseña").notEmpty();
    request.checkBody("password", "Introduzca una contraseña correcta").matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/);

    request.checkBody("name", "Debe añadir un nombre").notEmpty();
    request.checkBody("name", "El nombre debe contener solo letras y/o números").matches(/^[A-Za-z0-9_-]+$/);

    request.checkBody("gender", "Debe elegir una opción").notEmpty();
    
    if(request.body.birth_date != ""){
        request.checkBody("birth_date", "Debe introducir una fecha válida").isBefore();
    }
}


/* Crea un nuevo usuario y mete en la sesión los datos del nuevo usuario */
new_user.post("/new_user", multerFactory.single("profile_img"), function(request, response, next) {
    let user  = {
        email : request.body.email,
        password : request.body.password,
        name: request.body.name,
        gender : request.body.gender,
        birth_date : request.body.birth_date,
        profile_img: "noPerfil.jpg", 
        points : 0
    };

    camposDeFormularioValidos(request);
    

    let age = utils.calcularEdad(user.birth_date);

    if(request.file) {
        user.profile_img = request.file.filename;       
    }

    request.session.currentUser = user.email;
    request.session.profile_img = user.profile_img;
    request.session.points = user.points;
    
    request.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            response.render("new_user", {errores : result.mapped()});     
        } else {
            daoUser.readUser(user.email, (err, userBBDD) => {
                if (err) {
                    next(err);
                } else if (userBBDD == null) {
                    daoUser.insertUser(user, (err) =>{
                        if (err) {
                            next(err);
                        } else {
                            response.render("my_profile", {
                                name : user.name, 
                                gender: user.gender, 
                                points: user.points,
                                age : age,
                                profile_img : user.profile_img,   
                                userEmail : user.email,
                                profile_modifiable : true         
                            });
                        }                 
                    });
                } else { 
                    console.log("Error, ya existe el usuario");
                }
            }); 
        }
    });
});


/* Ruta paramétrica de la imagen de perfil */
new_user.get("/profile_img/:id", function(request, response)  {
    let pathImg = path.join(__dirname, "..", "profile_imgs", request.params.id);
    response.sendFile(pathImg);
});


module.exports = new_user;