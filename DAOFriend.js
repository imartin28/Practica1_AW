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
            if(err){
                callback(err, null);
            }
            else{
                connection.query("SELECT name, profile_img FROM User WHERE email IN (SELECT emailSender FROM FriendRequest WHERE emailDestination = ? AND state = ?) ",
                [emailCurrentUser, "PENDING"],
                (err, results)=>{
                    connection.release();
                    if(err){
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


}

module.exports = DAOFriend; 