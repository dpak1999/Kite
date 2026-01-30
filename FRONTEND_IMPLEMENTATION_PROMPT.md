# Frontend Implementation Prompt: Mobile App Wallet & Trading UI

## Overview

Implement the complete mobile app UI for the investment portfolio management system. The **backend APIs are already implemented and documented** in `/packages/backend/WALLET_TRADING_API.md`.

Your task is to create all mobile app screens, components, hooks, and modals to provide users with:
- Virtual wallet management
- Add money request functionality
- Buy/sell stocks and mutual funds
- Transaction history viewing
- Enhanced portfolio with P&L visualization
- Watchlist with search capability

## Current State

### Mobile App (`/apps/native`)
- ✅ React Native with Expo 54
- ✅ Clerk authentication integrated
- ✅ Convex backend connection
- ✅ Bottom tab navigation (5 tabs: Watchlist, Orders, Portfolio, Apps, Profile)
- ❌ All screens are placeholders - need complete implementation
- ❌ No wallet, transaction, or portfolio features implemented

### What's Already Done
- ✅ Backend schema with 4 new tables (wallets, addMoneyRequests, transactions, watchlist)
- ✅ All backend APIs implemented and tested:
  - `convex/wallets.ts` - Wallet management
  - `convex/addMoneyRequests.ts` - Add money requests
  - `convex/transactions.ts` - Transaction history
  - `convex/trading.ts` - Buy/sell functionality
  - `convex/watchlist.ts` - Watchlist management
  - `convex/holdings.ts` - Enhanced portfolio with P&L

## Backend APIs Available

Refer to `/packages/backend/WALLET_TRADING_API.md` for complete API documentation.

### Key APIs You'll Use

#### Wallet APIs
- `api.wallets.getUserWallet(userId)` - Get wallet balance
- `api.wallets.getWalletStats(userId)` - Get wallet statistics
- `api.wallets.initializeWallet(userId)` - Initialize wallet for new user

#### Add Money APIs
- `api.addMoneyRequests.getUserRequests(userId, paginationOpts)` - Get user's requests
- `api.addMoneyRequests.createRequest(userId, amount)` - Create new request
- `api.addMoneyRequests.cancelRequest(requestId, userId)` - Cancel pending request

#### Transaction APIs
- `api.transactions.getUserTransactions(userId, filters?, paginationOpts)` - Get transactions with filters
- `api.transactions.getRecentTransactions(userId, limit)` - Get recent transactions
- `api.transactions.getTransactionStats(userId)` - Get transaction statistics

#### Trading APIs
- `api.trading.buyStock(userId, stockId, quantity)` - Buy stock
- `api.trading.sellStock(userId, holdingId, quantity)` - Sell stock
- `api.trading.buyMutualFund(userId, mutualFundId, units)` - Buy mutual fund
- `api.trading.sellMutualFund(userId, holdingId, units)` - Sell mutual fund

#### Holdings APIs
- `api.holdings.getUserPortfolio(userId)` - Get portfolio with P&L
- `api.holdings.getPortfolioSummary(userId)` - Get portfolio stats only
- `api.holdings.getStockHoldingById(holdingId)` - Get single stock holding
- `api.holdings.getMutualFundHoldingById(holdingId)` - Get single MF holding

#### Watchlist APIs
- `api.watchlist.getUserWatchlist(userId)` - Get user's watchlist
- `api.watchlist.addToWatchlist(userId, instrumentType, instrumentId)` - Add to watchlist
- `api.watchlist.removeFromWatchlist(userId, instrumentType, instrumentId)` - Remove from watchlist
- `api.watchlist.toggleWatchlist(userId, instrumentType, instrumentId)` - Toggle watchlist
- `api.watchlist.isInWatchlist(userId, instrumentType, instrumentId)` - Check if in watchlist

## Implementation Requirements

### Phase 1: Dependencies & Setup

**File**: `/apps/native/package.json`

Add these dependencies:
```json
{
  "react-native-chart-kit": "^6.12.0",
  "react-native-svg": "^15.0.0",
  "react-native-modal": "^13.0.1",
  "react-native-toast-message": "^2.2.1",
  "@react-native-async-storage/async-storage": "^2.1.0",
  "react-native-tab-view": "^3.5.2",
  "react-native-pager-view": "^6.5.2"
}
```

After updating package.json, run:
```bash
cd apps/native
npm install
```

---

### Phase 2: Custom Hooks

**Directory**: `/apps/native/src/hooks/`

Create these custom hooks to fetch data from Convex:

#### 1. `useUserWallet.ts`
```typescript
import { useQuery } from "convex/react";
import { api } from "../../../packages/backend/convex/_generated/api";

export const useUserWallet = (userId: string) => {
  const wallet = useQuery(api.wallets.getUserWallet,
    userId ? { userId } : "skip"
  );
  return wallet;
};

export const useWalletStats = (userId: string) => {
  const stats = useQuery(api.wallets.getWalletStats,
    userId ? { userId } : "skip"
  );
  return stats;
};
```

#### 2. `useUserTransactions.ts`
```typescript
import { useQuery } from "convex/react";
import { api } from "../../../packages/backend/convex/_generated/api";

export const useUserTransactions = (
  userId: string,
  filters?: { type?: string },
  page = 1,
  limit = 20
) => {
  return useQuery(
    api.transactions.getUserTransactions,
    userId
      ? {
          userId,
          filters,
          paginationOpts: { page, limit },
        }
      : "skip"
  );
};

export const useRecentTransactions = (userId: string, limit = 5) => {
  return useQuery(
    api.transactions.getRecentTransactions,
    userId ? { userId, limit } : "skip"
  );
};

export const useTransactionStats = (userId: string) => {
  return useQuery(
    api.transactions.getTransactionStats,
    userId ? { userId } : "skip"
  );
};
```

#### 3. `useUserPortfolio.ts`
```typescript
import { useQuery } from "convex/react";
import { api } from "../../../packages/backend/convex/_generated/api";

export const useUserPortfolio = (userId: string) => {
  return useQuery(
    api.holdings.getUserPortfolio,
    userId ? { userId } : "skip"
  );
};

export const usePortfolioSummary = (userId: string) => {
  return useQuery(
    api.holdings.getPortfolioSummary,
    userId ? { userId } : "skip"
  );
};
```

#### 4. `useWatchlist.ts`
```typescript
import { useQuery } from "convex/react";
import { api } from "../../../packages/backend/convex/_generated/api";

export const useWatchlist = (userId: string) => {
  return useQuery(
    api.watchlist.getUserWatchlist,
    userId ? { userId } : "skip"
  );
};

export const useWatchlistCount = (userId: string) => {
  return useQuery(
    api.watchlist.getWatchlistCount,
    userId ? { userId } : "skip"
  );
};
```

#### 5. `useAddMoneyRequests.ts`
```typescript
import { useQuery } from "convex/react";
import { api } from "../../../packages/backend/convex/_generated/api";

export const useUserRequests = (userId: string, page = 1, limit = 10) => {
  return useQuery(
    api.addMoneyRequests.getUserRequests,
    userId
      ? {
          userId,
          paginationOpts: { page, limit },
        }
      : "skip"
  );
};
```

---

### Phase 3: Reusable Components

**Directory**: `/apps/native/src/components/`

Create these reusable UI components. Use the existing styling patterns from other screens.

#### Component List

1. **`WalletCard.tsx`** - Display wallet balance prominently with icon
   - Show current balance (large, bold)
   - Show "Add Money" button
   - Optional: Show recent activity count

2. **`TransactionListItem.tsx`** - Single transaction row
   - Icon based on transaction type (add_money, buy, sell)
   - Transaction description
   - Amount with +/- indicator and color (green for credit, red for debit)
   - Date/time
   - Tap to view details

3. **`HoldingCard.tsx`** - Stock/MF holding display
   - Instrument name and symbol
   - Quantity/units owned
   - Current price/NAV
   - Current value (quantity × price)
   - P&L amount and percentage with color coding
   - Buy/Sell buttons

4. **`InstrumentCard.tsx`** - Watchlist/search result item
   - Instrument name and symbol
   - Current price
   - Percentage change (with color)
   - "Add to Watchlist" / "Remove from Watchlist" button
   - Tap to view detail screen

5. **`PortfolioSummary.tsx`** - Overall portfolio statistics card
   - Total invested
   - Current value
   - Total gain/loss (amount and %)
   - Color-coded based on positive/negative

6. **`PriceChart.tsx`** - Simple line chart for historical prices
   - Use react-native-chart-kit
   - Show price trend over time
   - Optional: Show gain/loss area

7. **`AmountInput.tsx`** - Formatted rupee input field
   - Number input with rupee symbol (₹)
   - Validation (min, max)
   - Error message display
   - Format as currency on blur

8. **`ConfirmModal.tsx`** - Confirmation dialog
   - Title
   - Message
   - Confirm/Cancel buttons
   - Customizable button labels and colors

9. **`EmptyState.tsx`** - Empty state placeholder
   - Icon
   - Message
   - Optional action button
   - Use for empty watchlist, no transactions, etc.

10. **`LoadingSpinner.tsx`** - Loading indicator
    - Centered spinner
    - Optional loading message
    - Use ActivityIndicator from React Native

**Styling Guidelines**:
- Use existing color scheme from the app
- Use `react-native-responsive-fontsize` for font sizes
- Use Ionicons for icons
- Ensure components work on both iOS and Android
- Add proper TypeScript types for all props

---

### Phase 4: Screens Implementation

#### Screen 1: WalletScreen

**File**: `/apps/native/src/screens/WalletScreen.tsx`

**Features**:
1. Display current balance prominently
2. "Add Money" button → opens AddMoneyRequestModal
3. Show pending add money requests with status badges
4. Show recent transactions (last 5)
5. "View All Transactions" button → navigate to Transactions tab
6. Pull-to-refresh

**Layout**:
```
┌─────────────────────────────┐
│  Wallet Balance             │
│  ₹ 10,000.00               │
│  [Add Money Button]         │
└─────────────────────────────┘
┌─────────────────────────────┐
│  Pending Requests           │
│  • ₹5,000 - Pending         │
│  • ₹3,000 - Approved        │
└─────────────────────────────┘
┌─────────────────────────────┐
│  Recent Transactions        │
│  • Added Money    +₹10,000  │
│  • Bought Stock   -₹5,000   │
│  • Sold MF        +₹2,500   │
│  [View All]                 │
└─────────────────────────────┘
```

**API Calls**:
- `useUserWallet(userId)` - Get balance
- `useUserRequests(userId, 1, 10)` - Get pending requests
- `useRecentTransactions(userId, 5)` - Get recent transactions
- `useMutation(api.addMoneyRequests.createRequest)` - Create request
- `useMutation(api.addMoneyRequests.cancelRequest)` - Cancel request

---

#### Screen 2: TransactionHistoryScreen

**File**: `/apps/native/src/screens/TransactionHistoryScreen.tsx` (rename from OrdersScreen.tsx)

**Features**:
1. List all transactions with pagination
2. Filter tabs: All, Add Money, Buy, Sell
3. Each item shows: icon, description, amount (+/-), date
4. Pull-to-refresh
5. Load more on scroll
6. Tap transaction to view details (optional modal)

**Layout**:
```
┌─────────────────────────────┐
│ [All] [Add$] [Buy] [Sell]   │
└─────────────────────────────┘
┌─────────────────────────────┐
│ 🔼 Added Money              │
│    +₹10,000  |  2 hours ago │
├─────────────────────────────┤
│ 📈 Bought RELIANCE          │
│    -₹5,000   |  5 hours ago │
├─────────────────────────────┤
│ 📉 Sold HDFC MF             │
│    +₹2,500   |  1 day ago   │
└─────────────────────────────┘
```

**API Calls**:
- `useUserTransactions(userId, filters, page, limit)` - Get transactions
- Filter by type based on selected tab

---

#### Screen 3: Enhanced PortfolioScreen

**File**: `/apps/native/src/screens/PortfolioScreen.tsx`

**Features**:
1. 3-tab layout using react-native-tab-view:
   - Tab 1: **Stocks**
   - Tab 2: **Mutual Funds**
   - Tab 3: **Combined**
2. Portfolio summary card at top (total invested, current value, P&L)
3. Holdings list with HoldingCard components
4. Each holding shows:
   - Name and symbol
   - Quantity/units
   - Current price
   - Current value
   - P&L (amount and %)
   - Buy/Sell buttons
5. Pull-to-refresh
6. Empty state when no holdings

**Layout** (for each tab):
```
┌─────────────────────────────┐
│  Portfolio Summary          │
│  Invested: ₹50,000          │
│  Current:  ₹55,000          │
│  Gain:     ₹5,000 (+10%)    │
└─────────────────────────────┘
┌─────────────────────────────┐
│  RELIANCE INDUSTRIES        │
│  10 shares @ ₹2,500         │
│  Current: ₹25,000           │
│  P&L: +₹2,500 (+11.1%)     │
│  [Buy] [Sell]               │
├─────────────────────────────┤
│  TCS LIMITED                │
│  5 shares @ ₹3,500          │
│  Current: ₹17,500           │
│  P&L: -₹500 (-2.8%)        │
│  [Buy] [Sell]               │
└─────────────────────────────┘
```

**API Calls**:
- `useUserPortfolio(userId)` - Get portfolio with P&L
- `useMutation(api.trading.buyStock)` - Buy stock (from modal)
- `useMutation(api.trading.sellStock)` - Sell stock (from modal)
- `useMutation(api.trading.buyMutualFund)` - Buy MF (from modal)
- `useMutation(api.trading.sellMutualFund)` - Sell MF (from modal)

---

#### Screen 4: Enhanced WatchlistScreen

**File**: `/apps/native/src/screens/WatchlistScreen.tsx`

**Features**:
1. Search bar at top
2. Search results (when typing):
   - Search both stocks and mutual funds
   - Show results with "Add to Watchlist" button
   - Tap to view detail screen
3. Watchlist section (when not searching):
   - List of watchlist items
   - Show current price and change %
   - Swipe to delete or button to remove
   - Tap to view detail screen
4. Pull-to-refresh
5. Empty state when watchlist is empty

**Layout**:
```
┌─────────────────────────────┐
│  🔍 Search stocks & MFs...  │
└─────────────────────────────┘
┌─────────────────────────────┐
│  Your Watchlist             │
├─────────────────────────────┤
│  RELIANCE                   │
│  ₹2,500 | +2.5% ⭐         │
├─────────────────────────────┤
│  HDFC Equity Fund           │
│  ₹450 | -0.5% ⭐           │
└─────────────────────────────┘
```

**Search Implementation**:
- Use `useQuery(api.stocks.listStocks)` to get all stocks (or search API if available)
- Use `useQuery(api.mutualFunds.listMutualFunds)` to get all MFs
- Filter locally based on search query
- Or implement search API on backend if needed

**API Calls**:
- `useWatchlist(userId)` - Get watchlist
- `useMutation(api.watchlist.addToWatchlist)` - Add to watchlist
- `useMutation(api.watchlist.removeFromWatchlist)` - Remove from watchlist
- `useMutation(api.watchlist.toggleWatchlist)` - Toggle (easier)

---

#### Screen 5: InstrumentDetailScreen

**File**: `/apps/native/src/screens/InstrumentDetailScreen.tsx`

**Features**:
1. Instrument header (name, symbol, current price, change %)
2. Price chart (historical data)
3. "Buy" button (opens BuyModal)
4. Key statistics (for stocks: high/low, for MFs: category, fund manager)
5. Add/Remove from watchlist toggle button
6. Back button to return

**Layout**:
```
┌─────────────────────────────┐
│  ← RELIANCE INDUSTRIES      │
│  REL | NSE                  │
│  ₹2,500.00                  │
│  +₹62.50 (+2.56%) ⬆        │
│  ⭐ In Watchlist             │
└─────────────────────────────┘
┌─────────────────────────────┐
│  [Price Chart]              │
│                             │
│      /\  /\                 │
│     /  \/  \                │
└─────────────────────────────┘
┌─────────────────────────────┐
│  [Buy]                      │
└─────────────────────────────┘
┌─────────────────────────────┐
│  Key Stats                  │
│  • High: ₹2,600             │
│  • Low: ₹2,400              │
│  • Exchange: NSE            │
└─────────────────────────────┘
```

**API Calls**:
- Pass instrument data via navigation params
- `useQuery(api.stockHistoricalData.getByStockId)` - Get historical data for chart
- `useQuery(api.watchlist.isInWatchlist)` - Check if in watchlist
- `useMutation(api.watchlist.toggleWatchlist)` - Toggle watchlist

---

### Phase 5: Modals

**Directory**: `/apps/native/src/screens/modals/`

#### Modal 1: AddMoneyRequestModal

**File**: `/apps/native/src/screens/modals/AddMoneyRequestModal.tsx`

**Features**:
- Amount input field (use AmountInput component)
- Validation:
  - Amount > 0
  - Amount <= ₹10,00,000
- Submit button
- Cancel button
- Show loading state during submission
- Show success/error message (use Toast)
- Auto-close on success

**API Call**:
- `useMutation(api.addMoneyRequests.createRequest)`

---

#### Modal 2: BuyModal

**File**: `/apps/native/src/screens/modals/BuyModal.tsx`

**Features**:
- Display instrument name and current price
- Quantity/units input
- Show total cost calculation (quantity × price)
- Show wallet balance
- Validation:
  - Quantity > 0
  - Total cost <= wallet balance
- Confirm button (disabled if invalid)
- Cancel button
- Show loading state during purchase
- Show success/error message

**Props**:
```typescript
{
  instrumentType: "stock" | "mutualFund";
  instrumentId: string;
  instrumentName: string;
  currentPrice: number;
  walletBalance: number;
  onSuccess: () => void;
  onCancel: () => void;
}
```

**API Calls**:
- `useMutation(api.trading.buyStock)` or `useMutation(api.trading.buyMutualFund)`

---

#### Modal 3: SellModal

**File**: `/apps/native/src/screens/modals/SellModal.tsx`

**Features**:
- Display instrument name and current price
- Show owned quantity/units
- Quantity/units input (with max = owned quantity)
- Show proceeds calculation (quantity × price)
- Validation:
  - Quantity > 0
  - Quantity <= owned quantity
- Confirm button
- Cancel button
- Show loading state during sale
- Show success message with proceeds

**Props**:
```typescript
{
  instrumentType: "stock" | "mutualFund";
  holdingId: string;
  instrumentName: string;
  currentPrice: number;
  ownedQuantity: number;
  onSuccess: () => void;
  onCancel: () => void;
}
```

**API Calls**:
- `useMutation(api.trading.sellStock)` or `useMutation(api.trading.sellMutualFund)`

---

### Phase 6: Navigation Updates

**File**: `/apps/native/src/navigation/TabNavigator.tsx`

**Update the tab structure**:

Option 1 (Recommended): 5 tabs
```
1. Watchlist (WatchlistScreen)
2. Transactions (TransactionHistoryScreen) - renamed from Orders
3. Portfolio (PortfolioScreen)
4. Wallet (WalletScreen) - NEW
5. Profile (ProfileScreen)
```

Option 2: Keep Wallet inside Profile as a button

Update icons accordingly:
- Watchlist: `star-outline` or `list-outline`
- Transactions: `receipt-outline` or `time-outline`
- Portfolio: `pie-chart-outline` or `trending-up-outline`
- Wallet: `wallet-outline` or `cash-outline`
- Profile: `person-outline`

---

### Phase 7: Error Handling & Loading States

**For all screens and components**:

1. **Loading States**:
   - Show LoadingSpinner while data is loading
   - Show skeleton screens for better UX (optional)

2. **Error States**:
   - Show error message if query fails
   - Add "Retry" button
   - Use Toast for mutation errors

3. **Empty States**:
   - Show EmptyState component when no data
   - Add helpful message and action button

4. **Success Feedback**:
   - Use react-native-toast-message for success notifications
   - Example: "Stock purchased successfully!"
   - Example: "Added to watchlist"

5. **Real-time Updates**:
   - Convex queries automatically update in real-time
   - Ensure UI reflects changes immediately
   - Example: After buying stock, portfolio and wallet update automatically

---

### Phase 8: Styling & Polish

**Use existing patterns from the codebase**:

1. **Colors**:
   - Use existing color scheme
   - Green for positive P&L, red for negative
   - Use theme colors for consistency

2. **Typography**:
   - Use `react-native-responsive-fontsize` for all font sizes
   - Consistent font weights (regular, medium, bold)

3. **Spacing**:
   - Consistent padding and margins
   - Use multiples of 4 or 8 for spacing

4. **Cards & Containers**:
   - Use shadow/elevation for card elevation
   - Rounded corners
   - Consistent border radius

5. **Icons**:
   - Use Ionicons exclusively
   - Consistent icon sizes
   - Match icon to action (buy = arrow-up, sell = arrow-down, etc.)

6. **Buttons**:
   - Primary buttons for main actions
   - Secondary/outline buttons for cancel
   - Disabled state styling
   - Loading state (spinner in button)

7. **Forms**:
   - Clear labels
   - Error messages below inputs
   - Focus states

---

## Testing Checklist

### Wallet Screen
- [ ] Balance displays correctly
- [ ] Add money button opens modal
- [ ] Can create add money request
- [ ] Pending requests show with status
- [ ] Can cancel pending request
- [ ] Recent transactions display
- [ ] Navigate to all transactions works
- [ ] Pull-to-refresh works

### Transaction History
- [ ] All transactions display
- [ ] Filter tabs work correctly
- [ ] Pagination works (scroll to load more)
- [ ] Pull-to-refresh works
- [ ] Transaction details correct (icon, amount, date)

### Portfolio
- [ ] 3 tabs work (Stocks, MFs, Combined)
- [ ] Portfolio summary calculates correctly
- [ ] Holdings display with correct P&L
- [ ] Buy button opens BuyModal
- [ ] Sell button opens SellModal
- [ ] Can buy stock with sufficient balance
- [ ] Cannot buy with insufficient balance
- [ ] Can sell owned holdings
- [ ] Cannot sell more than owned
- [ ] Portfolio updates after buy/sell
- [ ] Pull-to-refresh works
- [ ] Empty state shows when no holdings

### Watchlist
- [ ] Search works for stocks and MFs
- [ ] Can add to watchlist from search
- [ ] Watchlist items display
- [ ] Can remove from watchlist
- [ ] Tap item navigates to detail screen
- [ ] Pull-to-refresh works
- [ ] Empty state shows when watchlist empty

### Instrument Detail
- [ ] Instrument details display correctly
- [ ] Price chart shows historical data
- [ ] Buy button works
- [ ] Watchlist toggle works
- [ ] Navigation back works

### Modals
- [ ] AddMoneyRequestModal validates input
- [ ] BuyModal validates balance and quantity
- [ ] SellModal validates owned quantity
- [ ] All modals show loading states
- [ ] Success/error messages display
- [ ] Modals close on success

### Real-time Updates
- [ ] Wallet balance updates after add money approval
- [ ] Portfolio updates after buy/sell
- [ ] Transaction list updates after new transaction
- [ ] All screens refresh automatically (Convex reactivity)

### Cross-Platform
- [ ] Test on iOS simulator/device
- [ ] Test on Android emulator/device
- [ ] Check SafeAreaView on both platforms
- [ ] Check keyboard behavior on both platforms

---

## Development Steps

### Step 1: Setup
1. Add dependencies to package.json
2. Run `npm install`
3. Import api from Convex in files that need it

### Step 2: Create Hooks
1. Create all custom hooks in `/apps/native/src/hooks/`
2. Test hooks by logging data in a test screen

### Step 3: Create Components
1. Create all reusable components
2. Test each component in isolation
3. Style consistently

### Step 4: Implement Screens
1. Start with WalletScreen (simplest)
2. Then TransactionHistoryScreen
3. Then PortfolioScreen (most complex)
4. Then WatchlistScreen
5. Finally InstrumentDetailScreen

### Step 5: Implement Modals
1. AddMoneyRequestModal
2. BuyModal
3. SellModal

### Step 6: Update Navigation
1. Update TabNavigator with new screens
2. Test navigation flow

### Step 7: Polish & Test
1. Add loading states everywhere
2. Add error handling
3. Add empty states
4. Test all user flows
5. Fix any bugs

---

## Important Notes

1. **User ID**: Get userId from Clerk auth context. Example:
   ```typescript
   import { useUser } from "@clerk/clerk-expo";
   const { user } = useUser();
   const userId = user?.id;
   ```

2. **Convex Mutations**: Use `useMutation` hook from Convex:
   ```typescript
   import { useMutation } from "convex/react";
   const createRequest = useMutation(api.addMoneyRequests.createRequest);

   // Call it
   await createRequest({ userId, amount: 5000 });
   ```

3. **Toast Messages**: Configure Toast at app root:
   ```typescript
   import Toast from 'react-native-toast-message';

   // At bottom of App component
   <Toast />
   ```

4. **Currency Formatting**: Create a helper function:
   ```typescript
   export const formatCurrency = (amount: number) => {
     return `₹${amount.toLocaleString('en-IN', {
       minimumFractionDigits: 2,
       maximumFractionDigits: 2
     })}`;
   };
   ```

5. **P&L Color**: Create a helper:
   ```typescript
   export const getPLColor = (value: number) => {
     return value >= 0 ? '#00C853' : '#FF3D00';
   };
   ```

6. **Date Formatting**: Use a library or helper:
   ```typescript
   export const formatDate = (timestamp: number) => {
     return new Date(timestamp).toLocaleDateString('en-IN');
   };

   export const formatRelativeTime = (timestamp: number) => {
     const seconds = Math.floor((Date.now() - timestamp) / 1000);
     if (seconds < 60) return 'Just now';
     const minutes = Math.floor(seconds / 60);
     if (minutes < 60) return `${minutes}m ago`;
     const hours = Math.floor(minutes / 60);
     if (hours < 24) return `${hours}h ago`;
     const days = Math.floor(hours / 24);
     return `${days}d ago`;
   };
   ```

---

## Example Code Snippets

### Using Wallet Hook in WalletScreen

```typescript
import { useUserWallet } from '../hooks/useUserWallet';
import { useUser } from '@clerk/clerk-expo';

export default function WalletScreen() {
  const { user } = useUser();
  const wallet = useUserWallet(user?.id);

  if (!wallet) return <LoadingSpinner />;

  return (
    <View>
      <Text>Balance: {formatCurrency(wallet.balance)}</Text>
    </View>
  );
}
```

### Using Buy Mutation in BuyModal

```typescript
import { useMutation } from 'convex/react';
import { api } from '../../../../packages/backend/convex/_generated/api';

export default function BuyModal({ stockId, onSuccess }) {
  const buyStock = useMutation(api.trading.buyStock);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    try {
      setLoading(true);
      await buyStock({
        userId: user.id,
        stockId,
        quantity: parseInt(quantity),
      });
      Toast.show({
        type: 'success',
        text1: 'Purchase successful!',
      });
      onSuccess();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Purchase failed',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal>
      <TextInput value={quantity} onChangeText={setQuantity} />
      <Button onPress={handleBuy} loading={loading}>
        Buy
      </Button>
    </Modal>
  );
}
```

---

## Success Criteria

Your implementation will be successful when:

1. ✅ Users can view their wallet balance
2. ✅ Users can request to add money (admin approval required)
3. ✅ Users can view all transactions with filtering
4. ✅ Users can view their portfolio with accurate P&L calculations
5. ✅ Users can buy stocks/MFs with wallet balance validation
6. ✅ Users can sell their holdings
7. ✅ Users can search and add instruments to watchlist
8. ✅ All screens update in real-time via Convex reactivity
9. ✅ Proper error handling and user feedback
10. ✅ Clean, consistent UI following existing app patterns
11. ✅ Works on both iOS and Android

---

## Additional Resources

- Backend API Documentation: `/packages/backend/WALLET_TRADING_API.md`
- Existing screen examples: Check `LoginScreen.tsx`, `ProfileScreen.tsx` for styling patterns
- Convex React Hooks: https://docs.convex.dev/client/react
- React Native Tab View: https://github.com/react-native-community/react-native-tab-view
- React Native Chart Kit: https://github.com/indiespirit/react-native-chart-kit

---

## Questions?

If you encounter issues or need clarification:

1. Check `/packages/backend/WALLET_TRADING_API.md` for API details
2. Check existing screens for styling/pattern reference
3. Verify Convex connection is working
4. Check console for errors
5. Test backend APIs in Convex dashboard first

---

Good luck with the implementation! Focus on creating a smooth, intuitive user experience with real-time updates and proper error handling.
