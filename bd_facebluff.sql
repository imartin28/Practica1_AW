



CREATE TABLE IF NOT EXISTS User (
   email    VARCHAR(100) not null,
   password   VARCHAR(100) not null,
   name        VARCHAR(200) not null,
   gender     VARCHAR(20) not null,
   birth_date DATE,
   profile_img VARCHAR(200),
   points INT,
   CONSTRAINT pk_user PRIMARY KEY (Email),
   CONSTRAINT ck_user CHECK (gender IN ('Masculino', 'Femenino', 'Otro')) 
   
  );


  CREATE TABLE IF NOT EXISTS FriendRequest (
    emailSender VARCHAR(200) not null,
    emailDestination VARCHAR(200) not null,
    state VARCHAR(200) not null,
    CONSTRAINT pk_friendRequest PRIMARY KEY (emailSender, emailDestination),
    CONSTRAINT fk_friendRequest_User_sender FOREIGN KEY(emailSender) REFERENCES User(email) ON DELETE CASCADE,
    CONSTRAINT fk_friendRequest_User_destination FOREIGN KEY(emailDestination) REFERENCES User(email) ON DELETE CASCADE,
    CONSTRAINT ck_friendRequest_state CHECK (state IN ('ACCEPTED', 'REJECTED', 'PENDING'))
  );


CREATE TABLE IF NOT EXISTS Friend (
    emailFriend1 VARCHAR(200) not null,
    emailFriend2 VARCHAR(200) not null,
    CONSTRAINT pk_friend PRIMARY KEY (emailFriend1, emailFriend2),
    CONSTRAINT fk_friend_User_1 FOREIGN KEY(emailFriend1) REFERENCES User(email) ON DELETE CASCADE,
    CONSTRAINT fk_friend_User_2 FOREIGN KEY(emailFriend2) REFERENCES User(email) ON DELETE CASCADE
 
);

/********* PREGUNTAS *********/

CREATE TABLE IF NOT EXISTS Question (
  id_question INT NOT NULL AUTO_INCREMENT,
  text_question VARCHAR(500) NOT NULL,
  initial_number_of_answers INT NOT NULL,
  CONSTRAINT pk_question PRIMARY KEY (id_question)
);


CREATE TABLE IF NOT EXISTS Answer(
  id_answer INT NOT NULL AUTO_INCREMENT,
  id_question INT NOT NULL,
  text_answer VARCHAR(500) NOT NULL,
  CONSTRAINT pk_answer PRIMARY KEY (id_answer),
  CONSTRAINT fk_answer_question FOREIGN KEY(id_question) REFERENCES Question(id_question) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS QuestionAnsweredByUser (
  emailUser VARCHAR(200) NOT NULL,
  id_answer INT NOT NULL,
  id_question INT NOT NULL,
  CONSTRAINT pk_questionAnsweredByUser PRIMARY KEY (emailUser, id_question),
  CONSTRAINT fk_questionAnsweredByUser_user FOREIGN KEY(emailUser) REFERENCES User(email) ON DELETE CASCADE,
  CONSTRAINT fk_questionAnsweredByUser_answer FOREIGN KEY(id_answer) REFERENCES Answer(id_answer) ON DELETE CASCADE,
  CONSTRAINT fk_questionAnsweredByUser_question FOREIGN KEY(id_question) REFERENCES Question(id_question) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS QuestionAnsweredForFriend (
  emailUser VARCHAR(200) NOT NULL,
  emailFriend VARCHAR(200) NOT NULL,
  id_question INT NOT NULL,
  correct VARCHAR(5) NOT NULL,
  CONSTRAINT pk_questionAnsweredByFriend PRIMARY KEY (emailUser, emailFriend, id_question),
  CONSTRAINT fk_questionAnsweredByFriend_user FOREIGN KEY(emailUser) REFERENCES User(email) ON DELETE CASCADE,
  CONSTRAINT fk_questionAnsweredByFriend_user_friend FOREIGN KEY(emailFriend) REFERENCES User(email) ON DELETE CASCADE,
  CONSTRAINT fk_questionAnsweredByFriend_question FOREIGN KEY(id_question) REFERENCES Question(id_question) ON DELETE CASCADE
);


/********* GALERIA DE IMAGENES *********/

CREATE TABLE IF NOT EXISTS PhotoGallery (
  id_image INT NOT NULL AUTO_INCREMENT,
  emailUser VARCHAR(200) NOT NULL,
  profile_img VARCHAR(200),
  description_image VARCHAR(500) NOT NULL,
  CONSTRAINT pk_photoGallery PRIMARY KEY (id_image),
  CONSTRAINT fk_photoGallery_User FOREIGN KEY(emailUser) REFERENCES User(email) ON DELETE CASCADE

);


/********* NOTIFICACIONES *********/

CREATE TABLE IF NOT EXISTS Notifications (
  id_notification INT NOT NULL AUTO_INCREMENT,
  emailUser_answered_first VARCHAR(200) NOT NULL,
  emailUser_guessing VARCHAR(200) NOT NULL,  
  text_answer_user_answered_first VARCHAR(200) NOT NULL,
  text_answer_user_guessing VARCHAR(200) NOT NULL,  
  text_question VARCHAR(200) NOT NULL,
  CONSTRAINT pk_notifications PRIMARY KEY (id_notification),
  CONSTRAINT fk_Notifications_User_First FOREIGN KEY(emailUser_answered_first) REFERENCES User(email) ON DELETE CASCADE,
  CONSTRAINT fk_Notifications_User_Guessing FOREIGN KEY(emailUser_guessing) REFERENCES User(email) ON DELETE CASCADE

);