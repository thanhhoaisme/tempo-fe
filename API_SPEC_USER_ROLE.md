# Tổng hợp API cần implement (role: `user`)

## Ghi chú chung
- Tất cả endpoints yêu cầu authentication Bearer token (trừ `/auth/register` và `/auth/login`).
- Role `user` đủ cho thao tác CRUD bình thường; nếu cần quản trị (quản lý user/global settings) có thể thêm role `admin` sau.
- Định dạng response chuẩn: { success: boolean, data?: any, error?: string }
- Thêm pagination/filtering query params khi danh sách lớn: `?page=1&limit=20&search=...`.

---

## 1) Authentication / User

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
    - **Full name validation:** Minimum 2 characters, maximum 50 characters
    - **Password strength:** Minimum 8 characters
    - **Password complexity:** Must contain at least:
      - 1 uppercase letter (A-Z)
      - 1 lowercase letter (a-z)
      - 1 number (0-9)
      - 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
    - **Password blacklist:** Check against common passwords (server-side implementation — e.g. `passay` for Java or `zxcvbn` server-side ports)
    - **Email validation:** Valid email format and domain
    - **Email uniqueness:** Check if email already exists
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

---

## 2) Dashboard

- GET /api/dashboard/overview
  - Mục đích: Lấy tổng quan dashboard (tổng hợp nhiều metrics)
  - Auth: yes
  - Response: 
    ```json
    {
      "tasks": {
        "total": 45,
        "completedToday": 3,
        "overdue": 2,
        "dueThisWeek": 7
      },
      "habits": {
        "totalHabits": 8,
        "completedToday": 5,
        "completionRate": 62.5
      },
      "streak": {
        "currentStreak": 12,
        "longestStreak": 28,
        "nextMilestone": {
          "days": 14,
          "reward": 100
        }
      },
      "productivity": {
        "todayHours": 4.5,
        "weekHours": 23.2,
        "totalSessions": 156
      },
      "coins": 450
    }
    ```
  - Logic:
    - Tổng hợp data từ tasks, habits, streak, timer sessions
    - Cache 5 phút để giảm database queries
    - Chỉ tính completed tasks/habits của hôm nay (today 00:00 - 23:59)

- GET /api/dashboard/recent-activities
  - Mục đích: Lấy danh sách hoạt động gần đây
  - Auth: yes
  - Query: ?limit=10 (default 10, max 50)
  - Response: { activities: Activity[] }
  - Activity structure:
    ```json
    {
      "id": "activity-123",
      "type": "task_completed" | "habit_completed" | "timer_session" | "comment_added" | "project_joined",
      "title": "Completed Design Mockups",
      "description": "Task completed in 2h 30m",
      "timestamp": 1704931200000,
      "metadata": {
        "taskId": "task-1",
        "duration": 9000,
        "projectName": "Website Redesign"
      }
    }
    ```
  - Logic:
    - Trả về max 50 activities gần nhất (sorted by timestamp desc)
    - Activity types: task_completed, task_created, habit_completed, timer_session, comment_added, project_joined, streak_milestone
    - Include metadata để link đến resource (taskId, habitId, etc.)

- GET /api/dashboard/productivity
  - Mục đích: Lấy productivity stats (timer sessions)
  - Auth: yes
  - Query: ?period=today|week|month (default: week)
  - Response:
    ```json
    {
      "period": "week",
      "totalHours": 23.5,
      "totalSessions": 42,
      "averageSessionLength": 33.6,
      "mostProductiveDay": "Monday",
      "breakdown": {
        "Monday": 4.5,
        "Tuesday": 3.2,
        "Wednesday": 5.1,
        "Thursday": 4.8,
        "Friday": 3.9,
        "Saturday": 1.5,
        "Sunday": 0.5
      },
      "topProjects": [
        {
          "projectId": "proj-1",
          "projectName": "Website Redesign",
          "hours": 12.3,
          "percentage": 52.3
        }
      ]
    }
    ```
  - Logic:
    - Tính từ timer sessions trong khoảng thời gian
    - today: hôm nay (00:00 - 23:59)
    - week: 7 ngày gần nhất
    - month: 30 ngày gần nhất
    - averageSessionLength tính bằng phút

- GET /api/dashboard/upcoming
  - Mục đích: Lấy tasks sắp đến hạn
  - Auth: yes
  - Query: ?days=7 (default: 7 days, max: 30)
  - Response:
    ```json
    {
      "items": [
        {
          "id": "task-1",
          "title": "Submit quarterly report",
          "dueDate": "2026-01-20",
          "priority": "high",
          "projectId": "proj-1",
          "projectName": "Company Projects",
          "daysUntilDue": 3,
          "isOverdue": false
        }
      ],
      "overdue": [
        {
          "id": "task-2",
          "title": "Review pull requests",
          "dueDate": "2026-01-15",
          "priority": "medium",
          "daysOverdue": 2
        }
      ]
    }
    ```
  - Logic:
    - items: Tasks có dueDate trong X ngày tới (sorted by dueDate asc)
    - overdue: Tasks có dueDate < today (sorted by dueDate desc - oldest first)
    - Include project name nếu task thuộc project
    - daysUntilDue: số ngày còn lại (positive number)
    - daysOverdue: số ngày quá hạn (positive number)

---

## 3) Tasks

- GET /api/tasks
  - Mục đích: Lấy danh sách task (table view)
  - Query: ?projectId=&status=&priority=&search=&page=&limit=&includeShared=true
  - Auth: yes
  - Response: { items: Task[], total }
  - Logic: Trả về tasks user tạo + tasks từ projects user là owner/member (nếu includeShared=true)

- POST /api/tasks
  - Mục đích: Tạo task
  - Body: { title, projectId?, dueDate?, priority?, status?, assigneeId? }
  - Auth: yes
  - Response: { task }
  - Logic: 
    - Solo task (no projectId): chỉ có thể self-assign
    - Project task: owner/member có thể assign cho bất kỳ member nào trong project

- GET /api/tasks/:id
  - Mục đích: Lấy chi tiết task
  - Auth: yes
  - Response: { task }

- PUT /api/tasks/:id
  - Mục đích: Cập nhật task (title, status, priority, dueDate, projectId, assigneeId)
  - Body: Partial<Task>
  - Auth: yes
  - Response: { task, assignee?: { id, name, avatarUrl } }
  - Logic: 
    - Khi update assigneeId, validate assignee là member của project
    - Trả về assignee object để UI hiển thị

- DELETE /api/tasks/:id
  - Mục đích: Xóa task
  - Auth: yes
  - Response: { success }

- PATCH /api/tasks/bulk
  - Mục đích: Cập nhật nhiều task (bulk status/priority/date)
  - Body: { ids: string[], updates: Partial<Task> }
  - Auth: yes

### Subtasks

> Simple subtasks với title và status (todo/done) only.

- GET /api/tasks/:taskId/subtasks
  - Mục đích: Lấy danh sách subtasks của task
  - Auth: yes
  - Response: { subtasks: Subtask[] }
  - Subtask: { id, parentTaskId, title, status: 'todo'|'done', sortOrder, completedAt?, createdAt }

- POST /api/tasks/:taskId/subtasks
  - Mục đích: Tạo subtask mới
  - Body: { title }
  - Auth: yes
  - Response: { subtask }

- PUT /api/subtasks/:id
  - Mục đích: Cập nhật subtask (title, status)
  - Body: { title?, status? }
  - Auth: yes
  - Response: { subtask }
  - Logic: Khi status = 'done', tự động set completedAt = now()

- DELETE /api/subtasks/:id
  - Mục đích: Xóa subtask
  - Auth: yes
  - Response: { success }

---

## 4) Task Pages (Collaborative Documents)

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

> **Inline Comments Feature**: Users can select text in the document and add a comment referencing that specific selection. The `selectionStart` and `selectionEnd` fields store the character positions.
>
> **Click-to-Navigate**: When user clicks on a comment in the sidebar, the editor should:
> 1. Scroll to the referenced text position (using `selectionStart`/`selectionEnd`)
> 2. Highlight the referenced text temporarily (e.g., yellow background for 2 seconds)
> 3. If `selectionStart` is null (general comment), just scroll to top of document
>
> **Reply Feature**: Comments support threaded replies. To reply:
> 1. User clicks "Reply" button on a comment
> 2. POST with `parentId` set to the parent comment's ID
> 3. Frontend displays replies indented/nested under parent comment
> 4. Replies inherit the parent's text selection context for reference

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
      "selectionStart": 150,
      "selectionEnd": 200,
      "quotedText": "the selected text",
      "parentId": null,
      "resolved": false,
      "createdAt": 1704931200000,
      "updatedAt": 1704931200000,
      "replies": [
        {
          "id": "comment-124",
          "pageId": "page-1",
          "userId": "user-3",
          "user": { "name": "Jane Smith", "avatarUrl": "..." },
          "content": "I agree, we should also mention the dependencies.",
          "parentId": "comment-123",
          "resolved": false,
          "createdAt": 1704931500000,
          "updatedAt": 1704931500000
        }
      ]
    }
    ```
  - Logic:
    - Server trả về comments với nested replies khi `includeReplies=true` (default)
    - Replies không có `selectionStart`/`selectionEnd` riêng, inherit từ parent comment
    - Frontend click vào reply cũng scroll đến vị trí text của parent comment

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

## 5) Projects

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

### Project Collaboration

> **Role System**: Chỉ có 2 roles:
> - **owner**: Tạo project, CRUD project, mời/xóa members
> - **member**: CRUD tasks trong project (không thể CRUD project)

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

- DELETE /api/projects/:id/invitations/:invitationId
  - Mục đích: Hủy lời mời đã gửi
  - Auth: yes (owner only)
  - Response: { success: boolean }

### Project Invitations (User side)

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

---

## 6) Habits

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

---

## 7) Timer / Sessions

- POST /api/timer/start
  - Mục đích: Bắt đầu phiên time-tracking
  - Body: { taskId? }

- POST /api/timer/stop
  - Mục đích: Dừng phiên và lưu duration
  - Body: { sessionId, notes? }

- GET /api/timer/sessions
  - Mục đích: Lấy danh sách sessions
  - Query: ?taskId=&dateRange=

---

## 8) Calendar Events

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

---

## 9) Notes

- GET /api/notes
  - Mục đích: Lấy note(s)
  - Query: ?taskId=
  - Auth: yes

- POST /api/notes
  - Mục đích: Tạo note
  - Body: { title, content, taskId? }

- PUT /api/notes/:id
  - Mục đích: Update note

- DELETE /api/notes/:id
  - Mục đích: Delete note

---

## 10) Shop / Timer Skins

- GET /api/shop/items
  - Mục đích: Lấy danh sách timer skins có thể mua
  - Auth: yes
  - Response: { items: ShopItem[] }
  - ShopItem: { id, name, description, price, type: 'skin' | 'item', previewUrl? }
  - **Pre-defined Items:**
    - `streak-freeze`: Is a consumable item.
      - Name: Streak Freeze (Thẻ đóng băng chuỗi)
      - Description: Automatically protects your streak if you miss a day. Consumed upon use.
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

---

## 11) Coins / Currency System

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

---

## 12) Streak Rewards System

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
            - **Condition:** User DOES NOT complete any habit on Day N. AND User HAS "Streak Freeze" item.
            - **Result:** 1 "Streak Freeze" item consumed. Streak count remains unchanged (preserved).
    - **Streak Freeze Details:**
        - **Cost:** 100 coins per item (Available in Shop).
        - **Duration/Usage:** One-time use. Each item protects the streak for **one single day**.

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

---

## 13) Notifications

- GET /api/notifications
  - Mục đích: Lấy danh sách notifications
  - Auth: yes

- POST /api/notifications/mark-read
  - Mục đích: Đánh dấu đã đọc (single / bulk)
  - Auth: yes

---

## 14) Settings / Preferences

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

---

## 15) Status / Priority (option sets)

- GET /api/meta/statuses
  - Mục đích: Lấy option status
  - Auth: yes

- GET /api/meta/priorities
  - Mục đích: Lấy option priority
  - Auth: yes

- (Optional) POST/PUT/DELETE cho chỉnh sửa option nếu user có quyền

---

## 16) AI Analytics / Chat

- POST /api/ai/chat
  - Mục đích: Chat endpoint (proxy to AI backend)
  - Body: { message, context? }

- POST /api/ai/analytics
  - Mục đích: Request analytics/report generation
  - Body: { startDate, endDate, metrics[] }

---

## 17) Quote of the Day

- GET /api/quotes/today
  - Mục đích: Lấy quote of the day (hiển thị trên dashboard)
  - Auth: yes
  - Response: { quote: string, author: string }
  - Logic:
    - **Caching Strategy:** Cache quote trong 24 giờ (reset lúc 00:00 UTC)
    - **Source:** Fetch từ ZenQuotes.io API (`https://zenquotes.io/api/today`)
    - **Fallback:** Nếu API fail, trả về 1 trong 10 default quotes hardcoded
    - **Rate Limiting:** Chỉ call ZenQuotes max 1 lần/ngày (nhờ cache)
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

---

## 18) Export Data

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

---

## 19) File Upload

- POST /api/uploads
  - Mục đích: Upload file (avatars, attachments)
  - Body: form-data file
  - Response: { url }

---

## 20) WebSocket Events

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

## Data Models

### Core Models

```
Task: { 
  id, taskId, title, status, priority?, dueDate?, tags?, projectId?, 
  createdAt, createdBy, assigneeId?, lastModifiedBy?, lastModifiedAt?,
  hasPage: boolean, pageId?: string
}

Project: { 
  id, name, emoji, collapsed, ownerId, createdAt 
}

Note: { id, title, content, taskId?, createdAt }

Habit: { 
  id, name, icon?, category?: string, reminderTime?: string, 
  completions: Record<string, boolean>, createdAt 
}

User: { 
  id, username, fullName, email, avatarUrl?, coins: number, 
  ownedSkins: string[], activeSkin?: string, claimedRewards: string[], roles?: string[] 
}
- Note: `username` is unique identifier displayed in TopBar and greetings (e.g., "Good morning, @johndoe")
- Note: `fullName` is the user's display name

ShopItem: { id, name, description, price, type: 'skin' | 'item' }

CalendarEvent: { id, title, startTime, endTime, color?, taskId? }
```

### Collaboration Models

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

### Permission Matrix

| Role   | View Tasks | CRUD Tasks | View Project Members | Invite/Remove Members | CRUD Project |
|--------|------------|------------|---------------------|----------------------|--------------|
| owner  | ✓          | ✓          | ✓                   | ✓                    | ✓            |
| member | ✓          | ✓          | ✓                   | ✗                    | ✗            |

---

## Gợi ý implement cho BE Java

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

