# EcoTrack Uganda - Offline AI Setup Guide

## Overview
This guide helps you set up offline AI models for EcoTrack Uganda using Ollama. The application can work without internet connectivity while maintaining full functionality.

## Prerequisites
- Node.js 16+
- 4GB+ RAM
- Internet connection (only for initial setup)

## Step 1: Install Ollama

### Windows
1. Download Ollama from [ollama.ai](https://ollama.ai)
2. Run the installer
3. Open Command Prompt and verify installation:
   ```cmd
   ollama --version
   ```

### macOS
```bash
brew install ollama
```

### Linux
```bash
curl https://ollama.ai/install.sh | sh
```

## Step 2: Pull Required Models

Once Ollama is installed, pull a lightweight model:

```bash
# Recommended: Mistral (7B) - Fastest, good quality
ollama pull mistral

# Alternative: Neural Chat (7B) - Good for Q&A
ollama pull neural-chat

# Alternative: Orca Mini (3B) - Lighter, faster
ollama pull orca-mini
```

**First pull will download 4-7GB, so ensure you have space and internet.**

## Step 3: Start Ollama Server

### Windows
```cmd
ollama serve
```
The server will start on `http://localhost:11434`

### macOS/Linux
```bash
ollama serve
```

## Step 4: Configure EcoTrack Uganda

### Environment Variables

Create a `.env` file in the root directory:

```env
# Offline AI Configuration
OFFLINE_MODE=true
OFFLINE_MODEL=mistral
OLLAMA_URL=http://localhost:11434

# Optional: Keep your Gemini key as fallback
GEMINI_API_KEY=your_key_here

# Server Port
PORT=8001
```

### Updated Configuration in server.js

If using Node.js backend, the app will automatically:
1. Try Ollama first (if available)
2. Fall back to Gemini API (if available)
3. Use mock data (if both fail)

## Step 5: Run EcoTrack Uganda

```cmd
npm start
```

The app will now use offline AI models!

## Features Available Offline

✅ **Recommendations** - AI-powered sustainability tips
✅ **Challenges** - Personalized community challenges  
✅ **Eco Expert Chat** - Question answering (text only)
✅ **All other app features** - No internet required

⚠️ **Offline Limitations**
- Voice/Live Assistant requires internet (Google API)
- Local initiative search uses static data
- Image generation not available offline

## Performance Tips

### Model Selection by Hardware

| Model | Size | Speed | Quality | RAM |
|-------|------|-------|---------|-----|
| orca-mini | 3.3B | ⚡⚡⚡ | Good | 4GB+ |
| neural-chat | 7B | ⚡⚡ | Better | 8GB+ |
| mistral | 7B | ⚡⚡ | Best | 8GB+ |
| llama2 | 7B | ⚡ | Excellent | 16GB+ |

### Optimization

1. **Reduce model precision:**
   ```bash
   ollama pull mistral:quantized
   ```

2. **Use GPU acceleration** (NVIDIA):
   ```bash
   # Ollama automatically detects CUDA-capable GPUs
   ```

3. **Adjust response generation timeout:**
   - Edit `OLLAMA_TIMEOUT` in `.env` (default: 30000ms)

## Testing Offline Mode

### Test Recommendations
```typescript
import { getOfflineEcoRecommendations } from './services/offline-ai';

const recs = await getOfflineEcoRecommendations(
  [],
  'Mbarara',
  AppLanguage.ENGLISH
);
console.log(recs);
```

### Test Challenges
```typescript
import { getOfflineChallenges } from './services/offline-ai';

const challenges = await getOfflineChallenges(
  'Mbarara',
  AppLanguage.ENGLISH
);
console.log(challenges);
```

## Fallback Strategy

The application uses this priority:

1. **Online Gemini** (if API key exists and internet available)
2. **Offline Ollama** (if server running)
3. **Mock Data** (always available)

This ensures the app never crashes and always provides content.

## Troubleshooting

### Ollama Not Found
```cmd
# Check Ollama path
where ollama

# If not found, add to PATH manually or use full path
C:\Users\YourName\AppData\Local\Programs\Ollama\ollama.exe serve
```

### Port Already in Use
```cmd
# Change port in .env
OLLAMA_URL=http://localhost:11435

# Or kill existing process
netstat -ano | findstr :11434
taskkill /PID <PID> /F
```

### Model Takes Too Long to Load
- First run loads model into memory (~30-60 seconds)
- Subsequent calls are faster (5-10 seconds)
- Consider using orca-mini for faster responses

### Memory Issues
```bash
# Check available RAM
wmic OS get TotalVisibleMemorySize, FreePhysicalMemory

# Use lighter model
ollama pull orca-mini
# Update .env: OFFLINE_MODEL=orca-mini
```

## Advanced: Using Different Models

### Swap Model Runtime
Edit `.env`:
```env
OFFLINE_MODEL=neural-chat
```

Restart the app - it will automatically load the new model.

### Custom Model Fine-tuning
For production use, you can fine-tune models with EcoTrack-specific data:
```bash
ollama create ecotrack-expert -f Modelfile
```

## Production Deployment

For offline-first production environments:

1. **Pre-download models** before deployment
2. **Use quantized versions** to reduce size
3. **Set OFFLINE_MODE=true** to skip online attempts
4. **Monitor memory usage** on servers
5. **Use model caching** for faster responses

## Support & Resources

- Ollama Docs: https://github.com/ollama/ollama
- Model Library: https://ollama.ai/library
- Issue Tracker: https://github.com/ollama/ollama/issues

---

**Made Offline by:** EcoTrack Uganda Team
**Last Updated:** January 2026
