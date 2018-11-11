



create table User
  (Email    VARCHAR(100) not null,
   password   VARCHAR(100) not null,
   name        VARCHAR(200) not null,
   gender     VARCHAR(20) not null,
   birth_date DATE,
   profile_img BLOB,
   CONSTRAINT pk_user PRIMARY KEY (Email),
   CONSTRAINT ck_user CHECK (gender IN ('Masculino', 'Femenino', 'Otro')) 
   
    );

