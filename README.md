# 🌱 EcoTrack Uganda - Carbon Footprint Tracker & Community Platform

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

**An AI-powered environmental tracking application with voice assistance, community initiatives, and real-time carbon footprint monitoring for Uganda.**

[![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7.3.1-purple?logo=vite)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-4.18-green?logo=express)](https://expressjs.com)
[![Google AI](https://img.shields.io/badge/Google%20AI-Gemini%202.0-red?logo=google)](https://ai.google.dev)

</div>

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [Running the Application](#running-the-application)
7. [Framework Details](#framework-details)
8. [Architecture](#architecture)
9. [API Documentation](#api-documentation)
10. [Advanced Features](#advanced-features)
11. [Quota Management](#quota-management)
12. [Troubleshooting](#troubleshooting)
13. [Development](#development)
14. [Deployment](#deployment)

---

## 🎯 Overview

**EcoTrack Uganda** is a comprehensive environmental tracking platform designed specifically for Ugandan communities. It combines cutting-edge AI technology with practical sustainability tools to help users:

- **Track Carbon Footprint**: Monitor personal environmental impact across transport, energy, food, and waste
- **Voice Interaction**: Chat with AI-powered voice assistant for real-time recommendations
- **Community Connection**: Join local environmental initiatives and sustainability challenges
- **Educational Content**: Learn about climate change through curated video content
- **Real-time Analytics**: Visualize your environmental impact with dynamic charts

The application uses **Google's Gemini AI 2.0 Flash** for advanced natural language processing and **React 19** for a responsive, modern user interface.

---

## ✨ Features

### 🎤 Advanced Voice Assistant
- **Real-time Speech Recognition**: Convert voice to text using Web Speech API
- **Streaming Responses**: Get AI responses as they're generated (no waiting)
- **Natural Language Understanding**: Context-aware conversations with conversation history
- **Function Calling**: Voice commands can trigger specific actions (carbon calculation, recommendations)
- **Text-to-Speech Output**: Listen to responses through browser audio
- **Offline Fallback**: Works even when API quota is exceeded with intelligent responses

### 💬 Advanced Chatbot
- **Streaming Chat Interface**: Real-time message streaming with visible AI thinking
- **Sentiment Analysis**: Understand user emotion and respond appropriately
- **Recommendation Engine**: Personalized sustainability tips based on user profile
- **Conversation History**: Maintains context across multiple exchanges
- **Rate Limiting**: Smart quota management to prevent free tier exhaustion
- **Offline Mode**: Keyword-based responses when API unavailable

### 📊 Carbon Footprint Calculator
- **Multi-category Tracking**: Transport, energy use, food, waste
- **Real-time Visualization**: Interactive charts showing impact distribution
- **Historical Data**: Track changes over time
- **Comparative Analysis**: See how your footprint compares to others

### 🌍 Community Hub
- **Local Initiatives**: Discover environmental projects in your district
- **Challenge Participation**: Join sustainability challenges with community members
- **User Profiles**: Create public profiles and track community contributions
- **Social Features**: Connect with other eco-conscious Ugandans

### 📚 Education Center
- **Video Content**: Curated environmental education videos
- **Interactive Lessons**: Learn about climate action and sustainability
- **Resource Library**: Access guides and best practices

### 👤 User Management
- **Email Authentication**: Secure registration and login
- **JWT-based Sessions**: Token-based authentication system
- **Google SSO**: One-click login with Google Account
- **Profile Management**: Customize personal settings and preferences
- **Data Persistence**: All user data securely stored in database

---

## 🛠️ Technology Stack

### **Frontend**

#### **React 19.2.3**
- **Latest React Features**: React Server Components, Transitions, and Concurrent features
- **Hooks API**: Custom hooks for state management and side effects
- **Functional Components**: Modern component-based architecture
- **JSX/TSX**: Type-safe component templating

#### **TypeScript 5.6**
- **Static Type Checking**: Catch errors at compile time
- **Advanced Types**: Generics, unions, interfaces for type safety
- **Better IDE Support**: IntelliSense and code completion
- **Null Safety**: Optional chaining and nullish coalescing

#### **Vite 7.3.1**
- **Lightning-Fast Development**: Hot Module Replacement (HMR) for instant updates
- **Optimized Build**: Efficient production bundles (~2.2MB)
- **Native ESM**: Modern JavaScript module system
- **CSS Processing**: Built-in support for CSS modules and preprocessing

#### **Web APIs Used**
- **Web Speech API**: Voice recognition and text-to-speech synthesis
- **Web Audio API**: Audio processing and playback
- **LocalStorage**: Client-side data persistence
- **Fetch API**: HTTP requests to backend
- **Canvas API**: Dynamic background rendering

### **Backend**

#### **Express.js 4.18**
- **RESTful API**: Standard HTTP methods and routing
- **Middleware Support**: Request processing pipeline
- **Static File Serving**: Serve built frontend assets
- **CORS Enabled**: Cross-origin requests supported
- **Error Handling**: Comprehensive error management

#### **Node.js**
- **JavaScript Runtime**: Server-side JavaScript execution
- **NPM Ecosystem**: Access to thousands of packages
- **Async/Await**: Modern asynchronous programming

### **AI & LLM**

#### **Google Generative AI (Gemini 2.0 Flash)**
- **Latest Language Model**: State-of-the-art natural language understanding
- **Streaming Responses**: Real-time token generation for instant feedback
- **Function Calling**: Enable AI to invoke specific tools and functions
- **Multimodal Support**: Process text and potentially images
- **System Prompts**: Custom instructions for specific behaviors

#### **Ollama (Optional)**
- **Local LLM**: Run language models locally for privacy
- **Fallback Option**: Use when API quota exceeded
- **Privacy-first**: Data never leaves your machine

### **Database**

#### **lowdb 5.1.0**
- **Lightweight JSON DB**: File-based database (db.json)
- **Synchronous Operations**: Simple, blocking I/O
- **Perfect for Small Projects**: Sufficient for MVP and testing
- **Easy Data Inspection**: Human-readable JSON format

### **Authentication**

#### **JWT (JSON Web Tokens)**
- **Stateless Authentication**: No server-side session storage
- **Secure Token Format**: Base64-encoded with HMAC signatures
- **Expiration**: Automatic token expiry for security
- **Cross-domain Support**: Works across different domains

### **Package Management**

#### **npm 10+**
- **Dependency Management**: Install and manage 100+ packages
- **Scripts**: Automated build, dev, and deployment tasks
- **Lock File**: Reproducible installs with package-lock.json

---

## 📁 Project Structure

```
ecotrack-uganda/
│
├── 📄 Configuration Files
│   ├── vite.config.ts          # Vite build configuration
│   ├── tsconfig.json           # TypeScript configuration
│   ├── package.json            # Dependencies and scripts
│   ├── .env                    # Environment variables (API keys)
│   └── index.html              # HTML entry point
│
├── 🎨 Frontend Source (TypeScript/React)
│   ├── index.tsx               # React app entry point
│   ├── App.tsx                 # Main component with routing
│   ├── types.ts                # TypeScript interfaces
│   ├── constants.ts            # Global constants and configuration
│   ├── metadata.json           # App metadata
│   │
│   ├── 📱 Components/
│   │   ├── Navigation.tsx                  # Header/tab navigation
│   │   ├── MainNatureBackground.tsx        # Dynamic animated background
│   │   ├── DynamicBackground.tsx           # Secondary background effects
│   │   ├── ActivityLogger.tsx              # Activity tracking UI
│   │   ├── ChallengeCard.tsx               # Challenge display component
│   │   ├── RecommendationCard.tsx          # Recommendation display
│   │   ├── FootprintChart.tsx              # Chart visualization
│   │   ├── LiveAssistant.tsx               # Voice UI component
│   │   ├── AdvancedLiveAssistant.tsx       # Enhanced voice with streaming
│   │   ├── AdvancedChatbot.tsx             # Advanced chatbot UI
│   │   └── VideoUploadModal.tsx            # Video upload interface
│   │
│   ├── 📖 Screens/
│   │   ├── Dashboard.tsx       # Main dashboard view
│   │   ├── Calculator.tsx      # Footprint calculator screen
│   │   ├── Community.tsx       # Community hub screen
│   │   ├── Videos.tsx          # Video gallery screen
│   │   └── ...
│   │
│   └── 🔧 Services/
│       ├── api.ts                  # Main API client
│       ├── config.ts               # Configuration management
│       ├── gemini.ts               # Gemini API integration
│       ├── live-api.ts             # Live streaming API
│       ├── advanced-ai-voice.ts    # Advanced voice service (593 lines)
│       ├── advanced-chatbot.ts     # Advanced chatbot service (635+ lines)
│       ├── LanguageContext.tsx     # i18n language management
│       ├── translations.ts         # Language translations
│       └── offline-ai.ts           # Offline AI fallback
│
├── 🖥️ Backend (Node.js/Express)
│   ├── server.js               # Express server (371 lines)
│   │   ├── Port: 8000
│   │   ├── Static file serving
│   │   ├── Auth endpoints
│   │   └── API routing
│   │
│   └── Routes:
│       ├── POST /api/users/register
│       ├── POST /api/users/login
│       ├── POST /api/users/google-login
│       └── GET /* (static files)
│
├── 💾 Database
│   └── db.json                 # lowdb JSON database
│       ├── users array
│       ├── activities array
│       └── user sessions
│
├── 📚 Documentation
│   ├── README.md               # This file (comprehensive guide)
│   ├── QUOTA_HANDLING.md       # Quota management system
│   └── IMPLEMENTATION_SUMMARY.md  # Feature implementation details
│
└── 📦 Build Output
    └── dist/                   # Production bundle
        ├── index.html          # Built HTML
        ├── assets/
        │   ├── index-*.js      # Bundled JavaScript (2.1MB)
        │   └── *.css           # Compiled styles
        └── ...
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js**: Version 16.0 or higher
- **npm**: Version 8.0 or higher
- **Git**: For cloning the repository
- **Google Generative AI API Key**: From [ai.google.dev](https://ai.google.dev)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd ecotrack-uganda
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs 100+ packages including:
- React, ReactDOM, React Router
- Google Generative AI SDK
- Express, Vite, TypeScript
- lowdb, dotenv, cors
- And more...

### Step 3: Configure Environment Variables
Create or update `.env` file:
```bash
# Google Generative AI
VITE_GEMINI_API_KEY=your_api_key_here
REACT_APP_GEMINI_API_KEY=your_api_key_here

# Optional: For Ollama fallback
OLLAMA_API_URL=http://localhost:11434

# Server Configuration
PORT=8000
NODE_ENV=development
```

**Get Your API Key:**
1. Visit [Google AI Studio](https://ai.studio)
2. Click "Get API Key"
3. Create a new API key
4. Copy and paste into `.env`

### Step 4: Verify Installation
```bash
npm run build
# Should complete with: "✓ built in X.XXs"
```

---

## ▶️ Running the Application

### Development Mode (with live reload)
```bash
npm run dev
```
- Frontend runs on: `http://localhost:5173`
- Hot reload enabled: Changes appear instantly
- Source maps available for debugging

### Production Build
```bash
npm run build
```
- Optimizes code and assets
- Creates `dist/` folder with production files
- Bundle size: ~2.2MB (gzipped: ~408KB)

### Start Production Server
```bash
npm run start
# or
node server.js
```
- Server runs on: `http://localhost:8000`
- Serves production-built frontend
- Listens for API requests

### Run Both Frontend & Backend
```bash
# Terminal 1: Development frontend
npm run dev

# Terminal 2: Backend server
node server.js
```

---

## 📖 Framework Details

### React 19.2.3 - Frontend Framework

#### What is React?
React is a JavaScript library for building user interfaces with reusable components. It uses a virtual DOM to efficiently update only the parts of the UI that change.

#### How It's Used in EcoTrack:

**Component-Based Architecture:**
```typescript
// App.tsx - Root component
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {currentUser ? <Dashboard /> : <LoginScreen />}
    </div>
  );
}
```

**State Management:**
- `useState()`: Local component state for UI data
- `useEffect()`: Side effects like API calls
- `useContext()`: Shared state (language, user info)
- Props: Data passed to child components

**React Hooks:**
- `useState`: Manage component state
- `useEffect`: Handle side effects and lifecycle
- `useContext`: Access shared context data
- `useCallback`: Memoize functions for performance
- `useReducer`: Complex state logic

#### Key React Features Used:
1. **Functional Components**: All components are functions
2. **JSX**: HTML-like syntax in JavaScript
3. **Two-way Binding**: Form inputs with state
4. **Event Handling**: onClick, onChange, onSubmit
5. **Conditional Rendering**: Show/hide elements based on state
6. **List Rendering**: Map over arrays to create elements
7. **Props Drilling**: Pass data through component tree
8. **Fragments**: <> </> syntax to avoid extra div wrappers

### TypeScript 5.6 - Type Safety

#### What is TypeScript?
TypeScript extends JavaScript with static types, catching errors before runtime and providing better IDE support.

#### How It's Used in EcoTrack:

**Type Definitions:**
```typescript
// types.ts
interface User {
  id: string;
  email: string;
  name: string;
  district: string;
  isPremium: boolean;
  createdAt: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

type ActivityType = 'transport' | 'energy' | 'food' | 'waste';
```

**Benefits:**
1. **Type Checking**: Catch errors at compile time
2. **IDE Support**: Autocomplete and IntelliSense
3. **Documentation**: Types serve as documentation
4. **Refactoring**: Safe, automated refactoring
5. **Self-documenting Code**: Types show function expectations

**TypeScript Features Used:**
- `interface`: Define object shapes
- `type`: Create type aliases
- `enum`: Define fixed sets of values
- `generics`: Reusable components with type parameters
- `union types`: `'string' | 'number'`
- `optional properties`: `name?: string`
- `readonly`: Prevent mutations

### Vite 7.3.1 - Build Tool & Development Server

#### What is Vite?
Vite (French for "quick") is a next-generation frontend build tool that offers:
- Lightning-fast development server (HMR)
- Optimized production builds
- Native ESM support
- Zero-config out of the box

#### How It's Used in EcoTrack:

**Development Server:**
```bash
npm run dev
# Starts on http://localhost:5173
# Changes apply instantly (HMR)
```

**Vite Configuration (vite.config.ts):**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    minify: false, // For debugging
    outDir: 'dist',
  }
})
```

**Benefits in EcoTrack:**
1. **Fast Development**: Changes visible in <100ms
2. **Small Bundle**: Only necessary code included
3. **Efficient Caching**: Leverages HTTP caching
4. **Asset Optimization**: Automatic image/file optimization

### Express.js 4.18 - Backend Framework

#### What is Express?
Express is a minimal web framework for Node.js that provides:
- Routing (map URLs to handlers)
- Middleware (request processing)
- Static file serving
- Easy API development

#### How It's Used in EcoTrack:

**Server Structure (server.js):**
```typescript
const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.post('/api/users/register', (req, res) => {
  // Handle registration
});

app.listen(8000, () => {
  console.log('Server running on port 8000');
});
```

**Key Express Features Used:**
1. **Routing**: `app.get()`, `app.post()`, etc.
2. **Middleware**: `app.use(middleware)`
3. **Static Files**: `app.use(express.static('dist'))`
4. **Request/Response**: Handle HTTP requests
5. **Error Handling**: Catch and log errors

#### API Endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/users/register` | Create new account |
| POST | `/api/users/login` | Authenticate user |
| POST | `/api/users/google-login` | OAuth login |
| GET | `/*` | Serve static files |

### Google Generative AI (Gemini 2.0 Flash) - AI Engine

#### What is Gemini?
Gemini is Google's latest language model offering:
- State-of-the-art natural language understanding
- Streaming responses for real-time feedback
- Function calling for tool integration
- Multimodal capabilities (text, images, etc.)

#### How It's Used in EcoTrack:

**Gemini Integration (advanced-chatbot.ts, advanced-ai-voice.ts):**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const client = new GoogleGenerativeAI(apiKey);
const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Stream responses
const response = await model.generateContentStream({
  contents: [{ role: 'user', parts: [{ text: userMessage }] }],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1024,
  }
});

for await (const chunk of response.stream) {
  console.log(chunk.text());
}
```

**Advanced Features:**
1. **Streaming**: Real-time token generation
2. **Function Calling**: AI can invoke tools
3. **System Prompts**: Custom AI behavior
4. **Conversation History**: Context awareness
5. **Temperature Control**: Creativity vs. determinism

#### Prompts Used:

**Eco-Tracker Prompt:**
```
You are an expert environmental sustainability consultant...
Help track and reduce carbon footprint...
```

**Chatbot Prompt:**
```
You are a friendly EcoTrack assistant...
Provide personalized recommendations...
```

**Voice Assistant Prompt:**
```
You are a helpful voice assistant for environmental tracking...
Provide concise, friendly responses...
```

### lowdb 5.1.0 - Database

#### What is lowdb?
lowdb is a lightweight JSON database that:
- Stores data in a simple JSON file (db.json)
- Works synchronously for simplicity
- Perfect for prototypes and small projects
- No external database needed

#### How It's Used in EcoTrack:

**Database Structure (db.json):**
```json
{
  "users": [
    {
      "id": "uuid-123",
      "email": "user@example.com",
      "password": "hashed-password",
      "name": "John Doe",
      "district": "Kampala",
      "isPremium": false,
      "createdAt": 1702000000000
    }
  ],
  "activities": [
    {
      "userId": "uuid-123",
      "type": "transport",
      "carbon": 5.2,
      "date": 1702000000000
    }
  ]
}
```

**Data Management (server.js):**
- User registration/login
- Activity tracking
- Session management
- Profile information

#### Limitations & Why:
- **Synchronous**: Single-threaded, simple
- **File-based**: Portable, human-readable
- **Perfect for MVP**: Easy to inspect and debug
- **Scalability**: Not suitable for millions of users

### Web APIs - Browser Capabilities

#### Web Speech API
Enables voice interaction in the browser:

**Speech Recognition:**
```typescript
const recognition = new webkitSpeechRecognition();
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
};
```

**Text-to-Speech:**
```typescript
const utterance = new SpeechSynthesisUtterance(text);
speechSynthesis.speak(utterance);
```

#### Canvas API
Dynamic backgrounds with animations:
```typescript
const canvas = document.getElementById('background');
const ctx = canvas.getContext('2d');
// Draw animated backgrounds
```

#### LocalStorage API
Store user preferences locally:
```typescript
localStorage.setItem('theme', 'dark');
const theme = localStorage.getItem('theme');
```

---

## 🏗️ Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Browser (User)                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  React 19 + TypeScript Frontend             │  │
│  │  ├─ App.tsx (Main Component)                │  │
│  │  ├─ Screens/ (Dashboard, Calculator, etc)  │  │
│  │  ├─ Components/ (UI Components)            │  │
│  │  └─ Services/ (API Clients)                │  │
│  └──────────────────────────────────────────────┘  │
│                        ↑                             │
│        HTTP/REST (JSON)  ↓  Web APIs              │
│                                                     │
└─────────────────────────────────────────────────────┘
              ↕ (Fetch API / CORS)
┌─────────────────────────────────────────────────────┐
│        Express.js Backend (Node.js)                 │
│  ┌──────────────────────────────────────────────┐  │
│  │  Routes:                                      │  │
│  │  ├─ /api/users/register                      │  │
│  │  ├─ /api/users/login                         │  │
│  │  ├─ /api/users/google-login                  │  │
│  │  └─ Static Files (dist/)                     │  │
│  └──────────────────────────────────────────────┘  │
│                        ↓                             │
│                                                     │
└─────────────────────────────────────────────────────┘
              ↕ (File I/O)
┌─────────────────────────────────────────────────────┐
│  lowdb (JSON File Database)                         │
│  └─ db.json                                         │
│     ├─ users[]                                      │
│     ├─ activities[]                                 │
│     └─ sessions[]                                   │
└─────────────────────────────────────────────────────┘
              ↕ (HTTPS/API)
┌─────────────────────────────────────────────────────┐
│  Google Generative AI (Gemini 2.0 Flash)           │
│  ├─ Chat/Voice API                                 │
│  ├─ Function Calling                               │
│  └─ Streaming Responses                            │
└─────────────────────────────────────────────────────┘
```

### Data Flow Diagram

**User Authentication Flow:**
```
User Input (Email/Password)
    ↓
React Form Component
    ↓
API Call to /api/users/login
    ↓
Express Backend Validates
    ↓
Checks lowdb database
    ↓
JWT Token Generated
    ↓
Sent to Frontend
    ↓
Stored in localStorage
    ↓
User State Updated
    ↓
Redirected to Dashboard
```

**Chat/Voice Interaction Flow:**
```
User Message (Text or Voice)
    ↓
Speech Recognition (if voice) / Text Input (if chat)
    ↓
Service (advanced-chatbot.ts or advanced-ai-voice.ts)
    ↓
Check Rate Limit & API Available
    ↓
├─ Limited → Offline Fallback Response
└─ Available → Call Gemini API
         ↓
    Stream Response
         ↓
Display in UI with Streaming Effect
    ↓
(Optional) Text-to-Speech Output (if voice)
    ↓
Add to Conversation History
```

---

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "district": "Kampala"
}

Response 200:
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login User
```
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-123",
    "email": "user@example.com",
    "name": "John Doe",
    "district": "Kampala"
  }
}
```

#### Google OAuth Login
```
POST /api/users/google-login
Content-Type: application/json

{
  "token": "google-id-token"
}

Response 200:
{
  "success": true,
  "token": "jwt-token",
  "user": { /* user data */ }
}
```

### AI Service Endpoints (Frontend)

#### Chatbot Service
```typescript
import { AdvancedChatbotService } from './services/advanced-chatbot';

const chatbot = new AdvancedChatbotService(apiKey, userId);

// Stream response
await chatbot.streamChat(
  userMessage,
  {
    onChunk: (chunk) => console.log(chunk),
    onComplete: (fullText) => console.log(fullText),
    onError: (error) => console.error(error)
  }
);
```

#### Voice Service
```typescript
import { AdvancedAIVoiceService } from './services/advanced-ai-voice';

const voice = new AdvancedAIVoiceService(apiKey, context);

// Stream voice response
await voice.streamChatResponse(
  userMessage,
  {
    onChunk: (chunk) => updateUI(chunk),
    onComplete: (fullText) => finalize(),
    onError: (error) => handleError(error)
  }
);
```

---

## 🚀 Advanced Features

### 1. Streaming Responses
Responses appear character-by-character as they're generated, creating a real-time AI experience:

```typescript
// User sees: "H", "He", "Hel", "Hello", "Hello!"
for await (const chunk of response.stream) {
  displayChunk(chunk.text()); // Display each piece immediately
}
```

### 2. Function Calling
AI can invoke specific tools for calculations:

```typescript
const tools = [
  {
    name: 'calculate_carbon',
    description: 'Calculate carbon for an activity',
    parameters: {
      type: 'object',
      properties: {
        activity: { type: 'string' },
        distance: { type: 'number' }
      }
    }
  }
];
```

### 3. Conversation History
Maintains context across multiple messages:

```typescript
conversationHistory = [
  { role: 'user', content: 'What is my carbon footprint?' },
  { role: 'model', content: 'Your footprint is...' },
  { role: 'user', content: 'How can I reduce it?' }, // Understands previous context
];
```

### 4. Rate Limiting & Quota Management
Prevents API quota exhaustion:

```typescript
private isRateLimited(): boolean {
  // Max 15 requests/minute for chatbot
  // Max 10 requests/minute for voice
  return this.requestTimestamps.length >= this.maxRequestsPerMinute;
}
```

### 5. Offline Fallback System
Works without API when quota exceeded:

```typescript
if (error.includes('429') || error.includes('quota')) {
  return this.getOfflineFallback(userMessage);
  // Returns intelligent keyword-based responses
}
```

### 6. Multi-language Support
Support for English and Luganda:

```typescript
// LanguageContext.tsx
const [language, setLanguage] = useState('en');

// translations.ts
const translations = {
  en: { hello: 'Hello' },
  lu: { hello: 'Wa'l' }
};
```

---

## 💾 Quota Management

### Rate Limits
- **Chatbot**: 15 requests/minute
- **Voice**: 10 requests/minute

### Google Free Tier Quotas
- 50,000 requests/day
- 2,000 requests/minute
- 1,000,000 input tokens/minute

### Offline Mode Triggers
- Rate limit exceeded
- 429 Quota Exceeded error
- API key missing
- Network unavailable

**See [QUOTA_HANDLING.md](QUOTA_HANDLING.md) for detailed documentation.**

---

## 🔧 Troubleshooting

### Issue: Application won't start
```bash
# Check Node version
node --version # Should be 16+

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: API Key not working
```bash
# Verify in .env file
VITE_GEMINI_API_KEY=your_actual_key_here

# Restart dev server
npm run dev
```

### Issue: Port already in use
```bash
# Windows - Find and kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

### Issue: Build fails with TypeScript errors
```bash
# Check for type errors
npm run build

# Generate type declarations
npx tsc --noEmit
```

### Issue: Offline responses only
- Check API key in .env
- Verify rate limit (15/min chat, 10/min voice)
- Wait 60 seconds for rate limit to reset
- Check Google Cloud Console for quota usage

---

## 👨‍💻 Development

### Adding a New Component
```typescript
// components/NewComponent.tsx
import React from 'react';

interface Props {
  title: string;
  onAction: () => void;
}

export const NewComponent: React.FC<Props> = ({ title, onAction }) => {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

### Adding a New Screen
```typescript
// screens/NewScreen.tsx
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export const NewScreen: React.FC = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await api.get('/endpoint');
      setData(result);
    };
    fetchData();
  }, []);

  return (
    <div>
      {data && <div>{/* Render data */}</div>}
    </div>
  );
};
```

### Adding a New API Endpoint
```typescript
// server.js
app.get('/api/new-endpoint', (req, res) => {
  try {
    // Handle request
    res.json({ success: true, data: /* ... */ });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📦 Deployment

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Heroku
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create ecotrack-uganda

# Deploy
git push heroku main
```

### Docker Deployment
```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["node", "server.js"]
```

---

## 📚 Additional Resources

- **React Documentation**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs
- **Express Guide**: https://expressjs.com
- **Vite Documentation**: https://vitejs.dev
- **Google AI Studio**: https://ai.studio
- **Gemini API Docs**: https://ai.google.dev/docs

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Contributors

- **Development Team**: EcoTrack Uganda Team
- **AI Integration**: Google Generative AI
- **UI/UX**: Modern React Components

---

## 🤝 Support

For issues, questions, or feature requests:
1. Check [QUOTA_HANDLING.md](QUOTA_HANDLING.md) for quota-related issues
2. Review [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for feature details
3. Inspect browser console for error messages
4. Contact the development team

---

**EcoTrack Uganda** - Making sustainability accessible and measurable for Ugandan communities. 🌍♻️
