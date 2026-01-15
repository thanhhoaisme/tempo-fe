# 📱 Tempo - Smart Habit Tracker & Productivity App

## 🎯 Tổng quan dự án

**Tempo** (trước đây là FlowNote) là một ứng dụng Web Productivity toàn diện, kết hợp nhiều công cụ quản lý thời gian, habit tracking, task management và AI assistant để giúp người dùng tối ưu hóa năng suất làm việc hàng ngày.

### Thông tin kỹ thuật
- **Frontend Framework**: Next.js (React)
- **Language**: TypeScript
- **Styling**: CSS (với theme hỗ trợ Light/Dark mode)
- **State Management**: React Context API
- **Data Storage**: localStorage (Frontend demo), sẽ tích hợp với Backend Java/Spring Boot
- **Deployment Target**: AWS (< 100 concurrent users)

---

## 📂 Cấu trúc các trang (Pages)

| Trang | Route | Mục đích |
|-------|-------|---------|
| Dashboard/Home | `/` | Trang chủ với tổng quan streak, tasks, habits |
| Timer | `/timer` | Focus timer với nhiều skin animation |
| Habits | `/habits` | Quản lý và theo dõi habits hàng ngày |
| Tracker (Tasks) | `/tracker` | Quản lý tasks theo dạng bảng Notion-like |
| Calendar | `/calendar` | Lịch tuần với timer sessions và events |
| Notes | `/notes` | Ghi chú nhanh |
| Shop | `/shop` | Mua skins và items bằng coins |
| AI Chat | `/ai-chat` | Chatbot AI trợ lý năng suất |
| AI Analytics | `/ai-analytics` | Phân tích AI về productivity patterns |
| Settings | `/settings` | Cài đặt ứng dụng (theme, notifications, export) |
| Profile | `/profile` | Quản lý profile và đổi mật khẩu |
| Login | `/login` | Đăng nhập |
| Register | `/register` | Đăng ký tài khoản mới |

---

## 🔥 Chức năng chi tiết

### 1. Dashboard/Home (`/`)

**Mô tả**: Trang tổng quan hiển thị trạng thái productivity của người dùng.

**Chức năng:**
| Chức năng | Mô tả | API cần thiết |
|-----------|-------|---------------|
| Streak Display | Hiển thị streak hiện tại dạng vòng tròn progress | `GET /api/users/streak-rewards` |
| Habit Overview | Tổng hợp habits đã hoàn thành/bỏ lỡ trong tuần | `GET /api/habits` |
| Task Statistics | Thống kê tasks: total, done, in progress, overdue | `GET /api/tasks` |
| Streak Rewards | Claim phần thưởng milestone (7, 14, 28 ngày) | `POST /api/users/streak-rewards/claim` |
| Quick Navigation | Điều hướng nhanh đến Timer, Tasks, Habits, Calendar | - |
| Period Filter | Lọc thống kê theo Today/Week/Month | Query params |

**Streak Rewards Milestones:**
- 🏆 7 days streak → 50 coins
- 🏆 14 days streak → 100 coins  
- 🏆 28 days streak → 200 coins

---

### 2. Focus Timer (`/timer`)

**Mô tả**: Timer Pomodoro-style để tập trung làm việc, có gamification với nhiều animation skins.

**Chức năng:**
| Chức năng | Mô tả | API cần thiết |
|-----------|-------|---------------|
| Start Timer | Bắt đầu phiên focus | `POST /api/timer/start` |
| Pause Timer | Tạm dừng phiên | - (local state) |
| Stop/Complete | Dừng và lưu session | `POST /api/timer/stop` |
| Duration Presets | Chọn thời gian: 15/25/45/60 phút | - |
| Focus Topic | Nhập chủ đề đang focus | - |
| Timer Skins | Chọn animation skin (Battery, Clock, HP Bar, Cat Yarn) | `GET /api/users/inventory` |
| Break Mode | Chế độ nghỉ ngắn giữa các session | - |
| Session Complete | Tự động lưu event vào Calendar khi hoàn thành | `POST /api/calendar/events` |
| Finish Early | Kết thúc sớm và vẫn tính thời gian đã focus | `POST /api/timer/stop` |

**Timer Skins có sẵn:**
1. **Battery Power** - Animation pin sạc (100 coins)
2. **Clock Skin** - Đồng hồ analog (150 coins)
3. **HP Bar** - Thanh HP game style (200 coins)
4. **Cat Yarn** - Mèo chơi cuộn len (200 coins)

---

### 3. Habits Tracking (`/habits`)

**Mô tả**: Theo dõi và xây dựng thói quen hàng ngày.

**Chức năng:**
| Chức năng | Mô tả | API cần thiết |
|-----------|-------|---------------|
| View Habits | Danh sách habits với icon và streak | `GET /api/habits` |
| Add Habit | Tạo habit mới với tên và icon | `POST /api/habits` |
| Edit Habit | Sửa tên/icon habit | `PUT /api/habits/:id` |
| Delete Habit | Xóa habit | `DELETE /api/habits/:id` |
| Toggle Completion | Đánh dấu hoàn thành habit theo ngày | `POST /api/habits/:id/complete` |
| 7-Day Calendar | Hiển thị 7 ngày gần nhất với trạng thái hoàn thành | - |
| Habit Stats | Completion rate, current streak per habit | - |
| Streak Protection | Streak Freeze tự động bảo vệ nếu quên 1 ngày | Logic trong backend |

**Streak Logic:**
- ✅ Hoàn thành ít nhất 1 habit/ngày → Streak +1
- ❌ Bỏ lỡ 1 ngày + KHÔNG có Streak Freeze → Streak reset về 0
- 🛡️ Bỏ lỡ 1 ngày + CÓ Streak Freeze → Tiêu hao 1 freeze, streak giữ nguyên

---

### 4. Task Tracker (`/tracker`)

**Mô tả**: Quản lý tasks theo dạng bảng giống Notion, hỗ trợ projects và collaboration.

**Chức năng:**
| Chức năng | Mô tả | API cần thiết |
|-----------|-------|---------------|
| View Tasks | Danh sách tasks dạng bảng với các cột | `GET /api/tasks` |
| Add Task | Tạo task mới | `POST /api/tasks` |
| Edit Task | Sửa title, status, priority, due date, tags | `PUT /api/tasks/:id` |
| Delete Task | Xóa task | `DELETE /api/tasks/:id` |
| Bulk Actions | Chọn nhiều task và update/delete cùng lúc | `PATCH /api/tasks/bulk` |
| Projects | Nhóm tasks theo projects | `GET/POST/PUT/DELETE /api/projects` |
| Project Emoji | Icon emoji cho mỗi project | `PUT /api/projects/:id` |
| Collapse Project | Thu gọn/mở rộng project | - (local state) |
| Status | Not started / In progress / Done / Re-surface | Select dropdown |
| Priority | Low / Medium / High | Select dropdown |
| Due Date | Chọn ngày deadline | Date picker |
| Tags | Gắn tags cho task | Input |
| Search & Filter | Tìm kiếm và lọc tasks | Query params |

**Task Statuses:**
- 🔘 Not started (Chưa bắt đầu)
- 🔵 In progress (Đang làm)
- ✅ Done (Hoàn thành)
- 🔄 Re-surface (Cần xem lại)

**Task Priorities:**
- 🟢 Low (Thấp)
- 🟡 Medium (Trung bình)
- 🔴 High (Cao)

---

### 5. Calendar (`/calendar`)

**Mô tả**: Lịch tuần hiển thị timer sessions và events.

**Chức năng:**
| Chức năng | Mô tả | API cần thiết |
|-----------|-------|---------------|
| Week View | Hiển thị 7 ngày với timeline 24 giờ | `GET /api/calendar/events` |
| View Events | Các events hiển thị theo block thời gian | - |
| Create Event | Click vào slot để tạo event mới | `POST /api/calendar/events` |
| Edit Event | Click vào event để sửa | `PUT /api/calendar/events/:id` |
| Delete Event | Xóa event | `DELETE /api/calendar/events/:id` |
| Drag & Drop | Kéo thả event để đổi thời gian | `PUT /api/calendar/events/:id` |
| Resize Event | Kéo resize để thay đổi duration | `PUT /api/calendar/events/:id` |
| Color Picker | Chọn màu cho event | - |
| Timer Integration | Timer sessions tự động tạo event | Auto-created |
| Navigation | Prev/Next week, Today button | - |
| Context Menu | Right-click để tạo event nhanh | - |

**Event Colors:**
- 🟣 Purple (default)
- 🔵 Blue
- 🟢 Green
- 🟡 Yellow
- 🔴 Red
- 🟠 Orange

---

### 6. Notes (`/notes`)

**Mô tả**: Ghi chú nhanh với tìm kiếm và tags.

**Chức năng:**
| Chức năng | Mô tả | API cần thiết |
|-----------|-------|---------------|
| View Notes | Grid layout các notes | `GET /api/notes` |
| Create Note | Tạo note mới với title | `POST /api/notes` |
| Edit Note | Sửa content (rich text planned) | `PUT /api/notes/:id` |
| Delete Note | Xóa note | `DELETE /api/notes/:id` |
| Search Notes | Tìm kiếm theo title/content | Query params |
| Pin Note | Ghim note quan trọng lên đầu | `PUT /api/notes/:id` |
| Tags | Gắn tags để phân loại | - |

---

### 7. Shop (`/shop`)

**Mô tả**: Cửa hàng mua timer skins và items bằng coins.

**Chức năng:**
| Chức năng | Mô tả | API cần thiết |
|-----------|-------|---------------|
| View Items | Danh sách items có thể mua | `GET /api/shop/items` |
| Item Preview | Xem trước animation của skin | - |
| Purchase | Mua item (trừ coins) | `POST /api/shop/purchase` |
| Activate Skin | Kích hoạt skin đã mua | `PUT /api/users/active-skin` |
| View Inventory | Xem items đã sở hữu | `GET /api/users/inventory` |
| Coins Display | Hiển thị số coins hiện có | `GET /api/users/coins` |

**Shop Items:**

| Item | Loại | Giá | Mô tả |
|------|------|-----|-------|
| Battery Power | Skin | 100 coins | Timer animation kiểu pin sạc |
| Clock Skin | Skin | 150 coins | Đồng hồ analog cổ điển |
| HP Bar | Skin | 200 coins | Thanh HP kiểu game |
| Cat Yarn | Skin | 200 coins | Mèo chơi cuộn len dễ thương |
| **Streak Freeze** | **Item** | **100 coins** | **Bảo vệ streak nếu quên 1 ngày** |

---

### 8. AI Chat (`/ai-chat`)

**Mô tả**: Chatbot AI trợ lý năng suất cá nhân.

**Chức năng:**
| Chức năng | Mô tả | API cần thiết |
|-----------|-------|---------------|
| Chat Interface | Giao diện chat 2 chiều | `POST /api/ai/chat` |
| Productivity Advice | AI đưa lời khuyên dựa trên data | - |
| Habit Analysis | Phân tích patterns thói quen | - |
| Task Suggestions | Gợi ý ưu tiên tasks | - |
| Context Awareness | AI hiểu context từ habits/tasks/timer | Body: { context } |

**Lưu ý**: Hiện tại đang ở chế độ demo với responses giả lập. Backend AI cần tích hợp với LLM (OpenAI, etc.).

---

### 9. AI Analytics (`/ai-analytics`)

**Mô tả**: Dashboard phân tích AI về patterns năng suất.

**Chức năng:**
| Chức năng | Mô tả | API cần thiết |
|-----------|-------|---------------|
| Productivity Score | Điểm năng suất tổng thể (0-100) | `POST /api/ai/analytics` |
| Insights | AI-generated insights về patterns | - |
| Peak Hours | Nhận diện giờ làm việc hiệu quả nhất | - |
| Habit Trends | Xu hướng hoàn thành habits | - |
| Weekly Patterns | Phát hiện ngày yếu trong tuần | - |
| Recommendations | Gợi ý cải thiện từ AI | - |

**Insight Types:**
- 📈 Productivity Pattern (giờ làm việc hiệu quả)
- ⚡ Habit Consistency (xu hướng habits)
- 📅 Weekly Pattern (pattern theo ngày trong tuần)
- 💡 Recommendation (gợi ý cải thiện)

---

### 10. Settings (`/settings`)

**Mô tả**: Cài đặt ứng dụng và preferences.

**Chức năng:**
| Chức năng | Mô tả | API cần thiết |
|-----------|-------|---------------|
| Theme Toggle | Chuyển đổi Light/Dark mode | `PUT /api/settings` |
| Notifications | Bật/tắt push notifications | `PUT /api/settings` |
| Email Notifications | Bật/tắt email daily digest | `PUT /api/settings` |
| Export Data | Xuất toàn bộ data ra JSON | `GET /api/users/export` |
| Privacy Settings | Quản lý quyền riêng tư | - |

**Export Data Format:**
```json
{
  "exportDate": "2026-01-13T...",
  "version": "1.0",
  "user": { "id", "name", "email", "coins", "activeSkin" },
  "tasks": [...],
  "projects": [...],
  "notes": [...],
  "habits": [...],
  "calendarEvents": [...],
  "timerSessions": [...],
  "settings": { "theme", "emailNotifications", "timeFormat" }
}
```

---

### 11. Profile (`/profile`)

**Mô tả**: Quản lý thông tin cá nhân.

**Chức năng:**
| Chức năng | Mô tả | API cần thiết |
|-----------|-------|---------------|
| View Profile | Xem thông tin user | `GET /api/auth/me` |
| Update Profile | Sửa tên, avatar | `PUT /api/users/:id` |
| Change Password | Đổi mật khẩu | `PUT /api/users/:id/password` |
| Password Strength | Hiển thị độ mạnh mật khẩu | - (frontend) |
| Avatar Upload | Upload ảnh đại diện | `POST /api/uploads` |

**Password Requirements:**
- ✅ Tối thiểu 8 ký tự
- ✅ 1 chữ hoa (A-Z)
- ✅ 1 chữ thường (a-z)
- ✅ 1 số (0-9)
- ✅ 1 ký tự đặc biệt (!@#$%^&*...)

---

### 12. Authentication (`/login`, `/register`)

**Chức năng:**
| Chức năng | Mô tả | API cần thiết |
|-----------|-------|---------------|
| Register | Đăng ký tài khoản mới | `POST /api/auth/register` |
| Login | Đăng nhập | `POST /api/auth/login` |
| Token Refresh | Làm mới access token | `POST /api/auth/refresh` |
| Logout | Đăng xuất | - (clear token) |

---

## 🤝 Collaboration Features (Project Collaboration)

**Mô tả**: Tính năng cộng tác trên projects (cho teams).

### Project Members

| Chức năng | Mô tả | API cần thiết |
|-----------|-------|---------------|
| View Members | Xem danh sách thành viên project | `GET /api/projects/:id/members` |
| Invite Member | Mời thành viên qua email | `POST /api/projects/:id/invite` |
| Remove Member | Xóa thành viên | `DELETE /api/projects/:id/members/:userId` |
| Transfer Ownership | Chuyển quyền owner | `PUT /api/projects/:id/transfer-ownership` |

### Project Roles

| Role | View Tasks | CRUD Tasks | View Members | Invite/Remove | CRUD Project |
|------|------------|------------|--------------|---------------|--------------|
| **Owner** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Member** | ✅ | ✅ | ✅ | ❌ | ❌ |

### Invitations

| Chức năng | Mô tả | API cần thiết |
|-----------|-------|---------------|
| View Invitations | Xem lời mời pending | `GET /api/users/invitations` |
| Accept Invitation | Chấp nhận lời mời | `POST /api/invitations/:token/accept` |
| Decline Invitation | Từ chối lời mời | `POST /api/invitations/:token/decline` |
| Cancel Invitation | Owner hủy lời mời | `DELETE /api/projects/:id/invitations/:invitationId` |

---

## 📝 Task Pages (Collaborative Documents)

**Mô tả**: Mỗi task có thể có 1 trang tài liệu cộng tác (giống Google Docs).

### Document Features

| Chức năng | Mô tả | API cần thiết |
|-----------|-------|---------------|
| Create Page | Tạo page cho task | `POST /api/tasks/:taskId/page` |
| View Page | Xem/edit content | `GET /api/tasks/:taskId/page` |
| Update Page | Update metadata (title) | `PUT /api/pages/:pageId` |
| Delete Page | Xóa page | `DELETE /api/pages/:pageId` |
| Real-time Sync | Sync content qua WebSocket (Y.js) | WebSocket events |

### Toolbar Formatting

| Format | Shortcut | Description |
|--------|----------|-------------|
| Bold | `**text**` | In đậm |
| Italic | `*text*` | In nghiêng |
| Underline | `__text__` | Gạch chân |
| Code | `` `code` `` | Code inline |
| Heading 1 | `# heading` | Tiêu đề 1 |
| Heading 2 | `## heading` | Tiêu đề 2 |
| Quote | `> quote` | Trích dẫn |
| List | `- item` | Danh sách |
| Ordered List | `1. item` | Danh sách đánh số |
| Link | `[text](url)` | Liên kết |

### Comments

| Chức năng | Mô tả | API cần thiết |
|-----------|-------|---------------|
| View Comments | Xem tất cả comments | `GET /api/pages/:pageId/comments` |
| Add Comment | Thêm comment | `POST /api/pages/:pageId/comments` |
| Inline Comment | Comment trên text đã chọn | `POST /api/pages/:pageId/comments` (với selectionStart/End) |
| Edit Comment | Sửa comment | `PUT /api/pages/:pageId/comments/:commentId` |
| Delete Comment | Xóa comment | `DELETE /api/pages/:pageId/comments/:commentId` |
| Resolve Comment | Đánh dấu đã giải quyết | `PUT /api/pages/:pageId/comments/:commentId` |
| Reply Comment | Trả lời comment | `POST` với parentId |

---

## 🔌 WebSocket Events (Real-time)

### Connection
```
Endpoint: wss://your-domain/socket.io
Auth: ?token=JWT_TOKEN
```

### Project Channel Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-project` | Client → Server | Tham gia channel project |
| `leave-project` | Client → Server | Rời channel |
| `task-created` | Server → Client | Task mới được tạo |
| `task-updated` | Server → Client | Task được update |
| `task-deleted` | Server → Client | Task bị xóa |
| `member-joined` | Server → Client | Thành viên mới tham gia |
| `member-left` | Server → Client | Thành viên rời project |

### Page Channel Events (Y.js Sync)

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-page` | Client → Server | Tham gia page để edit |
| `leave-page` | Client → Server | Rời page |
| `sync-step-1/2` | Both | Y.js document sync |
| `update` | Both | Document update |
| `awareness-update` | Both | Cursor/presence update |
| `comment-added` | Server → Client | Comment mới |
| `comment-updated` | Server → Client | Comment được update |
| `comment-deleted` | Server → Client | Comment bị xóa |

---

## 💰 Gamification System

### Coins Economy

| Nguồn thu | Coins |
|-----------|-------|
| Complete Timer Session (25 min) | +10 coins |
| Complete Focus Session (45 min) | +20 coins |
| Complete All Daily Habits | +15 coins |
| Streak Reward (7 days) | +50 coins |
| Streak Reward (14 days) | +100 coins |
| Streak Reward (28 days) | +200 coins |

### Chi tiêu

| Item | Giá |
|------|-----|
| Timer Skins | 100-200 coins |
| Streak Freeze | 100 coins |

---

## 📊 Data Models

### User Profile
```typescript
interface UserProfile {
  id: string;
  username: string;
  coins: number;
  totalXP: number;
  level: number;
  theme: 'dark' | 'light';
  timerAnimation: 'coffee' | 'hourglass' | 'battery' | ...;
  inventory: Record<string, number>; // itemId -> quantity
  currentStreak: number;
  lastActiveDate: string;
}
```

### Task
```typescript
interface Task {
  id: string;
  taskId: string;
  title: string;
  status: 'Not started' | 'In progress' | 'Done' | 'Re-surface';
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  tags?: string[];
  projectId?: string;
  createdAt: number;
  createdBy?: string;
  assigneeId?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: number;
  hasPage?: boolean;
  pageId?: string;
}
```

### Project
```typescript
interface Project {
  id: string;
  name: string;
  emoji: string;
  collapsed: boolean;
  ownerId?: string;
  createdAt?: number;
}
```

### Habit
```typescript
interface Habit {
  id: string;
  name: string;
  icon: string;
  completions: Record<string, boolean>; // date -> completed
  createdAt: number;
}
```

### Calendar Event
```typescript
interface CalendarEvent {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  color?: string;
  taskId?: string;
  createdFromTimer?: boolean;
}
```

### Note
```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  isPinned: boolean;
}
```

---

## 🛠️ Tóm tắt APIs (xem chi tiết tại `API_SPEC_USER_ROLE.md`)

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy profile
- `POST /api/auth/refresh` - Refresh token

### User
- `PUT /api/users/:id` - Update profile
- `PUT /api/users/:id/password` - Đổi mật khẩu
- `GET /api/users/coins` - Lấy số coins
- `POST /api/users/coins/earn` - Thưởng coins
- `GET /api/users/inventory` - Inventory
- `PUT /api/users/active-skin` - Set active skin
- `GET /api/users/export` - Export data

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET/PUT/DELETE /api/tasks/:id` - CRUD single task
- `PATCH /api/tasks/bulk` - Bulk update

### Projects
- `GET/POST /api/projects` - List/Create
- `PUT/DELETE /api/projects/:id` - Update/Delete
- `GET /api/projects/:id/members` - Members
- `POST /api/projects/:id/invite` - Invite
- `DELETE /api/projects/:id/members/:userId` - Remove member

### Habits
- `GET/POST /api/habits` - List/Create
- `PUT/DELETE /api/habits/:id` - Update/Delete
- `POST /api/habits/:id/complete` - Mark complete

### Timer
- `POST /api/timer/start` - Start session
- `POST /api/timer/stop` - Stop session
- `GET /api/timer/sessions` - Get sessions

### Calendar
- `GET /api/calendar/events` - List events
- `POST /api/calendar/events` - Create event
- `PUT/DELETE /api/calendar/events/:id` - Update/Delete

### Notes
- `GET/POST /api/notes` - List/Create
- `PUT/DELETE /api/notes/:id` - Update/Delete

### Shop
- `GET /api/shop/items` - List items
- `POST /api/shop/purchase` - Purchase item

### AI
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/analytics` - Generate analytics

### Streak Rewards
- `GET /api/users/streak-rewards` - Get rewards status
- `POST /api/users/streak-rewards/claim` - Claim reward

### Settings
- `GET/PUT /api/settings` - Get/Update settings

### Notifications
- `GET /api/notifications` - List notifications
- `POST /api/notifications/mark-read` - Mark as read

### Task Pages (Collaboration)
- `POST /api/tasks/:taskId/page` - Create page
- `GET /api/tasks/:taskId/page` - Get page
- `PUT /api/pages/:pageId` - Update page
- `DELETE /api/pages/:pageId` - Delete page
- `GET/POST /api/pages/:pageId/comments` - Comments
- `PUT/DELETE /api/pages/:pageId/comments/:commentId` - Comment CRUD

---

## 🗂️ Cấu trúc thư mục chính

```
src/
├── app/                          # Next.js pages
│   ├── page.tsx                  # Dashboard/Home
│   ├── timer/page.tsx            # Focus Timer
│   ├── habits/page.tsx           # Habits Tracking
│   ├── tracker/page.tsx          # Task Tracker
│   ├── calendar/page.tsx         # Calendar View
│   ├── notes/page.tsx            # Notes
│   ├── shop/page.tsx             # Shop
│   ├── ai-chat/page.tsx          # AI Chatbot
│   ├── ai-analytics/page.tsx     # AI Analytics
│   ├── settings/page.tsx         # Settings
│   ├── profile/page.tsx          # Profile
│   ├── login/page.tsx            # Login
│   └── register/page.tsx         # Register
├── components/
│   ├── features/
│   │   ├── collaboration/        # Collab features
│   │   │   ├── CollaborativeEditor.tsx
│   │   │   ├── ProjectMembersModal.tsx
│   │   │   └── PendingInvitations.tsx
│   │   ├── timer-skins/          # Timer animations
│   │   │   ├── BatterySkin.tsx
│   │   │   ├── ClockSkin.tsx
│   │   │   ├── HPBarSkin.tsx
│   │   │   └── CatYarnSkin.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── ...
├── context/
│   ├── AppContext.tsx            # Main app state
│   └── ThemeContext.tsx          # Theme state
├── types/
│   └── index.ts                  # TypeScript interfaces
└── ...
```

---

## ✅ Checklist Backend Implementation

### Priority 1 - Core Features
- [ ] Authentication (register, login, JWT)
- [ ] User CRUD
- [ ] Tasks CRUD + bulk operations
- [ ] Projects CRUD
- [ ] Habits CRUD + completion tracking
- [ ] Timer sessions

### Priority 2 - Extended Features
- [ ] Calendar events
- [ ] Notes CRUD
- [ ] Shop + Purchase system
- [ ] Coins system
- [ ] Streak rewards

### Priority 3 - Collaboration
- [ ] Project members
- [ ] Invitations
- [ ] Task pages
- [ ] Page comments
- [ ] WebSocket integration

### Priority 4 - AI Integration
- [ ] AI Chat endpoint (LLM integration)
- [ ] AI Analytics generation

---

## 📌 Lưu ý cho Backend Development

1. **Tech Stack gợi ý**: Spring Boot + Spring Security (JWT) + JPA
2. **Database**: PostgreSQL hoặc MySQL
3. **WebSocket**: Socket.IO với `netty-socketio` hoặc `spring-websocket`
4. **File Storage**: AWS S3 cho avatars và attachments
5. **AI Integration**: OpenAI API hoặc self-hosted LLM
6. **Deployment**: AWS EC2 (t2.micro cho demo) hoặc ECS/EKS cho production

---

*Tài liệu này được tạo tự động dựa trên codebase hiện tại. Cập nhật lần cuối: 2026-01-13*
