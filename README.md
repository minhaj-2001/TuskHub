# WorkStageTracker - Project Management Application

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Installation Guide](#installation-guide)
5. [Environment Configuration](#environment-configuration)
6. [Project Structure](#project-structure)
7. [Database Schema](#database-schema)
8. [API Documentation](#api-documentation)
9. [Frontend Architecture](#frontend-architecture)
10. [Backend Architecture](#backend-architecture)
11. [Authentication & Authorization](#authentication--authorization)
12. [Role-Based Access Control](#role-based-access-control)
13. [Usage Guide](#usage-guide)
14. [PDF Export Feature](#pdf-export-feature)
15. [Development Workflow](#development-workflow)
16. [Testing](#testing)
17. [Deployment](#deployment)
18. [Troubleshooting](#troubleshooting)
19. [Contributing](#contributing)
20. [License](#license)

## Project Overview

WorkStageTracker is a comprehensive project management application designed to streamline project workflows with role-based access control. It enables managers to create, manage, and track projects while providing team members with appropriate access levels for viewing progress and collaborating effectively.

### Key Objectives
- Simplify project management with intuitive stage-based tracking
- Implement role-based access control for secure collaboration
- Provide visual analytics and reporting capabilities
- Enable seamless team collaboration through invite system
- Export project details for stakeholder communication

## Features

### Core Functionality
- **Project Management**: Create, edit, delete, and track projects with custom stages
- **Stage Tracking**: Define project stages with start and completion dates
- **Role-Based Access Control**: Managers have full access, users have limited view-only access
- **Team Collaboration**: Managers can invite team members via unique invite links
- **Visual Analytics**: Dashboard with charts and statistics for project insights
- **PDF Export**: Export project details as PDF reports in table or card view format
- **Email Integration**: Automated email notifications for verification and project sharing

### User Roles & Capabilities

#### Manager Capabilities
- Create unlimited projects
- Define custom project stages
- Create stage connections and workflows
- Invite team members with limited access
- Export project reports as PDF
- Full CRUD operations on projects and stages
- View all projects owned by the manager
- Access to complete dashboard with all analytics

#### User Capabilities
- View projects assigned by their manager
- Track project progress and stages
- Limited dashboard access with relevant statistics
- Cannot modify projects or create new ones
- Cannot invite other users
- Cannot access stage management features
- View-only access to project stages

### Dashboard Features
- Project statistics and overview cards
- Visual charts for project status distribution
- Project completion tracking over time
- Stage completion time analysis
- Project filtering and search functionality
- Time-based analytics (monthly/yearly views)

## Technology Stack

### Frontend Technologies
- **React 18** with TypeScript for type safety and modern React features
- **React Router v7** for file-based routing system
- **React Query** for server state management and API caching
- **Tailwind CSS** for utility-first styling
- **Shadcn/ui** for accessible, reusable UI components
- **React Hook Form** with Zod validation for form handling
- **Lucide React** for consistent iconography
- **Recharts** for data visualization and charts
- **Sonner** for toast notifications

### Backend Technologies
- **Node.js** with Express.js for server runtime
- **MongoDB** with Mongoose ORM for database operations
- **JWT (JSON Web Tokens)** for stateless authentication
- **bcrypt** for secure password hashing
- **Nodemailer** for email services
- **Puppeteer** for PDF generation from HTML
- **Handlebars** for HTML templating in PDF generation
- **Arcjet** for security, bot detection, and rate limiting

### Development Tools
- **Vite** for fast build tooling and development server
- **ESLint** for code quality and consistency
- **Prettier** for code formatting
- **Husky** for Git hooks and pre-commit checks
- **TypeScript** for static type checking

## Installation Guide

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager
- Git for version control

### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/WorkStageTracker.git
   cd WorkStageTracker


1. **Backend Setup**
   ```bash
   cd backend
npm install




