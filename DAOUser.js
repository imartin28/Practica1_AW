"use strict";

class DAOUser{

    constructor(pool){
        this.pool = pool;
    }

    
    insertUser(user, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err);
            }
            else{
                let gender;
                switch (user.gender) {
                    case "Masculino" : gender = "Hombre"; break;
                    case "Femenino" : gender = "Mujer"; break;
                    case "Otro" : gender = "Otro"; break;
                }
                
                connection.query("INSERT INTO USER VALUES (?,?,?,?,?,?, 0)",
                [user.email, user.password, user.name, gender, user.birth_date, user.profile_img],
                (err, resultado)=>{
                    connection.release();
                    if(err){
                        callback(err);
                    }
                    else{
                     
                        callback(null);
                    }
                });
            }
        
        });
    }


    loginUser(email, password, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err, false);
            }
            else{
                connection.query("SELECT EMAIL FROM USER WHERE EMAIL = ? AND PASSWORD = ?",
                [email, password], (err, resultado) => {
                    connection.release();
                    if(err){
                        callback(err, false);
                    }
                    else{
                        let estaLogueado =  resultado.length > 0;
                        callback(null, estaLogueado);
                    }
                });
            }
        });
    }


    modifyUser(user, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err);
            }
            else{
                connection.query("UPDATE USER SET PASSWORD = ?, NAME = ?,GENDER = ?, BIRTH_DATE = ? ,PROFILE_IMG = ? WHERE EMAIL = ?",
                [user.password, user.name, user.gender, user.birth_date, user.profile_img, user.email],
                (err, resultado) =>{
                    connection.release();
                    if(err){
                        callback(err);
                    }
                    else{
                        callback(null);
                    }
                });
            }
        });
    }



    readUser(email, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err, null);
            }
            else{
                connection.query("SELECT * FROM USER WHERE EMAIL = ?", 
                [email], (err, result) =>{
                    connection.release();
                    if(err){
                        callback(err, null);
                    }
                    else{
                        let user = {
                            name : result[0].name,                          
                            gender : result[0].gender,
                            points : result[0].points,
                            birth_date : result[0].birth_date,
                            profile_img : result[0].profile_img
                        }
                        callback(null, user);
                    }
                });
            }
        });
    }
}



module.exports = DAOUser; 