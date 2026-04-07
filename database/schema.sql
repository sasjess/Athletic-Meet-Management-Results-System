CREATE DATABASE meet_db;
USE meet_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','meet_manager','data_entry_operator') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gender (
    gender_id CHAR(1) PRIMARY KEY,
    name VARCHAR(10) UNIQUE NOT NULL
);

CREATE TABLE age_groups (
    agegroup_id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE athletes (
    bib_no INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    school_id INT NOT NULL,
    gender_id CHAR(1) NOT NULL,
    agegroup_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (school_id) REFERENCES schools(school_id),
    FOREIGN KEY (gender_id) REFERENCES gender(gender_id),
    FOREIGN KEY (agegroup_id) REFERENCES age_groups(agegroup_id)
);