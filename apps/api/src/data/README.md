# Mock Transaction Data

This directory contains mock transaction data for testing and demonstration purposes.

## Files

- **mock-transactions.json**: Sample transaction data (20 transactions spanning August 2026)
- **seed.ts**: Utilities for loading mock data into the in-memory store

## Mock Data Overview

The mock data includes:
- **Income transactions**: Salary, freelance work, consulting bonuses
- **Expense transactions**: Housing, utilities, food, transportation, entertainment, health, shopping
- **Realistic amounts**: From $12.50 (coffee) to $5,000 (salary)
- **Diverse categories**: Employment, Housing, Utilities, Food, Transportation, Health, Entertainment, Education, Insurance, Shopping, Side Work
- **Date range**: August 1-13, 2026

### Summary
- **Total Income**: $7,000
- **Total Expenses**: ~$3,134.62
- **Balance**: ~$3,865.38

## Usage

### Option 1: Automatic Seeding on Startup

Set the `SEED_DATA` environment variable to `true`:

```bash
# In apps/api/.env
SEED_DATA=true
```

Then start the server:

```bash
pnpm dev
```

You'll see:
```
Seeding transaction store with mock data...
✓ Seeded 20 transactions
🚀 API server started on port 3000 (development)
```

### Option 2: Manual Seeding via Code

```typescript
import { seedMockData, clearMockData } from './data/seed.js';

// Load mock data
seedMockData();

// Clear all data
clearMockData();
```

### Option 3: Manual Seeding via API Calls

Use the mock data as a reference for creating transactions via POST requests:

```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-08-01",
    "description": "Monthly Salary",
    "amount": 5000,
    "type": "income",
    "category": "Employment"
  }'
```

## Testing with Mock Data

The mock data is useful for:

1. **API Testing**: Test filtering, sorting, and pagination with realistic data
2. **Frontend Development**: Build UI components with meaningful data
3. **Demo/Screenshots**: Show the app with populated data
4. **Performance Testing**: Stress test with larger datasets (duplicate the data)

### Example Queries

With mock data loaded, you can test various scenarios:

```bash
# Get all transactions
curl http://localhost:3000/api/v1/transactions

# Filter by type
curl "http://localhost:3000/api/v1/transactions?type=expense"

# Filter by category
curl "http://localhost:3000/api/v1/transactions?category=Food"

# Search descriptions
curl "http://localhost:3000/api/v1/transactions?search=gas"

# Combine filters
curl "http://localhost:3000/api/v1/transactions?type=expense&category=Food&search=groceries"

# Get financial summary
curl http://localhost:3000/api/v1/summary
```

## Extending Mock Data

To add more transactions:

1. Edit `mock-transactions.json`
2. Follow the existing format:
   ```json
   {
     "date": "2026-08-15",
     "description": "Description here",
     "amount": 100.00,
     "type": "income",
     "category": "Category"
   }
   ```
3. Ensure validation rules are met:
   - `date`: ISO 8601 format (YYYY-MM-DD)
   - `description`: Non-empty string
   - `amount`: Positive number
   - `type`: "income" or "expense"
   - `category`: Non-empty string

## Notes

- Mock data is stored in **memory only** and resets when the server restarts
- IDs are auto-generated on load (UUIDs)
- Invalid transactions in the JSON file are skipped with a warning
- Seeding is **disabled by default** to avoid confusion in production-like environments
