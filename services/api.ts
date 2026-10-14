
import { User, Activity, Challenge, Recommendation, UserType, Video } from '../types';

const BASE_URL = 'http://localhost:8000/api';
const AUTH_TOKEN_KEY = 'ecotrack_auth_token';
const OFFLINE_QUEUE_KEY = 'ecotrack_offline_activities';

class ApiService {
  private static instance: ApiService;
  private token: string | null = null;

  private constructor() {
    this.token = localStorage.getItem(AUTH_TOKEN_KEY);
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public getToken() {
    return this.token;
  }

  private get headers(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (this.token && this.token !== 'mock_token') {
      headers['Authorization'] = `Token ${this.token}`;
    }
    return headers;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    if (this.token === 'mock_token') {
       // Simulate delay for mock
       await new Promise(resolve => setTimeout(resolve, 300));
       return null; 
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: { ...this.headers, ...options.headers },
      });

      if (response.status === 401) {
        this.clearToken();
        if (!window.location.pathname.includes('login') && !window.location.pathname.includes('register')) {
          window.location.reload(); 
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Network response was not ok');
      }

      return response.json();
    } catch (error) {
      console.warn(`API Error for ${endpoint}:`, error);
      // Return null for GET requests on network error to allow UI to use fallbacks
      if (!options.method || options.method.toUpperCase() === 'GET') {
        return null;
      }
      throw error;
    }
  }

  public setToken(token: string) {
    this.token = token;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  public clearToken() {
    this.token = null;
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  // OFFLINE LOGIC
  public getOfflineQueue(): Omit<Activity, 'id' | 'timestamp'>[] {
    const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  }

  public addToOfflineQueue(activity: Omit<Activity, 'id' | 'timestamp'>) {
    const queue = this.getOfflineQueue();
    queue.push(activity);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  }

  public clearOfflineQueue() {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  }

  public async syncOfflineActivities() {
    const queue = this.getOfflineQueue();
    if (queue.length === 0 || this.token === 'mock_token') return;

    for (const act of queue) {
      try {
        await this.createActivity(act);
      } catch (e) {
        console.error("Failed to sync activity:", e);
      }
    }
    this.clearOfflineQueue();
  }

  // AUTH ENDPOINTS
  public googleLogin = (idToken: string) => this.request('/users/google-login/', {
    method: 'POST',
    body: JSON.stringify({ token: idToken })
  });

  public register = (data: any) => this.request('/users/register/', { 
    method: 'POST', 
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      name: data.name,
      district: data.district,
      location: data.location,
      age: data.age,
      occupation: data.occupation,
      user_type: 'individual'
    }) 
  });

  public registerOrganization = (data: any) => this.request('/users/register/organization/', { 
    method: 'POST', 
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      organization_name: data.organization_name,
      contact_person: data.contact_person,
      phone_number: data.phone_number,
      district: data.district,
      website: data.website,
      organization_size: data.organization_size,
      user_type: 'organization'
    }) 
  });

  public login = (email: string, pass: string) => this.request('/users/login/', { method: 'POST', body: JSON.stringify({ email, password: pass }) });
  
  public logout = () => {
    this.clearToken();
    return this.request('/users/logout/', { method: 'POST' }).catch(() => null);
  };

  public getProfile = () => this.request('/users/profile/');
  
  public updateProfile = (data: any) => this.request('/users/profile/update/', { method: 'PUT', body: JSON.stringify(data) });

  // ACTIVITY ENDPOINTS
  public getActivities = async () => {
    const res = await this.request('/activities/');
    return res || [];
  }
  
  public deleteActivity = (id: string) => this.request(`/activities/${id}/`, { method: 'DELETE' });

  public createActivity = (data: Omit<Activity, 'id' | 'timestamp'>) => this.request('/activities/', { 
    method: 'POST', 
    body: JSON.stringify({
      type: data.category.toLowerCase(),
      description: data.description,
      subcategory: data.subcategory,
      carbon_footprint: data.co2e,
      quantity: data.value,
      details: data.details || {}
    }) 
  });

  // VIDEO ENDPOINTS
  public getVideos = async () => {
    const res = await this.request('/videos/');
    return res || [];
  }
  
  public uploadVideo = (data: Partial<Video>) => this.request('/videos/upload/', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  });

  // CHALLENGE ENDPOINTS
  public getChallenges = async () => {
    const res = await this.request('/challenges/');
    return res || [];
  }
  
  public joinChallenge = (id: string) => this.request('/challenges/join/', { 
    method: 'POST', 
    body: JSON.stringify({ challengeId: id }) 
  });

  // COMMUNITY / LEADERBOARD
  public getLeaderboard = async () => {
    const res = await this.request('/users/leaderboard/');
    return res || [];
  };
}

export const api = ApiService.getInstance();
