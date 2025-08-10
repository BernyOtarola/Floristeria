# FloraVista - Premium Florist E-commerce Platform

## Overview

FloraVista is a full-stack e-commerce application for a premium florist business specializing in fresh flowers and custom arrangements. The platform provides a modern shopping experience with features like product catalog browsing, shopping cart management, order processing, and an AI-powered customer service assistant. The application is built for the Colombian market with Spanish language support and local currency formatting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: Zustand with persistence for cart management and global state
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **UI Components**: Radix UI primitives for accessible, unstyled components
- **Data Fetching**: TanStack Query for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API with structured error handling and logging middleware
- **Development**: Hot reload with Vite integration for seamless full-stack development
- **Session Management**: Express sessions with PostgreSQL store for cart persistence

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless provider
- **Schema**: Structured tables for categories, products, cart items, coupons, orders, and reviews
- **Migrations**: Drizzle Kit for database schema management and versioning

### Data Storage Strategy
- **Development**: In-memory storage with MemStorage class for rapid prototyping
- **Production**: PostgreSQL database with connection pooling
- **Schema Design**: Normalized relational structure with foreign key relationships
- **Data Validation**: Zod schemas for runtime type checking and API validation

### Key Features
- **Product Catalog**: Categorized product browsing with filtering and search
- **Shopping Cart**: Persistent cart with quantity management and coupon support
- **Order Processing**: Multi-step checkout with delivery options (pickup/delivery)
- **AI Assistant**: OpenAI-powered customer service chatbot with business context
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints
- **Internationalization**: Spanish language support with Colombian peso formatting

### Business Logic
- **Pricing**: Colombian peso currency formatting with proper decimal handling
- **Delivery**: Dual delivery system (store pickup and home delivery)
- **Coupons**: Percentage-based discount system with expiration dates
- **Inventory**: Stock tracking with availability indicators
- **Reviews**: Customer rating and review system for products

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection for production database
- **drizzle-orm**: Type-safe ORM for database operations and query building
- **@tanstack/react-query**: Server state management and caching layer
- **express**: Web application framework for API endpoints and middleware

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives (dialog, dropdown, form controls)
- **tailwindcss**: Utility-first CSS framework for responsive design
- **class-variance-authority**: Type-safe variant API for component styling
- **lucide-react**: Modern icon library for consistent iconography

### Form and Validation
- **react-hook-form**: Performant form library with validation
- **@hookform/resolvers**: Integration layer for external validation libraries
- **zod**: TypeScript-first schema validation for runtime type checking

### AI Integration
- **openai**: Official OpenAI API client for GPT-4 chat completions
- **Custom AI Assistant**: Business-specific prompts and context for customer service

### Development Tools
- **vite**: Fast build tool with hot module replacement
- **tsx**: TypeScript execution environment for development
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for debugging

### Third-party Integrations
- **WhatsApp Business API**: Order messaging integration for customer communication
- **Social Media**: Facebook and Instagram integration for business presence
- **Google Fonts**: Playfair Display and Inter fonts for premium typography