-- Create tables for ConnectHub app

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    birthday DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    age INTEGER NOT NULL,
    bio TEXT,
    interests TEXT[], -- Array of strings
    photos TEXT[], -- Array of photo URLs
    photo_url TEXT,
    distance FLOAT DEFAULT 0,
    latitude FLOAT,
    longitude FLOAT,
    city VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    report_count INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    max_distance INTEGER DEFAULT 50,
    age_min INTEGER DEFAULT 18,
    age_max INTEGER DEFAULT 35,
    show_me_in_discovery BOOLEAN DEFAULT TRUE,
    is_paused BOOLEAN DEFAULT FALSE
);

CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'like',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    matched_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_new_match BOOLEAN DEFAULT TRUE
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent'
);

-- Add foreign key after both tables exist
ALTER TABLE matches ADD COLUMN last_message_id UUID REFERENCES messages(id) ON DELETE SET NULL;

