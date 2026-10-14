# ⚡ EcoTrack Uganda - Quick Reference

## 🚀 Quick Start (2 minutes)

```bash
# 1. Get API Key
# Visit: https://aistudio.google.com/ → Get API Key

# 2. Create .env file
echo GEMINI_API_KEY=your_key_here > .env

# 3. Run app
npm start

# 4. Open browser
# http://localhost:8001
```

---

## 🎤 Voice Assistant

### Enable It
```env
GEMINI_API_KEY=AIzaSy...
```

### Use It
1. Click 🎤 button (bottom right)
2. Allow microphone
3. Speak your question

### Demo Questions
- "What's my carbon footprint?"
- "How can I reduce emissions?"
- "Tell me about sustainable transport"

---

## 📹 Video Modal

### Upload Video
1. Go to Videos screen
2. Click Upload button
3. Fill form
4. Click Publish

### Required Fields
- Title
- Description
- Category (Transport/Energy/Food/Waste/General)
- Thumbnail URL

---

## 🤖 AI Features

### Online (Gemini)
```env
GEMINI_API_KEY=your_key
# Auto-enabled when key is set
```

### Offline (Ollama)
```env
OFFLINE_MODE=true
OFFLINE_MODEL=mistral
```

### Check What's Running
```javascript
// Browser console
window.GEMINI_API_KEY  // Should show key
```

---

## ⚙️ Configuration

### .env File Template
```env
# Voice Assistant
GEMINI_API_KEY=AIzaSy...

# Offline AI
OFFLINE_MODE=false
OFFLINE_MODEL=mistral
OLLAMA_URL=http://localhost:11434

# Server
PORT=8001
NODE_ENV=development
```

---

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start server
npm start

# Development mode with watch
npm run dev

# Clean build
rm -rf dist node_modules && npm install && npm run build
```

---

## 🐛 Troubleshooting

### Voice Button Disabled
```
❌ Issue: Button is gray/disabled
✅ Fix: Set GEMINI_API_KEY in .env
```

### Microphone Not Working
```
❌ Issue: "NotAllowedError"
✅ Fix: Allow microphone in browser permissions
```

### No AI Responses
```
❌ Issue: Recommendations not showing
✅ Fix: Check GEMINI_API_KEY or run Ollama
```

### Modal Won't Open
```
❌ Issue: Modal doesn't appear
✅ Fix: Check browser console for errors (F12)
```

---

## 📊 What's Included

- ✅ Voice Assistant (Real-time)
- ✅ AI Recommendations
- ✅ Community Challenges
- ✅ Video Upload
- ✅ Offline Support
- ✅ Multi-Language (EN/LG)
- ✅ Demo Account
- ✅ Local Storage

---

## 🔐 Security

### Protect Your API Key
```bash
# Add to .gitignore
echo ".env" >> .gitignore

# Never commit .env file
git status  # Verify .env is ignored
```

---

## 📱 Demo Account

```
Email: demo@ecotrack.ug
Password: password123
```

---

## 🌐 URLs

- **App:** http://localhost:8001
- **Gemini API:** https://aistudio.google.com/
- **Ollama:** http://localhost:11434
- **Docs:** See COMPLETE_SETUP_GUIDE.md

---

## 🆘 Get Help

1. Check browser console: `F12 → Console`
2. Read error messages carefully
3. See `GEMINI_API_SETUP.md` for voice help
4. See `OFFLINE_AI_SETUP.md` for offline help
5. See `COMPLETE_SETUP_GUIDE.md` for full guide

---

## ✅ Verify Everything Works

```javascript
// In browser console:

// 1. Check Gemini key
console.log('Gemini:', window.GEMINI_API_KEY ? '✅' : '❌');

// 2. Check app version
console.log('App:', document.title);

// 3. Check voice button
console.log('Voice ready:', document.querySelector('[title="Start Voice Chat"]') ? '✅' : '❌');
```

---

## 🎯 Next Steps

1. ✅ Get Gemini API key
2. ✅ Add to .env or browser
3. ✅ Restart app
4. ✅ Click 🎤 button
5. ✅ Start speaking!

---

**Ready to track your eco-impact?** 🌿

Start the app: `npm start`

---

**Last Updated:** January 2026 | **Version:** 1.0.0
