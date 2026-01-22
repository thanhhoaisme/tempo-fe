-- ============================================
-- TEMPO (FlowNote) Database Schema
-- PostgreSQL 15+
-- Generated: 2026-01-17
-- Updated: 2026-01-19 (Cleaned up for MVP)
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Uncomment below if using AI vector embeddings
-- CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- ENUM TYPES
-- ============================================

-- Project member roles
CREATE TYPE project_role_type AS ENUM ('owner', 'member');

-- Task status
CREATE TYPE task_status_type AS ENUM ('Not started', 'In progress', 'Done', 'Re-surface');

-- Task priority
CREATE TYPE task_priority_type AS ENUM ('Low', 'Medium', 'High');

-- Timer session status
CREATE TYPE timer_status_type AS ENUM ('active', 'paused', 'completed', 'abandoned');

-- Shop item type
CREATE TYPE shop_item_type AS ENUM ('skin', 'item');

-- Theme
CREATE TYPE theme_type AS ENUM ('light', 'dark');

-- Time format
CREATE TYPE time_format_type AS ENUM ('12h', '24h');

-- AI analytics period
CREATE TYPE analytics_period_type AS ENUM ('weekly', 'monthly');

-- AI chat role
CREATE TYPE chat_role_type AS ENUM ('user', 'assistant');

-- Notification type
CREATE TYPE notification_type AS ENUM (
    'project_invite', 
    'task_assigned', 
    'task_completed',
    'comment_added',
    'streak_milestone',
    'reward_available',
    'system'
);

-- Subtask status (simple: only todo/done)
CREATE TYPE subtask_status_type AS ENUM ('todo', 'done');

-- ============================================
-- TABLE: users
-- Core user accounts
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(30) NOT NULL,
    full_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    coins INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE,
    active_skin_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT chk_users_username CHECK (
        LENGTH(username) >= 3 AND 
        LENGTH(username) <= 30 AND
        username ~ '^[a-zA-Z][a-zA-Z0-9_.]*$'
    ),
    CONSTRAINT chk_users_full_name CHECK (
        LENGTH(full_name) >= 2 AND 
        LENGTH(full_name) <= 50
    ),
    CONSTRAINT chk_users_coins CHECK (coins >= 0)
);

COMMENT ON TABLE users IS 'Core user accounts table';
COMMENT ON COLUMN users.username IS 'Unique username, 3-30 chars, alphanumeric + underscore + dot, cannot start with number';
COMMENT ON COLUMN users.password IS 'bcrypt or argon2 hashed password, cost factor >= 12';
COMMENT ON COLUMN users.current_streak IS 'Current consecutive days streak';
COMMENT ON COLUMN users.last_active_date IS 'Last date user completed at least 1 habit (for streak calculation)';

-- ============================================
-- TABLE: settings
-- User preferences (1:1 with users)
-- ============================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    theme theme_type NOT NULL DEFAULT 'light',
    push_notifications BOOLEAN NOT NULL DEFAULT true,
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    time_format time_format_type NOT NULL DEFAULT '24h',
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_settings_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_settings_user UNIQUE (user_id)
);

COMMENT ON TABLE settings IS 'User preferences and settings';

-- ============================================
-- TABLE: password_history
-- Previous passwords to prevent reuse
-- ============================================
CREATE TABLE password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_password_history_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE password_history IS 'Password history to prevent reuse of last 3 passwords';

-- ============================================
-- TABLE: projects
-- Project containers
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    collapsed BOOLEAN NOT NULL DEFAULT false,
    owner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_projects_owner FOREIGN KEY (owner_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE projects IS 'Project containers for organizing tasks';

-- ============================================
-- TABLE: project_members
-- Project membership (many-to-many)
-- ============================================
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role project_role_type NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_project_members_project FOREIGN KEY (project_id) 
        REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_members_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_project_members UNIQUE (project_id, user_id)
);

COMMENT ON TABLE project_members IS 'Project membership with roles (owner/member)';

-- ============================================
-- TABLE: project_invitations
-- Pending project invitations
-- ============================================
CREATE TABLE project_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL,
    invited_user_id UUID,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_invitations_project FOREIGN KEY (project_id) 
        REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_invitations_invited_user FOREIGN KEY (invited_user_id) 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_invitations_created_by FOREIGN KEY (created_by) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_invitations_token UNIQUE (token)
);

COMMENT ON TABLE project_invitations IS 'Pending project invitations with 7-day expiry';

-- ============================================
-- TABLE: tasks
-- Task items
-- ============================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status_type NOT NULL DEFAULT 'Not started',
    priority task_priority_type,
    due_date DATE,
    project_id UUID,
    created_by UUID NOT NULL,
    assignee_id UUID,
    last_modified_by UUID,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) 
        REFERENCES projects(id) ON DELETE SET NULL,
    CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id) 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_tasks_modified_by FOREIGN KEY (last_modified_by) 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uk_tasks_task_id UNIQUE (task_id)
);

COMMENT ON TABLE tasks IS 'Task items with status, priority, and collaboration support';

-- task_tags table removed - tags feature not in MVP

-- ============================================
-- TABLE: subtasks
-- Simple subtasks for tasks (title + status only)
-- ============================================
CREATE TABLE subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_task_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    status subtask_status_type NOT NULL DEFAULT 'todo',
    sort_order INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_subtasks_parent_task FOREIGN KEY (parent_task_id) 
        REFERENCES tasks(id) ON DELETE CASCADE
);

COMMENT ON TABLE subtasks IS 'Simple subtasks with title and status (todo/done) only';

-- ============================================
-- TABLE: task_pages
-- Collaborative documents for tasks (1:1)
-- ============================================
CREATE TABLE task_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL,
    project_id UUID,
    title VARCHAR(255) NOT NULL DEFAULT 'Untitled',
    document_state BYTEA,
    version INTEGER NOT NULL DEFAULT 1,
    created_by UUID NOT NULL,
    last_edited_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_edited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_task_pages_task FOREIGN KEY (task_id) 
        REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_pages_project FOREIGN KEY (project_id) 
        REFERENCES projects(id) ON DELETE SET NULL,
    CONSTRAINT fk_task_pages_created_by FOREIGN KEY (created_by) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_pages_edited_by FOREIGN KEY (last_edited_by) 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uk_task_pages_task UNIQUE (task_id)
);

COMMENT ON TABLE task_pages IS 'Collaborative documents for tasks, stores Y.js binary state';

-- page_id removed from tasks - pages are auto-created with task

-- ============================================
-- TABLE: page_comments
-- Comments on task pages (supports replies)
-- ============================================
CREATE TABLE page_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    selection_start INTEGER,
    selection_end INTEGER,
    quoted_text TEXT,
    parent_id UUID,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_page_comments_page FOREIGN KEY (page_id) 
        REFERENCES task_pages(id) ON DELETE CASCADE,
    CONSTRAINT fk_page_comments_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_page_comments_parent FOREIGN KEY (parent_id) 
        REFERENCES page_comments(id) ON DELETE CASCADE,
    CONSTRAINT fk_page_comments_resolved_by FOREIGN KEY (resolved_by) 
        REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE page_comments IS 'Comments on task pages with inline and threaded reply support';

-- ============================================
-- TABLE: habits
-- User habits
-- ============================================
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) DEFAULT '✅',
    category VARCHAR(50) DEFAULT 'General',
    reminder_time VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_habits_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE habits IS 'User habits with reminders and categories';

-- ============================================
-- TABLE: habit_completions
-- Daily habit completion records
-- ============================================
CREATE TABLE habit_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL,
    completion_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT true,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_habit_completions_habit FOREIGN KEY (habit_id) 
        REFERENCES habits(id) ON DELETE CASCADE,
    CONSTRAINT uk_habit_completions UNIQUE (habit_id, completion_date)
);

COMMENT ON TABLE habit_completions IS 'Daily completion records for habits';

-- ============================================
-- TABLE: timer_sessions
-- Focus timer sessions
-- ============================================
CREATE TABLE timer_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    task_id UUID,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    focus_topic VARCHAR(255),
    status timer_status_type NOT NULL DEFAULT 'active',
    notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paused_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_timer_sessions_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_timer_sessions_task FOREIGN KEY (task_id) 
        REFERENCES tasks(id) ON DELETE SET NULL,
    CONSTRAINT chk_timer_duration CHECK (duration_seconds >= 0)
);

COMMENT ON TABLE timer_sessions IS 'Focus timer sessions tracking productivity';

-- ============================================
-- TABLE: calendar_events
-- Calendar events
-- ============================================
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    color VARCHAR(20) DEFAULT 'purple',
    task_id UUID,
    timer_session_id UUID,
    created_from_timer BOOLEAN NOT NULL DEFAULT false,
    is_all_day BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_calendar_events_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_calendar_events_task FOREIGN KEY (task_id) 
        REFERENCES tasks(id) ON DELETE SET NULL,
    CONSTRAINT fk_calendar_events_timer FOREIGN KEY (timer_session_id) 
        REFERENCES timer_sessions(id) ON DELETE SET NULL,
    CONSTRAINT chk_calendar_times CHECK (end_time > start_time)
);

COMMENT ON TABLE calendar_events IS 'Calendar events including timer sessions';

-- ============================================
-- TABLE: notes
-- Quick notes
-- ============================================
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    task_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_notes_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notes_task FOREIGN KEY (task_id) 
        REFERENCES tasks(id) ON DELETE SET NULL
);

COMMENT ON TABLE notes IS 'Quick notes with optional task linking';

-- ============================================
-- TABLE: note_tags
-- Note tags
-- ============================================
CREATE TABLE note_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_note_tags_note FOREIGN KEY (note_id) 
        REFERENCES notes(id) ON DELETE CASCADE,
    CONSTRAINT uk_note_tags UNIQUE (note_id, tag_name)
);

COMMENT ON TABLE note_tags IS 'Tags associated with notes';

-- ============================================
-- TABLE: shop_items
-- Items available in shop
-- ============================================
CREATE TABLE shop_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_key VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    item_type shop_item_type NOT NULL,
    price INTEGER NOT NULL,
    preview_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_shop_items_key UNIQUE (item_key),
    CONSTRAINT chk_shop_items_price CHECK (price >= 0)
);

COMMENT ON TABLE shop_items IS 'Items available for purchase in the shop';

-- ============================================
-- TABLE: user_inventory
-- Consumable items owned by users
-- ============================================
CREATE TABLE user_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    item_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_user_inventory_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_inventory_item FOREIGN KEY (item_id) 
        REFERENCES shop_items(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_inventory UNIQUE (user_id, item_id),
    CONSTRAINT chk_user_inventory_quantity CHECK (quantity >= 0)
);

COMMENT ON TABLE user_inventory IS 'Consumable items owned by users (e.g., streak freeze)';

-- ============================================
-- TABLE: user_owned_skins
-- Skins owned by users
-- ============================================
CREATE TABLE user_owned_skins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    skin_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_owned_skins_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_owned_skins_skin FOREIGN KEY (skin_id) 
        REFERENCES shop_items(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_owned_skins UNIQUE (user_id, skin_id)
);

COMMENT ON TABLE user_owned_skins IS 'Timer skins owned by users';

-- Add foreign key for active_skin_id in users table
ALTER TABLE users 
ADD CONSTRAINT fk_users_active_skin FOREIGN KEY (active_skin_id) 
    REFERENCES shop_items(id) ON DELETE SET NULL;

-- ============================================
-- TABLE: coin_transactions
-- Coin transaction history
-- ============================================
CREATE TABLE coin_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    reason VARCHAR(255),
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_coin_transactions_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE coin_transactions IS 'Coin transaction history for auditing';
COMMENT ON COLUMN coin_transactions.amount IS 'Positive for earning, negative for spending';
COMMENT ON COLUMN coin_transactions.transaction_type IS 'e.g., timer_session, purchase, streak_reward, habit_complete';

-- ============================================
-- TABLE: streak_rewards
-- Available streak milestones
-- ============================================
CREATE TABLE streak_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reward_key VARCHAR(50) NOT NULL,
    days_required INTEGER NOT NULL,
    coins_reward INTEGER NOT NULL,
    description VARCHAR(255),
    icon VARCHAR(10) DEFAULT '🏆',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_streak_rewards_key UNIQUE (reward_key),
    CONSTRAINT uk_streak_rewards_days UNIQUE (days_required),
    CONSTRAINT chk_streak_rewards_days CHECK (days_required > 0),
    CONSTRAINT chk_streak_rewards_coins CHECK (coins_reward > 0)
);

COMMENT ON TABLE streak_rewards IS 'Streak milestone rewards configuration';

-- ============================================
-- TABLE: user_claimed_rewards
-- Rewards claimed by users
-- ============================================
CREATE TABLE user_claimed_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    reward_id UUID NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_claimed_rewards_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_claimed_rewards_reward FOREIGN KEY (reward_id) 
        REFERENCES streak_rewards(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_claimed_rewards UNIQUE (user_id, reward_id)
);

COMMENT ON TABLE user_claimed_rewards IS 'Streak rewards claimed by users';

-- ============================================
-- TABLE: notifications
-- User notifications
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    action_url VARCHAR(500),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE notifications IS 'User notifications for various events';

-- ============================================
-- TABLE: ai_chat_sessions
-- AI chat sessions
-- ============================================
CREATE TABLE ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_ai_chat_sessions_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE ai_chat_sessions IS 'AI chat session containers';

-- ============================================
-- TABLE: ai_chat_messages
-- AI chat message history
-- ============================================
CREATE TABLE ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role chat_role_type NOT NULL,
    content TEXT NOT NULL,
    context JSONB,
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_ai_chat_messages_session FOREIGN KEY (session_id) 
        REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_ai_chat_messages_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE ai_chat_messages IS 'AI chat message history';

-- ============================================
-- TABLE: ai_analytics_reports
-- AI-generated analytics reports
-- ============================================
CREATE TABLE ai_analytics_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    period analytics_period_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    productivity_score INTEGER,
    insights JSONB,
    recommendations JSONB,
    raw_data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_ai_analytics_reports_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_ai_analytics_score CHECK (
        productivity_score IS NULL OR 
        (productivity_score >= 0 AND productivity_score <= 100)
    )
);

COMMENT ON TABLE ai_analytics_reports IS 'AI-generated productivity analytics reports';

-- ============================================
-- TABLE: journal_entries
-- Journal entries for AI analysis
-- ============================================
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    entry_date DATE NOT NULL,
    content TEXT NOT NULL,
    mood VARCHAR(50),
    -- Uncomment if using pgvector for embeddings
    -- embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_journal_entries_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_journal_entries UNIQUE (user_id, entry_date)
);

COMMENT ON TABLE journal_entries IS 'Daily journal entries for AI analysis';

-- ============================================
-- TABLE: file_uploads
-- Uploaded files metadata
-- ============================================
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    storage_url VARCHAR(500),
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_file_uploads_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_file_uploads_size CHECK (file_size > 0)
);

COMMENT ON TABLE file_uploads IS 'Uploaded files metadata (actual files stored in S3)';
COMMENT ON COLUMN file_uploads.purpose IS 'e.g., avatar, attachment, page_image';

-- ============================================
-- TABLE: daily_quotes
-- Cached daily quotes
-- ============================================
CREATE TABLE daily_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_date DATE NOT NULL,
    quote TEXT NOT NULL,
    author VARCHAR(100),
    source VARCHAR(100),
    fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_daily_quotes_date UNIQUE (quote_date)
);

COMMENT ON TABLE daily_quotes IS 'Cached daily motivational quotes';

-- ============================================
-- TABLE: activity_logs
-- User activity audit trail
-- ============================================
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50),
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_activity_logs_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE activity_logs IS 'User activity audit trail for dashboard recent activities';
COMMENT ON COLUMN activity_logs.activity_type IS 'e.g., task_completed, habit_completed, timer_session, comment_added';

-- ============================================
-- INDEXES
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Settings
CREATE INDEX idx_settings_user_id ON settings(user_id);

-- Projects
CREATE INDEX idx_projects_owner_id ON projects(owner_id);

-- Project members
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);

-- Project invitations
CREATE INDEX idx_project_invitations_project_id ON project_invitations(project_id);
CREATE INDEX idx_project_invitations_email ON project_invitations(email);
CREATE INDEX idx_project_invitations_token ON project_invitations(token);
CREATE INDEX idx_project_invitations_pending ON project_invitations(expires_at) 
    WHERE accepted_at IS NULL AND declined_at IS NULL;

-- Tasks
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_task_id ON tasks(task_id);

-- Task tags
CREATE INDEX idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX idx_task_tags_name ON task_tags(tag_name);

-- Task pages
CREATE INDEX idx_task_pages_task_id ON task_pages(task_id);
CREATE INDEX idx_task_pages_project_id ON task_pages(project_id);

-- Page comments
CREATE INDEX idx_page_comments_page_id ON page_comments(page_id);
CREATE INDEX idx_page_comments_user_id ON page_comments(user_id);
CREATE INDEX idx_page_comments_parent_id ON page_comments(parent_id);
CREATE INDEX idx_page_comments_unresolved ON page_comments(page_id) WHERE resolved = false;

-- Habits
CREATE INDEX idx_habits_user_id ON habits(user_id);

-- Habit completions
CREATE INDEX idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX idx_habit_completions_date ON habit_completions(completion_date);
CREATE INDEX idx_habit_completions_habit_date ON habit_completions(habit_id, completion_date);

-- Timer sessions
CREATE INDEX idx_timer_sessions_user_id ON timer_sessions(user_id);
CREATE INDEX idx_timer_sessions_task_id ON timer_sessions(task_id);
CREATE INDEX idx_timer_sessions_started_at ON timer_sessions(started_at);
CREATE INDEX idx_timer_sessions_status ON timer_sessions(status);

-- Calendar events
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_user_time ON calendar_events(user_id, start_time, end_time);

-- Notes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_pinned ON notes(user_id) WHERE is_pinned = true;

-- Note tags
CREATE INDEX idx_note_tags_note_id ON note_tags(note_id);

-- Shop items
CREATE INDEX idx_shop_items_type ON shop_items(item_type);
CREATE INDEX idx_shop_items_active ON shop_items(is_active) WHERE is_active = true;

-- User inventory
CREATE INDEX idx_user_inventory_user_id ON user_inventory(user_id);

-- User owned skins
CREATE INDEX idx_user_owned_skins_user_id ON user_owned_skins(user_id);
CREATE INDEX idx_user_owned_skins_active ON user_owned_skins(user_id) WHERE is_active = true;

-- Coin transactions
CREATE INDEX idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at);

-- User claimed rewards
CREATE INDEX idx_user_claimed_rewards_user_id ON user_claimed_rewards(user_id);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- AI chat messages
CREATE INDEX idx_ai_chat_messages_session_id ON ai_chat_messages(session_id);
CREATE INDEX idx_ai_chat_messages_user_id ON ai_chat_messages(user_id);

-- AI analytics reports
CREATE INDEX idx_ai_analytics_reports_user_id ON ai_analytics_reports(user_id);
CREATE INDEX idx_ai_analytics_reports_period ON ai_analytics_reports(user_id, period, start_date);

-- Journal entries
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);

-- File uploads
CREATE INDEX idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX idx_file_uploads_purpose ON file_uploads(purpose);

-- Activity logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type);

-- Daily quotes
CREATE INDEX idx_daily_quotes_date ON daily_quotes(quote_date);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to relevant tables
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_task_pages_updated_at
    BEFORE UPDATE ON task_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_page_comments_updated_at
    BEFORE UPDATE ON page_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_habits_updated_at
    BEFORE UPDATE ON habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ai_chat_sessions_updated_at
    BEFORE UPDATE ON ai_chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update longest_streak
CREATE OR REPLACE FUNCTION update_longest_streak()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_streak > NEW.longest_streak THEN
        NEW.longest_streak = NEW.current_streak;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_longest_streak
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_longest_streak();

-- Function to auto-set task completed_at
CREATE OR REPLACE FUNCTION set_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Done' AND OLD.status != 'Done' THEN
        NEW.completed_at = CURRENT_TIMESTAMP;
    ELSIF NEW.status != 'Done' THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tasks_completed_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION set_task_completed_at();

-- Function to create settings on user creation
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO settings (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_user_settings
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_user_settings();

-- Function to add owner as project member
CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_add_owner_as_member
    AFTER INSERT ON projects
    FOR EACH ROW EXECUTE FUNCTION add_owner_as_member();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default streak rewards
INSERT INTO streak_rewards (reward_key, days_required, coins_reward, description, icon) VALUES
    ('streak-7', 7, 50, '7-day streak milestone', '🔥'),
    ('streak-14', 14, 100, '2-week streak milestone', '🏆'),
    ('streak-28', 28, 200, '4-week streak milestone', '👑'),
    ('streak-60', 60, 500, '2-month streak milestone', '💎'),
    ('streak-100', 100, 1000, '100-day streak milestone', '🌟');

-- Insert default shop items
INSERT INTO shop_items (item_key, name, description, item_type, price, sort_order) VALUES
    ('battery-skin', 'Battery Power', 'Timer animation with battery charging effect', 'skin', 100, 1),
    ('clock-skin', 'Classic Clock', 'Elegant analog clock timer animation', 'skin', 150, 2),
    ('hp-bar-skin', 'HP Bar', 'Gaming-style HP bar timer animation', 'skin', 200, 3),
    ('cat-yarn-skin', 'Cat & Yarn', 'Cute cat playing with yarn timer animation', 'skin', 200, 4),
    ('streak-freeze', 'Streak Freeze', 'Protects your streak if you miss one day. Single use.', 'item', 100, 10);

-- Insert fallback quotes
INSERT INTO daily_quotes (quote_date, quote, author) VALUES
    (CURRENT_DATE, 'The only way to do great work is to love what you do.', 'Steve Jobs'),
    (CURRENT_DATE - INTERVAL '1 day', 'Believe you can and you''re halfway there.', 'Theodore Roosevelt'),
    (CURRENT_DATE - INTERVAL '2 days', 'Success is not final, failure is not fatal.', 'Winston Churchill');

-- ============================================
-- VIEWS
-- ============================================

-- View: User dashboard overview
CREATE OR REPLACE VIEW v_user_dashboard AS
SELECT 
    u.id as user_id,
    u.username,
    u.coins,
    u.current_streak,
    u.longest_streak,
    (SELECT COUNT(*) FROM tasks t WHERE t.created_by = u.id) as total_tasks,
    (SELECT COUNT(*) FROM tasks t WHERE t.created_by = u.id AND t.status = 'Done' 
        AND DATE(t.completed_at) = CURRENT_DATE) as completed_today,
    (SELECT COUNT(*) FROM tasks t WHERE t.created_by = u.id AND t.due_date < CURRENT_DATE 
        AND t.status != 'Done') as overdue_tasks,
    (SELECT COUNT(*) FROM habits h WHERE h.user_id = u.id) as total_habits,
    (SELECT COUNT(*) FROM habit_completions hc 
        JOIN habits h ON h.id = hc.habit_id 
        WHERE h.user_id = u.id AND hc.completion_date = CURRENT_DATE AND hc.completed = true) as habits_completed_today
FROM users u;

-- View: Project with member count
CREATE OR REPLACE VIEW v_projects_with_members AS
SELECT 
    p.*,
    (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) as member_count,
    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count
FROM projects p;

-- ============================================
-- END OF SCHEMA
-- ============================================
