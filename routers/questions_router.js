"use strict";

const express = require("express");
const mysql = require("mysql");
const questions = express.Router();
const config = require("../config");
const DAOUser = require("../integracion/DAOUser");
const path = require("path");

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);

const ficherosEstaticos = path.join(__dirname, "..", "public");
questions.use(express.static(ficherosEstaticos));

questions.get("/create_new_question", function(request, response) {
    response.status(200);
    response.render("create_new_question");
});

questions.get("/questions", function(request, response) {
    response.status(200);
    response.render("questions");
});


module.exports = questions;
