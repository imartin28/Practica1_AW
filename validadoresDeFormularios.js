"use strict";

function validarFormularioNuevoUsuario(request) {
    request.checkBody("email", "Debe introducir un email").notEmpty();
    request.checkBody("email", "Dirección de correo no válida").isEmail();
    /* request.check("email", "Dirección de correo ya existente").emailNoExistente(); */

    request.checkBody("password", "Debe introducir una contraseña").notEmpty();
    request.checkBody("password", "Introduzca una contraseña correcta").matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/);

    request.checkBody("name", "Debe añadir un nombre").notEmpty();
    request.checkBody("name", "El nombre debe contener solo letras y/o números").matches(/^[A-Za-z0-9_-]+$/);

    request.checkBody("gender", "Debe elegir una opción").notEmpty();
    
    if(request.body.birth_date != "")   {
        request.checkBody("birth_date", "Debe introducir una fecha válida").isBefore();
    }
}


function validarFormularioLogin(request){
    request.checkBody("email", "Debe introducir un email").notEmpty();
    request.checkBody("email", "Dirección de correo no válida").isEmail();
    request.checkBody("password", "Debe introducir una contraseña").notEmpty();
}


function validarFormularioSubidaImagenes(request) {
    request.checkBody("description", "La imagen debe tener una descripción").notEmpty();
}



module.exports = {
    validarFormularioNuevoUsuario : validarFormularioNuevoUsuario,
    validarFormularioLogin : validarFormularioLogin,
    validarFormularioSubidaImagenes : validarFormularioSubidaImagenes
}