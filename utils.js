"use strict";


function calcularEdad(fechaCumpleaños) {
    let fechaActual = new Date();
    let fechaNacimiento = new Date(fechaCumpleaños);

    let edad = fechaActual - fechaNacimiento;
    edad = Math.floor(edad / (1000*60*60*24*365));

    return edad;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = {
    calcularEdad : calcularEdad,
    shuffle : shuffle
};