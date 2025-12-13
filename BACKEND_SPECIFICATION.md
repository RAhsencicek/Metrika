# Metrika Backend API Spesifikasyonu

## 📋 İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [Teknoloji Önerileri](#teknoloji-önerileri)
3. [Veritabanı Şeması](#veritabanı-şeması)
4. [API Endpoint'leri](#api-endpointleri)
5. [Kimlik Doğrulama](#kimlik-doğrulama)
6. [Veri Modelleri](#veri-modelleri)
7. [İş Kuralları](#iş-kuralları)
8. [Gamification Sistemi](#gamification-sistemi)
9. [AI Entegrasyonu](#ai-entegrasyonu)
10. [WebSocket Olayları](#websocket-olayları)

---

## 🎯 Genel Bakış

**Metrika**, kapsamlı bir proje yönetimi ve gamification platformudur. Backend sistemi aşağıdaki temel modülleri desteklemelidir:

- **Proje Yönetimi**: Projeler, görevler, sprintler, dökümanlar
- **Ekip Yönetimi**: Kullanıcılar, roller, takımlar
- **Gamification**: XP, rozetler, liderlik tablosu
- **AI Doküman Analizi**: Doküman yükleme, AI ile analiz
- **KPI Takibi**: Performans metrikleri, grafikler
- **Bildirimler**: Gerçek zamanlı bildirimler
- **Takvim**: Etkinlikler, toplantılar

---

## 🛠️ Teknoloji Önerileri

### Backend Framework Seçenekleri:
| Teknoloji | Açıklama |
|-----------|----------|
| **Node.js + Express/Fastify** | Hızlı geliştirme, JavaScript/TypeScript uyumu |
| **Python + FastAPI** | AI entegrasyonu için ideal, async desteği |
| **Go + Gin/Fiber** | Yüksek performans, düşük kaynak tüketimi |
| **Java + Spring Boot** | Kurumsal projeler için |

### Veritabanı:
| Tip | Öneri | Kullanım |
|-----|-------|----------|
| **Ana DB** | PostgreSQL | Tüm ilişkisel veriler |
| **Cache** | Redis | Session, cache, real-time |
| **Search** | Elasticsearch | Doküman araması |
| **File Storage** | S3 / MinIO | Doküman depolama |

### Diğer Servisler:
- **Message Queue**: RabbitMQ / Redis Streams
- **AI Service**: OpenAI API / Claude API / Ollama
- **Auth**: JWT + Refresh Token
- **Real-time**: Socket.io / WebSocket

---

## 📊 Veritabanı Şeması

### 1. Users (Kullanıcılar)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    role ENUM('admin', 'manager', 'member', 'viewer') DEFAULT 'member',
    department VARCHAR(100),
    phone VARCHAR(20),
    location VARCHAR(100),
    bio TEXT,
    status ENUM('online', 'offline', 'busy', 'away') DEFAULT 'offline',
    
    -- Gamification
    level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    current_xp INTEGER DEFAULT 0,
    xp_to_next_level INTEGER DEFAULT 1000,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    
    -- Settings
    notification_preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department);
```

### 2. Projects (Projeler)
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('Active', 'Completed', 'On Hold', 'At Risk', 'Cancelled') DEFAULT 'Active',
    methodology ENUM('Waterfall', 'Scrum', 'Hybrid') NOT NULL,
    
    -- Progress & Budget
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    budget DECIMAL(15, 2),
    budget_used DECIMAL(15, 2) DEFAULT 0,
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    actual_end_date DATE,
    
    -- Relations
    manager_id UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    
    -- Metadata
    color VARCHAR(20) DEFAULT 'blue',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    tags TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_manager ON projects(manager_id);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
```

### 3. Project Members (Proje Üyeleri)
```sql
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role ENUM('owner', 'manager', 'member', 'viewer') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
```

### 4. Tasks (Görevler)
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('Todo', 'In Progress', 'Review', 'Done', 'Blocked') DEFAULT 'Todo',
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    
    -- Assignment
    assignee_id UUID REFERENCES users(id),
    reporter_id UUID REFERENCES users(id),
    
    -- Time Tracking
    estimated_hours DECIMAL(5, 2),
    logged_hours DECIMAL(5, 2) DEFAULT 0,
    
    -- Dates
    due_date DATE,
    completed_at TIMESTAMP,
    
    -- Metadata
    tags TEXT[],
    order_index INTEGER DEFAULT 0,
    
    -- XP Reward
    xp_reward INTEGER DEFAULT 10,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### 5. Sprints (Sprintler - Scrum/Hybrid için)
```sql
CREATE TABLE sprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    goal TEXT,
    status ENUM('Planning', 'Active', 'Completed', 'Cancelled') DEFAULT 'Planning',
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Velocity
    planned_points INTEGER DEFAULT 0,
    completed_points INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sprints_project ON sprints(project_id);
CREATE INDEX idx_sprints_status ON sprints(status);
```

### 6. Documents (Dokümanlar)
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    
    name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    -- AI Analysis
    ai_summary TEXT,
    ai_findings JSONB,
    ai_risks JSONB,
    ai_actions JSONB,
    ai_tags TEXT[],
    analysis_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    analyzed_at TIMESTAMP,
    
    -- Relations
    uploaded_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_analysis_status ON documents(analysis_status);
```

### 7. Comments (Yorumlar)
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_task ON comments(task_id);
CREATE INDEX idx_comments_user ON comments(user_id);
```

### 8. Time Logs (Zaman Kayıtları)
```sql
CREATE TABLE time_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    hours DECIMAL(5, 2) NOT NULL,
    description TEXT,
    logged_date DATE NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_time_logs_task ON time_logs(task_id);
CREATE INDEX idx_time_logs_user ON time_logs(user_id);
CREATE INDEX idx_time_logs_date ON time_logs(logged_date);
```

### 9. KPIs (Performans Göstergeleri)
```sql
CREATE TABLE kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    target_value DECIMAL(15, 2),
    current_value DECIMAL(15, 2) DEFAULT 0,
    unit VARCHAR(50),
    
    -- Tracking
    measurement_frequency ENUM('daily', 'weekly', 'monthly', 'sprint') DEFAULT 'weekly',
    last_measured_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kpis_project ON kpis(project_id);
```

### 10. KPI History (KPI Geçmişi)
```sql
CREATE TABLE kpi_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_id UUID REFERENCES kpis(id) ON DELETE CASCADE,
    
    value DECIMAL(15, 2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kpi_history_kpi ON kpi_history(kpi_id);
CREATE INDEX idx_kpi_history_date ON kpi_history(recorded_at);
```

### 11. Badges (Rozetler)
```sql
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    xp_reward INTEGER DEFAULT 50,
    
    -- Unlock Criteria
    criteria_type ENUM('tasks_completed', 'projects_completed', 'xp_earned', 'streak_days', 'specific_action') NOT NULL,
    criteria_value INTEGER NOT NULL,
    criteria_details JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 12. User Badges (Kullanıcı Rozetleri)
```sql
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    
    earned_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
```

### 13. XP Transactions (XP İşlemleri)
```sql
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    amount INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    source_type ENUM('task', 'badge', 'streak', 'document', 'comment', 'bonus') NOT NULL,
    source_id UUID,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_date ON xp_transactions(created_at);
```

### 14. Notifications (Bildirimler)
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    type ENUM('info', 'success', 'warning', 'error', 'xp', 'badge', 'task', 'mention', 'deadline') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Action
    action_url VARCHAR(500),
    action_label VARCHAR(100),
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    
    -- Context
    context JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

### 15. Calendar Events (Takvim Etkinlikleri)
```sql
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('meeting', 'deadline', 'task', 'milestone', 'other') NOT NULL,
    
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    all_day BOOLEAN DEFAULT false,
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule VARCHAR(255),
    
    -- Meeting
    meeting_url VARCHAR(500),
    location VARCHAR(255),
    
    -- Relations
    created_by UUID REFERENCES users(id),
    
    -- Metadata
    color VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_calendar_events_dates ON calendar_events(start_time, end_time);
CREATE INDEX idx_calendar_events_project ON calendar_events(project_id);
```

### 16. Event Attendees (Etkinlik Katılımcıları)
```sql
CREATE TABLE event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    status ENUM('pending', 'accepted', 'declined', 'tentative') DEFAULT 'pending',
    
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user ON event_attendees(user_id);
```

### 17. Activity Logs (Aktivite Geçmişi)
```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    
    details JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_project ON activity_logs(project_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_date ON activity_logs(created_at);
```

---

## 🔌 API Endpoint'leri

### Base URL
```
https://api.metrika.com/v1
```

### Authentication

#### POST /auth/register
Yeni kullanıcı kaydı
```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "Emre",
  "lastName": "Yılmaz",
  "department": "Yazılım"
}

// Response 201
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Emre",
      "lastName": "Yılmaz"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST /auth/login
Kullanıcı girişi
```json
// Request
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response 200
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST /auth/refresh
Token yenileme
```json
// Request
{
  "refreshToken": "refresh_token"
}

// Response 200
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

#### POST /auth/logout
Çıkış

#### POST /auth/forgot-password
Şifre sıfırlama

#### POST /auth/reset-password
Yeni şifre belirleme

---

### Users

#### GET /users/me
Mevcut kullanıcı bilgileri
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Emre",
    "lastName": "Yılmaz",
    "avatarUrl": "https://...",
    "role": "manager",
    "department": "Yazılım",
    "phone": "+90 555 123 45 67",
    "location": "İstanbul Ofis",
    "bio": "...",
    "status": "online",
    "level": 12,
    "totalXp": 24560,
    "currentXp": 560,
    "xpToNextLevel": 1000,
    "createdAt": "2023-01-01T00:00:00Z"
  }
}
```

#### PATCH /users/me
Profil güncelleme
```json
// Request
{
  "firstName": "Emre",
  "lastName": "Yılmaz",
  "phone": "+90 555 123 45 67",
  "bio": "Proje yöneticisi..."
}
```

#### PATCH /users/me/avatar
Profil fotoğrafı güncelleme (multipart/form-data)

#### PATCH /users/me/password
Şifre değiştirme
```json
// Request
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

#### GET /users
Tüm kullanıcıları listele
```
Query Params:
- search: string (isim veya email)
- department: string
- role: string
- status: string
- page: number (default: 1)
- limit: number (default: 20)
```

#### GET /users/:id
Kullanıcı detayı

#### GET /users/:id/stats
Kullanıcı istatistikleri
```json
// Response 200
{
  "success": true,
  "data": {
    "tasksCompleted": 156,
    "projectsInvolved": 12,
    "totalLoggedHours": 1240,
    "averageTaskCompletionTime": 2.5, // gün
    "onTimeDeliveryRate": 94, // %
    "currentStreak": 7, // gün
    "longestStreak": 21
  }
}
```

---

### Projects

#### GET /projects
Projeleri listele
```
Query Params:
- search: string
- status: Active | Completed | On Hold | At Risk
- methodology: Waterfall | Scrum | Hybrid
- managerId: uuid
- page: number
- limit: number
- sortBy: createdAt | dueDate | progress | title
- sortOrder: asc | desc
```

```json
// Response 200
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "uuid",
        "title": "E-Ticaret Platformu Yenileme",
        "description": "...",
        "status": "Active",
        "progress": 65,
        "methodology": "Scrum",
        "startDate": "2023-01-10",
        "endDate": "2023-06-30",
        "budget": 250000,
        "budgetUsed": 162500,
        "color": "blue",
        "manager": {
          "id": "uuid",
          "name": "Emre Yılmaz",
          "avatarUrl": "..."
        },
        "teamSize": 8,
        "tasksCompleted": 45,
        "totalTasks": 72
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 24,
      "totalPages": 2
    }
  }
}
```

#### POST /projects
Yeni proje oluştur
```json
// Request
{
  "title": "Yeni Proje",
  "description": "Proje açıklaması",
  "methodology": "Scrum",
  "startDate": "2023-07-01",
  "endDate": "2023-12-31",
  "budget": 150000,
  "teamMemberIds": ["uuid1", "uuid2"],
  "kpis": [
    {
      "name": "Sprint Hızı",
      "targetValue": 50,
      "unit": "story point"
    }
  ]
}
```

#### GET /projects/:id
Proje detayı

#### PATCH /projects/:id
Proje güncelle

#### DELETE /projects/:id
Proje sil (soft delete)

#### GET /projects/:id/stats
Proje istatistikleri
```json
// Response 200
{
  "success": true,
  "data": {
    "overview": {
      "progress": 65,
      "daysRemaining": 45,
      "budgetUsagePercent": 65
    },
    "tasks": {
      "total": 72,
      "todo": 15,
      "inProgress": 8,
      "review": 4,
      "done": 45
    },
    "team": {
      "totalMembers": 8,
      "activeToday": 6
    },
    "timeline": {
      "onSchedule": true,
      "estimatedCompletion": "2023-06-25"
    }
  }
}
```

#### GET /projects/:id/timeline
Proje zaman çizelgesi (Gantt için)

#### GET /projects/:id/burndown
Burndown chart verileri (Scrum için)
```json
// Response 200
{
  "success": true,
  "data": {
    "sprints": [
      {
        "name": "Sprint 1",
        "plannedPoints": 40,
        "completedPoints": 38,
        "startDate": "2023-01-10",
        "endDate": "2023-01-24"
      }
    ],
    "dailyBurndown": [
      { "date": "2023-01-10", "remaining": 40, "ideal": 40 },
      { "date": "2023-01-11", "remaining": 38, "ideal": 37 }
    ]
  }
}
```

---

### Project Members

#### GET /projects/:id/members
Proje üyelerini listele

#### POST /projects/:id/members
Üye ekle
```json
// Request
{
  "userId": "uuid",
  "role": "member"
}
```

#### PATCH /projects/:id/members/:userId
Üye rolünü güncelle

#### DELETE /projects/:id/members/:userId
Üyeyi projeden çıkar

---

### Tasks

#### GET /tasks
Tüm görevleri listele
```
Query Params:
- projectId: uuid
- sprintId: uuid
- status: Todo | In Progress | Review | Done | Blocked
- priority: Low | Medium | High | Urgent
- assigneeId: uuid
- search: string
- dueDateFrom: date
- dueDateTo: date
- page: number
- limit: number
```

#### POST /tasks
Yeni görev oluştur
```json
// Request
{
  "projectId": "uuid",
  "sprintId": "uuid", // optional
  "title": "API Dokümantasyonu",
  "description": "...",
  "status": "Todo",
  "priority": "High",
  "assigneeId": "uuid",
  "dueDate": "2023-06-15",
  "estimatedHours": 16,
  "tags": ["Backend", "Dokümantasyon"],
  "xpReward": 25
}
```

#### GET /tasks/:id
Görev detayı

#### PATCH /tasks/:id
Görev güncelle

#### DELETE /tasks/:id
Görev sil

#### PATCH /tasks/:id/status
Görev durumunu değiştir
```json
// Request
{
  "status": "Done"
}

// Response 200 (XP kazanımı dahil)
{
  "success": true,
  "data": {
    "task": { ... },
    "xpEarned": 25,
    "newTotalXp": 24585,
    "levelUp": false,
    "badgesEarned": []
  }
}
```

#### POST /tasks/:id/time-logs
Zaman kaydı ekle
```json
// Request
{
  "hours": 2.5,
  "description": "API endpoint'lerini yazdım",
  "loggedDate": "2023-06-10"
}
```

#### GET /tasks/:id/time-logs
Zaman kayıtlarını listele

#### GET /tasks/:id/comments
Yorumları listele

#### POST /tasks/:id/comments
Yorum ekle
```json
// Request
{
  "content": "İlk taslak tamamlandı, geri bildirim bekliyorum."
}
```

---

### Sprints

#### GET /projects/:projectId/sprints
Sprint listesi

#### POST /projects/:projectId/sprints
Yeni sprint oluştur
```json
// Request
{
  "name": "Sprint 5",
  "goal": "API geliştirme tamamlanacak",
  "startDate": "2023-06-01",
  "endDate": "2023-06-14",
  "plannedPoints": 45
}
```

#### GET /sprints/:id
Sprint detayı

#### PATCH /sprints/:id
Sprint güncelle

#### PATCH /sprints/:id/start
Sprint başlat

#### PATCH /sprints/:id/complete
Sprint tamamla

---

### Documents

#### GET /documents
Dokümanları listele
```
Query Params:
- projectId: uuid
- taskId: uuid
- analysisStatus: pending | processing | completed | failed
- fileType: string
```

#### POST /documents/upload
Doküman yükle (multipart/form-data)
```
Form Fields:
- file: File
- projectId: uuid
- taskId: uuid (optional)
- analyzeWithAI: boolean (default: true)
```

#### GET /documents/:id
Doküman detayı

#### DELETE /documents/:id
Doküman sil

#### POST /documents/:id/analyze
AI analizi başlat

#### GET /documents/:id/analysis
AI analiz sonuçlarını getir
```json
// Response 200
{
  "success": true,
  "data": {
    "status": "completed",
    "analyzedAt": "2023-06-10T14:30:00Z",
    "summary": "Bu stratejik doküman, şirketin 2023 yılı için...",
    "findings": [
      {
        "type": "positive",
        "content": "Yeni ürün lansmanı için pazarlama stratejisi güçlü."
      }
    ],
    "risks": [
      {
        "severity": "critical",
        "content": "Finansal projeksiyon detayları bazı bölümlerde eksik.",
        "page": 14
      }
    ],
    "suggestedActions": [
      {
        "title": "Finansal projeksiyonları revize et",
        "priority": "high"
      }
    ],
    "tags": ["KOBI", "Pazarlama", "Bütçe Artışı"]
  }
}
```

---

### KPIs

#### GET /projects/:projectId/kpis
KPI listesi

#### POST /projects/:projectId/kpis
Yeni KPI oluştur
```json
// Request
{
  "name": "Sprint Hızı",
  "description": "Her sprintte tamamlanan story point",
  "targetValue": 50,
  "unit": "story point",
  "measurementFrequency": "sprint"
}
```

#### GET /kpis/:id
KPI detayı

#### PATCH /kpis/:id
KPI güncelle

#### DELETE /kpis/:id
KPI sil

#### POST /kpis/:id/record
KPI değeri kaydet
```json
// Request
{
  "value": 48
}
```

#### GET /kpis/:id/history
KPI geçmişi

---

### Gamification

#### GET /gamification/profile
Kullanıcı gamification profili
```json
// Response 200
{
  "success": true,
  "data": {
    "level": 12,
    "totalXp": 24560,
    "currentXp": 560,
    "xpToNextLevel": 1000,
    "rank": 5,
    "badges": [
      {
        "id": "uuid",
        "name": "Proje Ustası",
        "icon": "trophy",
        "color": "yellow",
        "earnedAt": "2023-05-15"
      }
    ],
    "recentActivities": [
      {
        "type": "task_completed",
        "xpEarned": 25,
        "title": "Finansal Rapor Q3 tamamlandı",
        "createdAt": "2023-06-10T10:00:00Z"
      }
    ],
    "skills": {
      "projectManagement": 92,
      "teamLeadership": 85,
      "analytics": 78,
      "communication": 90
    }
  }
}
```

#### GET /gamification/leaderboard
Liderlik tablosu
```
Query Params:
- period: month | all-time (default: month)
- limit: number (default: 10)
```

```json
// Response 200
{
  "success": true,
  "data": {
    "period": "month",
    "users": [
      {
        "rank": 1,
        "userId": "uuid",
        "name": "Ahmet Yıldız",
        "avatarUrl": "...",
        "department": "Ürün Yönetimi",
        "xp": 12450,
        "level": 24,
        "isCurrentUser": false
      }
    ],
    "currentUserRank": 5
  }
}
```

#### GET /gamification/badges
Tüm rozetler

#### GET /gamification/xp-history
XP geçmişi
```
Query Params:
- from: date
- to: date
- limit: number
```

---

### Notifications

#### GET /notifications
Bildirimleri listele
```
Query Params:
- isRead: boolean
- type: string
- page: number
- limit: number
```

#### GET /notifications/unread-count
Okunmamış bildirim sayısı

#### PATCH /notifications/:id/read
Bildirimi okundu olarak işaretle

#### PATCH /notifications/read-all
Tüm bildirimleri okundu olarak işaretle

#### DELETE /notifications/:id
Bildirimi sil

---

### Calendar

#### GET /calendar/events
Etkinlikleri listele
```
Query Params:
- from: datetime
- to: datetime
- projectId: uuid
- type: meeting | deadline | task | milestone
```

#### POST /calendar/events
Etkinlik oluştur
```json
// Request
{
  "title": "Sprint Değerlendirme",
  "description": "...",
  "type": "meeting",
  "startTime": "2023-06-15T10:00:00Z",
  "endTime": "2023-06-15T11:00:00Z",
  "projectId": "uuid",
  "attendeeIds": ["uuid1", "uuid2"],
  "meetingUrl": "https://zoom.us/...",
  "color": "purple"
}
```

#### GET /calendar/events/:id
Etkinlik detayı

#### PATCH /calendar/events/:id
Etkinlik güncelle

#### DELETE /calendar/events/:id
Etkinlik sil

#### PATCH /calendar/events/:id/respond
Etkinliğe yanıt ver
```json
// Request
{
  "status": "accepted" // accepted | declined | tentative
}
```

---

### Dashboard

#### GET /dashboard/stats
Dashboard istatistikleri
```json
// Response 200
{
  "success": true,
  "data": {
    "projects": {
      "total": 24,
      "active": 18,
      "completed": 5,
      "atRisk": 1
    },
    "tasks": {
      "total": 156,
      "myTasks": 12,
      "overdue": 3,
      "dueToday": 2
    },
    "performance": {
      "completionRate": 76,
      "onTimeDelivery": 94,
      "budgetUtilization": 65
    },
    "recentActivity": [
      {
        "type": "task_completed",
        "user": "Emre Yılmaz",
        "project": "E-Ticaret Platformu",
        "description": "API Dokümantasyonu tamamlandı",
        "createdAt": "2023-06-10T10:00:00Z"
      }
    ],
    "aiSuggestions": [
      {
        "type": "warning",
        "project": "Mobil Uygulama",
        "message": "Sprint hızı düşüyor. Ek kaynak planlaması önerilir.",
        "createdAt": "2023-06-10T08:00:00Z"
      }
    ]
  }
}
```

#### GET /dashboard/upcoming-tasks
Yaklaşan görevler

#### GET /dashboard/project-overview
Proje özeti (grafikler için)

---

### Team

#### GET /team/members
Ekip üyelerini listele
```
Query Params:
- department: string
- status: online | offline | busy
- search: string
```

#### GET /team/members/:id
Ekip üyesi profili

#### GET /team/departments
Departman listesi

#### GET /team/org-chart
Organizasyon şeması

---

### Settings

#### GET /settings/notifications
Bildirim ayarları

#### PATCH /settings/notifications
Bildirim ayarlarını güncelle
```json
// Request
{
  "emailNotifications": true,
  "desktopNotifications": true,
  "taskAssignments": true,
  "deadlineReminders": true,
  "weeklyReport": false
}
```

---

## 🔐 Kimlik Doğrulama

### JWT Token Yapısı
```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "role": "manager",
  "iat": 1686312000,
  "exp": 1686315600
}
```

### Token Süreleri
- **Access Token**: 1 saat
- **Refresh Token**: 7 gün

### Yetkilendirme Rolleri
| Rol | Açıklama | Yetkiler |
|-----|----------|----------|
| `admin` | Sistem yöneticisi | Tam erişim |
| `manager` | Proje yöneticisi | Proje oluşturma, üye yönetimi |
| `member` | Takım üyesi | Görev yönetimi, yorum yapma |
| `viewer` | Görüntüleyici | Salt okunur erişim |

### Örnek Middleware (Node.js)
```javascript
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.sub);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## 📦 Veri Modelleri (TypeScript)

```typescript
// User
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  department?: string;
  phone?: string;
  location?: string;
  bio?: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  level: number;
  totalXp: number;
  currentXp: number;
  xpToNextLevel: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// Project
interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'At Risk' | 'Cancelled';
  methodology: 'Waterfall' | 'Scrum' | 'Hybrid';
  progress: number;
  budget?: number;
  budgetUsed: number;
  startDate: string;
  endDate: string;
  actualEndDate?: string;
  manager: UserSummary;
  createdBy: UserSummary;
  color: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  tags: string[];
  teamSize: number;
  tasksCompleted: number;
  totalTasks: number;
  createdAt: string;
  updatedAt: string;
}

// Task
interface Task {
  id: string;
  projectId: string;
  sprintId?: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  status: 'Todo' | 'In Progress' | 'Review' | 'Done' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignee?: UserSummary;
  reporter: UserSummary;
  estimatedHours?: number;
  loggedHours: number;
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  xpReward: number;
  createdAt: string;
  updatedAt: string;
}

// Sprint
interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  status: 'Planning' | 'Active' | 'Completed' | 'Cancelled';
  startDate: string;
  endDate: string;
  plannedPoints: number;
  completedPoints: number;
  createdAt: string;
  updatedAt: string;
}

// Document
interface Document {
  id: string;
  projectId: string;
  taskId?: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: UserSummary;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  aiSummary?: string;
  aiFindings?: Finding[];
  aiRisks?: Risk[];
  aiActions?: Action[];
  aiTags?: string[];
  analyzedAt?: string;
  createdAt: string;
}

// KPI
interface KPI {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  measurementFrequency: 'daily' | 'weekly' | 'monthly' | 'sprint';
  lastMeasuredAt?: string;
  history: KPIHistoryItem[];
}

// Badge
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  xpReward: number;
  criteriaType: 'tasks_completed' | 'projects_completed' | 'xp_earned' | 'streak_days' | 'specific_action';
  criteriaValue: number;
  criteriaDetails?: object;
}

// Notification
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'xp' | 'badge' | 'task' | 'mention' | 'deadline';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  readAt?: string;
  context?: object;
  createdAt: string;
}

// CalendarEvent
interface CalendarEvent {
  id: string;
  projectId?: string;
  title: string;
  description?: string;
  type: 'meeting' | 'deadline' | 'task' | 'milestone' | 'other';
  startTime: string;
  endTime?: string;
  allDay: boolean;
  isRecurring: boolean;
  recurrenceRule?: string;
  meetingUrl?: string;
  location?: string;
  createdBy: UserSummary;
  attendees: EventAttendee[];
  color: string;
  createdAt: string;
}

// Helper Types
interface UserSummary {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Finding {
  type: 'positive' | 'negative' | 'neutral';
  content: string;
}

interface Risk {
  severity: 'low' | 'medium' | 'high' | 'critical';
  content: string;
  page?: number;
}

interface Action {
  title: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

interface KPIHistoryItem {
  value: number;
  recordedAt: string;
}

interface EventAttendee {
  user: UserSummary;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
}
```

---

## ⚙️ İş Kuralları

### Proje Kuralları
1. **Proje oluşturma**: Sadece `admin` ve `manager` rolleri
2. **Proje silme**: Sadece proje sahibi veya `admin`
3. **Durum değişiklikleri**:
   - `Active` → `Completed`, `On Hold`, `At Risk`
   - `On Hold` → `Active`, `Cancelled`
   - `At Risk` → `Active`, `Cancelled`
4. **Progress hesaplama**: `(completedTasks / totalTasks) * 100`

### Görev Kuralları
1. **Görev tamamlama**: 
   - Status `Done` olduğunda XP verilir
   - Atanan kişiye XP eklenir
   - Streak güncellenir
2. **Öncelik bazlı XP çarpanı**:
   - Low: 1x
   - Medium: 1.5x
   - High: 2x
   - Urgent: 2.5x
3. **Zamanında tamamlama bonusu**: +50% XP

### Gamification Kuralları
1. **Seviye sistemi**:
   - Her seviye için gereken XP: `level * 1000`
   - Seviye atlama: Bildirim + ses efekti
2. **XP Kaynakları**:

| Kaynak | XP |
|--------|-----|
| Görev tamamlama | 10-50 (önceliğe göre) |
| Yorum yapma | 5 |
| Doküman yükleme | 10 |
| AI analizi tetikleme | 15 |
| Rozet kazanma | 25-100 |
| Streak bonusu (7 gün) | 50 |
| Streak bonusu (30 gün) | 200 |

3. **Rozet kriterleri örnekleri**:
   - "Proje Ustası": 10 proje tamamla
   - "Takım Lideri": 5 projede liderlik yap
   - "Hız Ustası": 50 görevi zamanında tamamla
   - "Dokümantasyon Uzmanı": 25 doküman yükle

### Bildirim Kuralları
1. **Gerçek zamanlı bildirimler**:
   - Görev ataması
   - Mention (@kullanıcı)
   - Son tarih yaklaşması (24 saat önce)
   - XP/Rozet kazanımı
2. **Email bildirimleri**:
   - Günlük özet (isteğe bağlı)
   - Haftalık rapor (isteğe bağlı)

---

## 🎮 Gamification Sistemi

### XP Hesaplama
```javascript
function calculateTaskXP(task, completedOnTime) {
  const baseXP = task.xpReward || 10;
  
  // Öncelik çarpanı
  const priorityMultiplier = {
    'Low': 1,
    'Medium': 1.5,
    'High': 2,
    'Urgent': 2.5
  }[task.priority];
  
  // Zamanında tamamlama bonusu
  const onTimeBonus = completedOnTime ? 1.5 : 1;
  
  return Math.floor(baseXP * priorityMultiplier * onTimeBonus);
}
```

### Seviye Sistemi
```javascript
function calculateLevel(totalXP) {
  let level = 1;
  let xpNeeded = 1000;
  let remainingXP = totalXP;
  
  while (remainingXP >= xpNeeded) {
    remainingXP -= xpNeeded;
    level++;
    xpNeeded = level * 1000;
  }
  
  return {
    level,
    currentXP: remainingXP,
    xpToNextLevel: xpNeeded
  };
}
```

### Rozet Kontrolü
```javascript
async function checkBadgeUnlock(userId, actionType, actionData) {
  const user = await User.findById(userId);
  const unlockedBadges = [];
  
  const badges = await Badge.find({ criteriaType: actionType });
  
  for (const badge of badges) {
    const isEarned = await UserBadge.exists({ userId, badgeId: badge.id });
    if (isEarned) continue;
    
    const qualifies = await checkCriteria(user, badge, actionData);
    if (qualifies) {
      await UserBadge.create({ userId, badgeId: badge.id });
      await addXP(userId, badge.xpReward, 'badge', badge.id);
      await createNotification(userId, 'badge', {
        title: 'Yeni Rozet!',
        message: `"${badge.name}" rozetini kazandınız!`,
        badgeId: badge.id
      });
      unlockedBadges.push(badge);
    }
  }
  
  return unlockedBadges;
}
```

---

## 🤖 AI Entegrasyonu

### Doküman Analizi İş Akışı

1. **Doküman Yükleme**
```javascript
// POST /documents/upload
async function uploadDocument(file, metadata) {
  // 1. Dosyayı S3'e yükle
  const fileUrl = await s3.upload(file);
  
  // 2. Veritabanına kaydet
  const document = await Document.create({
    ...metadata,
    fileUrl,
    analysisStatus: 'pending'
  });
  
  // 3. Analiz kuyruğuna ekle
  await messageQueue.publish('document-analysis', {
    documentId: document.id,
    fileUrl,
    fileType: file.mimetype
  });
  
  return document;
}
```

2. **AI Analizi (Worker)**
```javascript
// Background worker
async function analyzeDocument(job) {
  const { documentId, fileUrl, fileType } = job.data;
  
  await Document.updateOne(
    { _id: documentId },
    { analysisStatus: 'processing' }
  );
  
  try {
    // 1. Dosyayı indir ve text'e çevir
    const text = await extractText(fileUrl, fileType);
    
    // 2. AI ile analiz et
    const analysis = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Sen bir proje yönetimi uzmanısın. Verilen dokümanı analiz et ve şunları çıkar:
            1. Yönetici özeti (max 200 kelime)
            2. Öne çıkan bulgular (pozitif ve negatif)
            3. Tespit edilen riskler (kritiklik seviyesi ile)
            4. Önerilen aksiyonlar
            5. Anahtar kelimeler/etiketler
            
            JSON formatında yanıt ver.`
        },
        {
          role: "user",
          content: text
        }
      ]
    });
    
    const result = JSON.parse(analysis.choices[0].message.content);
    
    // 3. Sonuçları kaydet
    await Document.updateOne(
      { _id: documentId },
      {
        analysisStatus: 'completed',
        aiSummary: result.summary,
        aiFindings: result.findings,
        aiRisks: result.risks,
        aiActions: result.actions,
        aiTags: result.tags,
        analyzedAt: new Date()
      }
    );
    
    // 4. Kullanıcıya bildirim gönder
    const document = await Document.findById(documentId).populate('uploadedBy');
    await createNotification(document.uploadedBy._id, 'info', {
      title: 'Doküman Analizi Tamamlandı',
      message: `"${document.name}" dokümanının AI analizi hazır.`,
      actionUrl: `/documents/${documentId}`
    });
    
    // 5. XP ver
    await addXP(document.uploadedBy._id, 15, 'document', documentId);
    
  } catch (error) {
    await Document.updateOne(
      { _id: documentId },
      { analysisStatus: 'failed' }
    );
    throw error;
  }
}
```

3. **AI Önerileri (Dashboard)**
```javascript
// Günlük çalışan job
async function generateAISuggestions() {
  const projects = await Project.find({ status: 'Active' });
  
  for (const project of projects) {
    const metrics = await calculateProjectMetrics(project.id);
    
    const suggestions = [];
    
    // Sprint hızı analizi
    if (metrics.velocityTrend < -10) {
      suggestions.push({
        type: 'warning',
        project: project.title,
        message: `Sprint hızı düşüyor (%${Math.abs(metrics.velocityTrend)}). Ek kaynak planlaması önerilir.`
      });
    }
    
    // Bütçe analizi
    if (metrics.budgetUsageRate > metrics.progressRate + 10) {
      suggestions.push({
        type: 'warning',
        project: project.title,
        message: `Bütçe kullanımı (%${metrics.budgetUsageRate}) ilerlemenin (%${metrics.progressRate}) önünde gidiyor.`
      });
    }
    
    // Risk analizi
    if (metrics.overdueTasksCount > 5) {
      suggestions.push({
        type: 'error',
        project: project.title,
        message: `${metrics.overdueTasksCount} adet gecikmiş görev var. Önceliklendirme yapılmalı.`
      });
    }
    
    // Önerileri kaydet ve bildirim gönder
    for (const suggestion of suggestions) {
      await AISuggestion.create(suggestion);
      await notifyProjectManager(project.managerId, suggestion);
    }
  }
}
```

---

## 📡 WebSocket Olayları

### Bağlantı
```javascript
// Client
const socket = io('wss://api.metrika.com', {
  auth: {
    token: accessToken
  }
});

// Server
io.on('connection', (socket) => {
  const user = socket.user;
  
  // Kullanıcıyı odalarına ekle
  socket.join(`user:${user.id}`);
  
  for (const project of user.projects) {
    socket.join(`project:${project.id}`);
  }
  
  // Online durumunu güncelle
  User.updateOne({ _id: user.id }, { status: 'online' });
  
  socket.on('disconnect', () => {
    User.updateOne({ _id: user.id }, { status: 'offline' });
  });
});
```

### Olaylar

#### Server → Client

| Olay | Açıklama | Payload |
|------|----------|---------|
| `notification` | Yeni bildirim | `{ id, type, title, message }` |
| `task:updated` | Görev güncellendi | `{ taskId, changes, updatedBy }` |
| `task:created` | Yeni görev | `{ task }` |
| `project:updated` | Proje güncellendi | `{ projectId, changes }` |
| `comment:added` | Yeni yorum | `{ taskId, comment }` |
| `user:status` | Kullanıcı durumu değişti | `{ userId, status }` |
| `xp:earned` | XP kazanıldı | `{ amount, reason, newTotal }` |
| `level:up` | Seviye atlandı | `{ newLevel, message }` |
| `badge:earned` | Rozet kazanıldı | `{ badge }` |

#### Client → Server

| Olay | Açıklama | Payload |
|------|----------|---------|
| `typing:start` | Yazmaya başladı | `{ taskId }` |
| `typing:stop` | Yazmayı bıraktı | `{ taskId }` |
| `presence:update` | Durum güncelleme | `{ status }` |

---

## 🚀 Deployment Önerileri

### Docker Compose Örneği
```yaml
version: '3.8'

services:
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/metrika
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=metrika
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  worker:
    build: ./backend
    command: npm run worker
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/metrika
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
  redis_data:
```

### Ortam Değişkenleri
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/metrika

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# File Storage
S3_BUCKET=metrika-documents
S3_REGION=eu-central-1
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx

# AI
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-4

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@metrika.com
SMTP_PASS=xxx

# Frontend
FRONTEND_URL=https://app.metrika.com
```

---

## 📝 Notlar

1. **Rate Limiting**: Tüm endpoint'lerde rate limiting uygulanmalı (örn: 100 req/min)
2. **Validation**: Tüm input'lar Joi/Zod ile validate edilmeli
3. **Logging**: Winston/Pino ile structured logging
4. **Monitoring**: Prometheus + Grafana
5. **Error Handling**: Global error handler middleware
6. **API Documentation**: Swagger/OpenAPI ile dokümantasyon
7. **Testing**: Jest/Vitest ile unit ve integration testler

---

Bu doküman, Metrika projesi için tam kapsamlı bir backend rehberi niteliğindedir. Herhangi bir AI coding asistanı bu dokümana dayanarak projeyle tam uyumlu bir backend oluşturabilir.
