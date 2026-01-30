# Wallet & Trading Backend APIs

Complete documentation for the wallet, transaction, trading, and watchlist backend APIs implemented for the Kite investment platform.

## Overview

This implementation adds a complete virtual trading system with:
- **Virtual Wallet**: Each user has a wallet with balance for virtual trading
- **Add Money System**: Users request money, admin approves, balance updates
- **Buy/Sell Functionality**: Users can buy/sell stocks and mutual funds
- **Transaction History**: Complete audit trail of all money movements
- **Portfolio Management**: Enhanced portfolio with P&L calculations
- **Watchlist**: Track instruments of interest

## Database Schema

### New Tables

#### 1. `wallets`
User's virtual account balance for trading.

```typescript
{
  userId: Id<"users">,
  balance: number,           // Current balance in rupees
  totalAdded: number,        // Lifetime added amount
  totalSpent: number,        // Lifetime spent on purchases
  totalEarned: number,       // Lifetime earned from sales
  lastUpdatedAt: number,
  createdAt: number,
}
```

**Indexes**: `by_userId`

#### 2. `addMoneyRequests`
User requests for adding money to wallet.

```typescript
{
  userId: Id<"users">,
  amount: number,
  status: "pending" | "approved" | "rejected",
  requestedAt: number,
  approvedAt?: number,
  approvedBy?: Id<"users">,
  rejectionReason?: string,
}
```

**Indexes**: `by_userId`, `by_status`, `by_requestedAt`

#### 3. `transactions`
Complete audit trail of all money movements.

```typescript
{
  userId: Id<"users">,
  type: "add_money" | "buy_stock" | "sell_stock" | "buy_mf" | "sell_mf",
  amount: number,
  description: string,
  relatedAssetId?: string,
  relatedAssetName?: string,
  quantity?: number,
  pricePerUnit?: number,
  balanceBefore: number,
  balanceAfter: number,
  createdAt: number,
}
```

**Indexes**: `by_userId`, `by_type`, `by_userId_createdAt`

#### 4. `watchlist`
User's tracked instruments.

```typescript
{
  userId: Id<"users">,
  instrumentType: "stock" | "mutualFund",
  instrumentId: string,
  addedAt: number,
}
```

**Indexes**: `by_userId`, `by_userId_instrumentId`

## API Modules

### 1. Wallets API (`convex/wallets.ts`)

#### Queries

**`getUserWallet(userId: Id<"users">)`**
- Get user's wallet with current balance
- Returns: `Wallet | null`

**`getWalletStats(userId: Id<"users">)`**
- Get wallet statistics for a user
- Returns: `{ currentBalance, totalAdded, totalSpent, totalEarned, netInvested, lastUpdatedAt }`

#### Mutations

**`initializeWallet(userId: Id<"users">)`**
- Initialize wallet for a new user (auto-called on signup)
- Creates wallet with ₹0 balance
- Returns: `Wallet`

**`updateBalance(userId, newBalance, addedAmount?, spentAmount?, earnedAmount?)`**
- Internal function to update wallet balance
- Used by transaction modules
- Returns: `Wallet`

---

### 2. Add Money Requests API (`convex/addMoneyRequests.ts`)

#### Queries

**`getUserRequests(userId: Id<"users">, paginationOpts: { page, limit })`**
- Get user's add money requests with pagination
- Returns: `{ requests, total, page, limit, totalPages }`

**`getPendingRequests(paginationOpts: { page, limit })`**
- Get pending requests for admin dashboard
- Enriched with user details
- Returns: `{ requests, total, page, limit, totalPages }`

**`getAllRequests(status?, paginationOpts: { page, limit })`**
- Get all requests with optional status filter
- For admin dashboard
- Returns: `{ requests, total, page, limit, totalPages }`

#### Mutations

**`createRequest(userId: Id<"users">, amount: number)`**
- User creates add money request
- Validates: amount > 0, amount <= ₹10,00,000, no pending requests
- Returns: `AddMoneyRequest`

**`approveRequest(requestId: Id<"addMoneyRequests">, adminId: Id<"users">)`**
- Admin approves request
- Updates wallet balance
- Creates "add_money" transaction
- Marks request as approved
- Returns: `AddMoneyRequest`

**`rejectRequest(requestId: Id<"addMoneyRequests">, adminId: Id<"users">, reason?: string)`**
- Admin rejects request
- Updates request status with rejection reason
- Returns: `AddMoneyRequest`

**`cancelRequest(requestId: Id<"addMoneyRequests">, userId: Id<"users">)`**
- User cancels their own pending request
- Deletes the request
- Returns: `{ success: true, message }`

---

### 3. Transactions API (`convex/transactions.ts`)

#### Queries

**`getUserTransactions(userId, filters?, paginationOpts: { page, limit })`**
- Get user's transactions with optional type filter
- Filter by: `type` (add_money, buy_stock, sell_stock, buy_mf, sell_mf)
- Returns: `{ transactions, total, page, limit, totalPages }`

**`getRecentTransactions(userId: Id<"users">, limit: number)`**
- Get last N transactions for dashboard
- Returns: `Transaction[]`

**`getTransactionStats(userId: Id<"users">)`**
- Get transaction statistics
- Returns: `{ totalTransactions, totalAdded, totalSpent, totalEarned, stockPurchases, stockSales, mfPurchases, mfSales }`

**`getTransactionsByType(userId, type, paginationOpts: { page, limit })`**
- Get transactions filtered by specific type
- Returns: `{ transactions, total, page, limit, totalPages }`

**`getTransaction(transactionId: Id<"transactions">)`**
- Get a single transaction by ID
- Returns: `Transaction | null`

#### Mutations

**`createTransaction(userId, type, amount, description, relatedAssetId?, relatedAssetName?, quantity?, pricePerUnit?, balanceBefore, balanceAfter)`**
- Internal function to create a transaction
- Used by other modules (addMoneyRequests, trading)
- Returns: `Transaction`

---

### 4. Trading API (`convex/trading.ts`)

#### Mutations

**`buyStock(userId: Id<"users">, stockId: Id<"stocks">, quantity: number)`**
- Buy stock shares
- Validates: quantity > 0, wallet balance >= totalCost
- Deducts from wallet
- Creates/updates userStockHoldings
- Creates "buy_stock" transaction
- Returns: `{ success, newBalance, holding, message }`

**`sellStock(userId: Id<"users">, holdingId: Id<"userStockHoldings">, quantity: number)`**
- Sell stock shares
- Validates: quantity > 0, user owns >= quantity shares
- Adds to wallet (quantity × currentPrice)
- Updates/removes holding
- Creates "sell_stock" transaction
- Returns: `{ success, newBalance, proceeds, message }`

**`buyMutualFund(userId: Id<"users">, mutualFundId: Id<"mutualFunds">, units: number)`**
- Buy mutual fund units
- Similar logic to buyStock using currentNav
- Returns: `{ success, newBalance, holding, message }`

**`sellMutualFund(userId: Id<"users">, holdingId: Id<"userMutualFundHoldings">, units: number)`**
- Sell mutual fund units
- Similar logic to sellStock using currentNav
- Returns: `{ success, newBalance, proceeds, message }`

---

### 5. Watchlist API (`convex/watchlist.ts`)

#### Queries

**`getUserWatchlist(userId: Id<"users">)`**
- Get user's watchlist with enriched instrument data
- Returns: `Array<{ watchlistItem, instrument }>`

**`getWatchlistByType(userId, instrumentType: "stock" | "mutualFund")`**
- Get watchlist items filtered by type
- Returns: `Array<{ watchlistItem, instrument }>`

**`isInWatchlist(userId, instrumentType, instrumentId: string)`**
- Check if an instrument is in user's watchlist
- Returns: `boolean`

**`getWatchlistCount(userId: Id<"users">)`**
- Get watchlist count by type
- Returns: `{ total, stocks, mutualFunds }`

#### Mutations

**`addToWatchlist(userId, instrumentType, instrumentId: string)`**
- Add instrument to watchlist
- Validates: instrument exists, not already in watchlist
- Returns: `WatchlistItem`

**`removeFromWatchlist(userId, instrumentType, instrumentId: string)`**
- Remove instrument from watchlist
- Returns: `{ success: true, message }`

**`toggleWatchlist(userId, instrumentType, instrumentId: string)`**
- Toggle watchlist status (add if not present, remove if present)
- Returns: `{ success, action: "added" | "removed", item?, message }`

---

### 6. Holdings API (Enhanced) (`convex/holdings.ts`)

#### Enhanced Queries

**`getUserPortfolio(userId: Id<"users">)`**
- Get user's complete portfolio with P&L calculations
- Returns:
```typescript
{
  stocks: Array<{
    holding: UserStockHolding,
    stock: Stock,
    currentValue: number,
    gainLoss: number,
    gainLossPercent: number,
  }>,
  mutualFunds: Array<{
    holding: UserMutualFundHolding,
    mutualFund: MutualFund,
    currentValue: number,
    gainLoss: number,
    gainLossPercent: number,
  }>,
  combined: {
    totalInvested: number,
    totalCurrentValue: number,
    totalGainLoss: number,
    totalGainLossPercent: number,
    stocksInvested: number,
    stocksCurrentValue: number,
    mfsInvested: number,
    mfsCurrentValue: number,
  }
}
```

**`getStockHoldingById(holdingId: Id<"userStockHoldings">)`**
- Get single stock holding with P&L
- Returns: `{ holding, stock, currentValue, gainLoss, gainLossPercent } | null`

**`getMutualFundHoldingById(holdingId: Id<"userMutualFundHoldings">)`**
- Get single MF holding with P&L
- Returns: `{ holding, mutualFund, currentValue, gainLoss, gainLossPercent } | null`

**`getPortfolioSummary(userId: Id<"users">)`**
- Get portfolio summary (stats only, no holdings list)
- Returns:
```typescript
{
  totalInvested: number,
  totalCurrentValue: number,
  totalGainLoss: number,
  totalGainLossPercent: number,
  stocksCount: number,
  stocksInvested: number,
  stocksCurrentValue: number,
  mfsCount: number,
  mfsInvested: number,
  mfsCurrentValue: number,
}
```

---

## Usage Examples

### 1. Add Money Flow

```typescript
// User creates request
const request = await ctx.runMutation(api.addMoneyRequests.createRequest, {
  userId: "user_123",
  amount: 10000,
});

// Admin approves request
await ctx.runMutation(api.addMoneyRequests.approveRequest, {
  requestId: request._id,
  adminId: "admin_456",
});

// User's wallet balance is now updated
const wallet = await ctx.runQuery(api.wallets.getUserWallet, {
  userId: "user_123",
});
// wallet.balance === 10000
```

### 2. Buy Stock Flow

```typescript
// Buy 10 shares of a stock
const result = await ctx.runMutation(api.trading.buyStock, {
  userId: "user_123",
  stockId: "stock_xyz",
  quantity: 10,
});
// result: { success: true, newBalance: 5000, holding: {...}, message: "..." }

// Check updated portfolio
const portfolio = await ctx.runQuery(api.holdings.getUserPortfolio, {
  userId: "user_123",
});
// portfolio.stocks[0].holding.quantity === 10
// portfolio.stocks[0].currentValue === 10 * currentPrice
// portfolio.stocks[0].gainLoss === currentValue - totalInvested
```

### 3. View Transactions

```typescript
// Get recent transactions
const recent = await ctx.runQuery(api.transactions.getRecentTransactions, {
  userId: "user_123",
  limit: 5,
});

// Get all transactions with pagination
const allTxns = await ctx.runQuery(api.transactions.getUserTransactions, {
  userId: "user_123",
  paginationOpts: { page: 1, limit: 20 },
});

// Get only buy transactions
const buyTxns = await ctx.runQuery(api.transactions.getUserTransactions, {
  userId: "user_123",
  filters: { type: "buy_stock" },
  paginationOpts: { page: 1, limit: 20 },
});
```

### 4. Manage Watchlist

```typescript
// Add to watchlist
await ctx.runMutation(api.watchlist.addToWatchlist, {
  userId: "user_123",
  instrumentType: "stock",
  instrumentId: "stock_xyz",
});

// Check if in watchlist
const isWatched = await ctx.runQuery(api.watchlist.isInWatchlist, {
  userId: "user_123",
  instrumentType: "stock",
  instrumentId: "stock_xyz",
});
// isWatched === true

// Get watchlist
const watchlist = await ctx.runQuery(api.watchlist.getUserWatchlist, {
  userId: "user_123",
});
// watchlist: [{ watchlistItem, instrument: { id, type, name, symbol, currentPrice, ... } }]

// Toggle (remove since it's already in watchlist)
await ctx.runMutation(api.watchlist.toggleWatchlist, {
  userId: "user_123",
  instrumentType: "stock",
  instrumentId: "stock_xyz",
});
// Returns: { success: true, action: "removed", message: "Removed from watchlist" }
```

---

## Testing the Backend

### Using Convex Dashboard

1. **Push schema changes**:
   ```bash
   cd packages/backend
   npx convex dev
   ```

2. **Test wallet initialization**:
   - Go to Convex Dashboard → Functions
   - Run `wallets:initializeWallet` with a userId
   - Verify wallet created with balance = 0

3. **Test add money flow**:
   - Run `addMoneyRequests:createRequest` with userId and amount
   - Run `addMoneyRequests:getPendingRequests` to see pending requests
   - Run `addMoneyRequests:approveRequest` with requestId and adminId
   - Run `wallets:getUserWallet` to verify balance updated
   - Run `transactions:getRecentTransactions` to see transaction created

4. **Test buy stock**:
   - Ensure user has wallet balance
   - Run `trading:buyStock` with userId, stockId, quantity
   - Run `holdings:getUserPortfolio` to see new holding with P&L
   - Run `wallets:getUserWallet` to verify balance deducted

5. **Test sell stock**:
   - Ensure user has stock holdings
   - Run `trading:sellStock` with userId, holdingId, quantity
   - Run `holdings:getUserPortfolio` to see updated holding
   - Run `wallets:getUserWallet` to verify balance credited

6. **Test watchlist**:
   - Run `watchlist:addToWatchlist` with userId, instrumentType, instrumentId
   - Run `watchlist:getUserWatchlist` to see watchlist items
   - Run `watchlist:removeFromWatchlist` to remove item

### Error Scenarios to Test

1. **Insufficient balance**: Try buying with balance < totalCost
2. **Insufficient quantity**: Try selling more shares than owned
3. **Duplicate add money request**: Try creating request when one is pending
4. **Invalid quantity**: Try buying/selling with quantity <= 0
5. **Missing instrument**: Try buying a non-existent stock/MF
6. **Unauthorized sell**: Try selling holding that doesn't belong to user

---

## Data Flow Diagrams

### Add Money Flow
```
User → createRequest → addMoneyRequests table (status: pending)
                              ↓
Admin → approveRequest → Update wallet.balance
                              ↓
                    Create transaction (type: add_money)
                              ↓
                    Update request (status: approved)
```

### Buy Stock Flow
```
User → buyStock → Validate balance >= totalCost
                        ↓
                  Deduct from wallet.balance
                        ↓
                  Create/update userStockHoldings
                        ↓
                  Create transaction (type: buy_stock)
```

### Sell Stock Flow
```
User → sellStock → Validate quantity <= holding.quantity
                         ↓
                   Add to wallet.balance (proceeds)
                         ↓
                   Update/delete userStockHoldings
                         ↓
                   Create transaction (type: sell_stock)
```

---

## Security Considerations

1. **Wallet Balance Validation**: All buy operations validate sufficient balance before proceeding
2. **Ownership Validation**: Sell operations verify the holding belongs to the user
3. **Immutable Transactions**: Transaction records are created via internal mutation, ensuring audit trail integrity
4. **Request Limits**: Add money requests limited to ₹10,00,000 per request
5. **Single Pending Request**: Users can only have one pending add money request at a time

---

## Performance Considerations

1. **Indexes**: All tables have appropriate indexes for common query patterns
2. **Pagination**: All list queries support pagination to handle large datasets
3. **Enrichment**: Queries enrich data with related entities in a single request
4. **Atomic Operations**: Buy/sell operations are atomic - either all steps succeed or all fail

---

## Future Enhancements

1. **Transaction Fees**: Add configurable transaction fees for buy/sell operations
2. **Order Types**: Support limit orders, stop-loss orders
3. **Recurring Investments**: Support SIP (Systematic Investment Plan) for mutual funds
4. **Portfolio Rebalancing**: Suggest portfolio rebalancing based on target allocations
5. **Tax Calculations**: Calculate capital gains tax for sell transactions
6. **Notifications**: Send notifications on request approval, order execution
7. **Bulk Operations**: Support buying/selling multiple instruments at once
8. **Price Alerts**: Alert users when instruments reach target prices

---

## API Endpoints Summary

| Module | Queries | Mutations |
|--------|---------|-----------|
| wallets | getUserWallet, getWalletStats | initializeWallet, updateBalance |
| addMoneyRequests | getUserRequests, getPendingRequests, getAllRequests | createRequest, approveRequest, rejectRequest, cancelRequest |
| transactions | getUserTransactions, getRecentTransactions, getTransactionStats, getTransactionsByType, getTransaction | createTransaction |
| trading | - | buyStock, sellStock, buyMutualFund, sellMutualFund |
| watchlist | getUserWatchlist, getWatchlistByType, isInWatchlist, getWatchlistCount | addToWatchlist, removeFromWatchlist, toggleWatchlist |
| holdings | getUserPortfolio, getStockHoldingById, getMutualFundHoldingById, getPortfolioSummary | (existing mutations) |

---

## Contact & Support

For questions or issues with the backend APIs, please refer to the main project documentation or contact the development team.
