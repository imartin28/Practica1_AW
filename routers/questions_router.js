"use strict";

const express = require("express");
const mysql = require("mysql");
const questions = express.Router();
const config = require("../config");
const DAOUser = require("../integracion/DAOUser");
const DAOQuestion = require("../integracion/DAOQuestion");
const path = require("path");

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);
const daoQuestion = new DAOQuestion(pool);

const ficherosEstaticos = path.join(__dirname, "..", "public");
questions.use(express.static(ficherosEstaticos));

questions.get("/create_new_question", function(request, response) {
    response.status(200);
    response.render("create_new_question");
});

questions.post("/create_new_question", function(request, response, next) {
    
    let array_answers = request.body.respuestas.split("\n");

    let question = {
        text : request.body.tituloPregunta,
        answers : array_answers
    }

    daoQuestion.insertQuestion(question, (err) =>{
        if(err){
            next(err);
        }else{
            response.render("create_new_question");
        }
    });
});

questions.get("/questions", function(request, response, next) {
    response.status(200);
    daoQuestion.readFiveRandomQuestions((err, questions)=>{
        if(err){
            next(err);
        }else{
            response.render("questions", {questions : questions});
        }
    });

    
});




module.exports = questions;
