"use strict";

const express = require("express");
const path = require("path");
const mysql = require("mysql");
const new_user = express.Router();
const config = require("../config");
const DAOUser = require("../integracion/DAOUser");
const utils = require("../utils.js");
const expressValidator = require("express-validator");
const multer = require("multer");
const multerFactory = multer({ dest: path.join(__dirname, ".." ,"profile_imgs")});
const ficherosEstaticos = path.join(__dirname, "..", "public");
const validadorFormularios = require("../validadoresDeFormularios");

new_user.use(express.static(ficherosEstaticos));

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);


new_user.get("/new_user", function(request, response)  {    
    response.render("new_user", {errores : null, mensajeDeError : null});
});


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

    validadorFormularios.validarFormularioNuevoUsuario(request);
    
    let age = utils.calcularEdad(user.birth_date);

    if (request.file) {
        user.profile_img = request.file.filename;       
    }

    request.session.currentUser = user.email;
    request.session.profile_img = user.profile_img;
    request.session.points = user.points;

    request.getValidationResult().then(function(result) {
        daoUser.readUser(user.email, (err, userBBDD) => {
            if (err) {
                next(err);
            } else if (userBBDD == null && result.isEmpty()) {
                daoUser.insertUser(user, (err) =>{
                    if (err) {
                        next(err);
                    } else {
                        response.redirect("my_profile");
                    }                 
                }); 
            } else if (userBBDD != null) {
                response.render("new_user", {errores : result.mapped(), mensajeDeError : "Dirección de correo ya existente"});
            } else {
                response.render("new_user", {errores : result.mapped(), mensajeDeError : null});
            }
        });
    });
});


/* Ruta paramétrica de la imagen de perfil */
new_user.get("/profile_img/:id", function(request, response)  {
    let pathImg = path.join(__dirname, "..", "profile_imgs", request.params.id);
    response.sendFile(pathImg);
});


module.exports = new_user;