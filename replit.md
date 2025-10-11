# API 510 Pressure Vessel Inspection Application

## Overview
A comprehensive, professional-grade web application for API 510 pressure vessel inspections, designed for excellence in the pressure vessel inspection industry.

## Application Features
- **Vessel Data Management**: Complete vessel specifications, materials, and operating conditions
- **Engineering Calculations**: ASME Section VIII and API 510 compliant calculations  
- **Thickness Analysis**: TML data management and corrosion rate calculations
- **External/Internal Inspection**: Comprehensive inspection workflows
- **In-Lieu Inspection**: On-stream inspection alternatives
- **Fitness-for-Service**: API 579 compliant assessments
- **Repairs & Alterations**: Documentation and evaluation
- **Pressure Testing**: Hydrostatic and pneumatic test procedures
- **Pressure Relief Devices**: Relief valve inspection and testing
- **Inspection Planning**: Interval calculations and scheduling
- **Professional Reporting**: Comprehensive report generation

## Technology Stack
- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS 4 with Shadcn UI components
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Routing**: React Router DOM
- **Backend**: Express 4 (serving static files)

## Project Structure
```
/
├── src/                    # React application source
│   ├── components/        # React components including UI library
│   ├── utils/            # Calculation engines and material database
│   ├── App.jsx           # Main application component
│   └── main.jsx          # Application entry point
├── dist/                  # Production build output
├── server/               # Express server for deployment
│   └── index.ts          # Static file server
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## Available Commands
- `pnpm install` - Install dependencies
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `npx tsx server/index.ts` - Run production server

## Deployment Configuration
The application is configured to run on port 5000 and serve the built static files from the `dist/` directory. The Express server handles client-side routing by serving index.html for all routes.

## Standards Compliance
- API 510: Pressure Vessel Inspection Code
- API 572: Inspection Practices for Pressure Vessels
- API 579: Fitness-for-Service Assessment
- ASME Section VIII: Pressure Vessel Design
- ASME Section II: Materials Specifications

## Recent Changes
- **2025-10-11**: Deployed from GitHub repository, configured Express 4 server for static file serving, production build created and tested successfully

## Target Users
- API 510 Certified Inspectors
- Inspection Companies
- Plant Engineers
- Regulatory Bodies
- Training Organizations
