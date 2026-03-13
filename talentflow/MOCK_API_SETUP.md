# Mock API Setup Guide

## Overview
This project includes mock implementations for frontend testing without needing real APIs. Perfect for UI development and testing before backend APIs are ready.

## Enabling Mocks

Add this to your `.env.local` file:

```env
NEXT_PUBLIC_USE_MOCKS=true
```

Then restart your dev server.

## What's Mocked

When `NEXT_PUBLIC_USE_MOCKS=true`, the following API endpoints use mock data:

### 1. **Search API** (`/api/search`)
- Returns mock candidates matching your query
- Simulates 500ms delay
- Mock data: [data/mock-data.ts](data/mock-data.ts#L1)

### 2. **Shortlist API** (`/api/shortlist`)
- Scores candidates against job descriptions
- Simulates 800ms delay
- Returns realistic scores based on skill matches

### 3. **Schedule API** (`/api/schedule`)
- Schedules interviews and generates Google Meet links
- Simulates 600ms delay
- Returns mock calendar event data

## Mock Data Available

5 sample candidates with profiles:
- Alice Johnson (Senior React Engineer)
- Bob Smith (Full Stack Developer)
- Carol White (Frontend Engineer)
- David Lee (DevOps Engineer)
- Eva Martinez (Product Manager)

3 sample jobs:
- Senior React Engineer
- Full Stack Developer
- DevOps Engineer

## Files Modified/Added

### New Files
- `data/mock-data.ts` - Sample candidates, jobs, and mock functions
- `lib/config.ts` - Configuration utility
- `lib/ai/candidate-search.mock.ts` - Mock search implementation
- `lib/ai/shortlist-scorer.mock.ts` - Mock shortlist implementation
- `lib/integrations/calendar.mock.ts` - Mock scheduling implementation

### Updated Files
- `app/api/search/route.ts` - Now supports mock mode
- `app/api/shortlist/route.ts` - Now supports mock mode
- `app/api/schedule/route.ts` - Now supports mock mode

## Testing the Frontend

1. Set `NEXT_PUBLIC_USE_MOCKS=true` in `.env.local`
2. Start dev server: `npm run dev`
3. Go to `http://localhost:3000`
4. Test search, shortlisting, and scheduling features

## Switching to Real APIs

1. Set `NEXT_PUBLIC_USE_MOCKS=false` (or remove the env var)
2. Ensure all required API credentials are configured
3. Restart dev server

## Adding More Mock Data

Edit `data/mock-data.ts`:

```typescript
export const MOCK_CANDIDATES = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    full_name: "Your Candidate",
    email: "candidate@example.com",
    // ... other fields
  },
  // Add more candidates
];
```

## Customizing Mock Behavior

Each mock implementation allows you to customize the delay and response:

```typescript
// Example: In lib/ai/candidate-search.mock.ts
export async function searchCandidates(query: string): Promise<SearchResult[]> {
  // Change this value to adjust simulated delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Modify logic here to change results
  const results = mockSearchCandidates(query);
  return results;
}
```

## Troubleshooting

### Mocks not being used?
- Check `.env.local` has `NEXT_PUBLIC_USE_MOCKS=true`
- Restart dev server after changing env vars
- Check console logs should show `[Mock X]` prefix

### Getting real API errors?
- Make sure `NEXT_PUBLIC_USE_MOCKS=true` is set
- Check that no real API credentials are being used in that mode

## Next Steps

Once real APIs are available:
1. Implement the actual backend endpoints
2. Remove or keep mock implementations for fallback
3. Set `NEXT_PUBLIC_USE_MOCKS=false`
