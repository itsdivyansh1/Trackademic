# Trackademic - Code Index & Architecture Overview

## Project Overview
**Trackademic** is a comprehensive academic portfolio management system that allows users to manage research publications, achievements, and academic forms. It's built with a modern full-stack architecture using Node.js/Express backend and Next.js frontend.

## Architecture

### Backend (Server)
- **Framework**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Passport.js with session-based auth
- **File Storage**: AWS S3 for document storage
- **Session Management**: Redis for session storage
- **Validation**: Zod for schema validation
- **File Processing**: PDF parsing for paper verification

### Frontend (Web)
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom components built on Radix UI primitives
- **Theme**: Dark/Light mode support with next-themes

## Database Schema

### Core Models

#### User Model
```prisma
model User {
  id           String  @id @default(uuid())
  name         String
  email        String  @unique
  password     String
  department   String
  stdId        String? // Student ID (format: 2023DSIT010)
  phone        String
  role         Role    @default(STUDENT) // STUDENT, FACULTY, ADMIN
  isApproved   Boolean @default(false)
  profileImage String?
  
  // Relations
  achievements         Achievement[]
  publications        ResearchPublication[]
  approvedAchievements Achievement[]
  approvedPublications ResearchPublication[]
  createdForms        Form[]
  formSubmissions     FormSubmission[]
}
```

#### Achievement Model
```prisma
model Achievement {
  id          String     @id @default(uuid())
  title       String
  description String
  category    String?
  date        DateTime
  fileUrl     String
  visibility  Visibility @default(PUBLIC)
  
  // Creator & Approval
  user         User   @relation(fields: [userId], references: [id])
  userId       String
  isApproved   Boolean @default(false)
  approvedBy   User?   @relation(fields: [approvedById], references: [id])
  approvedById String?
}
```

#### Research Publication Model
```prisma
model ResearchPublication {
  id                String     @id @default(uuid())
  title             String
  abstract          String
  authors           Json?      // Array of author names
  publicationYear   Int
  journalConference String
  doi               String
  fileUrl           String
  publishedAt       DateTime
  visibility        Visibility @default(PUBLIC)
  
  // Creator & Approval
  user         User   @relation(fields: [userId], references: [id])
  userId       String
  isApproved   Boolean @default(false)
  approvedBy   User?   @relation(fields: [approvedById], references: [id])
  approvedById String?
}
```

#### Form Builder System
```prisma
model Form {
  id          String        @id @default(uuid())
  title       String
  description String?
  slug        String        @unique
  category    FormCategory  @default(GENERIC)
  isOpen      Boolean       @default(true)
  
  createdBy   User          @relation(fields: [createdById], references: [id])
  createdById String
  fields      FormField[]
  submissions FormSubmission[]
}

model FormField {
  id       String    @id @default(uuid())
  form     Form      @relation(fields: [formId], references: [id])
  formId   String
  label    String
  type     FieldType // TEXT, NUMBER, TEXTAREA, EMAIL, SELECT, RADIO, CHECKBOX, DATE
  required Boolean   @default(false)
  options  Json?     // For SELECT, RADIO, CHECKBOX
}

model FormSubmission {
  id        String    @id @default(uuid())
  form      Form      @relation(fields: [formId], references: [id])
  formId    String
  user      User      @relation(fields: [userId], references: [id])
  userId    String
  answers   SubmissionAnswer[]
  
  @@unique([formId, userId]) // One submission per user per form
}
```

## API Endpoints

### Authentication Routes (`/api/v1/auth`)
- `POST /register` - User registration with profile image upload
- `POST /login` - User login with email/password
- `POST /logout` - User logout
- `GET /profile` - Get current user profile

### Achievement Routes (`/api/v1/achievement`)
- `POST /` - Create achievement with file upload
- `GET /public` - List public approved achievements
- `GET /my` - List user's achievements (public + private)
- `PUT /:id` - Update achievement
- `DELETE /:id` - Delete achievement
- `PUT /approve/:id` - Admin approval of achievement

### Publication Routes (`/api/v1/publication`)
- `POST /` - Create publication with PDF verification
- `PUT /:id` - Update publication
- `GET /my` - List user's publications
- `GET /user` - List user's approved publications
- `GET /public` - List public approved publications
- `DELETE /:id` - Delete publication
- `PUT /approve/:id` - Admin approval of publication
- `GET /admin/all` - Admin view of all publications

### Form Routes (`/api/v1/forms`)
- `POST /` - Create form (Faculty/Admin only)
- `GET /` - List forms (role-based visibility)
- `GET /mine` - List user's created forms
- `GET /:slug` - Get form by slug
- `PATCH /:id` - Update form
- `DELETE /:id` - Delete form
- `POST /:slug/submit` - Submit form response
- `GET /:slug/submissions` - View form submissions
- `GET /submissions/mine` - View user's submissions

## Key Features

### 1. Paper Verification System
- **Automatic PDF Analysis**: Extracts DOI, ISSN, or ISBN from uploaded papers
- **External API Integration**: 
  - CrossRef API for DOI verification
  - ISSN Portal for ISSN verification
  - Open Library for ISBN verification
- **Auto-Approval**: Papers with valid identifiers are automatically approved
- **Manual Review**: Papers without valid identifiers require admin approval

### 2. Role-Based Access Control
- **Students**: Can create achievements/publications, submit forms
- **Faculty**: Can create forms, view submissions, manage content
- **Admins**: Full access including approval workflows

### 3. File Management
- **AWS S3 Integration**: Secure file storage with signed URLs
- **Multiple Upload Types**: 
  - Profile images (direct S3 upload)
  - Achievement files (direct S3 upload)
  - Publication PDFs (memory upload for verification)

### 4. Form Builder System
- **Dynamic Forms**: Create custom forms with various field types
- **Role-Based Access**: Faculty/Admin can create, students can submit
- **Submission Tracking**: One submission per user per form
- **Form Categories**: Achievement, Certification, Generic

### 5. Dashboard & Analytics
- **Real-time Metrics**: Publication count, achievement count, activity feed
- **Recent Activity**: Shows latest publications and achievements
- **Role-Based Views**: Different dashboards for different user types

## Frontend Architecture

### Page Structure
```
/app/
├── (auth)/           # Authentication pages
│   ├── login/
│   └── register/
├── (marketing)/      # Marketing pages
├── admin/           # Admin-only pages
│   ├── achievements/
│   ├── publications/
│   └── users/
└── app/             # Main application
    ├── dashboard/
    ├── publications/
    ├── achievements/
    ├── profile/
    ├── form-builder/
    └── viewer/      # Document viewer
```

### Key Components

#### Authentication
- `AuthGate`: Protects routes and handles auth state
- `LoginForm`/`RegisterForm`: Authentication forms
- Session-based authentication with automatic redirects

#### UI Components
- **Sidebar Navigation**: Role-based menu items
- **Dashboard Cards**: Statistics and activity display
- **File Upload**: Drag-and-drop file uploads
- **Form Builder**: Dynamic form creation interface
- **Document Viewer**: PDF viewer for publications/achievements

#### State Management
- **TanStack Query**: Server state management
- **React Hook Form**: Form state management
- **Optimistic Updates**: Immediate UI feedback

## Security Features

### Authentication & Authorization
- Session-based authentication with Redis storage
- Password hashing with bcrypt
- Role-based route protection
- CSRF protection with session cookies

### File Security
- Signed URLs for S3 access (5-minute expiration)
- File type validation
- Secure file deletion on record removal

### Data Validation
- Zod schemas for all API inputs
- Type-safe database operations with Prisma
- Input sanitization and validation

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis server
- AWS S3 bucket
- pnpm package manager

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."

# Redis
REDIS_URL="redis://..."

# AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
S3_BUCKET_NAME="..."
AWS_REGION="..."

# Session
SESSION_SECRET="..."

# API
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### Installation
```bash
# Backend
cd server
pnpm install
pnpm prisma generate
pnpm prisma migrate dev

# Frontend
cd web
pnpm install
```

## Key Technologies & Libraries

### Backend Dependencies
- **express**: Web framework
- **prisma**: Database ORM
- **passport**: Authentication
- **bcrypt**: Password hashing
- **multer**: File upload handling
- **pdf-parse**: PDF text extraction
- **zod**: Schema validation
- **redis**: Session storage
- **aws-sdk**: S3 integration

### Frontend Dependencies
- **next**: React framework
- **react-query**: Server state management
- **react-hook-form**: Form handling
- **tailwindcss**: Styling
- **radix-ui**: UI primitives
- **lucide-react**: Icons
- **sonner**: Toast notifications
- **axios**: HTTP client

## Deployment Considerations

### Production Requirements
- PostgreSQL database with connection pooling
- Redis cluster for session management
- AWS S3 bucket with proper CORS configuration
- Environment variable management
- SSL/TLS certificates
- CDN for static assets

### Scalability Features
- Database connection pooling
- Redis session clustering
- S3 signed URL caching
- Optimized Prisma queries
- React Query caching strategies

## Future Enhancements

### Potential Features
- Citation tracking and metrics
- Collaboration tools for co-authors
- Integration with academic databases
- Advanced analytics and reporting
- Mobile application
- API rate limiting and monitoring
- Automated backup systems
- Multi-language support

---

This codebase represents a well-structured academic management system with modern development practices, comprehensive security measures, and scalable architecture suitable for educational institutions.
