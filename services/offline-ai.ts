/**
 * Offline AI Service using Ollama or local models
 * Provides offline alternatives to Google Gemini API
 * Falls back to mock data when AI is unavailable
 */

import { Activity, Challenge, Recommendation, AppLanguage } from "../types";
import { LANGUAGE_NAMES } from "./translations";

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL_NAME = process.env.OFFLINE_MODEL || 'mistral'; // Default to Mistral, supports: mistral, neural-chat, orca-mini
const USE_OFFLINE_MODE = process.env.OFFLINE_MODE === 'true';

interface OllamaResponse {
  response: string;
  done: boolean;
}

// Mock data for fallback when AI is unavailable
const MOCK_RECOMMENDATIONS: { [key: string]: Recommendation[] } = {
  en: [
    {
      title: "Switch to Improved Cookstoves",
      description: "Replace traditional charcoal stoves with efficient improved cookstoves. This can reduce fuel usage by 50% and provide better health outcomes.",
      category: "energy",
      difficulty: "medium",
      potentialSaving: 2.5
    },
    {
      title: "Use Public Transport Weekly",
      description: "Use matatus or motorcycles instead of personal vehicles for weekly commutes. Even 2-3 trips per week makes a significant impact.",
      category: "transport",
      difficulty: "easy",
      potentialSaving: 1.8
    },
    {
      title: "Compost Organic Waste",
      description: "Create a compost pit for matooke peels, vegetable scraps, and organic matter. Use the rich compost for home gardening.",
      category: "food",
      difficulty: "easy",
      potentialSaving: 0.9
    },
    {
      title: "Install Solar Panels",
      description: "Consider small solar panel systems for household electricity. The Western region has excellent solar potential.",
      category: "energy",
      difficulty: "hard",
      potentialSaving: 3.2
    },
    {
      title: "Buy Local Produce",
      description: "Purchase food from local markets and farmers instead of imported goods. This reduces transportation emissions significantly.",
      category: "shopping",
      difficulty: "easy",
      potentialSaving: 0.6
    }
  ],
  lg: [
    {
      title: "Kyawe Ekibuyiso kya Moku (Improved Cookstoves)",
      description: "Ddamu za moku ez'obuwandiike ng'okunuunga amafuta. Kino kiyinza okukendeeza ku mafuta ng'ekigazi 50% n'okuwa abantu obulamu obutonotono.",
      category: "energy",
      difficulty: "medium",
      potentialSaving: 2.5
    },
    {
      title: "Kumala Mu Lwagiro Lw'Olukwata",
      description: "Kumala mu matatu oba emmotoka ez'ensigo m'okumala ennaku z'omu wiiki.",
      category: "transport",
      difficulty: "easy",
      potentialSaving: 1.8
    }
  ]
};

const MOCK_CHALLENGES: { [key: string]: Challenge[] } = {
  en: [
    {
      id: "challenge_1",
      title: "Go Charcoal-Free Week",
      description: "Challenge your community to use improved cookstoves or alternative fuels for a full week. Share your experience!",
      participants: 342,
      userProgress: 0,
      target: 15,
      daysRemaining: 7,
      category: "Energy",
      points: 500,
      image: "https://picsum.photos/400/200?random=1"
    },
    {
      id: "challenge_2",
      title: "Public Transport Hero",
      description: "Use public matatus or motorcycles for all your trips this week. Track your carbon savings!",
      participants: 256,
      userProgress: 0,
      target: 8,
      daysRemaining: 7,
      category: "Transport",
      points: 400,
      image: "https://picsum.photos/400/200?random=2"
    },
    {
      id: "challenge_3",
      title: "Zero Waste Cooking",
      description: "Cook using only locally-sourced ingredients and compost all organic waste. Reduce packaging waste!",
      participants: 189,
      userProgress: 0,
      target: 5,
      daysRemaining: 7,
      category: "Food",
      points: 350,
      image: "https://picsum.photos/400/200?random=3"
    }
  ]
};

/**
 * Check if Ollama service is available
 */
export async function isOllamaAvailable(): Promise<boolean> {
  if (USE_OFFLINE_MODE) return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    console.warn('Ollama service not available, using mock data');
    return false;
  }
}

/**
 * Query Ollama for text generation
 */
async function queryOllama(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = (await response.json()) as OllamaResponse;
    return data.response;
  } catch (error) {
    console.error('Ollama query failed:', error);
    throw error;
  }
}

/**
 * Parse JSON from model response with fallback
 */
function parseJsonResponse(text: string): any {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch {
    console.warn('Failed to parse JSON response');
    return null;
  }
}

/**
 * Get personalized eco recommendations (offline)
 */
export async function getOfflineEcoRecommendations(
  activities: Activity[],
  district: string,
  language: AppLanguage = AppLanguage.ENGLISH
): Promise<Recommendation[]> {
  const langCode = language === AppLanguage.ENGLISH ? 'en' : 'lg';
  
  // Try Ollama first
  const isAvailable = await isOllamaAvailable();
  if (isAvailable) {
    try {
      const prompt = `
You are a sustainability expert for Western Uganda (${district}). Based on these carbon footprint activities:
${JSON.stringify(activities, null, 2)}

Generate exactly 3 personalized, actionable sustainability tips in JSON format.
Return as a JSON array with objects containing: title, description, category (energy/transport/food/shopping), difficulty (easy/medium/hard), potentialSaving (number).

Respond ONLY with valid JSON array, no other text.
Language: ${LANGUAGE_NAMES[language]}
Focus on regional solutions for ${district}.`;

      const response = await queryOllama(prompt);
      const parsed = parseJsonResponse(response);
      
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 5);
      }
    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
    }
  }

  // Fallback to mock data
  return MOCK_RECOMMENDATIONS[langCode] || MOCK_RECOMMENDATIONS.en;
}

/**
 * Generate AI challenges (offline)
 */
export async function getOfflineChallenges(
  district: string,
  language: AppLanguage = AppLanguage.ENGLISH
): Promise<Challenge[]> {
  const langCode = language === AppLanguage.ENGLISH ? 'en' : 'lg';
  
  // Try Ollama first
  const isAvailable = await isOllamaAvailable();
  if (isAvailable) {
    try {
      const prompt = `
You are a gamification expert. Generate 3 unique weekly sustainability challenges for ${district}, Western Uganda.

Return as JSON array with objects: id, title, description, participants (100-5000), userProgress (0), target (kg CO2), daysRemaining (7), category, points (100-1000), image (URL).

Respond ONLY with valid JSON array, no other text.
Language: ${LANGUAGE_NAMES[language]}`;

      const response = await queryOllama(prompt);
      const parsed = parseJsonResponse(response);
      
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 3);
      }
    } catch (error) {
      console.error('Failed to get AI challenges:', error);
    }
  }

  // Fallback to mock data
  return MOCK_CHALLENGES[langCode] || MOCK_CHALLENGES.en;
}

/**
 * Ask eco expert questions (offline)
 */
export async function askOfflineEcoExpert(
  question: string,
  context: string,
  language: AppLanguage = AppLanguage.ENGLISH
): Promise<{ text: string; imageUrl?: string }> {
  // Try Ollama first
  const isAvailable = await isOllamaAvailable();
  if (isAvailable) {
    try {
      const prompt = `
You are an Eco-Expert for EcoTrack Uganda. Answer the following question warmly and encouragingly.
Focus on Western Uganda sustainability (Mbarara, Kabale, Fort Portal region).

Question: ${question}
Context: ${context}

Language: ${LANGUAGE_NAMES[language]}
Keep response concise and actionable.`;

      const response = await queryOllama(prompt);
      return {
        text: response.trim() || 'I am currently learning more to better assist you.'
      };
    } catch (error) {
      console.error('Failed to get expert answer:', error);
    }
  }

  // Fallback response
  return {
    text: `As your offline Eco-Expert, I'm learning about sustainability in ${context}. In Western Uganda, we recommend focusing on energy-efficient cooking, using public transport, composting organic waste, and supporting local farming initiatives. What specific area would you like to know more about?`
  };
}

/**
 * Find local initiatives (offline - uses static data)
 */
export async function getOfflineLocalInitiatives(
  district: string,
  language: AppLanguage = AppLanguage.ENGLISH
): Promise<{ text: string; sources: Array<{ title: string; uri: string }> }> {
  const initiatives: { [key: string]: Array<{ title: string; uri: string }> } = {
    en: [
      { title: 'Uganda Wildlife Authority - Conservation Projects', uri: '#' },
      { title: 'Kabale Farmers Cooperative - Sustainable Agriculture', uri: '#' },
      { title: 'Rwenzori Mountains Foundation', uri: '#' },
      { title: 'Care International - Environmental Programs', uri: '#' },
      { title: 'Community Waste Management Initiatives', uri: '#' }
    ],
    lg: [
      { title: 'Ekitundu ky\'Abantu ab\'Obuggagga', uri: '#' },
      { title: 'Pulasiti y\'Olupakaloosa', uri: '#' }
    ]
  };

  const langCode = language === AppLanguage.ENGLISH ? 'en' : 'lg';
  const sources = initiatives[langCode] || initiatives.en;

  return {
    text: `Local sustainability initiatives in ${district} are actively working to reduce environmental impact. Consider joining community cleanup events, farmers cooperatives, and environmental NGOs working in your area.`,
    sources
  };
}

/**
 * Main hook to switch between online and offline AI
 */
export async function getRecommendationsWithFallback(
  activities: Activity[],
  district: string,
  language: AppLanguage = AppLanguage.ENGLISH,
  useOffline: boolean = false
) {
  if (useOffline) {
    return getOfflineEcoRecommendations(activities, district, language);
  }

  // Try online first, fallback to offline
  try {
    const { getEcoRecommendations } = await import('./gemini');
    return await getEcoRecommendations(activities, district, language);
  } catch (error) {
    console.warn('Online AI failed, using offline recommendations:', error);
    return getOfflineEcoRecommendations(activities, district, language);
  }
}

export async function getChallengesWithFallback(
  district: string,
  language: AppLanguage = AppLanguage.ENGLISH,
  useOffline: boolean = false
) {
  if (useOffline) {
    return getOfflineChallenges(district, language);
  }

  try {
    const { generateAIChallenges } = await import('./gemini');
    return await generateAIChallenges(district, language);
  } catch (error) {
    console.warn('Online AI failed, using offline challenges:', error);
    return getOfflineChallenges(district, language);
  }
}
