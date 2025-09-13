# replit.md

## Overview

This is a Student Interaction Portal - a comprehensive academic management system built with a modern full-stack architecture. The application facilitates communication and coordination between students, faculty, and administrators through features like course management, forums, real-time chat, assignment submission, document sharing, calendar events, and analytics dashboards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with role-based access control
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation schemas
- **Real-time Communication**: WebSocket integration for live chat and notifications

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with conventional HTTP methods and status codes
- **Real-time Features**: WebSocket server for live messaging and notifications
- **File Handling**: Multer middleware for file uploads with local storage
- **Session Management**: Express sessions with PostgreSQL store for persistence

### Authentication & Authorization
- **Provider**: Replit OIDC (OpenID Connect) authentication
- **Strategy**: Passport.js with OpenID Connect strategy
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Role-based Access**: Support for student, faculty, admin, and TA roles
- **Security**: HTTP-only cookies, secure session configuration, CSRF protection

### Database Design
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema**: Comprehensive relational design supporting:
  - User management with role-based permissions
  - Course enrollment and management
  - Forum discussions with threads and replies
  - Assignment creation and submission tracking
  - Document versioning and sharing
  - Calendar events and scheduling
  - Real-time messaging system
  - Activity logging and analytics
  - Notification system

### Data Storage Strategy
- **Primary Data**: PostgreSQL for relational data with foreign key constraints
- **File Storage**: Local filesystem for uploaded documents and assignments
- **Session Data**: PostgreSQL sessions table for authentication persistence
- **Real-time Data**: In-memory WebSocket connection management

### Development & Deployment
- **Build System**: Vite for frontend bundling with TypeScript compilation
- **Backend Bundling**: esbuild for server-side code bundling
- **Development**: Hot module replacement for frontend, nodemon-style restart for backend
- **Environment**: Separate development and production configurations
- **Database Migrations**: Drizzle Kit for schema migrations and database management

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database driver for Neon
- **drizzle-orm**: Type-safe ORM with PostgreSQL adapter
- **express**: Web application framework for Node.js
- **passport**: Authentication middleware with OpenID Connect strategy

### UI & Component Libraries
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **@tanstack/react-query**: Server state management and caching
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Feather icon library for React

### Development Tools
- **typescript**: Type checking and compilation
- **vite**: Frontend build tool and development server
- **drizzle-kit**: Database migration and introspection tools
- **@replit/vite-plugin-***: Replit-specific development plugins

### Real-time & Communication
- **ws**: WebSocket implementation for real-time features
- **multer**: File upload handling middleware

### Authentication & Security
- **openid-client**: OpenID Connect client implementation
- **express-session**: Session middleware for Express
- **connect-pg-simple**: PostgreSQL session store adapter

### Form Handling & Validation
- **react-hook-form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for various schema libraries
- **zod**: TypeScript-first schema declaration and validation

The application is designed as a monorepo with shared type definitions, enabling type safety across the full stack while maintaining separation of concerns between client and server code.