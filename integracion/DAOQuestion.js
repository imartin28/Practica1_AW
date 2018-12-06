
"use strict";

class DAOQuestion{

    constructor(pool){
        this.pool = pool;
    }

    
    readFiveRandomQuestions(callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err, null);
            }
            else{
                           
                connection.query("SELECT * FROM Question ORDER BY RAND() LIMIT 5 ",
                   (err, rows)=>{
                    connection.release();
                    if(err){
                        callback(err, null);
                    }
                    else{           
                        let questions = [];
                        rows.forEach(question =>{
                            questions.push(question.text_question);

                        });
                        callback(null, questions);
                        
                    }
                });
            }
        });
    }


    insertQuestion(question, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err);
            }
            else{
                           
                connection.query("INSERT INTO Question (text_question) VALUES (?)",
                [question.text], 
                (err, resultado)=>{
                    connection.release();
                    if(err){
                        callback(err);
                    }
                    else{       
                        let values = [];
                        question.answers.forEach(answer =>{
                            values.push([resultado.insertId, answer]);
                        });
                        
                        connection.query("INSERT INTO Answer (id_question, text_answer) VALUES  ?",
                        [values], 
                        (err, resultado) => {
                            if(err){
                                callback(err);
                            }else{
                                callback(null);
                            }
                        });  
                        
                    }
                });
            }
        });
    }

   /* getAllFriendRequestsTo(emailCurrentUser, callback){
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
    }*/
}

module.exports = DAOQuestion; 