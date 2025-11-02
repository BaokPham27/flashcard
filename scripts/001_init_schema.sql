-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  xp_points INT DEFAULT 0,
  cards_studied INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_studied_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (user_id)
);

-- Create flashcard_sets table
CREATE TABLE IF NOT EXISTS flashcard_sets (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (user_id),
  INDEX (is_public)
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id VARCHAR(36) PRIMARY KEY,
  set_id VARCHAR(36) NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  romaji TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (set_id) REFERENCES flashcard_sets(id) ON DELETE CASCADE,
  INDEX (set_id)
);

-- Create study_progress table
CREATE TABLE IF NOT EXISTS study_progress (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  set_id VARCHAR(36) NOT NULL,
  flashcard_id VARCHAR(36) NOT NULL,
  status ENUM('new', 'learning', 'reviewing', 'mastered') DEFAULT 'new',
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  `interval` INT DEFAULT 1, -- ✅ Đặt trong backtick để tránh lỗi
  next_review TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (set_id) REFERENCES flashcard_sets(id) ON DELETE CASCADE,
  FOREIGN KEY (flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE,
  INDEX (user_id),
  INDEX (set_id),
  UNIQUE KEY unique_progress (user_id, flashcard_id)
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  set_id VARCHAR(36) NOT NULL,
  mode ENUM('study', 'test') DEFAULT 'study',
  cards_studied INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  xp_earned INT DEFAULT 0,
  duration_minutes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (set_id) REFERENCES flashcard_sets(id) ON DELETE CASCADE,
  INDEX (user_id),
  INDEX (created_at)
);

-- Create set_shares table
CREATE TABLE IF NOT EXISTS set_shares (
  id VARCHAR(36) PRIMARY KEY,
  set_id VARCHAR(36) NOT NULL UNIQUE,
  shared_by VARCHAR(36) NOT NULL,
  share_token VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (set_id) REFERENCES flashcard_sets(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX (share_token)
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  achievement_key VARCHAR(50) NOT NULL,
  achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_achievement (user_id, achievement_key)
);

-- Create indexes for performance
CREATE INDEX idx_flashcard_sets_user ON flashcard_sets(user_id);
CREATE INDEX idx_flashcards_set ON flashcards(set_id);
CREATE INDEX idx_study_progress_user ON study_progress(user_id);
CREATE INDEX idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_created ON study_sessions(created_at);
CREATE INDEX idx_user_stats_user ON user_stats(user_id);
