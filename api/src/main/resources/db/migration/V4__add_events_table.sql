-- Create events table (H2-compatible)
CREATE TABLE events (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  place_id UUID REFERENCES place(id) ON DELETE SET NULL,
  category_id UUID REFERENCES category(id) ON DELETE SET NULL,
  source VARCHAR(50) NOT NULL, -- 'google', 'facebook', 'spotify', 'manual'
  external_id VARCHAR(255), -- ID from external API
  external_url TEXT, -- Link to original event
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern CLOB, -- For recurring events (JSON as text in H2)
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  external_user_id VARCHAR(255) UNIQUE NOT NULL, -- Google/Facebook ID
  provider VARCHAR(20) NOT NULL, -- 'google', 'facebook'
  name VARCHAR(255),
  email VARCHAR(255),
  profile_picture_url TEXT,
  preferences CLOB, -- User preferences and settings (JSON as text in H2)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user interests table
CREATE TABLE user_interests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  interest_type VARCHAR(50) NOT NULL, -- 'category', 'music_genre', 'event_type'
  interest_value VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create event interactions table
CREATE TABLE event_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL, -- 'rsvp', 'favorite', 'share'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, event_id, interaction_type)
);

-- Create indexes for performance
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_location ON events(place_id);
CREATE INDEX idx_events_source ON events(source);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_events_status ON events(status);

CREATE INDEX idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX idx_user_interests_type_value ON user_interests(interest_type, interest_value);

CREATE INDEX idx_event_interactions_user_id ON event_interactions(user_id);
CREATE INDEX idx_event_interactions_event_id ON event_interactions(event_id);
