# Testing Offline AI Features - EcoTrack Uganda

## Quick Test Overview

This guide helps you verify that all offline AI features are working correctly.

## Pre-requisites

1. **Ollama Running**
   ```bash
   ollama serve
   ```

2. **Model Downloaded**
   ```bash
   ollama pull mistral
   ```

3. **Application Running**
   ```bash
   PORT=8001 npm start
   ```

## Test Scenarios

### Test 1: Application Starts Without Internet

**Steps:**
1. Disconnect your internet (or use network throttling)
2. Start the application: `npm start`
3. Open http://localhost:8001

**Expected Result:**
- Application loads successfully
- Dashboard displays
- No connection errors in console

---

### Test 2: Recommendations Generate Offline

**Steps:**
1. Navigate to Dashboard
2. Log in with demo account:
   - Email: `demo@ecotrack.ug`
   - Password: `password123`
3. Wait for recommendations to load

**Expected Result:**
- "Your Eco Tips" section populates
- Shows 3-5 sustainability recommendations
- Tips are specific to selected district
- No network errors in console

**Console Check:**
```javascript
// Open DevTools (F12) → Console tab
// Should see:
// ✓ No errors about API failures
// ✓ Recommendations load within 5 seconds
```

---

### Test 3: Challenges Display Offline

**Steps:**
1. On Dashboard, scroll to "Weekly Challenges"
2. Observe challenge cards loading

**Expected Result:**
- 3 challenge cards appear
- Each shows:
  - Title (localized)
  - Description
  - Participants count
  - Points reward
  - Category badge
- No network errors

---

### Test 4: Language Support (Offline)

**Steps:**
1. Click language selector (top right)
2. Choose "Luganda" (LG)
3. Return to Dashboard
4. Wait for recommendations/challenges to reload

**Expected Result:**
- Content updates to Luganda
- Recommendations and challenges show in Luganda
- Layout adapts properly

---

### Test 5: Fallback Behavior (Online→Offline)

**Steps:**
1. Start with internet connected
2. Load Dashboard
3. Disconnect internet
4. Refresh page
5. Complete an activity
6. Dashboard AI features should still work

**Expected Result:**
- Page loads cached data first
- When AI features trigger, they use offline models
- No hard errors (graceful degradation)

---

### Test 6: Model Performance Test

**Steps:**
1. Open DevTools → Network tab
2. Wait for recommendations to generate
3. Note time taken

**Expected Result:**

| Model | First Load | Subsequent |
|-------|-----------|------------|
| orca-mini | 15-30s | 5-8s |
| neural-chat | 20-40s | 6-10s |
| mistral | 25-50s | 7-12s |

If slower:
- Check RAM availability: `wmic OS get FreePhysicalMemory`
- Consider using orca-mini
- Check CPU usage

---

### Test 7: Activity Logging & Recommendations

**Steps:**
1. On Dashboard, click "Quick Log Activity"
2. Add a transport activity (e.g., "Biked 5km")
3. Wait 2-3 seconds
4. Observe recommendations regenerate

**Expected Result:**
- Recommendations update based on new activity
- New suggestions are relevant to the activity logged
- No errors in process

---

### Test 8: Offline Database Persistence

**Steps:**
1. Add several activities
2. Note your points total
3. Close the application
4. Restart application
5. Log in again

**Expected Result:**
- All activities persist
- Points total unchanged
- Database file (`db.json`) updated locally

---

### Test 9: Error Handling

**Steps:**
1. Stop Ollama (`Ctrl+C`)
2. Try accessing recommendations/challenges
3. Observe application behavior

**Expected Result:**
- Application doesn't crash
- Shows cached/mock data
- Console shows fallback message
- Graceful error handling

**Console should show:**
```
Offline AI failed, using mock data
```

---

### Test 10: Network Recovery

**Steps:**
1. Stop Ollama
2. Load Dashboard (uses mock data)
3. Restart Ollama
4. Refresh page or wait for auto-retry

**Expected Result:**
- Automatically connects to Ollama
- Updates recommendations with fresh AI data
- Transitions from mock to real AI smoothly

---

## Automated Test Suite

### Run Tests Programmatically

```typescript
// Test file: src/tests/offline-ai.test.ts
import { getOfflineEcoRecommendations, getOfflineChallenges } from '../services/offline-ai';
import { AppLanguage } from '../types';

describe('Offline AI Services', () => {
  it('should generate recommendations offline', async () => {
    const recs = await getOfflineEcoRecommendations([], 'Mbarara', AppLanguage.ENGLISH);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0]).toHaveProperty('title');
    expect(recs[0]).toHaveProperty('potentialSaving');
  });

  it('should generate challenges offline', async () => {
    const challenges = await getOfflineChallenges('Mbarara', AppLanguage.ENGLISH);
    expect(challenges.length).toBe(3);
    expect(challenges[0]).toHaveProperty('points');
  });

  it('should support Luganda language', async () => {
    const recs = await getOfflineEcoRecommendations([], 'Mbarara', AppLanguage.LUGANDA);
    expect(recs.length).toBeGreaterThan(0);
    // Verify translations (if "Improved Cookstoves" en, should be "Kyawe..." in lg)
  });
});
```

Run tests:
```bash
npm test
```

---

## Performance Benchmarking

### Measure Response Times

```javascript
// In browser console
const start = performance.now();
// Trigger recommendation generation here
const end = performance.now();
console.log(`Took ${end - start}ms`);
```

**Target Times:**
- First recommendation: < 60 seconds
- Subsequent: < 15 seconds
- Challenges: < 30 seconds

---

## Troubleshooting Test Failures

### Recommendations Not Loading

**Check:**
1. Is Ollama running? `ollama serve`
2. Is model downloaded? `ollama list`
3. Console errors? `F12 → Console`

**Fix:**
```bash
ollama pull mistral
# Restart app
npm start
```

### Challenges Not Showing

**Check:**
1. Disable offline mode: `OFFLINE_MODE=false` in .env
2. Should fall back to mock data
3. Check `getOfflineChallenges()` function

### Slow Performance

**Options:**
1. Switch to faster model: `OFFLINE_MODEL=orca-mini`
2. Check RAM: `wmic OS get FreePhysicalMemory`
3. Close other applications
4. Check CPU: `tasklist /V | find ollama`

### Language Not Translating

**Check:**
1. Language setting saved? Check localStorage: `localStorage.getItem('language')`
2. Is translation file complete? Check `services/translations.ts`
3. Refresh page and try again

---

## Continuous Testing Setup

### GitHub Actions (if using Git)

Create `.github/workflows/offline-ai-test.yml`:

```yaml
name: Offline AI Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      ollama:
        image: ollama/ollama
        options: --gpus all
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 16
      - run: npm install
      - run: npm test
```

---

## Reporting Issues

When reporting offline AI issues, include:

1. **System Info**
   - OS (Windows/Mac/Linux)
   - RAM available
   - Ollama version: `ollama --version`

2. **Setup**
   - Model used
   - Model size
   - .env settings

3. **Error Details**
   - Browser console errors
   - Network tab info
   - Exact error message

4. **Steps to Reproduce**
   - Detailed steps
   - What you expected
   - What actually happened

---

## Success Indicators ✅

Your offline AI setup is working if:

- [x] App loads without internet
- [x] Recommendations generate in <60s
- [x] Challenges display correctly
- [x] Language switching works
- [x] Activities persist
- [x] No unhandled errors
- [x] Graceful fallbacks work
- [x] Performance acceptable

---

**Last Updated:** January 2026
**Questions?** Check OFFLINE_AI_SETUP.md for detailed configuration
