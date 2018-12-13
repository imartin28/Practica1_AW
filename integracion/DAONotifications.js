"use strict";

class DAONotifications{

    constructor(pool){
        this.pool = pool;
    }

    /* Inserta una nueva notificación */
    insertNotification(emailUserAnswered, emailUserGuessing, textAnswerFirst, textAnswerGuessing, textQuestion, callback ){
      
        this.pool.getConnection((err, connection) =>{
        
            if (err) {
                callback(err);
            } else {
                
                connection.query("INSERT INTO NOTIFICATIONS (emailUser_answered_first, emailUser_guessing, text_answer_user_answered_first, text_answer_user_guessing, text_question) VALUES (?,?,?,?,?)",
                [emailUserAnswered, emailUserGuessing, textAnswerFirst, textAnswerGuessing, textQuestion],
                (err, resultado)=>{
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


    /* Lee todas las notificaciones del usuario pasado como parámetro */
    readNotifications(emailUser, callback){
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err, null);
            } else {
                connection.query("SELECT * FROM NOTIFICATIONS, USER WHERE emailUser_guessing = email AND emailUser_answered_first = ?",
                [emailUser],
                (err, rows)=>{
                    connection.release();
                    if (err) {
                        callback(err, null);
                    } else {
                        let notifications = [];
                        rows.forEach(row => {
                            let notification = {
                                emailUserAnswered : row.emailUser_answered_first,
                                emailUserGuessing : row.emailUser_guessing,
                                textAnswerFirst : row.text_answer_user_answered_first,
                                textAnswerGuessing : row.text_answer_user_guessing,
                                textQuestion : row.text_question,
                                nameFriend : row.name
                            }
                            notifications.push(notification);
                        });

                        callback(null, notifications);
                    }
                });
            }
        });
    }

    /* Borra todas las notificaciones del usuario pasado como parámetro */
    deleteNotifications(email, callback) {
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err);
            } else {
                connection.query("DELETE FROM NOTIFICATIONS WHERE emailUser_answered_first = ?",
                [email],
                (err, result)=>{
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




module.exports = DAONotifications; 