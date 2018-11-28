"use strict";

class DAOFriend{

    constructor(pool){
        this.pool = pool;
    }

    
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


    getAllFriends(emailCurrentUser, callback){
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err, null);
            }
            else {
                connection.query("SELECT name, profile_img, email FROM User WHERE email IN (SELECT emailFriend2 FROM Friend WHERE emailFriend1 = ?) ",
                [emailCurrentUser],
                (err, results) => {
                    connection.release();
                    if (err) {
                        callback(err, null);
                    }
                    else{   
                        let users = [];
                        
                        results.forEach(result => {
                            let user = {
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
}

module.exports = DAOFriend; 