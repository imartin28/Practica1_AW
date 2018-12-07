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
    response.render("create_new_question", {errores : null});
});


function camposDeFormularioValidos(request) {
    request.checkBody("tituloPregunta", "Debe introducir un titulo.").notEmpty();
    request.checkBody("respuestas", "Debe introducir al menos una respuesta").notEmpty();
}



questions.post("/create_new_question", function(request, response, next) {
    let array_answers = request.body.respuestas.split("\n");

    let question = {
        text : request.body.tituloPregunta,
        answers : array_answers
    }

    camposDeFormularioValidos(request);

    request.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            response.render("create_new_question", {errores : result.mapped()});
        } else {
            daoQuestion.insertQuestion(question, (err) =>{
                if (err) {
                    next(err);
                } else {
                    response.redirect("questions");
                }
            });
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
   

    request.session.id_question = idQuestion;
    request.session.text_question = textQuestion;
    
    daoQuestion.answerOfTheUser(userEmail, idQuestion, (err, textAnswer) => {
        if (err) {
            next(err);
        } else {
            request.session.textAnswer = textAnswer;
            
            response.render("one_question", {text_question : textQuestion, id_question : idQuestion, textAnswer : textAnswer});
        }
    });
    
});

questions.get("/one_question", function(request, response) {

    response.render("one_question");
});

questions.post("/answer_question_for_myself", function(request, response, next) {
    let idQuestion = request.body.id_question;
    let textQuestion = request.body.text_question;
    let deleteString = request.body.delete;
    let deleteAnswer = false;
  
    if(deleteString == "true") {
        deleteAnswer = true;
    }
    
    daoQuestion.readAnswers(idQuestion, (err, answers) => {
        if (err) {
            next(err);
        } else {
            let question = {
                id : idQuestion,
                text : textQuestion,
                answers : answers
            }
           
            response.render("answer_question_for_myself", {question : question, deleteAnswer : deleteAnswer});
        }
    });
});



questions.post("/answer_question", function(request, response, next) {
    let typeOfAnswer = request.body.answer;
    let userEmail = request.session.currentUser;
    let idQuestion = request.session.id_question;
    let deleteString = request.body.deleteAnswer;

    if(deleteString == "true"){
        daoQuestion.deleteAnswer(userEmail, idQuestion, (err) =>{
            if(err){
                next(err);
            }else{               
                typeAnswer(typeOfAnswer, request, response, next);         
            }
        });
    } else {
        typeAnswer(typeOfAnswer, request, response, next);  
    }

    
});


function typeAnswer(typeOfAnswer, request, response, next){
    let userEmail = request.session.currentUser;
    let idQuestion = request.session.id_question;

    if (typeOfAnswer == undefined) {
        console.log(typeOfAnswer);
        response.redirect("answer_question_for_myself");

    }else if (typeOfAnswer == "other") {
        let textAnswer = request.body.other_answer;

        daoQuestion.insertOtherAnswer(textAnswer, idQuestion, (err, idAnswer) => {
            if (err) {
                next(err);
            } else {
                daoQuestion.answerQuestion(idQuestion, idAnswer, userEmail, (err) => {
                    if (err) {
                        next(err);
                    } else {
                        request.session.textAnswer = textAnswer;
                        response.redirect("one_question");
                    }
                });
            }
        });
    
    } else {
        let idAnswer = request.body.answer;
    
        daoQuestion.answerQuestion(idQuestion, idAnswer, userEmail, (err) => {
            if (err) {
                next(err);
            } else {
                daoQuestion.readOneAnswer(idAnswer, (err, textAnswer) =>{
                    if(err){
                        next(err);
                    }else{
                        request.session.textAnswer = textAnswer;
                        
                        response.redirect("one_question");
                    }
                });
            }
        });
    }



    
}


module.exports = questions;
