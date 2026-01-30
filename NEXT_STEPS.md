# Kite - Next Steps

## Project Overview

Monorepo with:
- `apps/web` - Next.js admin dashboard
- `apps/native` - Expo Android app
- `packages/backend` - Convex backend (shared)

---

## ✅ Completed

- [x] Monorepo setup with Turborepo
- [x] Convex backend configured
- [x] Clerk authentication integrated
- [x] Database schema (instruments, prices, priceHistory, watchlists)
- [x] Yahoo Finance API integration
- [x] Basic dashboard page with price overview
- [x] Native app with email/password auth

---

## 🔧 Immediate Setup Tasks

### 1. Clerk Configuration (Required)

- [ ] Go to [Clerk Dashboard](https://dashboard.clerk.com)
- [ ] Configure → JWT Templates → Create template named "convex"
- [ ] Copy Issuer URL to Convex Dashboard (Settings → Environment Variables → `CLERK_ISSUER_URL`)
- [ ] Disable social logins if only using email/password

### 2. Add Sample Instruments

Run in Convex Dashboard or create a seed script:

```typescript
// Add some Indian stocks
await instruments.addFromSearch({
  instruments: [
    { symbol: "RELIANCE.NS", name: "Reliance Industries", type: "equity", exchange: "NSE" },
    { symbol: "TCS.NS", name: "Tata Consultancy Services", type: "equity", exchange: "NSE" },
    { symbol: "INFY.NS", name: "Infosys", type: "equity", exchange: "NSE" },
    { symbol: "NIFTYBEES.NS", name: "Nippon India ETF Nifty BeES", type: "etf", exchange: "NSE" },
  ]
});

// Then refresh prices
await fetchMarketData.refreshAllPrices({});
```

---

## 📱 Web Dashboard Tasks

### Pages to Build

- [ ] `/dashboard/instruments` - List all saved instruments
  - Table with Symbol, Name, Type, Price, Change %
  - Filter tabs: All | Stocks | ETFs | Mutual Funds
  - Delete button per row
  - "Add Instruments" button

- [ ] `/dashboard/instruments/add` - Search & add instruments
  - Search input with debounce
  - Results table with checkboxes
  - "Add Selected" button

- [ ] `/dashboard/instruments/[symbol]` - Instrument detail
  - Current price with change
  - Price history table/chart
  - Refresh & Fetch History buttons

### Components to Build

- [ ] `SearchInstruments.tsx` - Search Yahoo Finance
- [ ] `InstrumentTable.tsx` - Display instruments with actions
- [ ] `PriceChart.tsx` - Simple chart for history (optional)
- [ ] `Toast.tsx` - Notification component

### Dashboard Layout

- [ ] Sidebar navigation
- [ ] Mobile responsive menu
- [ ] User profile dropdown (already have UserNav)

---

## 📲 Native App Tasks

### Screens to Build

- [ ] Watchlist screen - Show saved instruments with prices
- [ ] Search screen - Search and add instruments
- [ ] Instrument detail screen - Price and history
- [ ] Settings screen - App preferences

### Features

- [ ] Pull-to-refresh for prices
- [ ] Price change notifications (optional)
- [ ] Offline support with cached data

---

## 🗄️ Backend Enhancements

### New Features

- [ ] User-specific watchlists (schema already has `watchlists` table)
- [ ] Price alerts (new table needed)
- [ ] Portfolio tracking (holdings, buy/sell prices)

### API Additions

```typescript
// Watchlist mutations
watchlists.create({ name: string })
watchlists.addInstrument({ watchlistId, instrumentId })
watchlists.removeInstrument({ watchlistId, instrumentId })
watchlists.delete({ id })

// Watchlist queries
watchlists.list() // Get user's watchlists
watchlists.get({ id }) // Get single watchlist with instruments
```

### Mutual Funds Support

Yahoo Finance has limited MF data. Consider:
- [ ] Integrate [MFAPI.in](https://www.mfapi.in/) for Indian mutual funds
- [ ] Create separate `fetchMutualFundData.ts` action

---

## 🚀 Deployment

### Convex

- [ ] Already deployed (dev environment)
- [ ] For production: `npx convex deploy`

### Web (Vercel)

- [ ] Connect GitHub repo to Vercel
- [ ] Set environment variables:
  - `NEXT_PUBLIC_CONVEX_URL`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`

### Native (EAS Build)

- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Configure: `eas build:configure`
- [ ] Build APK: `eas build --platform android --profile preview`

---

## 📊 Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Yahoo       │────▶│ Convex      │────▶│ Dashboard   │
│ Finance API │     │ Backend     │     │ & App       │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
   Fetch on          Store prices        Real-time
   manual refresh    & history           updates via
                                         Convex subscriptions
```

---

## 🔑 Available Convex Functions

### Actions (async operations)
| Function | Description |
|----------|-------------|
| `fetchMarketData.searchInstruments` | Search Yahoo Finance |
| `fetchMarketData.refreshAllPrices` | Refresh all prices |
| `fetchMarketData.refreshPrice` | Refresh single price |
| `fetchMarketData.fetchHistory` | Fetch historical data |
| `fetchMarketData.fetchAllHistory` | Fetch history for all |

### Mutations (write operations)
| Function | Description |
|----------|-------------|
| `instruments.add` | Add single instrument |
| `instruments.addFromSearch` | Add from search results |
| `instruments.addBulk` | Add multiple instruments |
| `instruments.remove` | Soft delete instrument |
| `instruments.hardDelete` | Delete with all data |

### Queries (read operations)
| Function | Description |
|----------|-------------|
| `instruments.list` | Get all instruments |
| `instruments.getBySymbol` | Get by symbol |
| `prices.getAllPrices` | Get all current prices |
| `prices.getPrice` | Get price for one |
| `prices.getHistory` | Get price history |
| `prices.getHistoryBySymbol` | Get history by symbol |

---

## 📝 Notes

- Yahoo Finance data has 15-20 min delay (free tier limitation)
- Indian stocks use `.NS` (NSE) or `.BO` (BSE) suffix
- Convex queries auto-update in real-time when data changes
- All `/dashboard/*` routes are protected by Clerk middleware

---

## 🐛 Known Issues

- React Native Reanimated removed (caused Expo Go issues)
- If prices don't load, check Convex logs in dashboard

---

## 📚 Resources

- [Convex Docs](https://docs.convex.dev/)
- [Clerk Docs](https://clerk.com/docs)
- [Expo Docs](https://docs.expo.dev/)
- [Yahoo Finance API (unofficial)](https://github.com/ranaroussi/yfinance)
