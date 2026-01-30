# Kite Backend Documentation

## Table of Contents
- [Overview](#overview)
- [Architecture & Technology Stack](#architecture--technology-stack)
- [Database Models & Schema](#database-models--schema)
- [API Endpoints & Functions](#api-endpoints--functions)
- [Key Features](#key-features)
- [Architecture Pattern](#architecture-pattern)
- [Data Flow Examples](#data-flow-examples)
- [Recent Enhancements](#recent-enhancements)
- [Environment Configuration](#environment-configuration)

## Overview

The Kite backend is built on **Convex**, a backend-as-a-service platform providing real-time database capabilities with automatic type safety, serverless functions, and built-in authentication.

**Location**: `/packages/backend`

## Architecture & Technology Stack

### Core Technologies
- **Convex** v1.29.3 - Backend-as-a-service platform
- **TypeScript** - Type-safe development
- **Clerk** - Authentication provider
- **External APIs**:
  - Indian Stock API (`https://stock.indianapi.in`)
  - MFAPI (`https://api.mfapi.in`)

### Key Features
- Real-time database with automatic type safety
- Serverless functions (queries, mutations, actions)
- Built-in authentication with Clerk integration
- Automatic API generation from TypeScript functions

### Configuration Files
- `convex/schema.ts` - Database schema definition
- `convex/auth.config.js` - Clerk authentication configuration
- `package.json` - Dependencies and scripts

## Database Models & Schema

The system manages **8 core tables** with relationships and indexes:

### User Management

#### `users` Table
Stores user profiles synced from Clerk authentication.

**Fields**:
- `clerkId` (string) - Unique Clerk user identifier
- `email` (string) - User email address
- `firstName` (string, optional) - User's first name
- `lastName` (string, optional) - User's last name
- `imageUrl` (string, optional) - Profile image URL
- `createdAt` (number) - Account creation timestamp
- `lastLoginAt` (number) - Last login timestamp

**Indexes**:
- `by_clerkId` - Fast lookup by Clerk ID
- `by_email` - Fast lookup by email
- `by_createdAt` - Ordered user list

### Stock Instruments

#### `stocks` Table
Available stocks for tracking and trading.

**Fields**:
- `symbol` (string) - Stock ticker symbol (e.g., "RELIANCE")
- `companyName` (string) - Full company name
- `industry` (string, optional) - Industry sector
- `exchange` (string, optional) - Stock exchange (NSE, BSE)
- `currentPrice` (number, optional) - Latest trading price
- `percentChange` (number, optional) - Daily percentage change
- `yearHigh` (number, optional) - 52-week high price
- `yearLow` (number, optional) - 52-week low price
- `hasHistoricalData` (boolean) - Flag for historical data availability
- `addedAt` (number) - Timestamp when stock was added

**Indexes**:
- `by_symbol` - Fast lookup by ticker symbol
- `by_addedAt` - Chronologically ordered stocks

#### `stockHistoricalData` Table
Daily historical price data for stocks.

**Fields**:
- `stockId` (Id<"stocks">) - Foreign key to stocks table
- `date` (string) - Date in YYYY-MM-DD format
- `price` (number) - Closing price for the day
- `dma50` (number, optional) - 50-day moving average (deprecated)
- `dma200` (number, optional) - 200-day moving average (deprecated)
- `volume` (number, optional) - Trading volume (deprecated)

**Indexes**:
- `by_stockId` - All historical data for a stock
- `by_stockId_date` - Unique constraint and fast date lookup

**Note**: Recent commits indicate `dma50`, `dma200`, and `volume` are being phased out in favor of price-only data.

### Mutual Fund Instruments

#### `mutualFunds` Table
Available mutual funds for tracking and investment.

**Fields**:
- `schemeId` (string) - Unique scheme identifier
- `schemeName` (string) - Full mutual fund scheme name
- `isin` (string, optional) - International Securities Identification Number
- `schemeType` (string, optional) - Fund type (Equity, Debt, Hybrid)
- `categoryId` (string, optional) - Category identifier
- `category` (string, optional) - Fund category name
- `currentNav` (number, optional) - Current Net Asset Value
- `fundSize` (number, optional) - Assets under management
- `riskLevel` (string, optional) - Risk rating
- `fundManager` (string, optional) - Fund manager name
- `mfapiSchemeCode` (string, optional) - MFAPI scheme code for data fetching
- `hasHistoricalData` (boolean) - Flag for NAV history availability
- `addedAt` (number) - Timestamp when fund was added

**Indexes**:
- `by_schemeId` - Fast lookup by scheme ID
- `by_addedAt` - Chronologically ordered funds

#### `mutualFundHistoricalData` Table
Daily historical NAV (Net Asset Value) data for mutual funds.

**Fields**:
- `mutualFundId` (Id<"mutualFunds">) - Foreign key to mutualFunds table
- `date` (string) - Date in YYYY-MM-DD format
- `nav` (number) - Net Asset Value for the day

**Indexes**:
- `by_mutualFundId` - All NAV history for a fund
- `by_mutualFundId_date` - Unique constraint and fast date lookup

### User Holdings

#### `userStockHoldings` Table
User's stock portfolio and holdings.

**Fields**:
- `userId` (Id<"users">) - Foreign key to users table
- `stockId` (Id<"stocks">) - Foreign key to stocks table
- `quantity` (number) - Number of shares owned
- `avgBuyPrice` (number) - Average purchase price per share
- `totalInvested` (number) - Total amount invested (quantity × avgBuyPrice)
- `createdAt` (number) - Timestamp when holding was created
- `updatedAt` (number) - Timestamp of last update

**Indexes**:
- `by_userId` - All holdings for a user
- `by_stockId` - All users holding a specific stock
- `by_userId_stockId` - Unique constraint per user-stock pair

#### `userMutualFundHoldings` Table
User's mutual fund portfolio and holdings.

**Fields**:
- `userId` (Id<"users">) - Foreign key to users table
- `mutualFundId` (Id<"mutualFunds">) - Foreign key to mutualFunds table
- `units` (number) - Number of fund units owned
- `avgNav` (number) - Average NAV at purchase
- `totalInvested` (number) - Total amount invested (units × avgNav)
- `createdAt` (number) - Timestamp when holding was created
- `updatedAt` (number) - Timestamp of last update

**Indexes**:
- `by_userId` - All MF holdings for a user
- `by_mutualFundId` - All users holding a specific fund
- `by_userId_mutualFundId` - Unique constraint per user-fund pair

## API Endpoints & Functions

### Module: `users.ts` - User Management

| Function | Type | Parameters | Returns | Purpose |
|----------|------|------------|---------|---------|
| `list()` | Query | None | Array<User> | Get all users ordered by creation date |
| `getByClerkId(clerkId)` | Query | clerkId: string | User \| null | Retrieve user by Clerk ID |
| `syncUser(...)` | Mutation | clerkId, email, firstName, lastName, imageUrl | User ID | Upsert user (create or update from Clerk) |
| `count()` | Query | None | number | Get total user count |

### Module: `stocks.ts` - Stock Management

| Function | Type | Parameters | Returns | Purpose |
|----------|------|------------|---------|---------|
| `list()` | Query | None | Array<Stock> | Get all saved stocks |
| `getBySymbol(symbol)` | Query | symbol: string | Stock \| null | Retrieve stock by ticker symbol |
| `add(...)` | Mutation | symbol, companyName, industry, exchange, currentPrice, percentChange, yearHigh, yearLow | Stock ID | Add/update stock from search results |
| `remove(id)` | Mutation | id: Id<"stocks"> | void | Delete stock and cascade delete historical data |
| `updatePrice(id, currentPrice, percentChange)` | Mutation | id, currentPrice, percentChange | void | Update stock price |
| `getHistoricalData(stockId, pagination?)` | Query | stockId, pagination: {page, pageSize} | Paginated historical data | Get historical price data with pagination |

### Module: `stockApi.ts` - Stock Data Integration

| Function | Type | Parameters | Returns | Purpose |
|----------|------|------------|---------|---------|
| `searchStocks(query)` | Action | query: string | Array<StockResult> | Search stocks via Indian Stock API |
| `fetchStockHistoricalData(stockId, stockName)` | Action | stockId, stockName | {success, message, count} | Fetch 5-year price history for a stock |
| `fetchAllHistoricalData()` | Action | None | {success, results} | Batch fetch historical data for all stocks |
| `saveHistoricalData(...)` | Internal Mutation | stockId, data[] | void | Store price history in database |
| `getStocksWithoutHistory()` | Internal Query | None | Array<Stock> | Find stocks missing historical data |

**External API**: Uses `https://stock.indianapi.in` with `INDIAN_STOCK_API_KEY` environment variable.

**API Endpoints Used**:
- `/api/search?query={query}` - Search stocks
- `/api/{stockName}/historical` - Fetch 5-year historical data

### Module: `mutualFunds.ts` - Mutual Fund Management

| Function | Type | Parameters | Returns | Purpose |
|----------|------|------------|---------|---------|
| `list()` | Query | None | Array<MutualFund> | Get all saved mutual funds |
| `getBySchemeId(schemeId)` | Query | schemeId: string | MutualFund \| null | Retrieve fund by scheme ID |
| `add(...)` | Mutation | schemeId, schemeName, isin, schemeType, categoryId, category, currentNav, fundSize, riskLevel, fundManager | MutualFund ID | Add/update mutual fund from search |
| `remove(id)` | Mutation | id: Id<"mutualFunds"> | void | Delete fund and cascade delete NAV history |
| `updateNav(id, currentNav)` | Mutation | id, currentNav | void | Update fund NAV |
| `getHistoricalData(mutualFundId, pagination?)` | Query | mutualFundId, pagination: {page, pageSize} | Paginated NAV data | Get NAV history with pagination |

### Module: `mfApi.ts` - Mutual Fund Data Integration

| Function | Type | Parameters | Returns | Purpose |
|----------|------|------------|---------|---------|
| `searchScheme(query)` | Action | query: string | Array<SchemeResult> | Search MF schemes via MFAPI |
| `fetchMfHistoricalData(mutualFundId, schemeName)` | Action | mutualFundId, schemeName | {success, message, count} | Fetch historical NAV data |
| `fetchAllMfHistoricalData()` | Action | None | {success, results} | Batch fetch NAV history for all funds |

**External API**: Uses `https://api.mfapi.in`

**MF Scheme Matching Logic**:
1. Prefers "Regular Plan Growth" schemes
2. Falls back to "Regular" variants
3. Then tries "Growth" variants
4. Returns first result as fallback

**API Endpoints Used**:
- `/mf/search?q={query}` - Search mutual fund schemes
- `/mf/{schemeCode}` - Fetch scheme details and NAV history

### Module: `mfInternal.ts` - Internal Mutual Fund Operations

| Function | Type | Parameters | Returns | Purpose |
|----------|------|------------|---------|---------|
| `saveMfHistoricalData(...)` | Internal Mutation | mutualFundId, data[], mfapiSchemeCode | void | Store NAV history, update scheme code flag |
| `getMfsWithoutHistory()` | Internal Query | None | Array<MutualFund> | Find funds missing NAV history |

### Module: `holdings.ts` - Portfolio Management

| Function | Type | Parameters | Returns | Purpose |
|----------|------|------------|---------|---------|
| `listStockHoldings(userId?)` | Query | userId?: Id<"users"> | Array<EnrichedStockHolding> | Get stock holdings (enriched with user/stock details) |
| `getUserPortfolio(userId)` | Query | userId: Id<"users"> | {stocks, mutualFunds} | Complete portfolio (stocks + MFs combined) |
| `addStockHolding(...)` | Mutation | userId, stockId, quantity, avgBuyPrice | Holding ID | Create/update stock holding |
| `updateStockHolding(id, quantity, avgBuyPrice)` | Mutation | id, quantity, avgBuyPrice | void | Update stock holding |
| `removeStockHolding(id)` | Mutation | id: Id<"userStockHoldings"> | void | Delete stock holding |
| `listMutualFundHoldings(userId?)` | Query | userId?: Id<"users"> | Array<EnrichedMFHolding> | Get MF holdings (enriched with details) |
| `addMutualFundHolding(...)` | Mutation | userId, mutualFundId, units, avgNav | Holding ID | Create/update MF holding |
| `updateMutualFundHolding(id, units, avgNav)` | Mutation | id, units, avgNav | void | Update MF holding |
| `removeMutualFundHolding(id)` | Mutation | id: Id<"userMutualFundHoldings"> | void | Delete MF holding |
| `getHoldingsSummary()` | Query | None | {stats} | Portfolio statistics and aggregates |

## Key Features

### 1. User Management
- Clerk authentication integration
- Automatic user profile sync on login
- Track creation and last login timestamps
- User count and listing

### 2. Stock Instruments
- Search stocks via Indian Stock API
- Add stocks to dashboard with full market data
- Track current price, market changes, 52-week highs/lows
- Fetch historical price data (5-year history)
- Pagination support for large historical datasets
- Cascading deletion of historical data when stock removed

### 3. Mutual Fund Instruments
- Search mutual funds via MFAPI
- Intelligent scheme matching (Regular Plan Growth preference)
- Add funds with complete scheme information
- Track current NAV and fund details
- Fetch historical NAV data
- Pagination support for NAV history
- Store MFAPI scheme codes for efficient future updates

### 4. Portfolio Management
- User stock holdings with quantity and average buy price
- User mutual fund holdings with units and average NAV
- Complete portfolio view combining both asset types
- Portfolio summary statistics and aggregates
- Total invested amount calculations

### 5. Historical Data Management
- Batch fetching for all instruments
- Cascading deletion when instruments removed
- Pagination for large datasets (configurable page size)
- Efficient date-based indexing
- Separate data aggregation without deprecated fields

### 6. Data Enrichment
- Holdings include full user, stock, and fund details
- Portfolio aggregates stocks and MFs together
- Computed fields: totalInvested (quantity × price)
- Join operations across multiple tables

## Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React App)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    Convex RPC (WebSocket)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Convex Backend                               │
├─────────────────────────────────────────────────────────────────┤
│  Public API Functions                                           │
│  ├─ users.* (list, getByClerkId, count)                        │
│  ├─ stocks.* (list, getBySymbol, add, remove, updatePrice)     │
│  ├─ stockApi.* (searchStocks, fetchStockHistoricalData)         │
│  ├─ mutualFunds.* (list, getBySchemeId, add, remove)           │
│  ├─ mfApi.* (searchScheme, fetchMfHistoricalData)              │
│  └─ holdings.* (list, get, add, update, remove, summary)       │
│                                                                 │
│  Internal API Functions (Server-only)                          │
│  ├─ stockApi.saveHistoricalData, getStocksWithoutHistory       │
│  └─ mfInternal.saveMfHistoricalData, getMfsWithoutHistory      │
│                                                                 │
│  Convex Database (Persistence)                                 │
│  ├─ users, stocks, stockHistoricalData                         │
│  ├─ mutualFunds, mutualFundHistoricalData                      │
│  └─ userStockHoldings, userMutualFundHoldings                  │
└──────────┬──────────────────────────────────────────────────────┘
           │
       External APIs:
       ├─ Indian Stock API (search, historical data)
       ├─ MFAPI (scheme search, NAV history)
       └─ Clerk (authentication)
```

## Data Flow Examples

### Adding a Stock to Portfolio

1. User searches stock → `stockApi.searchStocks()` calls Indian Stock API
2. Results displayed → User selects stock
3. `stocks.add()` saves stock to database with current market data
4. User adds holding → `holdings.addStockHolding()` creates user-stock link with quantity and price
5. Admin fetches history → `stockApi.fetchStockHistoricalData()` populates 5 years of historical price data
6. Historical data available with pagination → `stocks.getHistoricalData()` retrieves paginated results

### Getting User Portfolio

1. Frontend calls `holdings.getUserPortfolio(userId)`
2. Query fetches from `userStockHoldings` table
3. Joins with `stocks` table for full instrument details
4. Query fetches from `userMutualFundHoldings` table
5. Joins with `mutualFunds` table for full fund details
6. Returns combined portfolio object with stocks and mutualFunds arrays
7. Each holding includes computed totalInvested amount

### Batch Fetching Historical Data

1. Admin triggers `stockApi.fetchAllHistoricalData()`
2. Query `getStocksWithoutHistory()` finds stocks with `hasHistoricalData: false`
3. For each stock, fetch 5-year data from Indian Stock API
4. Call internal `saveHistoricalData()` mutation to store results
5. Update stock record with `hasHistoricalData: true`
6. Return success report with counts

## Recent Enhancements

Based on recent git commits:

1. **Pagination for Historical Data** (Latest)
   - Added pagination support for both stock and mutual fund historical data queries
   - Configurable page size for efficient data loading
   - Updated UI components to support paginated data structure

2. **Mutual Fund Historical NAV Modal**
   - Introduced dedicated modal for viewing mutual fund NAV history
   - Integrated with instruments dashboard
   - Paginated display of historical NAV data

3. **Historical Data Fetching & Storage**
   - Implemented comprehensive historical data fetching for both stocks and mutual funds
   - Date-based auto-fill for stock purchase price and mutual fund NAV
   - Backend storage optimization for historical records

4. **Streamlined Stock Data**
   - Simplified stock historical data to price-only
   - Removed DMA (50-day and 200-day moving averages) from backend processing
   - Removed volume data from storage and display
   - Focus on essential price information for better performance

5. **Cascading Deletion**
   - Added cascading deletion for historical records
   - When stock or mutual fund is deleted, all associated historical data is automatically removed
   - Maintains database integrity and prevents orphaned records

## Environment Configuration

Required environment variables for backend operation:

```bash
# Indian Stock API
INDIAN_STOCK_API_KEY=your_api_key_here

# Clerk Authentication
CLERK_ISSUER_URL=https://your-clerk-instance.clerk.accounts.dev

# Convex Deployment
CONVEX_CLOUD_URL=https://your-deployment.convex.cloud

# Convex Deployment URL (for local development)
CONVEX_URL=https://your-deployment.convex.cloud
```

### Getting API Keys

1. **Indian Stock API**: Register at `https://stock.indianapi.in` to obtain API key
2. **Clerk**: Create application at `https://clerk.com` and copy issuer URL
3. **Convex**: Deploy project at `https://convex.dev` to get deployment URL

### Local Development

```bash
# Navigate to backend directory
cd packages/backend

# Install dependencies
npm install

# Start Convex development server
npx convex dev

# Deploy to Convex
npx convex deploy
```

### Testing APIs

Use Convex dashboard to test functions:
- Navigate to `https://dashboard.convex.dev`
- Select your deployment
- Use "Functions" tab to test queries, mutations, and actions
- View real-time logs and database state

---

## Summary

The Kite backend provides a comprehensive investment portfolio tracking system with:

- Real-time market data integration from Indian financial markets
- Comprehensive holding management for stocks and mutual funds
- Historical data tracking with pagination support
- User authentication and portfolio management
- Efficient data fetching and storage with cascading operations
- Type-safe API with automatic generation from TypeScript functions

Built on Convex for real-time capabilities, serverless architecture, and automatic scaling.
