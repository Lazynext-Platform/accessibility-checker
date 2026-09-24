CREATE TABLE IF NOT EXISTS user_behavior (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    page_path VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);

CREATE TABLE IF NOT EXISTS error_rates (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    error_code INTEGER NOT NULL,
    error_message TEXT NOT NULL,
    occurrence_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255),
    metadata JSON
);

CREATE INDEX idx_user_behavior_user_id ON user_behavior (user_id);
CREATE INDEX idx_error_rates_user_id ON error_rates (user_id);