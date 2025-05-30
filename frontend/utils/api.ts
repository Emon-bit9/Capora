const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiEndpoints = {
  auth: {
    register: `${API_BASE_URL}/api/v1/auth/register`,
    login: `${API_BASE_URL}/api/v1/auth/login`,
    profile: `${API_BASE_URL}/api/v1/auth/profile`,
    changePassword: `${API_BASE_URL}/api/v1/auth/change-password`,
    usage: `${API_BASE_URL}/api/v1/auth/usage`,
    upgradeSubscription: `${API_BASE_URL}/api/v1/auth/upgrade-subscription`,
  },
  videos: {
    upload: `${API_BASE_URL}/api/v1/videos/upload`,
    process: (contentId: string) => `${API_BASE_URL}/api/v1/videos/process/${contentId}`,
    variants: (contentId: string) => `${API_BASE_URL}/api/v1/videos/variants/${contentId}`,
    publish: (contentId: string) => `${API_BASE_URL}/api/v1/videos/publish/${contentId}`,
  },
  captions: {
    generate: `${API_BASE_URL}/api/v1/captions/generate`,
    generatePublic: `${API_BASE_URL}/api/v1/captions/generate-public`,
  },
  content: {
    list: `${API_BASE_URL}/api/v1/content/`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/content/${id}`,
  },
  analytics: {
    dashboard: `${API_BASE_URL}/api/v1/analytics/dashboard`,
  },
  templates: {
    list: `${API_BASE_URL}/api/v1/templates/`,
    use: (templateId: string) => `${API_BASE_URL}/api/v1/templates/${templateId}/use`,
  },
};

// Helper function for making API requests with authentication
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  // Check if body is FormData - if so, don't set Content-Type to let browser set it with boundary
  const isFormData = options.body instanceof FormData;
  
  const defaultHeaders: Record<string, string> = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  
  // Only add Content-Type if it's not FormData
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  
  const defaultOptions: RequestInit = {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  return fetch(url, defaultOptions);
}; 