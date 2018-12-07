
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
                        rows.forEach(row =>{
                            let question = {
                                id : row.id_question,
                                text : row.text_question
                            };
                            questions.push(question);
                        });
                        callback(null, questions);
                        
                    }
                });
            }
        });
    }

    readAnswers(id, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err, null);
            }
            else{
                connection.query("SELECT id_answer, text_answer FROM Answer WHERE id_question = ? ",
                    [id],
                   (err, rows) => {
                    connection.release();
                    if (err) {
                        callback(err, null);
                    } else {           
                        let answers = [];
                        rows.forEach(row =>{
                            let answer = {
                                id : row.id_answer,
                                text : row.text_answer 
                            };

                            answers.push(answer);
                        });
                        callback(null, answers); 
                    }
                });
            }
        });
    }


    readOneAnswer(idAnswer, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err, null);
            }
            else{
                connection.query("SELECT text_answer FROM Answer WHERE id_answer = ? ",
                    [idAnswer],
                   (err, rows) => {
                    connection.release();
                    if (err) {
                        callback(err, null);
                    } else {           
                        let textAnswer;
                        if(rows.length != 0){
                            textAnswer = rows[0].text_answer;
                        }
                        callback(null, textAnswer); 
                    }
                });
            }
        });
    }

    answerOfTheUser(userEmail, idQuestion, callback) {
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err, null);
            } else {
            
                connection.query("SELECT id_answer FROM QuestionAnsweredByUser WHERE id_question = ? AND emailUser = ? ",
                    [idQuestion, userEmail],
                   (err, rows) => {
                    if (err) {
                        connection.release();
                        callback(err, null);
                    } else {   
                        if (rows.length == 0) {
                            connection.release();        
                            callback(null, null); 
                        } else {
                            connection.query("SELECT text_answer FROM Answer WHERE id_answer = ?", 
                            [rows[0].id_answer],
                            (err, rows) => {
                                connection.release();
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, rows[0].text_answer);
                                }
                            });
                        }
                        
                    }
                });
            }
        });
    };


    insertQuestion(question, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err);
            }
            else{
                           
                connection.query("INSERT INTO Question (text_question) VALUES (?)",
                [question.text], 
                (err, resultado)=>{
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
                            connection.release();
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

    answerQuestion(idQuestion, idAnswer, userEmail, callback) {
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err);
            } else {

                connection.query("INSERT INTO QuestionAnsweredByUser (emailUser, id_answer, id_question) VALUES (?, ?, ?)",
                [userEmail, idAnswer, idQuestion], 
                (err, resultado) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {       
                        callback(null);
                    }
                });
            }
        });
    }   

    insertOtherAnswer(answerText, idQuestion, callback) {
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err, null);
            } else {
                connection.query("INSERT INTO Answer (id_question, text_answer) VALUES (?, ?)",
                [idQuestion, answerText], 
                (err, resultado) => {
                    connection.release();
                    if (err) {
                        callback(err, null);
                    } else {       
                        callback(null, resultado.insertId);
                    }
                });
            }
        });
    }



    deleteAnswer(emailUser, idQuestion, callback){
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err);
            } else {
                
                connection.query("DELETE FROM QuestionAnsweredByUser WHERE emailUser = ? AND id_question = ?",
                [emailUser, idQuestion], 
                (err, resultado) => {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {       
                        callback(null);
                    }
                });
            }
        });
    }



    friendsAnswerQuestion(emailUser, idQuestion, callback){
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err, null);
            } else {
                
                connection.query("SELECT name, profile_img, email FROM User WHERE email IN (SELECT emailFriend2 FROM Friend WHERE emailFriend1 = ?) OR email IN (SELECT emailFriend1 FROM Friend WHERE emailFriend2 = ?)",
                [emailUser, emailUser], 
                (err, rows) => {
                    connection.release();
                    if (err) {
                        callback(err, null);
                    } else {       
                        let friends = [];
                        
                        rows.forEach(row => {
                            let friend = {
                                email : row.email,
                                name : row.name,
                                profile_img : row.profile_img 
                            };
                            friends.push(friend);
                        });
                        callback(null, friends);
                    }
                });
            }
        });
    }
}

module.exports = DAOQuestion; 