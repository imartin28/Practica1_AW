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
const validadorFormularios = require("../validadoresDeFormularios");

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);


/* Muestra el perfil del usuario actual */
profile.get("/my_profile", function(request, response, next){
    renderMyProfile(request, response, next);
});



/* Muestra la pagina modify_profile.ejs */
profile.get("/modify_profile", function(request, response, next){
    let email = request.session.currentUser;

    daoUser.readUser(email, (err, user) => {
        if (err) {
            next(err);
        } else {
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

    if (request.file) {
        user.profile_img = request.file.filename;
    }

    daoUser.updateUser(user, (err) => {
        if (err) {
            next(err);
        } else {
            response.redirect("my_profile");
        }
    });
});

profile.post("/upload_image", multerFactory.single("gallery_image"), function(request, response, next) {
    let email = request.session.currentUser;
    let image;
    let description = request.body.description;

    if (request.file) {
        image = request.file.filename;
    }
    
    validadorFormularios.validarFormularioSubidaImagenes(request);

    request.getValidationResult().then(function(result) {
        if (result.isEmpty()) {
            daoUser.insertNewImageinPhotoGallery(email, image, description, (err) =>{
                if (err) {
                    next(err);
                } else {
                    daoUser.modifyPoints(email, -100, (err) =>{
                        if (err) {
                            next(err);
                        } else {
                            renderMyProfile(request, response, next, null);
                        }
                    });     
                }
            });
        } else {
            renderMyProfile(request, response, next, result.mapped());
        }
    });
});          

    


function renderMyProfile(request, response, next, errores) {
    let email = request.session.currentUser;

    daoUser.readUser(email, (err, user) => {
        if (err) {
            next(err);
        } else {
            daoUser.readUserImages(email, (err, images) =>{
                if (err) {
                    next(err);
                } else {
                    let age = utils.calcularEdad(user.birth_date);
            
                    request.session.profile_img = user.profile_img;
                    request.session.points = user.points;

                    response.render("my_profile", {
                        name : user.name, 
                        gender: user.gender, 
                        points: user.points,
                        age : age,
                        profile_img : user.profile_img,
                        profile_modifiable : true,
                        images : images,
                        errores : errores
                    });  
                }
            });          
        }
    });
}

module.exports = profile;