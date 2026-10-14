# EcoTrack Uganda - Complete Feature & Setup Guide

## 📱 Application Overview

EcoTrack Uganda is a comprehensive sustainability tracking application for Western Uganda with real-time AI assistance, offline capabilities, and full modal functionality.

### Core Features

| Feature | Status | Requires |
|---------|--------|----------|
| 🎤 Live Voice Assistant | ✅ Active | Gemini API Key + Microphone |
| 🤖 AI Recommendations | ✅ Active | Gemini API OR Offline AI |
| 🏆 Community Challenges | ✅ Active | Gemini API OR Offline AI |
| 📹 Video Upload Modal | ✅ Active | None (Local) |
| 📊 Carbon Footprint Tracking | ✅ Active | None (Local) |
| 🌍 Offline Support | ✅ Active | Ollama (Optional) |
| 🗣️ Multi-Language | ✅ Active | None (Built-in) |

---

## 🎤 Voice Assistant Setup

### Quick Start

1. **Get Gemini API Key**
   - Visit https://aistudio.google.com/
   - Click "Get API Key"
   - Copy the key

2. **Configure Key**
   - Create `.env` file:
     ```env
     GEMINI_API_KEY=your_key_here
     ```
   - Or set in browser console:
     ```javascript
     window.GEMINI_API_KEY = 'your_key_here';
     ```

3. **Start Using**
   - Click 🎤 button (bottom right)
   - Allow microphone access
   - Speak to the Eco-Consultant

### Voice Features

✅ **Real-Time Transcription** - Your speech converted to text
✅ **AI Voice Response** - Hear eco-tips spoken aloud  
✅ **Context Awareness** - Responses based on your location
✅ **Multiple Languages** - Speak/listen in English or Luganda
✅ **Continuous Conversation** - Multi-turn dialogue support

### Troubleshooting Voice

| Issue | Solution |
|-------|----------|
| Button is gray | Set `GEMINI_API_KEY` in `.env` or browser |
| No microphone | Check browser permissions for microphone |
| No audio response | Check speaker volume, browser audio settings |
| Slow responses | Check internet speed, try shorter queries |
| Connection errors | Verify API key is valid and active |

---

## 🤖 AI Recommendations & Challenges

### Online Mode (Gemini)

When `GEMINI_API_KEY` is configured:

```
Dashboard → Loads Gemini API → AI Recommendations/Challenges
```

**Features:**
- Personalized to your location (district)
- Context-aware based on activities
- Multi-language support
- Real-time generation

### Offline Mode (Ollama)

When `OLLAMA_URL` is configured:

```
Dashboard → Loads Ollama Model → Offline AI Recommendations/Challenges
```

**Benefits:**
- No internet required
- Faster local processing
- Privacy (data stays local)
- Lower latency

### Configuration Priority

The app tries in this order:
1. Online Gemini API (if key configured)
2. Offline Ollama (if running)
3. Mock data (always available)

---

## 📹 Video Upload Modal

### Features

✅ **Easy Upload Form** - Intuitive modal interface
✅ **Category Selection** - Transport, Energy, Waste, Food, General
✅ **Real-Time Validation** - Prevents incomplete submissions
✅ **Thumbnail URL Input** - Custom or auto-generated thumbnails
✅ **Loading States** - Visual feedback during submission

### How to Use

1. Navigate to **Videos** screen
2. Click "Upload Video" button (or 📹 icon)
3. Fill in:
   - Video Title
   - Description
   - Category
   - Thumbnail URL
4. Click **PUBLISH**
5. Modal closes and video added to feed

### Modal States

```
Idle (Closed)
    ↓
Click "Upload" Button
    ↓
Modal Opens (Animated)
    ↓
User Fills Form
    ↓
Submit Button Clicked
    ↓
Loading State (Spinner)
    ↓
Success → Modal Closes
    ↓
Video Appears in Feed
```

### Video Categories

- **General** - General sustainability tips
- **Transport** - Eco-friendly travel
- **Energy** - Renewable energy, efficiency
- **Waste** - Recycling, composting
- **Food** - Sustainable eating

---

## ⚙️ Complete Setup Instructions

### 1. Clone & Install

```bash
git clone <repo-url>
cd ecotrack-uganda
npm install
```

### 2. Configure Environment

Create `.env` file:

```env
# Voice Assistant (Recommended)
GEMINI_API_KEY=AIzaSy... 

# Offline AI (Optional)
OFFLINE_MODE=false
OFFLINE_MODEL=mistral
OLLAMA_URL=http://localhost:11434

# Server
PORT=8001
NODE_ENV=development
```

### 3. Setup Offline AI (Optional)

```bash
# Install Ollama from https://ollama.ai
ollama pull mistral

# Start Ollama in background
ollama serve
```

### 4. Build & Run

```bash
# Build
npm run build

# Start
npm start

# Open 
```

---

## 🌐 API Configuration

### Gemini API Key

**Get It:**
- https://aistudio.google.com/ → "Get API Key"
- https://console.cloud.google.com/ → Create credentials

**Set It:**

**Option A - .env file:**
```env
GEMINI_API_KEY=your_key_here
```

**Option B - Browser Console:**
```javascript
window.GEMINI_API_KEY = 'your_key_here';
```

**Option C - HTML Script:**
```html
<script>
  window.GEMINI_API_KEY = 'your_key_here';
</script>
```

### Ollama Setup

**Windows/Mac/Linux:**
```bash
# Install: https://ollama.ai
# Download model
ollama pull mistral

# Run server
ollama serve
# Listens on http://localhost:11434
```

---

## 📊 Dashboard Features

### Components

| Component | Purpose | Data Source |
|-----------|---------|-------------|
| Footprint Chart | Daily CO2 summary | Local storage |
| AI Tips | Personalized recommendations | Gemini/Ollama/Mock |
| Challenges | Weekly community events | Gemini/Ollama/Mock |
| Activity Log | Recent activities | Local storage |
| Points Display | User achievements | Local storage |

### Demo Account

```
Email: demo@ecotrack.ug
Password: password123
District: Mbarara
```

---

## 🔒 Security & Best Practices

### API Key Security

```bash
# Add to .gitignore
echo ".env" > .gitignore

# Never commit keys to git
git status  # Verify .env is ignored
```

### Permissions

- 🎤 **Microphone** - Required for voice assistant
- 📍 **Location** - Optional for local initiatives
- 💾 **Storage** - Local browser storage for data

### Rate Limits

Gemini Free Tier:
- 60 requests/minute
- ~1,000,000 requests/month
- 100 concurrent requests

---

## 🧪 Testing

### Test Voice Assistant

```javascript
// Browser Console
// 1. Check API key
window.GEMINI_API_KEY  

// 2. Check Gemini availability
const { isGeminiAvailable } = 
  await import('./services/live-api-enhanced.ts');
console.log(await isGeminiAvailable());

// 3. Check Ollama
fetch('http://localhost:11434/api/tags')
  .then(r => r.json())
  .then(console.log);
```

### Test Recommendations

```javascript
// Dashboard should show AI tips
// Check Console for:
// ✓ No errors
// ✓ Recommendations load within 5s
// ✓ Tips are specific to your district
```

### Test Video Modal

```javascript
// 1. Navigate to Videos
// 2. Click Upload button
// 3. Fill form
// 4. Click Publish
// 5. Verify:
//    ✓ Modal closes
//    ✓ Loading spinner shows
//    ✓ Video appears in list
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [GEMINI_API_SETUP.md](GEMINI_API_SETUP.md) | Voice assistant setup |
| [OFFLINE_AI_SETUP.md](OFFLINE_AI_SETUP.md) | Offline AI with Ollama |
| [TESTING_OFFLINE_AI.md](TESTING_OFFLINE_AI.md) | Testing guide |
| [README.md](README.md) | Project overview |

---

## 🚀 Performance Tips

### Optimize Build Size

```bash
# Current: ~640KB gzipped
# To reduce:
# 1. Use dynamic imports
# 2. Lazy load components
# 3. Tree-shake unused code

npm run build
```

### Optimize Runtime

```javascript
// Use offline mode for faster responses
OFFLINE_MODE=true

// Use lighter model
OFFLINE_MODEL=orca-mini  // vs mistral
```

### Optimize Network

```env
# Cache API responses
CACHE_RESPONSES=true
CACHE_TTL=3600000  // 1 hour

# Reduce requests
BATCH_REQUESTS=true
```

---

## 🐛 Common Issues & Fixes

| Issue | Error | Fix |
|-------|-------|-----|
| Voice disabled | Button is gray | Set GEMINI_API_KEY |
| No mic access | "NotAllowedError" | Allow microphone in browser |
| Slow AI | Takes >60s | Use orca-mini, reduce input |
| Offline fails | "Connection error" | Start Ollama, check port |
| Modal stuck | Won't close | Try F5 refresh or clear cache |
| Build fails | Rollup error | Delete node_modules, npm install |

---

## 📞 Support

### Resources

- **Gemini Docs:** https://ai.google.dev/docs
- **Ollama Docs:** https://github.com/ollama/ollama
- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev

### Get Help

1. Check browser console: `F12 → Console`
2. Check application logs: `npm start`
3. Review error messages
4. Check .env configuration
5. Verify internet connection
6. Try clearing cache: `Ctrl+Shift+Delete`

---

## ✅ Feature Checklist

- [x] 🎤 Voice Assistant (Gemini)
- [x] 🤖 AI Recommendations (Gemini/Ollama)
- [x] 🏆 AI Challenges (Gemini/Ollama)  
- [x] 📹 Video Upload Modal
- [x] 📊 Dashboard Analytics
- [x] 🌍 Offline Mode (Ollama)
- [x] 🗣️ Multi-Language Support
- [x] 💾 Local Data Persistence
- [x] 🔐 Secure API Configuration
- [x] 📱 Responsive Mobile UI

---

## 🎉 You're All Set!

Everything is now configured and ready to use:

1. ✅ Voice assistant active
2. ✅ All modals functional
3. ✅ AI features integrated
4. ✅ Offline support ready
5. ✅ Full multi-language support

**Start the app:** `npm start`

**Open in browser:** http://localhost:8001

**Enjoy sustainable impact tracking!** 🌿

---

**Last Updated:** January 2026
**Version:** 1.0.0
