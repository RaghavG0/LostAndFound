CREATE TABLE "USER" (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    bits_id VARCHAR(20) UNIQUE NOT NULL,
    login_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE CATEGORY (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO CATEGORY (category_name) VALUES
('Electronics'),
('ID Cards'),
('Wearables'),
('Jewellery'),
('Books'),
('Miscellaneous');

CREATE TABLE ITEM (
    item_id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    location_found VARCHAR(100) NOT NULL,
    date_found DATE NOT NULL,
    image_url TEXT,
    status VARCHAR(20) NOT NULL,
    uploaded_by INT NOT NULL,
    category_id INT NOT NULL,

    CONSTRAINT fk_item_user
        FOREIGN KEY (uploaded_by)
        REFERENCES "USER"(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_item_category
        FOREIGN KEY (category_id)
        REFERENCES CATEGORY(category_id),

    CONSTRAINT chk_item_status
        CHECK (status IN ('FOUND', 'CLAIMED', 'ARCHIVED'))
);

CREATE TABLE CLAIM (
    item_id INT PRIMARY KEY,
    claimed_by INT NOT NULL,
    claim_date DATE NOT NULL,
    expiry_date DATE NOT NULL,

    CONSTRAINT fk_claim_item
        FOREIGN KEY (item_id)
        REFERENCES ITEM(item_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_claim_user
        FOREIGN KEY (claimed_by)
        REFERENCES "USER"(user_id),

    CONSTRAINT chk_claim_dates
        CHECK (expiry_date > claim_date)
);

CREATE TABLE CLAIMANT_ID_DETAILS (
    claim_id INT PRIMARY KEY,
    id_type VARCHAR(30) NOT NULL,
    id_number VARCHAR(50) NOT NULL,

    CONSTRAINT fk_id_claim
        FOREIGN KEY (claim_id)
        REFERENCES CLAIM(item_id)
        ON DELETE CASCADE
);
