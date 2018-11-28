



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




