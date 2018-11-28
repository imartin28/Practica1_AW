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

friends.get("/friends", function(request, response) {
    let email = request.session.currentUser;

    daoFriend.getAllFriendRequestsTo(email, (err, friendRequests) => {
        if (err) {
            //next(err) para que salte al error middleware con error 500
            console.log(err.message);
        } else {
            daoFriend.getAllFriends(email, (err, friends) =>{
                if (err) {
                    console.log(err.message);
                } else {
                    response.render("friends", {friendRequests : friendRequests, friends : friends});
                } 
            }); 
        }
    });
});




friends.post("/search", function(request, response) {
    let searchText = request.body.searchText.trim();
    let currentUser = request.session.currentUser;
    
    if (searchText.length == 0) {
        response.redirect("friends");
    } else {
        daoUser.searchUsersWithText(searchText, currentUser, (err, users) => {
            if (err) {
                console.log(err.message);
            } else {
                response.render("search", {searchText : searchText, users : users});
            }
        });  
    }
});


friends.post("/new_friend_request", function(request, response) {
    let emailSender = request.session.currentUser;
    let emailDestination = request.body.emailDestination;
   
    daoFriend.insertFriendRequest(emailSender, emailDestination, (err) =>{
        if (err) {
            console.log(err.message);
        } else {
            response.redirect("my_profile");
        }
    });
  
});   

friends.get("/my_friend_profile", function(request, response){

    let email = request.body.emailDestination;
    console.log(email);
    daoUser.readUser(email, (err, user) => {
        if (err) {
            console.log(err);
        } else {
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
        }
    });
    
});

friends.get("/request_accepted", function(request, response) {
    response.status(200);

    daoFriend.requestAccepted();

});




module.exports = friends;