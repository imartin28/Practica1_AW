"use strict";

class DAOUser{

    constructor(pool){
        this.pool = pool;
    }

    /* Inserta un unevo usuario en la base de datos */    
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

    /* Devuelve el usuario si existe un usuario con ese email y ese password, en caso contrario devuelve null */
    loginUser(email, password, callback){
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err, null);
            } else {
                connection.query("SELECT email, points, profile_img FROM USER WHERE EMAIL = ? AND PASSWORD = ?",
                [email, password], (err, rows) => {
                    connection.release();
                    if (err) {
                        callback(err, null);
                    } else {
                        let user = null;

                        rows.forEach(row => {
                            user = {
                                email : row.email,
                                points : row.points,
                                profile_img : row.profile_img
                            };
                        });
                        callback(null, user);
                    }
                });
            }
        });
    }

    /* Busca usuarios cuyo nombre tenga el texto pasado como parámetro */
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


    /* Lee el usuario cuyo email coincida con el email pasado como parámetro */
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

    /* Actualiza el usuario pasado como parámetro */
    updateUser(user, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err);
            }
            else{
                let query = "";
                let parameters = [ user.password, user.name, user.gender, user.birth_date];

                if (user.profile_img == undefined) {
                    query = "UPDATE USER SET password = ?, name = ?, gender = ?, birth_date = ? WHERE email = ?";
                } else {
                    query = "UPDATE USER SET password = ?, name = ?, gender = ?, birth_date = ?, profile_img = ? WHERE email = ?";
                    parameters.push(user.profile_img);
                }                    
              
                parameters.push(user.email);
                connection.query(query, parameters, (err, result) =>{
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

    /* Actualiza el numero de puntos de un usuario sumandole los puntos pasados como parámetro */
    modifyPoints(email, numberOfPoints, callback) {
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err);
            } else {
                connection.query("UPDATE User SET points = points + ? WHERE email = ?", 
                [numberOfPoints, email],
                (err, result) => {
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
    
    /* Lee todas las imágenes del usuario pasado como parámetro */
    readUserImages(userEmail, callback){
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err, null);
            } else {
                connection.query("SELECT profile_img, description_image FROM PhotoGallery WHERE emailUser = ?", 
                [userEmail],
                (err, rows) => {
                    connection.release();
                    if (err) {
                        callback(err, null);
                    } else {
                        let images = [];

                        rows.forEach(row =>{
                            let image = {
                                image : row.profile_img,
                                description : row.description_image                     

                            };
                            images.push(image);
                        });
                        
                        callback(null, images);
                    }
                });
            }
        });
    }

    /* Inserta una nueva imagen en la galería de fotos de un usuario */
    insertNewImageinPhotoGallery(emailUser, image, description_image, callback){
        this.pool.getConnection((err, connection) =>{
            if (err) {
                callback(err);
            } else {
                connection.query("INSERT INTO PhotoGallery (emailUser, profile_img, description_image) VALUES (?,?, ?)", 
                [emailUser, image, description_image],
                (err, rows) => {
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




module.exports = DAOUser; 