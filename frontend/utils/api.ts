const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Debug logging for development
if (typeof window !== 'undefined') {
  console.log('🔗 API Configuration:', {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    API_BASE_URL,
    environment: process.env.NODE_ENV,
    hostname: window.location.hostname
  });
}

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
  
  // Debug logging
  console.log('🚀 Making API request:', {
    url,
    method: options.method || 'GET',
    hasToken: !!token,
    timestamp: new Date().toISOString()
  });
  
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

  try {
    const response = await fetch(url, defaultOptions);
    
    // Debug logging for response
    console.log('📥 API response:', {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      timestamp: new Date().toISOString()
    });
    
    return response;
  } catch (error) {
    // Enhanced error logging
    console.error('❌ API request failed:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}; 