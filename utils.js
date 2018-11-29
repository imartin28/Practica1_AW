"use strict";


function calcularEdad(fechaCumpleaños) {
    let fechaActual = new Date();
    let fechaNacimiento = new Date(fechaCumpleaños);

    let edad = fechaActual - fechaNacimiento;
    edad = Math.floor(edad / (1000*60*60*24*365));

    return edad;
}

module.exports = {
    calcularEdad : calcularEdad
};