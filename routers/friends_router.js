"use strict";

const express = require("express");
const mysql = require("mysql");
const friends = express.Router();
const config = require("../config");
const DAOUser = require("../integracion/DAOUser");
const DAOFriend = require("../integracion/DAOFriend");
const utils = require("../utils");

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);
const daoFriend = new DAOFriend(pool);


/* Atiende la petición get para mostrar la página friends.ejs, que contiene tanto las peticiones de amistad como los amigos */
friends.get("/friends", function(request, response, next) {
    let email = request.session.currentUser;
    
    daoFriend.getAllFriendRequestsTo(email, (err, friendRequests) => {
        if (err) {
            next(err);            
        } else {
            daoFriend.getAllFriends(email, (err, friends) =>{
                if (err) {
                    next(err);
                } else {                   
                    response.render("friends", {friendRequests : friendRequests, friends : friends});
                } 
            }); 
        }
    });
});


/* Recibe los datos de la barra de búsqueda de usuarios */
friends.post("/search", function(request, response, next) {
    let searchText = request.body.searchText.trim();
    let currentUser = request.session.currentUser;
    request.session.searchText = searchText;

    if (searchText.length == 0) {
        response.redirect("friends");
    } else {
        daoUser.searchUsersWithText(searchText, currentUser, (err, users) => {
            if (err) {
                next(err);
            } else {
                response.render("search", {searchText : searchText, users : users });
            }
        });  
    }
});


/* El usuario de la sesión actual envia una solicitud de amistad a otro usuario */
friends.post("/new_friend_request", function(request, response, next) {
    let emailSender = request.session.currentUser;
    let emailDestination = request.body.emailDestination;
    let buttonPulsed = request.body.request_friendship_button;
    
    if (buttonPulsed == "profile_link") {
        renderMyProfile(request, response, next, false, emailDestination);
    } else {
        daoFriend.insertFriendRequest(emailSender, emailDestination, (err) =>{
            if (err) {
                next(err);
            } else {
                let searchText = request.session.searchText;
                let emailUser = request.session.currentUser;

                daoUser.searchUsersWithText(searchText, emailUser, (err, users) => {
                    if (err) {
                        next(err);
                    } else {
                        response.setFlash("Se ha enviado la petición de amistad");
                        response.render("search", {searchText : searchText, users : users});
                    }
                });
            }
        });
    }
});   


/* Accedes al perfil de un usuario distinto al de la sesión actual, tanto en la pestaña
 amigos como en las solicitudes de aceptar o rechazar  */
friends.post("/my_friend_profile", function(request, response, next){
    let email = request.body.emailDestination;
    renderMyProfile(request, response, next, false, email);
});

/* Gestiona una petición de amistad aceptada, rechazada y enlaza al perfil del amigo */
friends.post("/accept_or_decline_friend_request", function(request, response, next) {
    let emailFriend = request.body.emailDestination;
    let currentUserEmail = request.session.currentUser;
    let buttonPulsed = request.body.request_button;
    
    if (buttonPulsed == "profile_link") {
        renderMyProfile(request, response, next, false, emailFriend);
    } else if (buttonPulsed == "request_accepted") {
        daoFriend.requestAccepted(currentUserEmail, emailFriend, (err) =>{
            if(err){
                next(err);
            }else{
                response.redirect("friends");
            }
        });
    } else if (buttonPulsed == "request_rejected") {
        daoFriend.requestRejected(currentUserEmail, emailFriend, (err) =>{
            if(err){
                next(err);
            }else{
                response.redirect("friends");
            }
        });
    }

});


function renderMyProfile(request, response, next, profileModifiable, email) {
    daoUser.readUser(email, (err, user) => {
        if (err) {
            next(err);
        } else {
            daoUser.readUserImages(email, (err, images) =>{
                if (err) {
                    next(err);
                } else {
                    let age = utils.calcularEdad(user.birth_date);         

                    response.render("my_profile", {
                        name : user.name, 
                        gender: user.gender, 
                        points: user.points,
                        age : age,
                        profile_img : user.profile_img,
                        profile_modifiable : profileModifiable,
                        images : images
                    });
                }
            });     
           
        }
    });    
}



module.exports = friends;