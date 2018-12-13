
"use strict";

class DAOQuestion{
    constructor(pool){
        this.pool = pool;
    }

    /* Lee 5 preguntas aleatorias */
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

    /* Lee todas las respuestas asociadas a la pregunta pasada como parámetro */
    readAnswers(idQuestion, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err, null);
            }
            else{
                connection.query("SELECT id_answer, text_answer FROM Answer WHERE id_question = ? ",
                    [idQuestion],
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


    /* Lee la respuesta cuyo id es pasado como parámetro */
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

    /* Lee la respuesta de un usuario a una pregunta */
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


    /* Inserta una nueva pregunta en la base de datos */
    insertQuestion(question, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err);
            }
            else{
                           
                connection.query("INSERT INTO Question (text_question, initial_number_of_answers) VALUES (?, ?)",
                [question.text, question.initialNumberOfAnswers], 
                (err, resultado) => {
                    if(err){
                        callback(err);
                    }
                    else{       
                        let values = [];
                        question.answers.forEach(answer =>{
                            values.push([resultado.insertId, answer]);
                        });
                        
                        connection.query("INSERT INTO Answer (id_question, text_answer) VALUES ?",
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

    /* Inserta una nueva respuesta en la base de datos respondida por el usuario para sí mismo */
    answerQuestionForMyself(idQuestion, idAnswer, userEmail, callback) {
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

    /* Inserta una nueva respuesta asociada a una pregunta pasada como parámetro */
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


    /* Borra una respuesta de un usuario a una pregunta */
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


    /* Lee todos los amigos del usuario pasado como parámetro que han respondido a una pregunta pasada como parámetro */
    friendsAnswerQuestion(emailUser, idQuestion, callback){
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err, null);
            } else {
                connection.query("SELECT name, profile_img, email, id_answer, correct FROM User U, QuestionAnsweredByUser Q LEFT JOIN QuestionAnsweredForFriend QA ON Q.emailUser = QA.emailFriend AND Q.id_question = QA.id_question WHERE Q.emailUser = email AND Q.id_question = ? AND (email IN (SELECT emailFriend2 FROM Friend WHERE emailFriend1 = ? ) OR email IN (SELECT emailFriend1 FROM Friend WHERE emailFriend2 = ?))",
                [idQuestion, emailUser, emailUser], 
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
                                profile_img : row.profile_img,
                                idAnswer : row.id_answer,
                                correct : row.correct
                            };
                            friends.push(friend);
                        });

                        callback(null, friends);
                    }
                });
            }
        });
    }

    /* Lee el numero inicial de respuestas - 1 respuestas de la pregunta pasada como parámetro. Además
       ninguna de las respuestas devueltas será la pasada como parámetro */
    readRandomAnswers(idAnswerOfTheFriend, idQuestion, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err, null);
            }
            else {
                connection.query("SELECT initial_number_of_answers FROM Question WHERE id_question = ?",
                [idQuestion],
                (err, rows) => {
                    if(err){
                        callback(err, null);
                    } else {
                        let numberOfAnswers = rows[0].initial_number_of_answers - 1;
                        connection.query("SELECT * FROM Answer WHERE id_answer != ? AND id_question = ? ORDER BY RAND() LIMIT ? ",
                        [idAnswerOfTheFriend, idQuestion, numberOfAnswers],
                    (err, rows)=>{
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
        });
    }

    /* Inserta una respuesta respondida por un amigo */
    insertAnswerForFriend(emailUser, emailFriend, idQuestion, isCorrect, callback) {
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err);
            } else {
                connection.query("INSERT INTO QuestionAnsweredForFriend (emailUser, emailFriend, id_question, correct) VALUES (?, ?, ?, ?)",
                [emailUser, emailFriend, idQuestion, isCorrect], 
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
}

module.exports = DAOQuestion; 