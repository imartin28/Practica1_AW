"use strict";

const mysql = require("mysql");
const config = require("./config");
const utils = require("./utils");


const DAOQuestion = require("./integracion/DAOQuestion");
const DAOUser = require("./integracion/DAOUser");
const DAONotifications = require("./integracion/DAONotifications");


const pool = mysql.createPool(config.mysqlConfig);
const daoQuestion = new DAOQuestion(pool);
const daoUser = new DAOUser(pool);
const daoNotifications = new DAONotifications(pool);



/* Lee los datos necesarios de la base de datos para renderizar la vista one_question y si no hay ningún error la renderiza. */
function renderOneQuestion(request, response, next) {
    let userEmail = request.session.currentUser;
    let idQuestion = request.session.id_question;
    let textQuestion = request.session.text_question;
    let points =  request.session.points;
    
    daoQuestion.answerOfTheUser(userEmail, idQuestion, (err, textAnswer) => {
        if (err) {
            next(err);
        } else {
            request.session.textAnswer = textAnswer;
            daoQuestion.friendsAnswerQuestion(userEmail, idQuestion, (err, friends) => {
                if (err) {
                    next(err);
                } else {
                    response.render("one_question", {text_question : textQuestion, id_question : idQuestion, textAnswer : textAnswer, listOfFriendsThatHaveAnswered: friends, points : points});
                }
            });
        }
    });
}



function renderMyProfile(request, response, next, notifications, errores, msg_error, profile_modifiable, email) {
    daoUser.readUser(email, (err, user) => {
        if (err) {
            next(err);
        } else {
            daoUser.readUserImages(email, (err, images) =>{
                if (err) {
                    next(err);
                } else {
                    let age = utils.calcularEdad(user.birth_date);
            
                    // Solo se deben añadir a la sesión si son los datos del usuario logueado. 
                    // En caso de ser de un amigo no se debe modificar la sesión.
                    if (profile_modifiable) {
                        request.session.profile_img = user.profile_img;
                        request.session.points = user.points;
                    }

             
                    response.render("my_profile", {
                        name : user.name, 
                        gender: user.gender, 
                        points: user.points,
                        age : age,
                        profile_img : user.profile_img,
                        profile_modifiable : profile_modifiable,
                        images : images,
                        errores : errores,
                        msg_error : msg_error,
                        notifications: notifications,
                        userEmail : request.session.currentUser,
                        userProfile_img : request.session.profile_img,
                        userPoints : request.session.points
                    });  
                }
            });          
        }
    });
}


module.exports = {
    renderOneQuestion : renderOneQuestion,
    renderMyProfile : renderMyProfile
}