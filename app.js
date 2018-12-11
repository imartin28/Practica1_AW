"use strict";

const config = require("./config");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const morgan = require("morgan");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore(config.mysqlConfig);
const expressValidator = require("express-validator");

//Routers
const login_router = require("./routers/login_router");
const my_profile_router = require("./routers/my_profile_router");
const new_user_router = require("./routers/new_user_router");
const friends_router = require("./routers/friends_router");
const questions_router = require("./routers/questions_router");

// Crear un servidor Express.js
const app = express();

const ficherosEstaticos = path.join(__dirname, "public");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public", "views"));

const middlewareSession = session({
    saveUninitialized: false, //Que no se cree ninguna sesión para los clientes que no estén en la BBDD de sesiones
    secret: "foobar34", // Se utiliza firmar el SID que se envía al cliente
    resave: false, //Fuerza a que se guarde el contenido de la sesión en la BBDD al final de la sesión
    store: sessionStore
});

// Middlewares
app.use(express.static(ficherosEstaticos));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(middlewareSession);
app.use(expressValidator());
app.use(flashMiddleware);


//Routers
app.use("/users", login_router);
app.use("/users", new_user_router);
app.use("/users", middlewareControlDeAcceso, my_profile_router);
app.use("/users", middlewareControlDeAcceso, friends_router);
app.use("/users", middlewareControlDeAcceso, middlewareDatosPreguntas, questions_router);

app.use(middlewareError404);
app.use(middlewareError500);


function middlewareError404(request, response, next) {
    response.status(404);
    response.render("error404");
}


function middlewareError500(error, request, response, next) {
    //Código 500: Internal server error
    response.status(500);
    response.render("error500", {
        pila : error.stack
    });
}


function middlewareControlDeAcceso(request,  response, next) {
    let email = request.session.currentUser;
    let profile_img = request.session.profile_img;
    let points = request.session.points;

    if (email != null) {
        response.locals.userEmail = email;
        response.locals.profile_img = profile_img;
        response.locals.points = points;
        next();
    } else {
        response.redirect("login");
    }     
}


function middlewareDatosPreguntas(request, response, next){
    response.locals.id_question = request.session.id_question;
    response.locals.text_question = request.session.text_question;
    response.locals.textAnswer = request.session.textAnswer;

    next();
}


function flashMiddleware(request, response, next){
    response.setFlash = function(msg) {
        request.session.flashMsg = msg;
    };

    response.locals.getAndClearFlash = function() {
        let msg = request.session.flashMsg;
        delete request.session.flashMsg;
        return msg;
    };
    next();
}


// Arrancar el servidor
app.listen(config.port, function(err) {
    if (err) {
        console.log("ERROR al iniciar el servidor");
    }
    else {
        console.log(`Servidor arrancado en el puerto ${config.port}`);
    }
 });


