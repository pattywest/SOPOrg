-- This file includes the basic table definitions needed for the backend.

-- This file assumes the schema sop_admin already exists
-- uncomment the next line if you need to create the schema
-- create schema sop_database;

create table if not exists sop_database.users (
    id int NOT NULL unique AUTO_INCREMENT,
    name varchar(255),
    email varchar(255) NOT NULL unique,
    password varchar(255),
    privilege BOOLEAN NOT NULL default 0,
    PRIMARY KEY (id)
);

create table if not exists sop_database.directories (
    id int NOT NULL unique AUTO_INCREMENT,
    name varchar(255) NOT NULL unique,
    PRIMARY KEY (id)
);

create table if not exists sop_database.sops (
    id int NOT NULL unique AUTO_INCREMENT,
    name varchar(255) NOT NULL unique,
    description varchar(255),
    latest_version_number int default 1,
    latest_version_document_id int,
    date_last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

create table if not exists sop_database.directory_sop (
    directory_id int NOT NULL,
    sop_id int NOT NULL,
    FOREIGN KEY (directory_id) REFERENCES sop_database.directories(id),
    FOREIGN KEY (sop_id) REFERENCES sop_database.sops(id)
);

create table if not exists sop_database.documents (
    id int NOT NULL unique AUTO_INCREMENT,
    sop_id int NOT NULL,
    editor_id int NOT NULL,
    original_file_name varchar(255),
    location varchar(255),
    version_number int NOT NULL,
    marked_for_deletion_by_user_id int,
    PRIMARY KEY (id),
    FOREIGN KEY (sop_id) REFERENCES sop_database.sops(id),
    FOREIGN KEY (editor_id) REFERENCES sop_database.users(id),
    FOREIGN KEY (marked_for_deletion_by_user_id) REFERENCES sop_database.users(id)
);