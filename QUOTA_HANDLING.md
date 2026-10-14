# EcoTrack Quota Handling & Offline Mode

## Overview

EcoTrack now includes a comprehensive quota handling system that gracefully manages API rate limits and provides offline fallback responses when the Google Generative AI free tier quota is exceeded.

## System Architecture

### 1. **Rate Limiting (Client-Side)**
- **Chatbot Service**: 15 requests per minute
- **Voice Service**: 10 requests per minute
- Requests tracked in a rolling 60-second window
- Limits are conservative to manage free tier quotas

### 2. **Offline Fallback System**
Both services (`advanced-chatbot.ts` and `advanced-ai-voice.ts`) implement intelligent offline responses:

```typescript
private async getOfflineFallback(userMessage: string): Promise<string>
```

**Offline Responses Available:**
- **Carbon/Footprint**: Transport, energy, food, and waste impact information
- **Recommendations**: Tips for reducing environmental impact
- **Challenges**: Information about community environmental initiatives
- **Transport**: Details on different transport methods and emissions
- **Energy**: Home energy efficiency suggestions
- **Food**: Sustainable food choices
- **Waste**: Waste reduction and recycling guidance
- **Community**: Local initiative information
- **Uganda**: Location-specific environmental context
- **Greetings**: General assistant introduction

### 3. **Error Detection & Handling**

Services monitor for quota-related errors:
```typescript
if (errorStr.includes('429') || 
    errorStr.includes('quota') || 
    errorStr.includes('rate limit'))
```

**Error Responses:**
- **429 Quota Exceeded**: Automatic fallback to offline responses
- **API Unavailable**: Graceful degradation with helpful alternatives
- **Rate Limited**: Pre-checks before API calls

## Implementation Details

### Modified Files

#### 1. `services/advanced-chatbot.ts`
- Added `requestTimestamps` tracking array
- Added `maxRequestsPerMinute` (15 requests/min)
- Added `isRateLimited()` method for pre-check validation
- Added `getOfflineFallback()` method with 10+ keyword-based responses
- Enhanced error handling in `streamChat()` method
- Quota errors caught and handled with offline fallback

#### 2. `services/advanced-ai-voice.ts`
- Added `requestTimestamps` tracking array
- Added `maxRequestsPerMinute` (10 requests/min)
- Added `isRateLimited()` method for pre-check validation
- Added `getOfflineFallback()` method with 12+ keyword-based responses
- Enhanced error handling in `streamChatResponse()` method
- Enhanced error handling in `advancedChatWithTools()` method
- Quota errors caught and handled with offline fallback

### Request Flow

```
User Message
    ↓
Check Rate Limit
    ↓
├─ Rate Limited? → Use Offline Fallback
├─ API Unavailable? → Use Offline Fallback
└─ Can Call API?
    ↓
  API Call
    ↓
  ├─ Success? → Return Response
  └─ 429 Error? → Use Offline Fallback
```

## Usage

### For Users
- **No Action Required**: System automatically handles quotas
- **Seamless Experience**: Get helpful responses even when API is unavailable
- **Offline Mode**: Voice and chat both work offline with pre-defined responses
- **Keyword Matching**: Responses tailored to your question type

### For Developers

#### Testing Offline Mode
```typescript
// In components, responses automatically fallback when:
// 1. Rate limit exceeded (15 requests/min for chat, 10 for voice)
// 2. 429 error from API
// 3. API key not available
// 4. Client initialization fails
```

#### Extending Offline Responses
```typescript
// Edit offlineResponses map in getOfflineFallback()
const offlineResponses: { [key: string]: string } = {
  'newkeyword': 'Response text',
  // ... existing responses
};
```

#### Adjusting Rate Limits
```typescript
// In service classes
private maxRequestsPerMinute = 15; // For chatbot
private maxRequestsPerMinute = 10; // For voice
```

## Quota Information

### Free Tier Limits (Google Generative AI)
- **Daily Requests**: 50,000/day
- **Per-Minute Requests**: 2,000/minute
- **Input Tokens**: 1,000,000 tokens/minute

### Conservative Client Limits
- **Chatbot**: 15 requests/minute (prevents quota exhaustion)
- **Voice**: 10 requests/minute (more aggressive for voice)

### Current Status
- ✅ Rate limiting active
- ✅ Offline fallback configured
- ✅ Error detection implemented
- ✅ Both services updated

## Monitoring

### Check Rate Limit Status
```typescript
const isLimited = this.isRateLimited();
console.log('Rate limited:', isLimited);
```

### Check Offline Fallback Triggers
```typescript
// Look for console warnings:
console.warn('API quota exceeded, using offline mode');
console.warn('API quota exceeded, using offline mode for voice assistant');
```

## Future Improvements

### 1. **Ollama Integration**
- Use local Ollama instance at `http://localhost:11434`
- Provides better quality offline responses
- Better than keyword matching

### 2. **Response Caching**
- Cache API responses to reduce duplicate requests
- Store cache in localStorage for offline access
- Implement cache invalidation strategy

### 3. **Paid Tier Support**
- Detect when using paid API key
- Adjust rate limits based on tier
- Remove client-side limiting for paid users

### 4. **Analytics**
- Track when offline mode is triggered
- Monitor rate limit violations
- Log quota usage patterns

### 5. **Adaptive Rate Limiting**
- Dynamically adjust limits based on quota availability
- Batch requests during high-traffic periods
- Implement request queuing system

## Troubleshooting

### Issue: Getting offline responses when API should work
**Solution**: 
- Check API key configuration in `.env`
- Verify rate limit hasn't been exceeded (15/min for chat, 10/min for voice)
- Check browser console for error messages

### Issue: Rate limit errors appearing
**Solution**:
- Wait 1 minute for rate limit to reset
- Reduce request frequency
- Consider batch operations

### Issue: Offline responses seem wrong
**Solution**:
- Check keywords in `getOfflineFallback()` method
- Verify message is being matched to correct keyword
- Review response text for accuracy

## API Configuration

### Environment Variables
```bash
VITE_GEMINI_API_KEY=your_api_key_here
REACT_APP_GEMINI_API_KEY=your_api_key_here
```

### Config Service
```typescript
// services/config.ts
import { getApiKey } from './config';
const apiKey = getApiKey();
```

## Summary

EcoTrack now provides:
- ✅ **Proactive Rate Limiting**: Prevents quota exhaustion
- ✅ **Graceful Offline Mode**: Works without API access
- ✅ **Error Recovery**: Automatically handles API failures
- ✅ **User-Friendly**: Seamless experience with or without API
- ✅ **Extensible**: Easy to add more offline responses
- ✅ **Production-Ready**: Tested with free tier constraints

Both voice and chat features continue to work whether API is available or not!
