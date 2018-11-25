"use strict";
const express = require("express");
const mysql = require("mysql");
const friends = express.Router();
const config = require("./config");
const DAOUser = require("./DAOUser");

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);

friends.get("/friends", function(request, response) {
    response.status(200);

    
    response.render("friends", {mensajeDeError : null});
});

friends.get("/search", function(request, response) {
    response.status(200);
    daoUser.searchUsersWithText("I", (err, users) => {
        if (err) {
            console.log(err.message);
        } else {
            response.render("search", {searchText : "e", users : users});
        }
    });
    
});


                                        


module.exports = friends;