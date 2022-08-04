CREATE TABLE profiles(
    profile_id BIGSERIAL PRIMARY KEY NOT NULL,
    profile_email VARCHAR(100) NOT NULL,
    profile_password VARCHAR(180) NOT NULL,
    profile_image VARCHAR(200),
    profile_location VARCHAR(150),
    profile_zipcode VARCHAR(150),
    profile_first_name VARCHAR(100),
    profile_last_name VARCHAR(100)
);

CREATE TABLE foodpost(
    food_id BIGSERIAL PRIMARY KEY NOT NULL,
    food_img VARCHAR(200),
    food_name VARCHAR(150) NOT NULL,
    food_description VARCHAR(8000),
    profile_id INT NOT NULL,
    food_minute INTEGER,
    food_hour INTEGER,
    food_ingredients VARCHAR(2400),
    FOREIGN KEY (profile_id) REFERENCES profiles(profile_id)
);

CREATE TABLE comments(
    comment_id BIGSERIAL PRIMARY KEY NOT NULL,
    comment_body VARCHAR(600),
    foodpost_id INT NOT NULL,
    user_comment_id INT,
    FOREIGN KEY (foodpost_id) REFERENCES foodpost(food_id)
);

CREATE TABLE likes(
    likes_id BIGSERIAL NOT NULL,
    liked_food_post_id INT,
    profile_id INT,
    FOREIGN KEY (liked_food_post_id) REFERENCES foodpost(food_id),
    PRIMARY KEY (profile_id, liked_food_post_id)
);

CREATE TABLE session(
    sid CHARACTER VARYING PRIMARY KEY NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


