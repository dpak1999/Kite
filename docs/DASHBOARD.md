# Kite Admin Dashboard Documentation

## Table of Contents
- [Overview](#overview)
- [Purpose & Functionality](#purpose--functionality)
- [Routes & Pages](#routes--pages)
- [Features Implemented](#features-implemented)
- [Components](#components)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Data Models & Integrations](#data-models--integrations)
- [Key Features & Smart Behaviors](#key-features--smart-behaviors)
- [File Structure](#file-structure)
- [Setup & Development](#setup--development)

## Overview

The **Kite Admin Dashboard** (branded as "Stocker") is a comprehensive web-based administration panel for managing investment portfolios and market instruments. It serves as both an administrative tool and user-facing platform built with Next.js 16, React 19, and TypeScript.

**Location**: `/apps/web`

## Purpose & Functionality

The admin dashboard allows users to:

- Track and manage stock and mutual fund holdings
- Search and add financial instruments (stocks and mutual funds) to watchlists
- View real-time price data and historical performance charts
- Manage user portfolios and investment records
- Access interactive API documentation for external integrations
- Monitor market overview with summary statistics
- View user registration and activity data

## Routes & Pages

The application follows Next.js 16 App Router conventions:

### Route Structure

```
/ (Root)                        - Landing/Login Page
└── /dashboard                  - Protected Dashboard Area
    ├── /                       - Dashboard Home (Market Overview)
    ├── /users                  - User Management Page
    ├── /holdings               - Holdings Overview
    │   └── /[userId]           - Individual User Portfolio Details
    ├── /instruments            - Instruments Management
    │   ├── /[symbol]           - Individual Instrument Details
    │   └── /add                - Add New Instrument
    ├── /api                    - API Reference & Documentation
    └── /settings               - Settings (Placeholder)
```

### Page Details

#### 1. Home Page (`/`)
- **Purpose**: Landing page with authentication
- **Access**: Public
- **Features**:
  - Clerk authentication integration
  - Redirect to dashboard if authenticated
  - Sign-in prompt for unauthenticated users

#### 2. Dashboard Home (`/dashboard`)
- **Purpose**: Market overview and summary statistics
- **Access**: Protected (requires authentication)
- **Features**:
  - Summary cards with key metrics
  - Total stocks and mutual funds count
  - User count display
  - Holdings summary statistics
  - Price table with current market data
  - Last update timestamp

#### 3. Users Management (`/dashboard/users`)
- **Purpose**: View and manage registered users
- **Access**: Protected
- **Features**:
  - User listing with profile information
  - Display signup date and last login
  - Avatar images from Clerk with fallback initials
  - User email and name display
  - User count statistics

#### 4. Holdings Overview (`/dashboard/holdings`)
- **Purpose**: Overview of all user portfolios
- **Access**: Protected
- **Features**:
  - Summary cards showing total invested amounts
  - Portfolio statistics across all users
  - List of users with their holdings
  - Quick navigation to individual portfolios
  - Holdings count per user

#### 5. Holdings Detail (`/dashboard/holdings/[userId]`)
- **Purpose**: Manage individual user's portfolio
- **Access**: Protected
- **Features**:
  - Complete stock holdings list for user
  - Complete mutual fund holdings list for user
  - Add new holdings modal with instrument search
  - Edit existing holdings with quantity/price updates
  - Delete holdings with confirmation
  - Date-based auto-fill for purchase price/NAV
  - Real-time total invested calculations
  - Current value and P&L tracking

#### 6. Instruments Management (`/dashboard/instruments`)
- **Purpose**: Search and manage financial instruments
- **Access**: Protected
- **Features**:
  - Tabbed interface (All / Stocks / Mutual Funds)
  - Real-time stock search with validation
  - Debounced mutual fund search
  - Add instruments to watchlist
  - Delete instruments from database
  - View historical data modals
  - Fetch historical price/NAV data
  - Pagination for historical data (10 items per page)
  - Display current price, NAV, and market changes

#### 7. Instrument Detail (`/dashboard/instruments/[symbol]`)
- **Purpose**: Detailed view of individual instrument
- **Access**: Protected
- **Status**: Placeholder for future implementation
- **Planned Features**:
  - Comprehensive instrument details
  - Chart visualization of historical data
  - Holdings tracking for this instrument
  - Performance metrics

#### 8. API Documentation (`/dashboard/api`)
- **Purpose**: Interactive API reference
- **Access**: Protected
- **Features**:
  - Swagger/OpenAPI specification viewer
  - Interactive endpoint playground
  - Test API endpoints directly from dashboard
  - Dynamic form generation for endpoint parameters
  - Response viewer with syntax highlighting
  - Copy-paste ready API examples

#### 9. Settings (`/dashboard/settings`)
- **Purpose**: User and application settings
- **Access**: Protected
- **Status**: Placeholder for future implementation
- **Planned Features**:
  - User preferences
  - Theme settings
  - Notification preferences
  - API key management

## Features Implemented

### Authentication & Security
- **Clerk Integration**: OAuth-based user authentication with multiple providers
- **Protected Routes**: Dashboard routes protected via middleware at `/dashboard/*`
- **User Sync**: Automatic synchronization of logged-in users to Convex database
- **Session Management**: Persistent login sessions across page refreshes
- **User Profiles**: Profile images, names, and email synced from Clerk

### Instruments Management
- **Stock Search**: Real-time search by company name or ticker symbol
  - Smart caching: checks Convex database before API call
  - Validation of search results
  - Display of current price, change %, and 52-week range
- **Mutual Fund Search**: Debounced search (500ms) for optimal performance
  - Live results as you type
  - Display of NAV, fund size, and category
  - Scheme type and risk level information
- **Add Instruments**: Add stocks and mutual funds to watchlist with full details
- **Delete Instruments**: Remove instruments with cascading deletion of historical data
- **Tabbed Interface**: Filter view by All, Stocks, or Mutual Funds

### Historical Data
- **Stock Historical Data**:
  - Fetch 5-year price history from Indian Stock API
  - Display in paginated modal (10 records per page)
  - Date and price columns with formatted display
  - Navigation controls (First, Previous, Next, Last)
- **Mutual Fund Historical NAV**:
  - Fetch NAV history from MFAPI
  - Paginated modal display
  - Date and NAV columns
  - Consistent pagination controls
- **Date-based Auto-fill**:
  - When adding holdings, select purchase date
  - System auto-populates price/NAV from historical data
  - Fallback to manual entry if no data available
- **Bulk Fetch**: Fetch historical data for multiple instruments simultaneously

### Holdings Management
- **User Portfolio Overview**: Summary cards showing total invested amounts by asset type
- **Stock Holdings**:
  - Create new stock holdings with quantity and average buy price
  - View all stock holdings for a user
  - Update quantity and price with edit modal
  - Delete holdings with confirmation
  - Real-time total invested calculation (quantity × avgBuyPrice)
- **Mutual Fund Holdings**:
  - Create new MF holdings with units and average NAV
  - View all mutual fund holdings for a user
  - Update units and NAV with edit modal
  - Delete holdings with confirmation
  - Real-time total invested calculation (units × avgNav)
- **Portfolio Summary**:
  - Statistics dashboard with user count
  - Total holdings count across all users
  - Total invested amount aggregation

### User Management
- **User Listing**: View all registered users with complete profile information
- **User Details**: Display signup date, last login timestamp, name, and email
- **User Profiles**: Avatar display from Clerk with fallback to initials for missing images
- **User Count**: Real-time count of registered users

### Market Data
- **Price Table**:
  - Display current prices for all instruments
  - Change indicators with color coding (green for positive, red for negative)
  - Percentage change with directional arrows
  - Sort by various columns
- **Market Overview**:
  - Show top gainers and losers
  - Total instruments count
  - Market statistics
- **Real-time Updates**: Last update timestamp tracking with refresh capability

### API Documentation
- **Swagger Parser**: Load and parse OpenAPI specifications from JSON
- **Interactive Playground**:
  - Test API endpoints directly from dashboard
  - No external tools required
  - View responses in real-time
- **Parameter UI**:
  - Dynamic form generation based on endpoint parameters
  - Type validation (string, number, boolean, etc.)
  - Required vs optional field indication
- **Response Viewer**:
  - Display API responses with formatted JSON
  - Syntax highlighting for readability
  - Status code and headers display

## Components

### Layout Components

#### `layout.tsx` (Root)
- **Location**: `/apps/web/src/app/layout.tsx`
- **Purpose**: Root application layout
- **Features**:
  - HTML document structure
  - Metadata configuration (title, description)
  - Font configuration (Inter, Geist Sans, Geist Mono)
  - Convex client provider wrapper
  - Global styles import

#### `ConvexClientProvider.tsx`
- **Location**: `/apps/web/src/app/ConvexClientProvider.tsx`
- **Purpose**: Client-side provider wrapper
- **Features**:
  - Clerk provider integration
  - Convex React client setup
  - Authentication state management
  - Client-only rendering enforcement

#### Dashboard Layout (`dashboard/layout.tsx`)
- **Location**: `/apps/web/src/app/dashboard/layout.tsx`
- **Purpose**: Dashboard-specific layout with navigation
- **Features**:
  - Sidebar navigation with icons
  - User navigation dropdown
  - Breadcrumb support
  - Protected route wrapper
  - Responsive design (mobile-friendly sidebar)

#### `DashboardClientWrapper.tsx`
- **Location**: `/apps/web/src/app/dashboard/DashboardClientWrapper.tsx`
- **Purpose**: Dashboard-level wrapper for user sync
- **Features**:
  - Automatic user sync with backend
  - Clerk user data extraction
  - Loading state management
  - Client-side only rendering

### Dashboard Components

#### `InstrumentCard.tsx`
- **Location**: `/apps/web/src/app/dashboard/components/InstrumentCard.tsx`
- **Purpose**: Reusable summary card for metrics
- **Props**:
  - `title`: Card title
  - `value`: Primary value to display
  - `trend`: Optional trend indicator (+/- %)
  - `icon`: Optional icon component
- **Features**:
  - Color-coded trend indicators
  - Responsive design
  - Icon support (Heroicons)

#### `PriceTable.tsx`
- **Location**: `/apps/web/src/app/dashboard/components/PriceTable.tsx`
- **Purpose**: Display market prices in table format
- **Features**:
  - Sortable columns
  - Color-coded change indicators
  - Directional arrows (up/down)
  - Responsive table design
  - Alternating row colors for readability

#### `SearchInstruments.tsx`
- **Location**: `/apps/web/src/app/dashboard/components/SearchInstruments.tsx`
- **Purpose**: Search UI component for instruments
- **Features**:
  - Real-time search input
  - Loading states
  - Results display with selection
  - Error handling

#### `RefreshButton.tsx`
- **Location**: `/apps/web/src/app/dashboard/components/RefreshButton.tsx`
- **Purpose**: Manual data refresh trigger
- **Features**:
  - Loading spinner during refresh
  - Disabled state during operation
  - Icon animation

### Instruments Components

#### `StockSearch.tsx`
- **Location**: `/apps/web/src/app/dashboard/instruments/components/StockSearch.tsx`
- **Purpose**: Stock search with Convex/API integration
- **Features**:
  - Smart caching (checks database before API)
  - Real-time search as you type
  - Results display with selection callback
  - Loading and error states
  - Display of price, change %, and company details

#### `MutualFundSearch.tsx`
- **Location**: `/apps/web/src/app/dashboard/instruments/components/MutualFundSearch.tsx`
- **Purpose**: Mutual fund search with debouncing
- **Features**:
  - 500ms debounce for optimal performance
  - Live results display
  - Selection callback
  - Loading spinner
  - Display of NAV, fund size, and category

#### `StockHistoryModal.tsx`
- **Location**: `/apps/web/src/app/dashboard/instruments/components/StockHistoryModal.tsx`
- **Purpose**: Display paginated stock price history
- **Features**:
  - Modal overlay with backdrop
  - Paginated table (10 records per page)
  - Date and price columns
  - Navigation controls (First, Prev, Next, Last)
  - Close button and escape key support
  - Formatted date display (DD MMM YYYY)
  - Formatted price display (₹X,XXX.XX)

#### `MfHistoryModal.tsx`
- **Location**: `/apps/web/src/app/dashboard/instruments/components/MfHistoryModal.tsx`
- **Purpose**: Display paginated mutual fund NAV history
- **Features**:
  - Modal overlay with backdrop
  - Paginated table (10 records per page)
  - Date and NAV columns
  - Consistent navigation controls
  - Close button and escape key support
  - Formatted date and NAV display

### Common UI Components

#### `UserNav.tsx`
- **Location**: `/apps/web/src/components/common/UserNav.tsx`
- **Purpose**: User navigation dropdown
- **Features**:
  - User avatar with fallback
  - Dropdown menu with user info
  - Sign-out functionality
  - Profile settings link (future)
  - Accessible with keyboard navigation

#### `avatar.tsx`
- **Location**: `/apps/web/src/components/common/avatar.tsx`
- **Purpose**: Avatar component from Radix UI
- **Features**:
  - Image display with fallback
  - Initials fallback for missing images
  - Circular design
  - Various sizes support

#### `button.tsx`
- **Location**: `/apps/web/src/components/common/button.tsx`
- **Purpose**: Reusable button component with variants
- **Features**:
  - Multiple variants (default, destructive, outline, ghost)
  - Size variants (sm, md, lg)
  - Loading state support
  - Disabled state styling
  - Icon support

#### `dropdown-menu.tsx`
- **Location**: `/apps/web/src/components/common/dropdown-menu.tsx`
- **Purpose**: Dropdown menu component from Radix UI
- **Features**:
  - Accessible with keyboard
  - Multiple trigger types
  - Nested menu support
  - Separator and label support
  - Customizable positioning

### Specialized Components

#### `ApiViewer.tsx`
- **Location**: `/apps/web/src/app/dashboard/api/ApiViewer.tsx`
- **Purpose**: API documentation viewer with interactive playground
- **Features**:
  - Load OpenAPI specifications from JSON
  - Display endpoints grouped by tags
  - Show request/response schemas
  - Interactive endpoint testing
  - Parameter form generation
  - Response display with syntax highlighting

#### `EndpointPlayground` (within ApiViewer)
- **Purpose**: Interactive API testing interface
- **Features**:
  - Dynamic form generation based on parameters
  - Type validation (string, number, boolean)
  - Required field validation
  - Send request button
  - Display response with formatting
  - Error handling and display

## Technology Stack

### Core Framework
- **Next.js** 16.0.9 - React framework with App Router
- **React** 19.2.2 - UI library with server components
- **TypeScript** 5.9.3 - Type-safe development

### Authentication
- **Clerk** - Authentication provider
  - `@clerk/nextjs` v5.57.1 - Next.js integration
  - `@clerk/clerk-react` v6.35.6 - React components

### Database & Backend
- **Convex** v1.29.3 - Real-time backend-as-a-service
- **convex-react** - React integration for Convex

### UI & Styling
- **Tailwind CSS** 4.1.17 - Utility-first CSS framework
  - `@tailwindcss/forms` - Form styling plugin
- **Radix UI** - Accessible component primitives
  - `@radix-ui/react-avatar` - Avatar component
  - `@radix-ui/react-dropdown-menu` - Dropdown menu
  - `@radix-ui/react-slot` - Composition utility
- **Heroicons** v2.2.0 - SVG icon library
- **Lucide React** v0.555.0 - Additional icon library
- **Class Variance Authority (CVA)** - Component styling variants
- **Tailwind Merge** - Merge Tailwind classes intelligently

### API & Documentation
- **@apidevtools/swagger-parser** - OpenAPI specification parser
- **Fetch API** - For API testing in playground

### Development Tools
- **ESLint** - Code linting
- **eslint-config-next** - Next.js specific lint rules
- **PostCSS** 8.5.6 - CSS processing

### Build & Deployment
- **Vercel** - Hosting platform (vercel.json configuration present)
- **Turbo** - Monorepo build system (turbo.json in root)

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              KITE ADMIN DASHBOARD                        │
│          (Next.js 16 + React 19 + TypeScript)            │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Authentication Layer                                    │
│  ├─ Clerk (OAuth Provider)                              │
│  │  ├─ Google OAuth                                     │
│  │  ├─ GitHub OAuth                                     │
│  │  └─ Email/Password                                   │
│  ├─ Middleware (Protected Routes)                       │
│  │  └─ /dashboard/* requires authentication             │
│  └─ User Sync Hook (useSyncUser)                        │
│     └─ Auto-sync user data to Convex on login           │
│                                                           │
│  Data Layer                                              │
│  ├─ Convex (Real-time DB & Backend)                     │
│  │  ├─ Stocks API (list, search, add, delete)          │
│  │  ├─ Mutual Funds API (list, search, add, delete)    │
│  │  ├─ Holdings API (CRUD operations)                   │
│  │  ├─ Users API (list, count, get by ID)              │
│  │  ├─ Stock API (historical data fetching)            │
│  │  └─ MF API (historical NAV fetching)                │
│  └─ External APIs                                        │
│     ├─ Indian Stock API (stock.indianapi.in)           │
│     │  ├─ Search stocks                                │
│     │  └─ Fetch historical prices                      │
│     └─ MFAPI (api.mfapi.in)                            │
│        ├─ Search mutual fund schemes                   │
│        └─ Fetch historical NAV                         │
│                                                           │
│  UI Layer                                                │
│  ├─ Tailwind CSS (Utility-first Styling)                │
│  ├─ Radix UI (Accessible Components)                    │
│  │  ├─ Avatar                                           │
│  │  ├─ Dropdown Menu                                    │
│  │  └─ Dialog/Modal                                     │
│  ├─ Heroicons (Primary Icon Library)                    │
│  ├─ Lucide (Additional Icons)                           │
│  └─ Custom Components                                    │
│     ├─ InstrumentCard                                   │
│     ├─ PriceTable                                       │
│     ├─ StockSearch                                      │
│     ├─ MutualFundSearch                                 │
│     ├─ StockHistoryModal                                │
│     └─ MfHistoryModal                                   │
│                                                           │
│  Pages & Features                                        │
│  ├─ Dashboard (Market Overview)                         │
│  ├─ Users Management                                     │
│  ├─ Holdings Management                                  │
│  │  ├─ Overview with summary                            │
│  │  └─ Detail view with CRUD operations                 │
│  ├─ Instruments Search & Management                     │
│  │  ├─ Stock search and add                             │
│  │  ├─ Mutual fund search and add                       │
│  │  ├─ Historical data modals                           │
│  │  └─ Delete functionality                             │
│  └─ API Documentation Viewer                            │
│     ├─ OpenAPI spec parsing                             │
│     ├─ Endpoint playground                              │
│     └─ Interactive testing                              │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
User Action → Frontend Component → Convex Query/Mutation → Database
                                        ↓
                                  External API (if needed)
                                        ↓
                                  Backend Processing
                                        ↓
                                  Real-time Update → Frontend
```

### Component Hierarchy

```
App Layout (Root)
└── ConvexClientProvider
    └── ClerkProvider
        ├── Home Page (/)
        │   └── Sign In/Sign Up
        └── Dashboard Layout
            ├── Sidebar Navigation
            ├── User Navigation
            └── Page Content
                ├── Dashboard Home
                ├── Users Page
                ├── Holdings Pages
                │   ├── Overview
                │   └── Detail (with modals)
                ├── Instruments Pages
                │   ├── List (with tabs)
                │   ├── Search Components
                │   └── History Modals
                ├── API Viewer
                └── Settings (placeholder)
```

## Data Models & Integrations

### Primary Data Entities

The dashboard manages these core data entities:

1. **Users**
   - Synced from Clerk authentication
   - Stored in Convex `users` table
   - Fields: clerkId, email, firstName, lastName, imageUrl, createdAt, lastLoginAt

2. **Stocks**
   - Financial instruments for equity trading
   - Fields: symbol, companyName, industry, exchange, currentPrice, percentChange, yearHigh, yearLow, hasHistoricalData, addedAt

3. **Mutual Funds**
   - Investment fund schemes
   - Fields: schemeId, schemeName, isin, schemeType, categoryId, category, currentNav, fundSize, riskLevel, fundManager, mfapiSchemeCode, hasHistoricalData, addedAt

4. **Stock Holdings**
   - User's stock portfolios
   - Fields: userId, stockId, quantity, avgBuyPrice, totalInvested, createdAt, updatedAt

5. **Mutual Fund Holdings**
   - User's mutual fund portfolios
   - Fields: userId, mutualFundId, units, avgNav, totalInvested, createdAt, updatedAt

6. **Historical Data**
   - Time-series price/NAV data
   - Stock: stockId, date, price
   - Mutual Fund: mutualFundId, date, nav

### External API Integrations

#### Indian Stock API
- **Base URL**: `https://stock.indianapi.in`
- **Endpoints**:
  - `/api/search?query={query}` - Search stocks
  - `/api/{stockName}/historical` - Fetch 5-year historical data
- **Authentication**: API key via `INDIAN_STOCK_API_KEY` environment variable
- **Usage**: Stock search and historical price data fetching

#### MFAPI (Mutual Fund API)
- **Base URL**: `https://api.mfapi.in`
- **Endpoints**:
  - `/mf/search?q={query}` - Search mutual fund schemes
  - `/mf/{schemeCode}` - Fetch scheme details and historical NAV
- **Authentication**: None (public API)
- **Usage**: Mutual fund search and historical NAV data fetching

#### Clerk Authentication
- **Purpose**: User authentication and profile management
- **Features**: OAuth providers, session management, user profiles
- **Integration**: Automatic sync to Convex database on login

### Data Synchronization

- **Real-time Updates**: Convex provides real-time updates via WebSocket
- **Optimistic Updates**: UI updates immediately, rolls back on error
- **User Sync**: Automatic sync from Clerk to Convex on every login
- **Data Enrichment**: Holdings queries join with stocks/funds for complete data

## Key Features & Smart Behaviors

### Performance Optimizations

1. **Debounced Search**
   - Mutual fund search debounced by 500ms
   - Reduces API calls and improves performance
   - Cancels previous requests on new input

2. **Smart Caching**
   - Stock search checks Convex database first
   - Only calls external API if not found locally
   - Reduces latency and API usage

3. **Pagination**
   - Historical data shown 10 items per page
   - Reduces initial load time
   - Navigation controls (First, Previous, Next, Last)
   - Page indicator (Page X of Y)

4. **Lazy Loading**
   - Historical data loaded on-demand when modal opened
   - Not loaded until user requests it
   - Reduces unnecessary API calls

### User Experience Enhancements

1. **Auto-fill on Date Selection**
   - When adding holdings, select purchase date
   - System auto-populates price/NAV from historical data
   - Fallback to manual entry if data unavailable
   - Saves time and ensures accuracy

2. **Hydration Management**
   - Uses `mounted` state to prevent hydration mismatches
   - Client-only rendering for dynamic content
   - Prevents SSR/client mismatch errors

3. **Loading States**
   - Spinners during async operations
   - Disabled buttons during processing
   - Visual feedback for user actions

4. **Error Handling**
   - Try-catch blocks around API calls
   - User-friendly error messages
   - Fallback UI for missing data

5. **Responsive Design**
   - Mobile-first approach
   - Breakpoints for tablet (md:) and desktop (lg:)
   - Collapsible sidebar on mobile
   - Touch-friendly buttons and inputs

### Form Validations

1. **Required Fields**
   - Form validation before submission
   - Visual indicators for required fields
   - Disable submit until valid

2. **Type Validation**
   - Number inputs for quantity, price, units, NAV
   - Email validation for user profiles
   - Date picker with format validation

3. **Range Validation**
   - Positive numbers only for prices and quantities
   - Date cannot be in future for historical data
   - Minimum values enforced (e.g., quantity > 0)

### Real-time Features

1. **Live Updates**
   - Price changes reflected immediately
   - Holdings updates in real-time
   - User additions visible without refresh

2. **Collaborative Editing**
   - Multiple users can view same data
   - Changes from one user reflected to others
   - Conflict resolution via Convex

3. **Last Update Tracking**
   - Display last update timestamp
   - Manual refresh button available
   - Auto-refresh on data changes

## File Structure

```
/Users/deepak/Developer/Kite/apps/web/
├── public/                         # Static assets
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── ConvexClientProvider.tsx    # Convex + Clerk provider
│   │   ├── ErrorBoundary.tsx           # Error handling component
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Home/Login page
│   │   ├── globals.css                 # Global styles
│   │   ├── middleware.ts               # Route protection
│   │   │
│   │   └── dashboard/              # Dashboard section
│   │       ├── DashboardClientWrapper.tsx  # User sync wrapper
│   │       ├── layout.tsx              # Dashboard layout
│   │       ├── page.tsx                # Dashboard home
│   │       │
│   │       ├── components/         # Dashboard components
│   │       │   ├── InstrumentCard.tsx
│   │       │   ├── PriceTable.tsx
│   │       │   ├── RefreshButton.tsx
│   │       │   └── SearchInstruments.tsx
│   │       │
│   │       ├── users/              # Users section
│   │       │   └── page.tsx            # Users list page
│   │       │
│   │       ├── holdings/           # Holdings section
│   │       │   ├── page.tsx            # Holdings overview
│   │       │   └── [userId]/
│   │       │       └── page.tsx        # User portfolio detail
│   │       │
│   │       ├── instruments/        # Instruments section
│   │       │   ├── page.tsx            # Instruments list
│   │       │   ├── [symbol]/
│   │       │   │   └── page.tsx        # Instrument detail
│   │       │   ├── add/
│   │       │   │   └── page.tsx        # Add instrument
│   │       │   └── components/
│   │       │       ├── StockSearch.tsx
│   │       │       ├── MutualFundSearch.tsx
│   │       │       ├── StockHistoryModal.tsx
│   │       │       └── MfHistoryModal.tsx
│   │       │
│   │       ├── api/                # API documentation
│   │       │   ├── page.tsx            # API reference page
│   │       │   └── ApiViewer.tsx       # OpenAPI viewer
│   │       │
│   │       └── settings/           # Settings section
│   │           └── page.tsx            # Settings page (placeholder)
│   │
│   ├── components/                 # Shared components
│   │   └── common/
│   │       ├── UserNav.tsx             # User navigation dropdown
│   │       ├── avatar.tsx              # Avatar component
│   │       ├── button.tsx              # Button component
│   │       └── dropdown-menu.tsx       # Dropdown menu
│   │
│   ├── hooks/                      # Custom React hooks
│   │   └── useSyncUser.ts              # User sync hook
│   │
│   ├── lib/                        # Utility functions
│   │   └── utils.ts                    # Helper functions
│   │
│   └── types/                      # TypeScript type definitions
│       └── index.ts                    # Shared types
│
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── next.config.js                  # Next.js configuration
└── vercel.json                     # Vercel deployment config
```

## Setup & Development

### Prerequisites

- Node.js 18+ and npm/yarn
- Convex account and project
- Clerk account and application
- Indian Stock API key

### Environment Variables

Create `.env.local` file in `/apps/web`:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional: Clerk URLs (auto-configured for most setups)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Installation

```bash
# Navigate to web app directory
cd apps/web

# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev
```

### Development Server

The app will be available at `http://localhost:3000`

- Home page: `http://localhost:3000`
- Dashboard: `http://localhost:3000/dashboard`

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Deployment

The application is configured for Vercel deployment:

1. Connect repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push to main branch

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "cd ../.. && npx turbo run build --filter=web...",
  "outputDirectory": ".next"
}
```

### Development Workflow

1. **Feature Development**:
   - Create feature branch
   - Make changes in `/apps/web/src`
   - Test locally with hot reload
   - Commit and push

2. **Backend Integration**:
   - Ensure Convex backend is deployed
   - Update Convex functions in `/packages/backend`
   - Test API calls from dashboard
   - Sync schema changes

3. **Component Development**:
   - Create components in appropriate directory
   - Use TypeScript for type safety
   - Follow Tailwind CSS conventions
   - Use Radix UI for accessible patterns

4. **Testing**:
   - Manual testing in browser
   - Test on mobile devices
   - Verify authentication flow
   - Check real-time updates

### Troubleshooting

**Common Issues**:

1. **Hydration Errors**
   - Use `mounted` state for client-only rendering
   - Avoid using `Date.now()` or random values in SSR

2. **Authentication Issues**
   - Verify Clerk environment variables
   - Check middleware configuration
   - Ensure user sync hook is running

3. **Convex Connection Issues**
   - Verify `NEXT_PUBLIC_CONVEX_URL` is correct
   - Check Convex deployment status
   - Ensure WebSocket connections are allowed

4. **API Errors**
   - Check API key configuration
   - Verify external API status
   - Check network requests in browser devtools

---

## Summary

The Kite Admin Dashboard is a production-ready investment portfolio management platform with:

- **Modern Tech Stack**: Next.js 16, React 19, TypeScript for robust development
- **Real-time Capabilities**: Convex backend for live data synchronization
- **User-Friendly Interface**: Responsive design with intuitive navigation
- **Comprehensive Features**: Complete portfolio management for stocks and mutual funds
- **Smart Optimizations**: Caching, debouncing, pagination for optimal performance
- **Security**: Protected routes with Clerk authentication
- **Extensible Architecture**: Clean component structure for easy feature additions

Built for the Indian financial market with integration to local stock and mutual fund APIs.
