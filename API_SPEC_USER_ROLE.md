Tổng hợp API cần implement (role: `user`)

Ghi chú chung:
- Tất cả endpoints yêu cầu authentication Bearer token (trừ `/auth/register` và `/auth/login`).
- Role `user` đủ cho thao tác CRUD bình thường; nếu cần quản trị (quản lý user/global settings) có thể thêm role `admin` sau.
- Định dạng response chuẩn: { success: boolean, data?: any, error?: string }
- Thêm pagination/filtering query params khi danh sách lớn: `?page=1&limit=20&search=...`.

1) Authentication / User
- POST /api/auth/register
  - Mục đích: Tạo tài khoản mới
  - Body: { name, email, password }
  - Auth: no
  - Response: { token, user }

- POST /api/auth/login
  - Mục đích: Đăng nhập
  - Body: { email, password }
  - Auth: no
  - Response: { token, user }

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
- POST /api/habits
- PUT /api/habits/:id
- DELETE /api/habits/:id
- (If tracking completions) POST /api/habits/:id/complete  or PATCH to record occurrence

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
  - ShopItem: { id, name, description, price, type: 'skin', previewUrl? }

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
  - Logic: Tính toán current streak từ habit completions, trả về rewards có thể claim

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

Data models (tóm tắt)
- Task: { id, taskId, title, status, priority?, dueDate?, tags?, projectId?, createdAt }
- Project: { id, name, emoji, collapsed }
- Note: { id, title, content, taskId?, createdAt }
- Habit: { id, title, schedule?, streak?, lastCompleted? }
- User: { id, name, email, avatarUrl?, coins: number, ownedSkins: string[], activeSkin?: string, claimedRewards: string[], roles?: string[] }
- ShopItem: { id, name, description, price, type: 'skin' }
- CalendarEvent: { id, title, startTime, endTime, color?, taskId? }

Gợi ý implement cho BE Java
- Sử dụng Spring Boot + Spring Security (JWT) cho auth.
- Controller per resource (TaskController, ProjectController, AuthController,...).
- DTOs cho request/response + validation (e.g. dueDate format yyyy-MM-dd).
- Service layer xử lý business logic, Repository (JPA) cho persistence.

Nếu bạn muốn, tôi sẽ:
- Tạo OpenAPI (Swagger) spec file (YAML) cho các endpoint trên.
- Sinh skeleton controller classes cho Spring Boot (Java).

File này lưu tại: /API_SPEC_USER_ROLE.md
