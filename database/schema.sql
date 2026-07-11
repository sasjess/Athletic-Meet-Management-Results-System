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
    school_id INT AUTO_INCREMENT PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    district VARCHAR(255) NOT NULL,
    city VARCHAR(255) NULL,
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

CREATE TABLE meets (
    meet_id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL UNIQUE,
    meet_name VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE,
    status ENUM('Upcoming', 'Ongoing', 'Completed') DEFAULT 'Upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    event_type ENUM('Track', 'Field') NOT NULL,
    gender_id CHAR(1) NOT NULL,
    agegroup_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gender_id) REFERENCES gender(gender_id),
    FOREIGN KEY (agegroup_id) REFERENCES age_groups(agegroup_id)
);

CREATE TABLE gender_events (

    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    gender_id char(1) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (gender_id) REFERENCES gender(gender_id) ON DELETE CASCADE,
    UNIQUE (event_id, gender_id)

);

CREATE TABLE meet_events (
id INT AUTO_INCREMENT PRIMARY KEY,
meet_id INT NOT NULL,
event_id INT NOT NULL,

FOREIGN KEY (meet_id) REFERENCES meets(meet_id)
ON DELETE CASCADE,
FOREIGN KEY (event_id) REFERENCES events(event_id)
ON DELETE CASCADE,

UNIQUE (meet_id, event_id)
);
CREATE TABLE stages (
    stage_id INT AUTO_INCREMENT PRIMARY KEY,
    stage_name VARCHAR(50) UNIQUE NOT NULL
);


CREATE TABLE results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    bib_no INT NOT NULL,
    event_id INT NOT NULL,
    meet_id INT NOT NULL,
    agegroup_id INT NOT NULL,
    gender_id CHAR(1) NOT NULL,
    performance_time DECIMAL(6,3) NULL,
    performance_distance DECIMAL(6,2) NULL,
    stage_id INT NOT NULL,
    heat_no INT NOT NULL,
    position INT,
    points DECIMAL(5,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (bib_no) REFERENCES athletes(bib_no) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (meet_id) REFERENCES meets(meet_id) ON DELETE CASCADE,
    FOREIGN KEY (agegroup_id) REFERENCES age_groups(agegroup_id) ON DELETE CASCADE,
    FOREIGN KEY (gender_id) REFERENCES gender(gender_id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES stages(stage_id) ON DELETE CASCADE,


    UNIQUE (bib_no, event_id, meet_id,stage_id)
);

CREATE TABLE agegroup_events (
    agegroup_id INT NOT NULL,
    event_id INT NOT NULL,

    -- Composite Primary Key to prevent duplicates
    PRIMARY KEY (agegroup_id, event_id),

    -- Foreign Keys
    CONSTRAINT fk_agegroup
        FOREIGN KEY (agegroup_id) REFERENCES age_groups(agegroup_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_event
        FOREIGN KEY (event_id) REFERENCES events(event_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE athlete_event (
    bib_no INT NOT NULL,
    event_id INT NOT NULL,

    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lane_number INT,
    heat_number INT,

    -- Composite Primary Key (prevents duplicates)
    PRIMARY KEY (bib_no, event_id),

    -- Foreign Keys
    CONSTRAINT fk_athlete
        FOREIGN KEY (bib_no) REFERENCES athletes(bib_no)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_event_athlete
        FOREIGN KEY (event_id) REFERENCES events(event_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


CREATE TABLE event_stages (
    event_stage_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    stage_id INT NOT NULL,

    FOREIGN KEY (event_id) REFERENCES events(event_id),
    FOREIGN KEY (stage_id) REFERENCES stages(stage_id)
);
