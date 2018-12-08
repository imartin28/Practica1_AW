"use strict";

class DAOUser{

    constructor(pool){
        this.pool = pool;
    }

    
    insertUser(user, callback) {
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
                
                console.log(user.birth_date);
                connection.query("INSERT INTO USER VALUES (?,?,?,?,?,?,0)",
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

    searchUsersWithText(searchText, currentUser, callback) {
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err, null);
            }
            else {
                connection.query("SELECT * FROM User WHERE Name LIKE ? AND email != ? AND email NOT IN (SELECT emailDestination FROM FriendRequest WHERE emailSender = ? AND state = ?) AND email NOT IN (SELECT emailSender FROM FriendRequest WHERE emailDestination = ? AND state = ?) AND email NOT IN (SELECT emailFriend2 FROM Friend WHERE emailFriend1 = ?) AND email NOT IN (SELECT emailFriend1 FROM Friend WHERE emailFriend2 = ?) ", 
                ['%' + searchText + '%', currentUser, currentUser, "PENDING", currentUser, "PENDING", currentUser, currentUser], (err, results) => {
                    connection.release();
                    if(err) {
                        callback(err, null);
                    }
                    else{
                        let users = [];
                    
                        results.forEach(result => {
                            let user = {
                                email : result.email,
                                name : result.name,
                                profile_img : result.profile_img
                            }
                            users.push(user);
                        });

                        callback(null, users);
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
                [email], (err, rows) =>{
                    connection.release();
                    if(err){
                        callback(err, null);
                    }
                    else{
                        let user = null;

                        if (rows.length > 0) {
                            user = {
                                name : rows[0].name,   
                                password: rows[0].password,                       
                                gender : rows[0].gender,
                                points : rows[0].points,
                                birth_date : rows[0].birth_date,
                                profile_img : rows[0].profile_img
                            }
                        }
                        
                        callback(null, user);
                    }
                });
            }
        });
    }


    updateUser(user, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err);
            }
            else{
                let query = "";
                let parameters = [ user.password, user.name, user.gender, user.birth_date];

                if(user.profile_img == undefined){
                    query = "UPDATE USER SET password = ?, name = ?, gender = ?, birth_date = ? WHERE email = ?";
                }else{
                    query = "UPDATE USER SET password = ?, name = ?, gender = ?, birth_date = ?, profile_img = ? WHERE email = ?";
                    parameters.push(user.profile_img);
                }                    
              
                parameters.push(user.email);
                connection.query(query, parameters, (err, result) =>{
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