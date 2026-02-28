-- =====================================
-- DROP EXISTING TABLES
-- =====================================

DROP TABLE IF EXISTS CLAIMANT_ID_DETAILS CASCADE;
DROP TABLE IF EXISTS CLAIM CASCADE;
DROP TABLE IF EXISTS ITEM CASCADE;
DROP TABLE IF EXISTS CATEGORY CASCADE;
DROP TABLE IF EXISTS "USER" CASCADE;


-- =====================================
-- USER TABLE
-- =====================================

CREATE TABLE "USER" (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    bits_id VARCHAR(20) UNIQUE NOT NULL,
    login_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =====================================
-- CATEGORY TABLE
-- =====================================

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


-- =====================================
-- ITEM TABLE
-- =====================================

CREATE TABLE ITEM (
    item_id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    location_found VARCHAR(100) NOT NULL,
    date_found DATE NOT NULL,
    image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'FOUND',
    uploaded_by INT NOT NULL,
    current_holder INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    holder_phone VARCHAR(20),
    holder_room VARCHAR(20),

    CONSTRAINT fk_item_user
        FOREIGN KEY (uploaded_by)
        REFERENCES "USER"(user_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_current_item_user
        FOREIGN KEY (current_holder)
        REFERENCES "USER"(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_item_category
        FOREIGN KEY (category_id)
        REFERENCES CATEGORY(category_id),

    CONSTRAINT chk_item_status
        CHECK (status IN ('FOUND', 'CLAIMED', 'ARCHIVED'))
);


-- =====================================
-- CLAIM TABLE
-- =====================================

CREATE TABLE CLAIM (
    claim_id SERIAL PRIMARY KEY,
    item_id INT NOT NULL UNIQUE, -- only one claim per item
    claimed_by INT NOT NULL,
    claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
    room_number VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,

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


-- =====================================
-- CLAIMANT ID DETAILS
-- =====================================

CREATE TABLE CLAIMANT_ID_DETAILS (
    id_detail_id SERIAL PRIMARY KEY,
    claim_id INT NOT NULL,
    id_number VARCHAR(50) NOT NULL,

    CONSTRAINT fk_id_claim
        FOREIGN KEY (claim_id)
        REFERENCES CLAIM(claim_id)
        ON DELETE CASCADE
);


-- =====================================
-- PERFORMANCE INDEXES
-- =====================================

CREATE INDEX idx_item_status ON ITEM(status);
CREATE INDEX idx_item_uploaded_by ON ITEM(uploaded_by);
CREATE INDEX idx_claim_claimed_by ON CLAIM(claimed_by);
CREATE INDEX idx_claim_date ON CLAIM(claim_date);