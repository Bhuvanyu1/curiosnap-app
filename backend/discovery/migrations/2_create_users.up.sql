CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar TEXT,
  interests TEXT[],
  streak_count INTEGER DEFAULT 0,
  total_facts INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_id to discoveries table
ALTER TABLE discoveries ADD COLUMN user_id BIGINT REFERENCES users(id);

-- Create index for better performance
CREATE INDEX idx_discoveries_user_id ON discoveries(user_id);
CREATE INDEX idx_discoveries_created_at ON discoveries(created_at);
CREATE INDEX idx_users_email ON users(email);
