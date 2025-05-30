import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Sparkles, 
  PlusCircle, 
  TrendingUp, 
  Users, 
  Heart, 
  Share2, 
  Video, 
  FileText,
  Target,
  Zap,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Copy,
  Check,
  Upload,
  Library,
  Film,
  BookOpen,
  Star,
  Search,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import { VideoUpload } from '../components/video-upload/VideoUpload';
import { Settings } from '../components/ui/Settings';
import { Publishing } from '../components/dashboard/Publishing';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/ui/Loading';
import { CaptionGenerator } from '@/components/dashboard/CaptionGenerator';
import { ContentLibrary } from '@/components/dashboard/ContentLibrary';
import { Analytics } from '@/components/dashboard/Analytics';
import { Templates } from '@/components/dashboard/Templates';

interface User {
  id: number;
  name: string;
  email: string;
  niche: string;
  avatar?: string;
}

interface CaptionRequest {
  video_description: string;
  tone: string;
  niche: string;
  include_hashtags: boolean;
  platforms: string[];
}

interface CaptionResponse {
  caption: string;
  hashtags: string[];
  word_count: number;
  character_count: number;
  estimated_engagement: string;
}

interface ContentItem {
  id: number;
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  status: 'draft' | 'processing' | 'ready' | 'published';
  platforms: string[];
  created_at: string;
  updated_at: string;
  captions?: any[];
  analytics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

interface AnalyticsData {
  overview: {
    total_content: number;
    total_views: number;
    total_likes: number;
    total_comments: number;
    total_shares: number;
    engagement_rate: number;
  };
  recent_performance: Array<{
    date: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }>;
  top_content: Array<{
    id: number;
    title: string;
    platform: string;
    views: number;
    engagement_rate: number;
  }>;
  platform_breakdown: Array<{
    platform: string;
    content_count: number;
    total_views: number;
    avg_engagement: number;
  }>;
}

interface Template {
  id: string;
  name: string;
  description: string;
  template: string;
  category: string;
  platforms: string[];
  tone: string;
  created_at: string;
}

const TABS = [
  { id: 'captions', name: 'AI Captions', icon: Sparkles },
  { id: 'videos', name: 'Upload Workflow', icon: Upload },
  { id: 'publishing', name: 'Publishing', icon: Send },
  { id: 'templates', name: 'Templates', icon: BookOpen },
  { id: 'library', name: 'Content Library', icon: Library },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'settings', name: 'Settings', icon: SettingsIcon },
];

export default function DashboardPage() {
  const { user, logout, updateUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('captions');
  
  // Caption Generator State
  const [captionRequest, setCaptionRequest] = useState({
    video_description: '',
    tone: 'casual',
    platforms: ['instagram'],
    include_hashtags: true,
    include_emojis: true,
    niche: 'lifestyle'
  });
  const [generatedCaption, setGeneratedCaption] = useState<CaptionResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  
  // Content Library State
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  
  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  
  // Templates State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && user) {
      setCaptionRequest(prev => ({
        ...prev,
        niche: user.niche || 'lifestyle'
      }));
      
      // Fetch initial data
      fetchContentItems();
      fetchAnalytics();
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const generateCaption = async () => {
    if (!captionRequest.video_description.trim()) {
      toast.error('Please enter a video description');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/captions/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(captionRequest),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedCaption(data);
        toast.success('Caption generated successfully! ✨');
      } else {
        toast.error(data.detail || 'Failed to generate caption');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCaption = async () => {
    if (!generatedCaption) return;
    
    const fullText = `${generatedCaption.caption}\n\n${generatedCaption.hashtags.join(' ')}`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedCaption(true);
      toast.success('Caption copied to clipboard!');
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch (error) {
      toast.error('Failed to copy caption');
    }
  };

  const handleVideoUploadComplete = (data: any) => {
    console.log('Video upload completed:', data);
    toast.success('Video processed successfully! Check your content library.');
    setActiveTab('library'); // Switch to library tab
  };

  const handleVideoUploadError = (error: string) => {
    console.error('Video upload error:', error);
  };

  const fetchContentItems = async () => {
    setIsLoadingContent(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/content/`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setContentItems(data.items || []);
      } else {
        console.error('Failed to fetch content');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/analytics/dashboard`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/templates/`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.items || []);
      } else {
        console.error('Failed to fetch templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const useTemplate = async (templateId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/templates/${templateId}/use`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setCaptionRequest(prev => ({
          ...prev,
          video_description: 'Used from template'
        }));
        setGeneratedCaption({
          caption: data.generated_caption,
          hashtags: data.hashtags,
          word_count: data.generated_caption.split(' ').length,
          character_count: data.generated_caption.length,
          estimated_engagement: 'high'
        });
        setActiveTab('captions');
        toast.success('Template applied successfully!');
      } else {
        toast.error('Failed to use template');
      }
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Error using template');
    }
  };

  const deleteContentItem = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/content/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      if (response.ok) {
        setContentItems(prev => prev.filter(item => item.id !== id));
        toast.success('Content deleted successfully');
      } else {
        toast.error('Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Error deleting content');
    }
  };

  // Fetch content when switching to library tab
  useEffect(() => {
    if (activeTab === 'library') {
      fetchContentItems();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'templates') {
      fetchTemplates();
    }
  }, [activeTab]);

  if (authLoading || isLoading) {
    return <Loading text="Loading your dashboard..." />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard - Capora</title>
        <meta name="description" content="Create AI-powered social media content" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Capora
                </span>
              </Link>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.niche} Creator</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
                <p className="text-blue-100 mb-6">Ready to create amazing content with AI?</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('captions')}
                    className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    <PlusCircle className="w-5 h-5 inline mr-2" />
                    Generate Caption
                  </button>
                  <button
                    onClick={() => setActiveTab('videos')}
                    className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-400 transition-all"
                  >
                    <Upload className="w-5 h-5 inline mr-2" />
                    Upload Video
                  </button>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-400 transition-all"
                  >
                    <BookOpen className="w-5 h-5 inline mr-2" />
                    Browse Templates
                  </button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="border-b border-gray-200 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    {TABS.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`
                            py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors
                            ${activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{tab.name}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'captions' && (
                  <div>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">AI Caption Generator</h2>
                        <p className="text-gray-600">Transform your ideas into engaging captions</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Video Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Video Description
                        </label>
                        <textarea
                          value={captionRequest.video_description}
                          onChange={(e) => setCaptionRequest({ ...captionRequest, video_description: e.target.value })}
                          placeholder="Describe your video content... (e.g., 'A morning workout routine showing 5 exercises for building strength')"
                          className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>

                      {/* Tone and Platform Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                          <select
                            value={captionRequest.tone}
                            onChange={(e) => setCaptionRequest({ ...captionRequest, tone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="casual">🙂 Casual</option>
                            <option value="professional">💼 Professional</option>
                            <option value="fun">🎉 Fun</option>
                            <option value="motivational">💪 Motivational</option>
                            <option value="educational">📚 Educational</option>
                            <option value="trendy">✨ Trendy</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                          <select
                            value={captionRequest.platforms[0] || 'instagram'}
                            onChange={(e) => setCaptionRequest({ ...captionRequest, platforms: [e.target.value] })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="instagram">📷 Instagram</option>
                            <option value="tiktok">🎵 TikTok</option>
                            <option value="youtube_shorts">🎬 YouTube Shorts</option>
                            <option value="facebook">📘 Facebook</option>
                            <option value="twitter">🐦 Twitter</option>
                          </select>
                        </div>
                      </div>

                      {/* Generate Button */}
                      <button
                        onClick={generateCaption}
                        disabled={isGenerating || !captionRequest.video_description.trim()}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Generating Amazing Caption...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-6 h-6" />
                            <span>Generate AI Caption</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Generated Caption */}
                    {generatedCaption && (
                      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-100">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Generated Caption</h3>
                          <button
                            onClick={copyCaption}
                            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
                          >
                            {copiedCaption ? (
                              <>
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="text-green-600 text-sm font-medium">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 text-gray-600" />
                                <span className="text-gray-600 text-sm font-medium">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-gray-900 whitespace-pre-wrap">{generatedCaption.caption}</p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Hashtags:</p>
                            <div className="flex flex-wrap gap-2">
                              {generatedCaption.hashtags.map((hashtag, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                >
                                  {hashtag}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-600 bg-white p-4 rounded-lg">
                            <span>Words: {generatedCaption.word_count}</span>
                            <span>Characters: {generatedCaption.character_count}</span>
                            <span className="capitalize">Engagement: {generatedCaption.estimated_engagement}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'videos' && (
                  <div>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Video Upload Workflow</h2>
                        <p className="text-gray-600">Complete video processing workflow - upload, process, review, and publish</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                      <div className="mb-6">
                        <Film className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          New Separated Workflow
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Experience our improved 4-step workflow: Upload → Process → Review → Publish
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-xl">📁</span>
                          </div>
                          <h4 className="font-semibold text-gray-900">1. Upload</h4>
                          <p className="text-sm text-gray-600">Upload your video file</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-xl">⚙️</span>
                          </div>
                          <h4 className="font-semibold text-gray-900">2. Process</h4>
                          <p className="text-sm text-gray-600">Generate platform variants</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-xl">👀</span>
                          </div>
                          <h4 className="font-semibold text-gray-900">3. Review</h4>
                          <p className="text-sm text-gray-600">Preview processed videos</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-xl">🚀</span>
                          </div>
                          <h4 className="font-semibold text-gray-900">4. Publish</h4>
                          <p className="text-sm text-gray-600">Choose platforms to publish</p>
                        </div>
                      </div>
                      
                      <Link href="/upload">
                        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                          Start Upload Workflow
                        </button>
                      </Link>
                      
                      <div className="mt-6 text-sm text-gray-500">
                        <p>✨ New features: Better control, review before publishing, platform-specific optimization</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'library' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                          <Library className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Content Library</h2>
                          <p className="text-gray-600">Manage your uploaded content and generated captions</p>
                        </div>
                      </div>
                      <button
                        onClick={fetchContentItems}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Refresh
                      </button>
                    </div>
                    
                    {isLoadingContent ? (
                      <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading content...</p>
                      </div>
                    ) : contentItems.length === 0 ? (
                      <div className="text-center py-12">
                        <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Content Yet</h3>
                        <p className="text-gray-600 mb-4">Upload some videos to see them here!</p>
                        <button
                          onClick={() => setActiveTab('videos')}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Upload Your First Video
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contentItems.map((item) => (
                          <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Thumbnail */}
                            <div className="relative h-48 bg-gray-200">
                              {item.thumbnail_url ? (
                                <img
                                  src={item.thumbnail_url}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Video className="w-12 h-12 text-gray-400" />
                                </div>
                              )}
                              
                              {/* Status Badge */}
                              <div className="absolute top-3 right-3">
                                <span className={`
                                  px-2 py-1 rounded-full text-xs font-medium
                                  ${item.status === 'ready' ? 'bg-green-100 text-green-800' :
                                    item.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                    item.status === 'published' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }
                                `}>
                                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Content Info */}
                            <div className="p-4">
                              <h3 className="font-semibold text-gray-900 mb-2 truncate">
                                {item.title || 'Untitled'}
                              </h3>
                              
                              {item.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                              
                              {/* Platforms */}
                              <div className="flex flex-wrap gap-1 mb-3">
                                {item.platforms.map((platform, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                                  >
                                    {platform}
                                  </span>
                                ))}
                              </div>
                              
                              {/* Analytics */}
                              {item.analytics && (
                                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                  <div className="flex items-center space-x-1">
                                    <Users className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-600">{item.analytics.views}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Heart className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-600">{item.analytics.likes}</span>
                                  </div>
                                </div>
                              )}
                              
                              {/* Date */}
                              <p className="text-xs text-gray-500 mb-3">
                                Created {new Date(item.created_at).toLocaleDateString()}
                              </p>
                              
                              {/* Actions */}
                              <div className="flex space-x-2">
                                {item.video_url && (
                                  <a
                                    href={item.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                                  >
                                    View
                                  </a>
                                )}
                                <button
                                  onClick={() => deleteContentItem(item.id)}
                                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                          <p className="text-gray-600">Track your content performance and engagement</p>
                        </div>
                      </div>
                      <button
                        onClick={fetchAnalytics}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Refresh
                      </button>
                    </div>
                    
                    {isLoadingAnalytics ? (
                      <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading analytics...</p>
                      </div>
                    ) : !analyticsData ? (
                      <div className="text-center py-12">
                        <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
                        <p className="text-gray-600 mb-4">Create some content to see analytics here!</p>
                        <button
                          onClick={() => setActiveTab('videos')}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Create Your First Content
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {/* Overview Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Video className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Total Content</p>
                                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.total_content}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Total Views</p>
                                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.total_views.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <Heart className="w-6 h-6 text-red-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.total_likes.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.engagement_rate.toFixed(1)}%</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Platform Breakdown */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Performance</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {analyticsData.platform_breakdown.map((platform, index) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium text-gray-900 capitalize">{platform.platform}</h4>
                                  <span className="text-sm text-gray-500">{platform.content_count} content</span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Views:</span>
                                    <span className="font-medium">{platform.total_views.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Avg Engagement:</span>
                                    <span className="font-medium">{platform.avg_engagement.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Performing Content */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Content</h3>
                          <div className="space-y-4">
                            {analyticsData.top_content.slice(0, 5).map((content, index) => (
                              <div key={content.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center space-x-4">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">{index + 1}</span>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">{content.title}</h4>
                                    <p className="text-sm text-gray-500 capitalize">{content.platform}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">{content.views.toLocaleString()} views</p>
                                  <p className="text-sm text-gray-500">{content.engagement_rate.toFixed(1)}% engagement</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recent Performance Chart Placeholder */}
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Performance</h3>
                          <div className="space-y-4">
                            {analyticsData.recent_performance.slice(-7).map((day, index) => (
                              <div key={day.date} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString()}</span>
                                <div className="flex space-x-6 text-sm">
                                  <span className="text-blue-600">{day.views} views</span>
                                  <span className="text-red-600">{day.likes} likes</span>
                                  <span className="text-green-600">{day.comments} comments</span>
                                  <span className="text-purple-600">{day.shares} shares</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'templates' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Content Templates</h2>
                          <p className="text-gray-600">Browse and use pre-made caption templates</p>
                        </div>
                      </div>
                      <button
                        onClick={fetchTemplates}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Refresh
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search templates..."
                          value={templateSearchQuery}
                          onChange={(e) => setTemplateSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {isLoadingTemplates ? (
                      <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading templates...</p>
                      </div>
                    ) : templates.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Found</h3>
                        <p className="text-gray-600 mb-4">Start creating your own templates!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates
                          .filter(template => 
                            template.name.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
                            template.description?.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
                            template.niche.toLowerCase().includes(templateSearchQuery.toLowerCase())
                          )
                          .map((template) => (
                            <div key={template.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                              {/* Template Header */}
                              <div className="p-4 border-b border-gray-100">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
                                  {template.is_public && (
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                      Public
                                    </span>
                                  )}
                                </div>
                                {template.description && (
                                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                                )}
                                
                                {/* Template Meta */}
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span className="capitalize bg-gray-100 px-2 py-1 rounded-full">{template.niche}</span>
                                  <span className="capitalize bg-gray-100 px-2 py-1 rounded-full">{template.tone}</span>
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-3 h-3" />
                                    <span>{template.usage_count}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Caption Preview */}
                              <div className="p-4">
                                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                  <p className="text-sm text-gray-700 line-clamp-4">
                                    {template.caption.length > 150 ? 
                                      `${template.caption.substring(0, 150)}...` : 
                                      template.caption
                                    }
                                  </p>
                                </div>
                                
                                {/* Hashtags Preview */}
                                {template.hashtags && template.hashtags.length > 0 && (
                                  <div className="mb-4">
                                    <div className="flex flex-wrap gap-1">
                                      {template.hashtags.slice(0, 3).map((hashtag: string, index: number) => (
                                        <span
                                          key={index}
                                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs"
                                        >
                                          {hashtag}
                                        </span>
                                      ))}
                                      {template.hashtags.length > 3 && (
                                        <span className="text-xs text-gray-500 px-2 py-1">
                                          +{template.hashtags.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Platforms */}
                                {template.platforms && template.platforms.length > 0 && (
                                  <div className="mb-4">
                                    <div className="flex flex-wrap gap-1">
                                      {template.platforms.map((platform: string, index: number) => (
                                        <span
                                          key={index}
                                          className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs capitalize"
                                        >
                                          {platform}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Action Button */}
                                <button
                                  onClick={() => useTemplate(template.id)}
                                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                  Use Template
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'publishing' && <Publishing />}

                {activeTab === 'settings' && (
                  <Settings 
                    user={user} 
                    onUserUpdate={(updatedUser) => {
                      updateUser(updatedUser);
                      setCaptionRequest(prev => ({
                        ...prev,
                        niche: updatedUser.niche || 'lifestyle'
                      }));
                    }}
                  />
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Content Created</p>
                        <p className="text-sm text-gray-500">Total</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {analyticsData?.overview.total_content || contentItems.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Engagement Rate</p>
                        <p className="text-sm text-gray-500">Average</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {analyticsData?.overview.engagement_rate ? `${analyticsData.overview.engagement_rate.toFixed(1)}%` : '0%'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Total Views</p>
                        <p className="text-sm text-gray-500">All content</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {analyticsData?.overview.total_views ? analyticsData.overview.total_views.toLocaleString() : '0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('videos')}
                    className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Video className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Upload Video</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('publishing')}
                    className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Send className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Publish Content</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('templates')}
                    className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <BookOpen className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Browse Templates</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">View Analytics</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('library')}
                    className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Library className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Content Library</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <SettingsIcon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Settings</span>
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Pro Tip</h3>
                <p className="text-sm text-gray-700">
                  Use specific details in your video description to get more engaging captions. 
                  Instead of "workout video", try "10-minute morning yoga routine for beginners".
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 