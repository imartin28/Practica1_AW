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
const login = require("./login");


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
app.use("/users", login);
//app.use("/users", friends);

// Arrancar el servidor
app.listen(config.port, function(err) {
    if (err) {
        console.log("ERROR al iniciar el servidor");
    }
    else {
        console.log(`Servidor arrancado en el puerto ${config.port}`);
    }
 });