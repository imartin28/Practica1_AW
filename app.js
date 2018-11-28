"use strict";
const config = require("./config");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore(config.mysqlConfig);
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
app.use(middlewareSession);
//Routers
app.use("/users", login_router);
app.use("/users", new_user_router);
app.use("/users", middlewareControlDeAcceso, my_profile_router);
app.use("/users", middlewareControlDeAcceso, friends_router);
app.use("/users", middlewareControlDeAcceso, questions_router);

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

// Arrancar el servidor
app.listen(config.port, function(err) {
    if (err) {
        console.log("ERROR al iniciar el servidor");
    }
    else {
        console.log(`Servidor arrancado en el puerto ${config.port}`);
    }
 });