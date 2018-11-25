"use strict";
const express = require("express");
const mysql = require("mysql");
const friends = express.Router();
const config = require("./config");
const DAOUser = require("./DAOUser");
const DAOFriend = require("./DAOFriend");

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);
const daoFriend = new DAOFriend(pool);

friends.get("/friends", function(request, response) {
    response.status(200);
    let email = request.session.currentUser;

    daoFriend.getAllFriendRequestsTo(email, (err, friendRequests) => {
        if (err) {
            console.log(err.message);
        } else {
            response.render("friends", {friendRequests : friendRequests});
        }
    });

    
});

friends.post("/search", function(request, response) {
    let searchText = request.body.searchText;
    let currentUser = request.session.currentUser;

    daoUser.searchUsersWithText(searchText, currentUser, (err, users) => {
        if (err) {
            console.log(err.message);
        } else {
            response.render("search", {searchText : searchText, users : users});
        }
    });    
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


module.exports = friends;