-- Create sharing analytics table
CREATE TABLE discovery_shares (
  id BIGSERIAL PRIMARY KEY,
  discovery_id BIGINT REFERENCES discoveries(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(discovery_id, user_id, platform)
);

-- Create indexes for better performance
CREATE INDEX idx_discovery_shares_discovery_id ON discovery_shares(discovery_id);
CREATE INDEX idx_discovery_shares_user_id ON discovery_shares(user_id);
CREATE INDEX idx_discovery_shares_shared_at ON discovery_shares(shared_at);
