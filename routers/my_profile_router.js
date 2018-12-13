"use strict";

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const profile = express.Router();
const config = require("../config");
const DAOUser = require("../integracion/DAOUser");
const DAONotifications = require("../integracion/DAONotifications");
const utils = require("../utils.js");
const multer = require("multer");
const multerFactory = multer({ dest: path.join(__dirname, "..", "profile_imgs")});
const validadorFormularios = require("../validadoresDeFormularios");
const renderizador = require("../renderizador");

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);
const daoNotifications = new DAONotifications(pool);


/* Muestra el perfil del usuario actual */
profile.get("/my_profile", function(request, response, next) {
    let email = request.session.currentUser;

    daoNotifications.readNotifications(email, (err, notifications) => {
        if (err) {
            next(err);
        } else {
            renderizador.renderMyProfile(request, response, next, notifications, null, null, true, email);
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
            response.render("modify_profile", {
                name : user.name, 
                password : user.password,
                gender: user.gender, 
                points: user.points,
                birth_date : JSON.stringify(user.birth_date).slice(1, 11), //Primero se convierte a string y después se recorta para quedarse solo con año, mes y día
                profile_img : user.profile_img,
                errores : null
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
        birth_date: request.body.birth_date,
        profile_img: request.session.profile_img
    };
 
    validadorFormularios.validarFormularioModificarUsuario(request);

    if (request.file) {
        user.profile_img = request.file.filename;
    }
    request.getValidationResult().then(function(result) { 
        if(result.isEmpty()){
            daoUser.updateUser(user, (err) => {
                if (err) {
                    next(err);
                } else {
                    
                    renderizador.renderMyProfile(request, response, next, [], null, null, true, user.email);
                }
            });
        }else{
           
            response.render("modify_profile", {
                name : user.name, 
                password : user.password,
                gender: user.gender, 
                points: user.points,
                birth_date : JSON.stringify(user.birth_date).slice(1, 11), //Primero se convierte a string y después se recorta para quedarse solo con año, mes y día
                profile_img : user.profile_img,
                
                errores : result.mapped()
            });
           
        }
        
    });
   
});

profile.post("/upload_image", multerFactory.single("gallery_image"), function(request, response, next) {
    let email = request.session.currentUser;
    let image;
    let description = request.body.description;
    let points = request.session.points;

    if (request.file) {
        image = request.file.filename;
    }
   
    validadorFormularios.validarFormularioSubidaImagenes(request);
  

    request.getValidationResult().then(function(result) {
        if (result.isEmpty() && image != undefined) {
            if(points >= 100){
                daoUser.insertNewImageinPhotoGallery(email, image, description, (err) =>{
                    if (err) {
                        next(err);
                    } else {
                        daoUser.modifyPoints(email, -100, (err) =>{
                            if (err) {
                                next(err);
                            } else {
                                renderizador.renderMyProfile(request, response, next, [], null, null, true, email);
                            }
                        });     
                    }
                 });
            }else{
                renderizador.renderMyProfile(request, response, next, [], result.mapped(), "No tienes puntos suficientes", true, email);
            }
        } else if(result.isEmpty() && image == undefined) {
            renderizador.renderMyProfile(request, response, next, [], null, "No ha seleccionado ninguna imagen", true, email);
        
        } else if (!result.isEmpty() && image == undefined){            
            renderizador.renderMyProfile(request, response, next, [], result.mapped(), "No ha seleccionado ninguna imagen", true, email);
       
        }else {
            renderizador.renderMyProfile(request, response, next, [], result.mapped(), null, true, email);
        }
    });
});          



module.exports = profile;