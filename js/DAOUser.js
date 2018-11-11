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
                connection.query("INSERT INTO USER VALUES (?,?,?,?,?,?)",
                [user.email, user.password, user.name, user.gender, user.birth_date, user.profile_img],
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
                callback(err);
            }
            else{
                connection.query("SELECT EMAIL FROM USER WHERE EMAIL = ? AND PASSWORD = ?",
                [email, password], (err, resultado) => {
                    connection.release();
                    if(err){
                        callback(err);
                    }
                    else{
                        if(resultado.length > 0){
                            callback(null);
                        }
                        else{
                            callback(new Error("No hay ningun usuario con ese usuario o contraseña"));
                        }
                        
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

}

module.exports = DAOUser; 