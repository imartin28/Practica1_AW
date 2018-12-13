"use strict";

const express = require("express");
const mysql = require("mysql");
const questions = express.Router();
const config = require("../config");
const DAOUser = require("../integracion/DAOUser");
const DAOQuestion = require("../integracion/DAOQuestion");
const DAONotifications = require("../integracion/DAONotifications");
const path = require("path");
const utils = require("../utils");
const validadorFormularios = require("../validadoresDeFormularios");
const renderizador = require("../renderizador");


// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUser = new DAOUser(pool);
const daoQuestion = new DAOQuestion(pool);
const daoNotifications = new DAONotifications(pool);

const ficherosEstaticos = path.join(__dirname, "..", "public");
questions.use(express.static(ficherosEstaticos));


questions.get("/create_new_question", function(request, response) {
    response.render("create_new_question", {errores : null});
});



questions.post("/create_new_question", function(request, response, next) {
    let array_answers = request.body.respuestas.split("\n");

    let question = {
        text : request.body.tituloPregunta,
        answers : array_answers,
        initialNumberOfAnswers : array_answers.length
    }

    validadorFormularios.validarFormularioCrearNuevaPregunta(request);

    request.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            response.render("create_new_question", {errores : result.mapped()});
        } else {
            daoQuestion.insertQuestion(question, (err) =>{
                if (err) {
                    next(err);
                } else {
                    response.setFlash("Pregunta creada correctamente");
                    response.redirect("questions");
                }
            });
        }
    });
});


questions.get("/questions", function(request, response, next) {
    let email = request.session.currentUser;

    daoQuestion.readFiveRandomQuestions((err, questions)=>{
        if (err) {
            next(err);
        } else {
            daoNotifications.deleteNotifications(email, (err) => {
                if (err) {
                    next(err);
                } else {
                    response.render("questions", {questions : questions});
                }
            });
            
        }
    });    
});

questions.post("/one_question", function(request, response, next) {
    let idQuestion = request.body.id_question;
    let textQuestion = request.body.text_question;
    let userEmail = request.session.currentUser;
   
    request.session.id_question = idQuestion;
    request.session.text_question = textQuestion;
    
    renderizador.renderOneQuestion(request, response, next);
});


questions.get("/one_question", function(request, response, next) {
    renderizador.renderOneQuestion(request, response, next);
});


/*  Renderiza la página de una pregunta para responderla por sí mismo */
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


/* Guarda la respuesta del usuario en la base de datos y elimina la respuesta previa en caso de haberla */
questions.post("/answer_question", function(request, response, next) {
    let typeOfAnswer = request.body.answer;
    let userEmail = request.session.currentUser;
    let idQuestion = request.session.id_question;
    let deleteString = request.body.deleteAnswer;

    if (deleteString == "true") {
        daoQuestion.deleteAnswer(userEmail, idQuestion, (err) =>{
            if (err) {
                next(err);
            } else {               
                typeAnswer(typeOfAnswer, request, response, next);         
            }
        });
    } else {
        typeAnswer(typeOfAnswer, request, response, next);  
    }
});



/*  Renderiza la página de una pregunta para responderla por un amigo */
questions.post("/answer_question_for_friend", function(request, response, next) {
    let idAnswerOfTheFriend = request.body.id_answer_of_the_friend;
    let idQuestion = request.session.id_question;
    let textQuestion = request.session.text_question;
    let emailFriend = request.body.friendEmail;
    let nameOfTheFriend = request.body.friendName;

    daoQuestion.readOneAnswer(idAnswerOfTheFriend, (err, textAnswer) => {
        if (err) {
            next(err);
        } else {
            daoQuestion.readRandomAnswers(idAnswerOfTheFriend, idQuestion, (err, answers) => {
                if (err) {
                    next(err);
                } else {
                    answers.push({id : idAnswerOfTheFriend, text : textAnswer});
                    utils.shuffle(answers);
                    response.render("answer_question_for_friend", {
                        text_question : textQuestion, 
                        answers : answers, 
                        emailFriend : emailFriend, 
                        nameOfTheFriend : nameOfTheFriend,
                        idAnswerOfTheFriend : idAnswerOfTheFriend, 
                        textAnswerOfTheFriend : textAnswer});
                }
            });
        }
    });
});



/* Guarda la respuesta en nombre de un amigo en la base de datos y elimina la respuesta previa en caso de haberla */
questions.post("/answered_question_for_friend", function(request, response, next) {
    let idQuestion = request.session.id_question;
    let textQuestion = request.session.text_question;
    let userEmail = request.session.currentUser;
    let emailFriend = request.body.emailFriend[0];
    let idAnswerUser = request.body.answer;
    let idAnswerOfTheFriend = request.body.idAnswerOfTheFriend[0];
    let isCorrect = idAnswerUser == idAnswerOfTheFriend;

    let textAnswerOfTheFriend = request.body.textAnswerOfTheFriend[0];

    daoQuestion.insertAnswerForFriend(userEmail, emailFriend, idQuestion, isCorrect, (err) => {
        if (err) {
            next(err);
        } else {
            daoQuestion.readOneAnswer(idAnswerUser, (err, textAnswer)=>{
                if(err){
                    next(err);
                }else{
                    daoNotifications.insertNotification(emailFriend, userEmail, textAnswerOfTheFriend, textAnswer, textQuestion, (err) =>{
                        if(err){
                            next(err);
                        }else if (isCorrect) {    
                             daoUser.modifyPoints(userEmail, 50, (err) => {                        
                                 if (err) {
                                     next(err);
                                 } else {
                                     daoUser.readUser(userEmail, (err, user) =>{
                                         if (err) {
                                             next(err);
                                         } else {
                                             request.session.points = user.points;
                                             renderizador.renderOneQuestion(request, response, next);
                                         }
                                    });
                                     
                                 }
                             });
                         } else {
                             renderizador.renderOneQuestion(request, response, next);
                         }
                     });
                }
            });
            
            
        }
    });
});






function typeAnswer(typeOfAnswer, request, response, next){
    let userEmail = request.session.currentUser;
    let idQuestion = request.session.id_question;

    
    if (typeOfAnswer == undefined) { // Si no se ha seleccionado ninguna respuesta
        response.setFlash("No se ha seleccionado ninguna respuesta");
        renderizador.renderOneQuestion(request, response, next);
    } else if (typeOfAnswer == "other") { // Si se ha selccionado la respuesta otra
        let textAnswer = request.body.other_answer;

        daoQuestion.insertOtherAnswer(textAnswer, idQuestion, (err, idAnswer) => {
            if (err) {
                next(err);
            } else {
                daoQuestion.answerQuestionForMyself(idQuestion, idAnswer, userEmail, (err) => {
                    if (err) {
                        next(err);
                    } else {
                        request.session.textAnswer = textAnswer;
                        response.setFlash("Nueva respuesta almacenada correctamente");
                        renderizador.renderOneQuestion(request, response, next);
                    }
                });
            }
        });
    
    } else { // Si se ha seleccionado una de las respuestas disponibles distintas de otra
        let idAnswer = request.body.answer;

        daoQuestion.answerQuestionForMyself(idQuestion, idAnswer, userEmail, (err) => {
            if (err) {
                next(err);
            } else {
                daoQuestion.readOneAnswer(idAnswer, (err, textAnswer) =>{
                    if (err) {
                        next(err);
                    } else {
                        request.session.textAnswer = textAnswer;
                        response.setFlash("Respuesta almacenada correctamente");
                        renderizador.renderOneQuestion(request, response, next);
                    }
                });
            }
        });
    }
}


module.exports = questions;
