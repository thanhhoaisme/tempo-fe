Tổng hợp API cần implement (role: `user`)

Ghi chú chung:
- Tất cả endpoints yêu cầu authentication Bearer token (trừ `/auth/register` và `/auth/login`).
- Role `user` đủ cho thao tác CRUD bình thường; nếu cần quản trị (quản lý user/global settings) có thể thêm role `admin` sau.
- Định dạng response chuẩn: { success: boolean, data?: any, error?: string }
- Thêm pagination/filtering query params khi danh sách lớn: `?page=1&limit=20&search=...`.

1) Authentication / User
- POST /api/auth/register
  - Mục đích: Tạo tài khoản mới
  - Body: { username, fullName, email, password }
  - Auth: no
  - Response: { token, user }
  - **Backend Validation Required:**
    - **Username validation:** 
      - Minimum 3 characters, maximum 30 characters
      - Only alphanumeric, underscore, dot (no spaces or special chars)
      - Must be unique (case-insensitive)
      - Cannot start with a number
    - **Full name validation:** Minimum 2 characters, maximum 100 characters
  - Auth: no
  - Response: { token, user }
  - **Backend Validation Required:**
    - **Password strength:** Minimum 8 characters
    - **Password complexity:** Must contain at least:
      - 1 uppercase letter (A-Z)
      - 1 lowercase letter (a-z)
      - 1 number (0-9)
      - 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
    - **Password blacklist:** Check against common passwords (use library like passay or zxcvbn server-side)
    - **Email validation:** Valid email format and domain
    - **Email uniqueness:** Check if email already exists
    - **Name validation:** Minimum 2 characters, maximum 100 characters
  - **Rate limiting:** Max 5 registration attempts per IP per hour
  - **Password hashing:** Use bcrypt or argon2 (cost factor ≥ 12 for bcrypt)

- POST /api/auth/login
  - Mục đích: Đăng nhập
  - Body: { email, password }
  - Auth: no
  - Response: { token, user }
  - **Backend Validation Required:**
    - **Rate limiting:** Max 5 failed attempts per account per 15 minutes
    - **Account lockout:** Lock account after 10 failed attempts in 1 hour (require email verification to unlock)
    - **Timing attack protection:** Use constant-time comparison for password verification
    - **Log failed attempts:** Record IP, timestamp, email for security monitoring

- GET /api/auth/me
  - Mục đích: Lấy profile hiện tại
  - Auth: yes
  - Response: { user }

- POST /api/auth/refresh
  - Mục đích: Lấy access token mới (optional)
  - Body: { refreshToken }
  - Auth: yes (refresh token)

- PUT /api/users/:id
  - Mục đích: Cập nhật profile (name, avatar, preferences)
  - Body: { name?, avatarUrl?, preferences? }
  - Auth: yes (user chỉ sửa chính mình)
  - **Backend Validation Required:**
    - **Authorization:** Verify user can only update their own profile (userId from JWT must match :id param)
    - **Name validation:** If provided, minimum 2 characters, maximum 100 characters
    - **Avatar URL validation:** If provided, must be valid URL format and from allowed domains
    - **File size limit:** If uploading avatar, max 2MB

- PUT /api/users/:id/password
  - Mục đích: Đổi mật khẩu (separate endpoint for security)
  - Body: { currentPassword, newPassword }
  - Auth: yes (user chỉ sửa chính mình)
  - **Backend Validation Required:**
    - **Current password verification:** Must verify currentPassword matches before allowing change
    - **New password strength:** Same validation as registration (min 8 chars, complexity requirements)
    - **Password reuse prevention:** Prevent reusing last 3 passwords
    - **Rate limiting:** Max 3 password change attempts per hour
    - **Session invalidation:** Invalidate all other sessions/tokens after password change
    - **Email notification:** Send email to user confirming password change
    - **Password blacklist:** Check against common passwords database

2) Tasks (core)
- GET /api/tasks
  - Mục đích: Lấy danh sách task (table view)
  - Query: ?projectId=&status=&priority=&search=&page=&limit=
  - Auth: yes
  - Response: { items: Task[], total }

- POST /api/tasks
  - Mục đích: Tạo task
  - Body: { title, projectId?, dueDate?, priority?, status?, tags? }
  - Auth: yes
  - Response: { task }

- GET /api/tasks/:id
  - Mục đích: Lấy chi tiết task
  - Auth: yes
  - Response: { task }

- PUT /api/tasks/:id
  - Mục đích: Cập nhật task (title, status, priority, dueDate, projectId, tags)
  - Body: Partial<Task>
  - Auth: yes
  - Response: { task }

- DELETE /api/tasks/:id
  - Mục đích: Xóa task
  - Auth: yes
  - Response: { success }

- PATCH /api/tasks/bulk
  - Mục đích: Cập nhật nhiều task (bulk status/priority/date)
  - Body: { ids: string[], updates: Partial<Task> }
  - Auth: yes

3) Projects
- GET /api/projects
  - Mục đích: Lấy danh sách projects (dùng cho select)
  - Auth: yes
  - Response: { items }

- POST /api/projects
  - Mục đích: Tạo project
  - Body: { name, emoji }
  - Auth: yes

- PUT /api/projects/:id
  - Mục đích: Cập nhật project (name, emoji, collapsed)
  - Auth: yes

- DELETE /api/projects/:id
  - Mục đích: Xóa project
  - Auth: yes

4) Status / Priority (option sets)
- GET /api/meta/statuses
  - Mục đích: Lấy option status
  - Auth: yes

- GET /api/meta/priorities
  - Mục đích: Lấy option priority
  - Auth: yes

- (Optional) POST/PUT/DELETE cho chỉnh sửa option nếu user có quyền

5) Notes
- GET /api/notes?taskId? /api/notes
  - Mục đích: Lấy note(s)
  - Auth: yes

- POST /api/notes
  - Mục đích: Tạo note
  - Body: { title, content, taskId? }

- PUT /api/notes/:id
  - Mục đích: Update note

- DELETE /api/notes/:id
  - Mục đích: Delete note

6) Habits
- GET /api/habits
  - Mục đích: Lấy danh sách habits của user
  - Auth: yes
  - Response: { items: Habit[] }
  - Habit: { id, name, icon?, category?, reminderTime?, completions: Record<string, boolean>, createdAt }
  - Note: `category` là text tự do user nhập (e.g., "Health", "Fitness", "Learning")

- POST /api/habits
  - Mục đích: Tạo habit mới
  - Body: { name: string, icon?: string, category?: string, reminderTime?: string }
  - Auth: yes
  - Response: { habit: Habit }
  - Note: `category` là optional, mặc định là "General" nếu không truyền

- PUT /api/habits/:id
  - Mục đích: Cập nhật habit
  - Body: { name?: string, icon?: string, category?: string, reminderTime?: string }
  - Auth: yes
  - Response: { habit: Habit }

- DELETE /api/habits/:id
  - Mục đích: Xóa habit
  - Auth: yes
  - Response: { success: boolean }

- POST /api/habits/:id/complete
  - Mục đích: Đánh dấu habit hoàn thành cho ngày cụ thể
  - Body: { date: string (YYYY-MM-DD), completed: boolean }
  - Auth: yes
  - Response: { habit: Habit }
  - Logic: Cập nhật `completions[date] = completed`

- GET /api/habits/stats
  - Mục đích: Lấy thống kê habits (cho dashboard)
  - Auth: yes
  - Response: { 
      totalHabits: number,
      completedToday: number,
      completionRate: number (0-100)
    }
  - Logic:
    - totalHabits: Đếm số habits của user
    - completedToday: Đếm số habits có completions[today] = true
    - completionRate: (completedToday / totalHabits) * 100


7) Timer / Sessions
- POST /api/timer/start
  - Mục đích: Bắt đầu phiên time-tracking
  - Body: { taskId? }

- POST /api/timer/stop
  - Mục đích: Dừng phiên và lưu duration
  - Body: { sessionId, notes? }

- GET /api/timer/sessions?taskId?dateRange?

8) Analytics / AI features (if any)
- POST /api/ai/chat
  - Mục đích: Chat endpoint (proxy to AI backend)
  - Body: { message, context? }

- POST /api/ai/analytics
  - Mục đích: Request analytics/report generation
  - Body: { startDate, endDate, metrics[] }

9) Shop / Purchases (if used in UI)
- GET /api/shop/items
- POST /api/shop/purchase

10) Notifications
- GET /api/notifications
- POST /api/notifications/mark-read (single / bulk)

11) Settings / Preferences
- GET /api/settings
  - Mục đích: Lấy user preferences (theme, notifications, time-format,...)
  - Auth: yes
  - Response: { settings: { theme, pushNotifications, emailNotifications, timeFormat } }

- PUT /api/settings
  - Mục đích: Lưu user preferences (theme, time-format, notification settings)
  - Body: { theme?, pushNotifications?, emailNotifications?, timeFormat? }
  - Auth: yes
  - Response: { settings }
  - Logic: 
    - pushNotifications: boolean - Enable/disable browser push notifications
    - emailNotifications: boolean - Enable/disable daily email summary
    - If emailNotifications is true, system sends daily digest via email
    - If emailNotifications is false, only in-app notifications are sent

12) File upload (avatars, attachments)
- POST /api/uploads
  - Body: form-data file
  - Response: { url }

13) Calendar Events
- GET /api/calendar/events
  - Mục đích: Lấy danh sách events trong khoảng thời gian
  - Query: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
  - Auth: yes
  - Response: { items: CalendarEvent[] }

- POST /api/calendar/events
  - Mục đích: Tạo calendar event (khi kết thúc timer session hoặc manual create)
  - Body: { title, startTime: ISO8601, endTime: ISO8601, color?, taskId? }
  - Auth: yes
  - Response: { event }
  - Note: User có thể tạo event bằng cách click/right-click vào calendar slot

- PUT /api/calendar/events/:id
  - Mục đích: Cập nhật event (drag-drop reschedule hoặc edit modal)
  - Body: Partial<CalendarEvent> (title?, startTime?, endTime?, color?)
  - Auth: yes
  - Response: { event }
  - Logic: Kiểm tra user ownership trước khi update

- DELETE /api/calendar/events/:id
  - Mục đích: Xóa event
  - Auth: yes
  - Response: { success }
  - Logic: Kiểm tra user ownership trước khi xóa

14) Shop / Timer Skins
- GET /api/shop/items
  - Mục đích: Lấy danh sách timer skins có thể mua
  - Auth: yes
  - Response: { items: ShopItem[] }
  - ShopItem: { id, name, description, price, type: 'skin' | 'item', previewUrl? }
  - **Pre-defined Items:**
    - `streak-freeze`: Is a consumable item.
      - Name: Streak Freeze (Thẻ đóng băng chuỗi)
      - Description: Automatically protects your streak if you miss a day. Consumed upon use. (Tự động bảo vệ chuỗi của bạn nếu bạn quên 1 ngày. Tiêu hao khi sử dụng.)
      - Price: 100 coins
      - Type: 'item'

- POST /api/shop/purchase
  - Mục đích: Mua timer skin
  - Body: { itemId: string }
  - Auth: yes
  - Response: { success: boolean, coins: number, ownedSkins: string[] }
  - Logic: Kiểm tra user có đủ coins không, trừ coins, thêm skin vào inventory

- GET /api/users/inventory
  - Mục đích: Lấy danh sách timer skins user đã mua
  - Auth: yes
  - Response: { ownedSkins: string[], activeSkin: string }

- PUT /api/users/active-skin
  - Mục đích: Đặt timer skin đang active
  - Body: { skinId: string }
  - Auth: yes
  - Response: { activeSkin: string }
  - Logic: Kiểm tra user có sở hữu skin không trước khi activate

15) Coins / Currency System
- GET /api/users/coins
  - Mục đích: Lấy số coins hiện tại của user
  - Auth: yes
  - Response: { coins: number }

- POST /api/users/coins/earn
  - Mục đích: Thưởng coins cho user (sau khi hoàn thành task, timer session, habit)
  - Body: { amount: number, reason: string }
  - Auth: yes
  - Response: { coins: number }
  - Logic: Cộng coins vào user balance, log transaction history

16) Streak Rewards System
- GET /api/users/streak-rewards
  - Mục đích: Lấy danh sách streak rewards đã claim và chưa claim
  - Auth: yes
  - Response: { 
      currentStreak: number,
      availableRewards: [{ id: string, days: number, coins: number, claimed: boolean }],
      claimedRewards: string[]
    }
  - Logic: 
    - **Streak Definition:** A user builds a streak by completing at least one task/habit per day.
    - **Logic Specification (If/Else):**
        - **Scenario 1: Daily Completion**
            - **Condition:** User completes at least 1 habit on Day N.
            - **Result:** Streak count increments (+1).
        - **Scenario 2: Missed Day (No Freeze)**
            - **Condition:** User DOES NOT complete any habit on Day N. AND User has NO "Streak Freeze" item.
            - **Result:** Streak resets to 0 on Day N+1.
        - **Scenario 3: Missed Day (With Freeze - Grace Period)**
            - **Condition:** User DOES NOT complete any habit on Day N. AND User HAS "Streak Freeze" item (Đóng băng chuỗi/Bảo vệ chuỗi).
            - **Result:** 1 "Streak Freeze" item consumed. Streak count remains unchanged (preserved).
    - **Streak Freeze Details:**
        - **Cost:** 100 coins per item (Available in Shop).
        - **Duration/Usage:** One-time use. Each item protects the streak for **one single day**. If a user misses 2 consecutive days, they need 2 Streak Freeze items to preserve the streak.

- POST /api/users/streak-rewards/claim
  - Mục đích: Claim streak reward milestone
  - Body: { rewardId: string }
  - Auth: yes
  - Response: { 
      success: boolean, 
      coins: number, 
      message: string,
      claimedRewards: string[]
    }
  - Logic: 
    - Kiểm tra user có đủ streak days để claim reward không
    - Kiểm tra reward đã được claim chưa
    - Nếu hợp lệ: cộng coins, lưu rewardId vào claimedRewards
    - Trả về error nếu không hợp lệ
  - Rewards mặc định:
    - streak-7: 7 days = 50 coins
    - streak-14: 14 days (2 weeks) = 100 coins
    - streak-28: 28 days (4 weeks) = 200 coins

17) Export Data
- GET /api/users/export
  - Mục đích: Export toàn bộ dữ liệu của user
  - Auth: yes
  - Response: File download (application/json)
  - Response headers: 
    - Content-Type: application/json
    - Content-Disposition: attachment; filename="flownote-export-{timestamp}.json"
  - Response body structure:
    ```json
    {
      "exportDate": "2026-01-09T16:27:25+07:00",
      "version": "1.0",
      "user": { "id", "name", "email", "avatarUrl", "coins", "activeSkin" },
      "tasks": [...],
      "projects": [...],
      "notes": [...],
      "habits": [...],
      "calendarEvents": [...],
      "timerSessions": [...],
      "settings": { "theme", "emailNotifications", "timeFormat" }
    }
    ```
  - Logic: 
    - Fetch tất cả data thuộc về user từ các bảng
    - Package thành JSON object
    - Set response headers để browser download file
    - File name format: flownote-export-YYYY-MM-DD.json

18) Quote of the Day
- GET /api/quotes/today
  - Mục đích: Lấy quote of the day (hiển thị trên dashboard)
  - Auth: yes
  - Response: { quote: string, author: string }
  - Logic:
    - **Caching Strategy:** Cache quote trong 24 giờ (reset lúc 00:00 UTC)
    - **Source:** Fetch từ ZenQuotes.io API (`https://zenquotes.io/api/today`)
    - **Fallback:** Nếu API fail, trả về 1 trong 10 default quotes hardcoded
    - **Rate Limiting:** Chỉ call ZenQuotes max 1 lần/ngày (nhờ cache)
    - **Response Format:** 
      ```json
      {
        "success": true,
        "data": {
          "quote": "The only way to do great work is to love what you do.",
          "author": "Steve Jobs"
        }
      }
      ```
  - **Backend Implementation Notes:**
    - Use Redis/In-Memory cache với TTL = 24h
    - Cache key: `quote:today:{YYYY-MM-DD}`
    - Fetch từ ZenQuotes chỉ khi cache miss
    - ZenQuotes response format: `[{ "q": "quote text", "a": "author", "h": "html" }]`
  - **Fallback Quotes (hardcoded):**
    1. "The only way to do great work is to love what you do." — Steve Jobs
    2. "Believe you can and you're halfway there." — Theodore Roosevelt
    3. "Success is not final, failure is not fatal." — Winston Churchill
    4. "The future belongs to those who believe in their dreams." — Eleanor Roosevelt
    5. "It does not matter how slowly you go as long as you do not stop." — Confucius
    6. "Everything you've ever wanted is on the other side of fear." — George Addair
    7. "Believe in yourself. You are braver than you think." — Unknown
    8. "I never dreamed about success, I worked for it." — Estée Lauder
    9. "Do what you can with all you have, wherever you are." — Theodore Roosevelt
    10. "Small progress is still progress." — Unknown

Data models (tóm tắt)
- Task: { id, taskId, title, status, priority?, dueDate?, tags?, projectId?, createdAt }
- Project: { id, name, emoji, collapsed }
- Note: { id, title, content, taskId?, createdAt }
- Habit: { id, name, icon?, category?: string, reminderTime?: string, completions: Record<string, boolean>, createdAt }
- User: { id, username, fullName, email, avatarUrl?, coins: number, ownedSkins: string[], activeSkin?: string, claimedRewards: string[], roles?: string[] }
  - Note: `username` is unique identifier displayed in TopBar and greetings (e.g., "Good morning, @johndoe")
  - Note: `fullName` is the user's display name
- ShopItem: { id, name, description, price, type: 'skin' }
- CalendarEvent: { id, title, startTime, endTime, color?, taskId? }

Gợi ý implement cho BE Java
- Sử dụng Spring Boot + Spring Security (JWT) cho auth.
- Controller per resource (TaskController, ProjectController, AuthController,...).
- DTOs cho request/response + validation (e.g. dueDate format yyyy-MM-dd).
- Service layer xử lý business logic, Repository (JPA) cho persistence.



---

## Project Notes / Ghi chú dự án

> **Mục đích dự án**: Đây là dự án để luyện code + thêm vào CV.
> 
> **Deployment**: Deploy trên AWS với số lượng người dùng nhỏ (< 100 concurrent users).
>
> **WebSocket recommendation**: Sử dụng **Socket.IO** vì:
> - Free và open-source
> - Dễ integrate với Spring Boot (via `netty-socketio` hoặc `spring-websocket`)
> - Free tier AWS EC2 (t2.micro) đủ handle ~50-100 concurrent connections
> - Fallback mechanism khi WebSocket không khả dụng
>
> **Alternative options**:
> - AWS API Gateway WebSocket (free tier: 1M messages/tháng)
> - Pusher (free tier: 200k messages/ngày, 100 concurrent connections)

---

## 18) Project Collaboration / Cộng tác dự án

> **Role System**: Chỉ có 2 roles:
> - **owner**: Tạo project, CRUD project, mời/xóa members
> - **member**: CRUD tasks trong project (không thể CRUD project)
>
> Cả owner và member đều có thể xem tất cả tasks của project trong "Tasks" tab.

### Project Member Management

- GET /api/projects/:id/members
  - Mục đích: Lấy danh sách thành viên của project
  - Auth: yes (owner hoặc member của project)
  - Response: { members: ProjectMember[] }
  - ProjectMember: { id, userId, projectId, role: 'owner' | 'member', user: { id, name, email, avatarUrl }, joinedAt }

- POST /api/projects/:id/invite
  - Mục đích: Mời thành viên mới vào project (role = member)
  - Body: { email: string }
  - Auth: yes (owner only)
  - Response: { invitation: ProjectInvitation }
  - Logic:
    - Kiểm tra email có tồn tại trong hệ thống không
    - Nếu có: tạo invitation và gửi notification
    - Nếu không: gửi email invitation link
    - Token expires sau 7 ngày
    - Invited user sẽ được assign role "member" khi accept

- DELETE /api/projects/:id/members/:userId
  - Mục đích: Xóa member khỏi project, hoặc member tự rời
  - Auth: yes (owner, hoặc user tự rời)
  - Response: { success: boolean }
  - Logic: Owner không thể rời project, phải transfer ownership hoặc xóa project

- PUT /api/projects/:id/transfer-ownership
  - Mục đích: Chuyển quyền owner cho member khác
  - Body: { newOwnerId: string }
  - Auth: yes (owner only)
  - Response: { success: boolean, project: Project }
  - Logic: Old owner thành member, new owner thành owner

### Project Invitations

- GET /api/users/invitations
  - Mục đích: Lấy danh sách lời mời đang pending của user hiện tại
  - Auth: yes
  - Response: { invitations: ProjectInvitation[] }

- POST /api/invitations/:token/accept
  - Mục đích: Chấp nhận lời mời (user trở thành member)
  - Auth: yes
  - Response: { project: Project }

- POST /api/invitations/:token/decline
  - Mục đích: Từ chối lời mời
  - Auth: yes
  - Response: { success: boolean }

- DELETE /api/projects/:id/invitations/:invitationId
  - Mục đích: Hủy lời mời đã gửi
  - Auth: yes (owner only)
  - Response: { success: boolean }

### Tasks in Shared Projects

- GET /api/tasks?includeShared=true
  - Mục đích: Lấy tất cả tasks của user (bao gồm tasks từ projects user là member)
  - Auth: yes
  - Response: { items: Task[], total }
  - Logic: Trả về tasks user tạo + tasks từ projects user là owner/member

---

## 19) Task Pages (Collaborative Documents) / Trang tài liệu cộng tác

> Cả owner và member đều có full quyền (view, comment, edit) với task pages.

### CRUD Operations

- POST /api/tasks/:taskId/page
  - Mục đích: Tạo page mới cho task
  - Body: { title?: string }
  - Auth: yes (owner hoặc member của project)
  - Response: { page: TaskPage }
  - TaskPage: { id, taskId, projectId, title, createdAt, createdBy }
  - Note: Content sẽ sync qua WebSocket (Y.js), không lưu qua REST API

- GET /api/tasks/:taskId/page
  - Mục đích: Lấy thông tin page của task
  - Auth: yes (owner hoặc member của project)
  - Response: { 
      page: TaskPage,
      documentState?: string  // Base64 Y.js document state for initial load
    }

- PUT /api/pages/:pageId
  - Mục đích: Update page metadata (title)
  - Body: { title: string }
  - Auth: yes (owner hoặc member)
  - Response: { page: TaskPage }

- DELETE /api/pages/:pageId
  - Mục đích: Xóa page
  - Auth: yes (owner only)
  - Response: { success: boolean }
  - Note: Cũng xóa tất cả comments liên quan

### Page Comments

> **Inline Comments Feature**: Users can select text in the document and add a comment referencing that specific selection. The `selectionStart` and `selectionEnd` fields store the character positions. When retrieving comments, the frontend uses these positions to:
> 1. Highlight the referenced text
> 2. Show the quoted text in the comment
> 3. Scroll to the text when clicking on a comment

- GET /api/pages/:pageId/comments
  - Mục đích: Lấy tất cả comments của page
  - Auth: yes (owner hoặc member)
  - Query params: 
    - resolved?: boolean (filter by resolved status)
    - includeReplies?: boolean (default true)
  - Response: { comments: PageComment[] }
  - PageComment structure:
    ```json
    {
      "id": "comment-123",
      "pageId": "page-1",
      "userId": "user-2",
      "user": { "name": "John Doe", "avatarUrl": "..." },
      "content": "This needs more detail",
      "selectionStart": 150,  // Character position start (null for general comments)
      "selectionEnd": 200,    // Character position end (null for general comments)
      "quotedText": "the selected text",  // Server returns the quoted text for convenience
      "parentId": null,
      "resolved": false,
      "createdAt": 1704931200000,
      "updatedAt": 1704931200000,
      "replies": []
    }
    ```

- POST /api/pages/:pageId/comments
  - Mục đích: Tạo comment mới (general hoặc inline)
  - Body: 
    ```json
    {
      "content": "string (required)",
      "selectionStart": "number (optional, for inline comments)",
      "selectionEnd": "number (optional, for inline comments)",
      "parentId": "string (optional, for replies)"
    }
    ```
  - Auth: yes (owner hoặc member)
  - Response: { comment: PageComment }
  - Note: Nếu có selectionStart/selectionEnd, đây là inline comment

- PUT /api/pages/:pageId/comments/:commentId
  - Mục đích: Cập nhật comment
  - Body: { content?: string, resolved?: boolean }
  - Auth: yes (comment owner, hoặc project owner)
  - Response: { comment: PageComment }

- DELETE /api/pages/:pageId/comments/:commentId
  - Mục đích: Xóa comment
  - Auth: yes (comment owner, hoặc project owner)
  - Response: { success: boolean }
  - Note: Xóa comment cũng xóa tất cả replies

---

## 20) WebSocket Events / Sự kiện WebSocket

> **Implementation**: Socket.IO với Spring Boot (netty-socketio)
> 
> **Connection endpoint**: `wss://your-domain/ws` hoặc `wss://your-domain/socket.io`

### Authentication
- Client gửi JWT token trong handshake query: `?token=xxx`
- Server validate token và associate socket với userId

### Project Channel Events

**Join/Leave**
- Client emit: `join-project` { projectId: string }
- Client emit: `leave-project` { projectId: string }

**Task Events (broadcast to project owner + members)**
- Server emit: `task-created` { task: Task, createdBy: string }
- Server emit: `task-updated` { taskId: string, updates: Partial<Task>, updatedBy: string }
- Server emit: `task-deleted` { taskId: string, deletedBy: string }

**Member Events**
- Server emit: `member-joined` { member: ProjectMember }
- Server emit: `member-left` { userId: string }

### Page Channel Events (Y.js Sync)

**Join/Leave**
- Client emit: `join-page` { pageId: string }
- Client emit: `leave-page` { pageId: string }

**Document Sync (Y.js protocol)**
- Client emit: `sync-step-1` { pageId: string, stateVector: Uint8Array }
- Server emit: `sync-step-1` { diff: Uint8Array, stateVector: Uint8Array }
- Client emit: `sync-step-2` { pageId: string, diff: Uint8Array }
- Client/Server emit: `update` { pageId: string, update: Uint8Array }

**Presence/Awareness**
- Client emit: `awareness-update` { pageId: string, awareness: { cursor?: { index, length }, user: { name, color } } }
- Server broadcast: `awareness-update` { userId: string, awareness: {...} }

**Comments (real-time)**
- Server emit: `comment-added` { comment: PageComment }
- Server emit: `comment-updated` { comment: PageComment }
- Server emit: `comment-deleted` { commentId: string }

---

## Data Models Update / Cập nhật Data Models

### New Models

```
ProjectRole: 'owner' | 'member'

ProjectMember: {
  id: string,
  userId: string,
  projectId: string,
  role: 'owner' | 'member',
  joinedAt: timestamp
}

ProjectInvitation: {
  id: string,
  projectId: string,
  email: string,
  token: string (unique, 32 chars),
  expiresAt: timestamp (7 days from creation),
  createdBy: string,
  createdAt: timestamp
}

TaskPage: {
  id: string,
  taskId: string (unique, 1:1 relationship),
  projectId: string,
  title: string,
  documentState: binary (Y.js encoded state),
  createdAt: timestamp,
  createdBy: string,
  lastEditedAt: timestamp,
  lastEditedBy: string,
  version: integer
}

PageComment: {
  id: string,
  pageId: string,
  userId: string,
  content: text,
  selectionStart?: integer,
  selectionEnd?: integer,
  parentId?: string (for replies),
  resolved: boolean (default false),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Updated Models

```
Project (updated): {
  id: string,
  name: string,
  emoji: string,
  collapsed: boolean,
  ownerId: string,  // NEW: User who created the project
  createdAt: timestamp  // NEW
}

Task (updated): {
  id: string,
  taskId: string,
  title: string,
  status: string,
  priority?: string,
  dueDate?: string,
  tags?: string[],
  projectId?: string,
  createdAt: timestamp,
  createdBy: string,  // NEW
  assigneeId?: string,  // NEW
  lastModifiedBy?: string,  // NEW
  lastModifiedAt?: timestamp,  // NEW
  hasPage: boolean,  // NEW: true if task has a TaskPage
  pageId?: string  // NEW
}
```

### Permission Matrix (Simplified)

| Role   | View Tasks | CRUD Tasks | View Project Members | Invite/Remove Members | CRUD Project |
|--------|------------|------------|---------------------|----------------------|--------------|
| owner  | ✓          | ✓          | ✓                   | ✓                    | ✓            |
| member | ✓          | ✓          | ✓                   | ✗                    | ✗            |

