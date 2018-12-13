"use strict";

class DAOFriend{

    constructor(pool){
        this.pool = pool;
    }

    /* Inserta una nueva solicitud de amistad */
    insertFriendRequest(emailSender, emailDestination, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err);
            }
            else{
                let state = "PENDING";
                
                connection.query("INSERT INTO FriendRequest VALUES (?,?,?)",
                [emailSender, emailDestination, state],
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


    /* Lee de la base de datos todas las solicitudes de miastad al usuario pasado como parámetro */
    getAllFriendRequestsTo(emailCurrentUser, callback){
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err, null);
            }
            else {
                connection.query("SELECT name, profile_img, email FROM User WHERE email IN (SELECT emailSender FROM FriendRequest WHERE emailDestination = ? AND state = ?) ",
                [emailCurrentUser, "PENDING"],
                (err, results) => {
                    connection.release();
                    if (err) {
                        callback(err, null);
                    }
                    else{   
                        let users = [];
                        
                        results.forEach(result => {
                            let user = {
                                email : result.email,
                                name : result.name,
                                profile_img : result.profile_img 
                            };
                            users.push(user);
                        });
                        callback(null, users);
                    }
                });
            }
        });
    }


    /* Lee todos los amigos del usuario pasado como parámetro */
    getAllFriends(emailCurrentUser, callback){
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err, null);
            }
            else {
                connection.query("SELECT name, profile_img, email FROM User WHERE email IN (SELECT emailFriend2 FROM Friend WHERE emailFriend1 = ?) OR email IN (SELECT emailFriend1 FROM Friend WHERE emailFriend2 = ?)",
                [emailCurrentUser, emailCurrentUser],
                (err, results) => {
                    connection.release();
                    if (err) {
                        callback(err, null);
                    }
                    else{   
                        let users = [];
                        
                        results.forEach(result => {
                            let user = {
                                email : result.email,
                                name : result.name,
                                profile_img : result.profile_img 
                            };
                            users.push(user);
                        });
                        callback(null, users);
                    }
                });
            }
        });
    }



    /* Cuando se acepta una solicitud de amistad la borra de FriendRequest e inserta a los usuarios en la tabla Friend */
    requestAccepted(emailCurrentUser, emailSender, callback){
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err);
            }
            else {
                let query = "DELETE FROM FriendRequest WHERE emailDestination = ? AND emailSender = ? ;";
                query += "INSERT INTO Friend VALUES (? , ?)"
                connection.query(query, [emailCurrentUser, emailSender, emailCurrentUser, emailSender],
                (err, results) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    }
                    else{  
                        callback(null);
                       
                    }
                });
            }
        });
    }

    /* Cuando se rechaza una solicitud de amistad la borra de FriendRequest */
    requestRejected(emailCurrentUser, emailSender, callback){
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err);
            }
            else {
                let query = "DELETE FROM FriendRequest WHERE emailDestination = ? AND emailSender = ?";
                connection.query("DELETE FROM FriendRequest WHERE emailDestination = ? AND emailSender = ?",
                    [emailCurrentUser, emailSender],
                (err, results) => {
                    connection.release();
                    if (err) {
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

module.exports = DAOFriend; 