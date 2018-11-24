"use strict";
const express = require("express");
const path = require("path");
const mysql = require("mysql");
const new_user = express.Router();
const config = require("./config");
const DAOUser = require("./DAOUser");
const multer = require("multer");
const multerFactory = multer({ dest: path.join(__dirname, "profile_imgs")});

const ficherosEstaticos = path.join(__dirname, "public");
new_user.use(express.static(ficherosEstaticos));

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


new_user.post("/new_user", multerFactory.single("profile_img"), function(request, response) {
    let user  = {
        email : request.body.email,
        password : request.body.password,
        name: request.body.name,
        gender : request.body.gender,
        birth_date : request.body.birth_date,
        profile_img: "noPerfil.jpg", 
        points : 0
    };
   
    let age = calcularEdad(user.birth_date);
   
    if(request.file){
        user.profile_img = request.file.filename;       
    }

    request.session.currentUser = user.email;
    request.session.profile_img = user.profile_img;
    request.session.points = user.points;
    
    //HAY QUE COMPROBAR QUE EL EMAIL EXISTE EN LA BD
    daoUser.insertUser(user, (err) =>{
        if(!err){        
            response.render("my_profile", {name : user.name, 
            gender: user.gender, 
            points: user.points,
            age : age,
            profile_img : user.profile_img,
            
            });
        } 
                
    });
});


new_user.get("/profile_img/:id", function(request, response)  {
    let pathImg = path.join(__dirname, "profile_imgs", request.params.id);
    response.sendFile(pathImg);
});


module.exports = new_user;