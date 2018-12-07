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
    daoQuestion.readFiveRandomQuestions((err, questions)=>{
        if(err){
            next(err);
        }else{
            response.render("questions", {questions : questions});
        }
    });    
});

// TODO
questions.post("/one_question", function(request, response, next) {
    let idQuestion = request.body.id_question;
    let textQuestion = request.body.text_question;
    let userEmail = request.session.currentUser;

    console.log(userEmail);
    console.log(idQuestion);
    request.session.id_question = idQuestion;
    request.session.text_question = textQuestion;

    daoQuestion.answerOfTheUser(userEmail, idQuestion, (err, answer) => {
        if (err) {
            next(err);
        } else {
            response.render("one_question", {text_question : textQuestion, id_question : idQuestion, answer : answer});
        }
    });
    
});

questions.get("/one_question", function(request, response, next) {
    response.locals.id_question = request.session.id_question;
    response.locals.text_question = request.session.text_question;

    response.render("one_question");
});

questions.post("/answer_question_for_myself", function(request, response, next) {
    let idQuestion = request.body.id_question;
    let textQuestion = request.body.text_question;
    
    daoQuestion.readAnswers(idQuestion, (err, answers) => {
        if (err) {
            next(err);
        } else {
            let question = {
                id : idQuestion,
                text : textQuestion,
                answers : answers
            }

            response.render("answer_question_for_myself", {question : question});
        }
    });
});




module.exports = questions;
