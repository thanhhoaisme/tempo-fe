# Database ERD Design - Tempo (FlowNote)

## 📊 Entity Relationship Diagram

```mermaid
erDiagram
    %% ============================================
    %% CORE ENTITIES
    %% ============================================
    
    USER {
        uuid id PK "Primary Key"
        varchar(30) username UK "Unique, 3-30 chars"
        varchar(50) full_name "2-50 characters"
        varchar(255) email UK "Unique, valid email format"
        varchar(255) password "bcrypt/argon2, cost >= 12"
        varchar(500) avatar_url "Optional, valid URL"
        int coins "Default 0"
        int current_streak "Default 0"
        int longest_streak "Default 0"
        date last_active_date "For streak calculation"
        uuid active_skin_id FK "Optional, references SHOP_ITEM"
        boolean is_active "Default true"
        boolean email_verified "Default false"
        timestamp created_at "Default NOW()"
        timestamp updated_at "Auto-update"
    }

    PASSWORD_HISTORY {
        uuid id PK
        uuid user_id FK "References USER"
        varchar(255) password "Previous passwords"
        timestamp created_at
    }

    %% ============================================
    %% SETTINGS & PREFERENCES
    %% ============================================

    SETTINGS {
        uuid id PK
        uuid user_id FK UK "One-to-one with USER"
        varchar(10) theme "ENUM: 'light', 'dark'"
        boolean push_notifications "Default true"
        boolean email_notifications "Default true"
        varchar(10) time_format "ENUM: '12h', '24h'"
        varchar(10) language "Default 'en'"
        varchar(50) timezone "Default 'UTC'"
        timestamp updated_at
    }

    %% ============================================
    %% PROJECT & COLLABORATION
    %% ============================================

    PROJECT {
        uuid id PK
        varchar(100) name "Project name"
        text description "Optional"
        boolean collapsed "Default false"
        uuid owner_id FK "References USER"
        timestamp created_at
        timestamp updated_at
    }

    PROJECT_MEMBER {
        uuid id PK
        uuid project_id FK "References PROJECT"
        uuid user_id FK "References USER"
        varchar(10) role "ENUM: 'owner', 'member'"
        timestamp joined_at
    }

    PROJECT_INVITATION {
        uuid id PK
        uuid project_id FK "References PROJECT"
        varchar(255) email "Invited email"
        varchar(64) token UK "Unique, 32-64 chars"
        timestamp expires_at "7 days from creation"
        uuid created_by FK "References USER"
        timestamp created_at
    }

    %% ============================================
    %% TASKS & TASK PAGES
    %% ============================================

    TASK {
        uuid id PK
        varchar(20) task_id UK "Human-readable ID"
        varchar(255) title
        text description "Optional"
        varchar(20) status "ENUM: 'Not started', 'In progress', 'Done', 'Re-surface'"
        varchar(10) priority "ENUM: 'Low', 'Medium', 'High' (nullable)"
        date due_date "Optional"
        uuid project_id FK "Optional, references PROJECT"
        uuid created_by FK "References USER"
        uuid assignee_id FK "Optional, references USER"
        timestamp completed_at "Optional"
        timestamp created_at
        timestamp last_modified_at
    }

    %% TASK_TAG removed - tags feature not in MVP

    SUBTASK {
        uuid id PK
        uuid parent_task_id FK "References TASK"
        varchar(255) title
        varchar(10) status "ENUM: 'todo', 'done'"
        int sort_order "For ordering"
        timestamp completed_at "Optional"
        timestamp created_at
        timestamp updated_at
    }

    TASK_PAGE {
        uuid id PK
        uuid task_id FK UK "One-to-one with TASK"
        uuid project_id FK "References PROJECT"
        varchar(255) title
        bytea document_state "Y.js encoded binary state"
        int version "Optimistic locking"
        uuid created_by FK "References USER"
        uuid last_edited_by FK "References USER"
        timestamp created_at
        timestamp last_edited_at
    }

    PAGE_COMMENT {
        uuid id PK
        uuid page_id FK "References TASK_PAGE"
        uuid user_id FK "References USER"
        text content
        int selection_start "Optional, for inline comments"
        int selection_end "Optional, for inline comments"
        text quoted_text "Optional, cached selected text"
        uuid parent_id FK "Optional, for replies (self-reference)"
        boolean resolved "Default false"
        timestamp created_at
        timestamp updated_at
    }

    %% ============================================
    %% HABITS
    %% ============================================

    HABIT {
        uuid id PK
        uuid user_id FK "References USER"
        varchar(100) name
        varchar(10) icon "Emoji"
        varchar(50) category "Optional, e.g., 'Health', 'Fitness'"
        varchar(20) reminder_time "Optional, e.g., '8:00 AM'"
        timestamp created_at
        timestamp updated_at
    }

    HABIT_COMPLETION {
        uuid id PK
        uuid habit_id FK "References HABIT"
        date completion_date "The date of completion"
        boolean completed "true/false"
        timestamp completed_at
    }

    %% ============================================
    %% TIMER & SESSIONS
    %% ============================================

    TIMER_SESSION {
        uuid id PK
        uuid user_id FK "References USER"
        uuid task_id FK "Optional, references TASK"
        int duration_seconds "Total duration"
        varchar(255) focus_topic "Optional"
        varchar(20) status "ENUM: 'active', 'paused', 'completed', 'abandoned'"
        text notes "Optional notes"
        timestamp started_at
        timestamp completed_at "Optional"
    }

    %% ============================================
    %% CALENDAR EVENTS
    %% ============================================

    CALENDAR_EVENT {
        uuid id PK
        uuid user_id FK "References USER"
        varchar(255) title
        text description "Optional"
        timestamp start_time
        timestamp end_time
        varchar(20) color "Optional, e.g., 'purple', 'blue'"
        uuid task_id FK "Optional, references TASK"
        uuid timer_session_id FK "Optional"
        boolean created_from_timer "Default false"
        boolean is_all_day "Default false"
        timestamp created_at
        timestamp updated_at
    }

    %% ============================================
    %% NOTES
    %% ============================================

    NOTE {
        uuid id PK
        uuid user_id FK "References USER"
        varchar(255) title
        text content
        boolean is_pinned "Default false"
        uuid task_id FK "Optional, references TASK"
        timestamp created_at
        timestamp updated_at
    }

    NOTE_TAG {
        uuid id PK
        uuid note_id FK "References NOTE"
        varchar(50) tag_name
    }

    %% ============================================
    %% SHOP & INVENTORY
    %% ============================================

    SHOP_ITEM {
        uuid id PK
        varchar(50) item_key UK "Unique key"
        varchar(100) name
        text description
        varchar(20) item_type "ENUM: 'skin', 'item'"
        int price "In coins"
        varchar(500) preview_url "Optional"
        boolean is_active "Default true"
        int sort_order "Display order"
        timestamp created_at
    }

    USER_INVENTORY {
        uuid id PK
        uuid user_id FK "References USER"
        uuid item_id FK "References SHOP_ITEM"
        int quantity "For consumables like streak-freeze"
        timestamp purchased_at
        timestamp last_used_at "Optional"
    }

    USER_OWNED_SKIN {
        uuid id PK
        uuid user_id FK "References USER"
        uuid skin_id FK "References SHOP_ITEM"
        boolean is_active "Only one can be active"
        timestamp purchased_at
    }

    COIN_TRANSACTION {
        uuid id PK
        uuid user_id FK "References USER"
        int amount "Positive for earn, negative for spend"
        int balance_after "Balance after transaction"
        varchar(50) transaction_type "e.g., 'timer_session', 'purchase'"
        varchar(255) reason "Optional details"
        timestamp created_at
    }

    %% ============================================
    %% STREAK & REWARDS
    %% ============================================

    STREAK_REWARD {
        uuid id PK
        varchar(50) reward_key UK "e.g., 'streak-7', 'streak-14'"
        int days_required
        int coins_reward
        varchar(255) description
        varchar(10) icon "Emoji"
    }

    USER_CLAIMED_REWARD {
        uuid id PK
        uuid user_id FK "References USER"
        uuid reward_id FK "References STREAK_REWARD"
        timestamp claimed_at
    }

    %% ============================================
    %% NOTIFICATIONS
    %% ============================================

    NOTIFICATION {
        uuid id PK
        uuid user_id FK "References USER"
        varchar(50) type "e.g., 'project_invite', 'task_assigned'"
        varchar(255) title
        text message
        boolean is_read "Default false"
        varchar(500) action_url "Optional, link to related resource"
        jsonb metadata "Additional data"
        timestamp created_at
        timestamp read_at "Optional"
    }

    %% ============================================
    %% AI & ANALYTICS
    %% ============================================

    AI_CHAT_SESSION {
        uuid id PK
        uuid user_id FK "References USER"
        varchar(255) title "Optional"
        timestamp created_at
        timestamp updated_at
    }

    AI_CHAT_MESSAGE {
        uuid id PK
        uuid session_id FK "References AI_CHAT_SESSION"
        uuid user_id FK "References USER"
        varchar(10) role "ENUM: 'user', 'assistant'"
        text content
        jsonb context "Optional context data"
        int tokens_used "Optional"
        timestamp created_at
    }

    AI_ANALYTICS_REPORT {
        uuid id PK
        uuid user_id FK "References USER"
        varchar(20) period "ENUM: 'weekly', 'monthly'"
        date start_date
        date end_date
        int productivity_score "0-100"
        jsonb insights "Array of insights"
        jsonb recommendations "Array of suggestions"
        timestamp generated_at
    }

    %% ============================================
    %% JOURNAL ENTRIES (for AI analysis)
    %% ============================================

    JOURNAL_ENTRY {
        uuid id PK
        uuid user_id FK "References USER"
        date entry_date "Date of the journal entry"
        text content
        varchar(50) mood "Optional"
        timestamp created_at
        timestamp updated_at
    }

    %% ============================================
    %% FILE UPLOADS
    %% ============================================

    FILE_UPLOAD {
        uuid id PK
        uuid user_id FK "References USER"
        varchar(255) original_name
        varchar(500) storage_key "S3 key"
        varchar(500) storage_url "Optional, public URL"
        varchar(100) mime_type
        bigint file_size "In bytes"
        varchar(50) purpose "e.g., 'avatar', 'attachment'"
        timestamp created_at
    }

    %% ============================================
    %% UTILITIES
    %% ============================================

    DAILY_QUOTE {
        uuid id PK
        date quote_date UK "Unique per day"
        text quote
        varchar(100) author
        varchar(100) source "Optional"
        timestamp fetched_at
    }

    ACTIVITY_LOG {
        uuid id PK
        uuid user_id FK "References USER"
        varchar(50) activity_type "e.g., 'task_completed'"
        varchar(255) title
        text description "Optional"
        varchar(50) entity_type "Optional"
        uuid entity_id "Optional"
        jsonb metadata "Additional data"
        timestamp created_at
    }

    %% ============================================
    %% RELATIONSHIPS
    %% ============================================

    USER ||--o{ PASSWORD_HISTORY : "has"
    USER ||--|| SETTINGS : "has"
    
    USER ||--o{ PROJECT : "owns"
    PROJECT ||--o{ PROJECT_MEMBER : "has"
    USER ||--o{ PROJECT_MEMBER : "is member of"
    PROJECT ||--o{ PROJECT_INVITATION : "has"
    USER ||--o{ PROJECT_INVITATION : "creates"
    
    PROJECT ||--o{ TASK : "contains"
    USER ||--o{ TASK : "creates"
    USER ||--o{ TASK : "is assigned to"
    TASK ||--o{ TASK_TAG : "has"
    TASK ||--o| TASK_PAGE : "has"
    
    TASK_PAGE ||--o{ PAGE_COMMENT : "has"
    USER ||--o{ PAGE_COMMENT : "writes"
    PAGE_COMMENT ||--o{ PAGE_COMMENT : "has replies"
    
    USER ||--o{ HABIT : "has"
    HABIT ||--o{ HABIT_COMPLETION : "has"
    
    USER ||--o{ TIMER_SESSION : "has"
    TASK ||--o{ TIMER_SESSION : "tracked by"
    
    USER ||--o{ CALENDAR_EVENT : "has"
    TASK ||--o{ CALENDAR_EVENT : "linked to"
    TIMER_SESSION ||--o{ CALENDAR_EVENT : "creates"
    
    USER ||--o{ NOTE : "has"
    NOTE ||--o{ NOTE_TAG : "has"
    TASK ||--o{ NOTE : "linked to"
    
    USER ||--o{ USER_INVENTORY : "has"
    USER ||--o{ USER_OWNED_SKIN : "has"
    SHOP_ITEM ||--o{ USER_INVENTORY : "purchased as"
    SHOP_ITEM ||--o{ USER_OWNED_SKIN : "purchased as"
    USER ||--o{ COIN_TRANSACTION : "has"
    
    USER ||--o{ USER_CLAIMED_REWARD : "claims"
    STREAK_REWARD ||--o{ USER_CLAIMED_REWARD : "claimed by"
    
    USER ||--o{ NOTIFICATION : "receives"
    
    USER ||--o{ AI_CHAT_SESSION : "has"
    AI_CHAT_SESSION ||--o{ AI_CHAT_MESSAGE : "contains"
    USER ||--o{ AI_ANALYTICS_REPORT : "has"
    USER ||--o{ JOURNAL_ENTRY : "writes"
    
    USER ||--o{ FILE_UPLOAD : "uploads"
    USER ||--o{ ACTIVITY_LOG : "generates"
```

---

## 📋 Tables Summary (24 Tables)

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts and profile |
| `settings` | User preferences (1:1 with users) |
| `password_history` | Previous passwords (last 3) |

### Project & Collaboration

| Table | Description |
|-------|-------------|
| `projects` | Project containers |
| `project_members` | Many-to-many: Users ↔ Projects |
| `project_invitations` | Pending invitations |

### Tasks

| Table | Description |
|-------|-------------|
| `tasks` | Task items |
| `task_tags` | Task tags (one-to-many) |
| `task_pages` | Collaborative document per task |
| `page_comments` | Comments on task pages |

### Habits

| Table | Description |
|-------|-------------|
| `habits` | User habits |
| `habit_completions` | Daily completion records |

### Timer & Calendar

| Table | Description |
|-------|-------------|
| `timer_sessions` | Focus timer sessions |
| `calendar_events` | Calendar events |

### Notes

| Table | Description |
|-------|-------------|
| `notes` | Quick notes |
| `note_tags` | Note tags |

### Shop & Economy

| Table | Description |
|-------|-------------|
| `shop_items` | Items available in shop |
| `user_inventory` | Consumable items owned |
| `user_owned_skins` | Skins owned by users |
| `coin_transactions` | Transaction history |

### Streak & Rewards

| Table | Description |
|-------|-------------|
| `streak_rewards` | Available streak milestones |
| `user_claimed_rewards` | Claimed rewards |

### Notifications

| Table | Description |
|-------|-------------|
| `notifications` | User notifications |

### AI Features

| Table | Description |
|-------|-------------|
| `ai_chat_sessions` | AI chat session containers |
| `ai_chat_messages` | Chat history with AI |
| `ai_analytics_reports` | Generated reports |
| `journal_entries` | Journal for AI analysis |

### Utilities

| Table | Description |
|-------|-------------|
| `file_uploads` | Uploaded files metadata |
| `daily_quotes` | Cached quotes |
| `activity_logs` | User activity audit trail |

---

## 🔗 Key Relationships

### One-to-One
- `USER` ↔ `SETTINGS`
- `TASK` ↔ `TASK_PAGE`

### One-to-Many
- `USER` → `PROJECT` (owner)
- `USER` → `TASK` (creator)
- `USER` → `HABIT`
- `USER` → `NOTE`
- `USER` → `TIMER_SESSION`
- `USER` → `CALENDAR_EVENT`
- `USER` → `NOTIFICATION`
- `PROJECT` → `TASK`
- `HABIT` → `HABIT_COMPLETION`
- `TASK_PAGE` → `PAGE_COMMENT`
- `PAGE_COMMENT` → `PAGE_COMMENT` (self-reference for replies)
- `AI_CHAT_SESSION` → `AI_CHAT_MESSAGE`

### Many-to-Many (via junction tables)
- `USER` ↔ `PROJECT` (via `PROJECT_MEMBER`)
- `USER` ↔ `SHOP_ITEM` (via `USER_INVENTORY` / `USER_OWNED_SKIN`)
- `USER` ↔ `STREAK_REWARD` (via `USER_CLAIMED_REWARD`)

---

## 📝 Key Constraints

1. **Username**: 3-30 characters, alphanumeric + underscore + dot, cannot start with number
2. **Email**: Valid format, unique
3. **Password**: Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
4. **Coins**: Cannot be negative
5. **Project invitation token**: Expires after 7 days
6. **Password history**: Keep last 3 passwords

---

## 🔧 Implementation Notes

1. **Database Choice**: PostgreSQL recommended for:
   - UUID support
   - JSONB for flexible metadata
   - pgvector extension for AI embeddings
   - Strong ENUM support

2. **Caching**: Consider Redis for:
   - Daily quotes (24h TTL)
   - Dashboard overview (5 min TTL)
   - User session data

3. **File Storage**: AWS S3 for avatars and attachments

4. **WebSocket Data**: 
   - Y.js document state stored as `bytea`
   - Consider separate document store for heavy collaboration

---

*Document updated: 2026-01-19 (Cleaned up for MVP)*
