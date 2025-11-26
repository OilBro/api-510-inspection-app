# API 510 Inspection App

A professional inspection management application for API 510 pressure vessel inspections.

## Project Structure

```
api-510-app-fixed/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utility libraries
│   │   ├── contexts/    # React contexts
│   │   └── hooks/       # Custom React hooks
│   ├── public/          # Static assets
│   └── index.html       # HTML entry point
├── server/              # Backend Express + tRPC server
│   ├── _core/          # Core server utilities
│   ├── routers/        # API route handlers
│   └── *.ts            # Business logic modules
├── shared/             # Shared code between client and server
├── drizzle/            # Database schema and migrations
└── scripts/            # Utility scripts

```

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Wouter (routing)
- **Backend**: Express, tRPC, Node.js
- **Database**: MySQL with Drizzle ORM
- **UI Components**: Radix UI, shadcn/ui
- **Build Tool**: Vite

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- pnpm (package manager)
- MySQL database

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Configure environment variables:
   Create a `.env` file with:
   ```
   DATABASE_URL=mysql://user:password@localhost:3306/api510
   NODE_ENV=development
   PORT=3000
   ```

3. Run database migrations:
   ```bash
   pnpm db:push
   ```

4. Start development server:
   ```bash
   pnpm dev
   ```

## Features

- **Inspection Management**: Create and manage pressure vessel inspections
- **Calculations**: API 510 compliant thickness and pressure calculations
- **Professional Reports**: Generate comprehensive PDF reports
- **Photo Management**: Upload, annotate, and organize inspection photos
- **Data Import**: Import data from Excel and PDF files
- **Nozzle Evaluations**: Track and evaluate nozzle conditions

## Known Issues & Fixes Applied

### Dependencies Fixed
- Added missing `superjson` for tRPC data serialization
- Added missing `nanoid` for ID generation
- Added `@dnd-kit/*` packages for drag-and-drop functionality
- Added `react-day-picker` for date selection
- Fixed `@tanstack/react-query` version compatibility with tRPC

### Type Errors Fixed
- Fixed type mismatch in PhotoChecklistPanel component
- Removed unused imports causing compilation warnings

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:generate` - Generate database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio (database GUI)

## Database Schema

The application uses the following main tables:
- `users` - User accounts
- `inspections` - Inspection records
- `calculations` - Calculation results
- `tmlReadings` - Thickness measurement locations
- `externalInspections` - External inspection data
- `internalInspections` - Internal inspection data
- `nozzleEvaluations` - Nozzle evaluation records
- `professionalReports` - Generated reports
- `photos` - Inspection photos

## Contributing

This is a professional inspection application. Please ensure all changes maintain compliance with API 510 standards.
