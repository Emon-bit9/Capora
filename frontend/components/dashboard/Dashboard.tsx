import React, { useState, useEffect } from 'react';
import { 
  PenTool, 
  Upload, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  BookOpen,
  Zap,
  TrendingUp,
  Users,
  Crown,
  AlertCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { CaptionGenerator } from './CaptionGenerator';
import { VideoUpload } from './VideoUpload';
import { ContentLibrary } from './ContentLibrary';
import { Analytics } from './Analytics';
import { Settings as SettingsComponent } from '../ui/Settings';
import { Templates } from './Templates';
import { UsageWarning } from '../ui/UsageWarning';

interface User {
  id: number;
  name: string;
  email: string;
  niche: string;
  avatar?: string;
  subscription_plan?: string;
  captions_used_this_month?: number;
  videos_processed_this_month?: number;
}

interface UsageData {
  captions_used_this_month: number;
  caption_limit: number;
  videos_processed_this_month: number;
  video_limit: number;
  subscription_plan: string;
  subscription_ends_at?: string;
  can_use_captions: boolean;
  can_process_videos: boolean;
}

interface DashboardProps {
  user: User | null;
  onUserUpdate: (user: User) => void;
}

const TABS = [
  { 
    id: 'captions', 
    name: 'AI Captions', 
    icon: PenTool, 
    color: 'blue',
    description: 'Generate engaging captions'
  },
  { 
    id: 'upload', 
    name: 'Video Upload', 
    icon: Upload, 
    color: 'green',
    description: 'Upload and process videos'
  },
  { 
    id: 'templates', 
    name: 'Templates', 
    icon: BookOpen, 
    color: 'purple',
    description: 'Browse professional templates'
  },
  { 
    id: 'library', 
    name: 'Content Library', 
    icon: FolderOpen, 
    color: 'orange',
    description: 'Manage your content'
  },
  { 
    id: 'analytics', 
    name: 'Analytics', 
    icon: BarChart3, 
    color: 'pink',
    description: 'Track performance'
  },
  { 
    id: 'settings', 
    name: 'Settings', 
    icon: Settings, 
    color: 'gray',
    description: 'Account & billing'
  },
];

export const Dashboard: React.FC<DashboardProps> = ({ user, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('captions');
  const [usageData, setUsageData] = useState<UsageData | null>(null);

  const fetchUsageData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/auth/usage`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setUsageData(data);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, []);

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50',
      green: isActive ? 'bg-green-600 text-white' : 'text-green-600 hover:bg-green-50',
      purple: isActive ? 'bg-purple-600 text-white' : 'text-purple-600 hover:bg-purple-50',
      orange: isActive ? 'bg-orange-600 text-white' : 'text-orange-600 hover:bg-orange-50',
      pink: isActive ? 'bg-pink-600 text-white' : 'text-pink-600 hover:bg-pink-50',
      gray: isActive ? 'bg-gray-600 text-white' : 'text-gray-600 hover:bg-gray-50',
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getPlanBadge = () => {
    const plan = usageData?.subscription_plan || 'free';
    const badges = {
      free: { text: 'Free', color: 'bg-gray-100 text-gray-700', icon: null },
      pro: { text: 'Pro', color: 'bg-blue-100 text-blue-700', icon: Zap },
      enterprise: { text: 'Enterprise', color: 'bg-purple-100 text-purple-700', icon: Crown },
    };
    
    const badge = badges[plan as keyof typeof badges] || badges.free;
    const Icon = badge.icon;
    
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {Icon && <Icon className="w-3 h-3" />}
        <span>{badge.text}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="flex">
        {/* Enhanced Sidebar */}
        <div className="w-80 bg-white shadow-xl border-r border-gray-200 h-screen sticky top-0">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Capora</h1>
                <p className="text-sm text-gray-500">AI Content Studio</p>
              </div>
            </div>
            
            {/* User Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.niche} Creator</p>
                  </div>
                </div>
                {getPlanBadge()}
              </div>
            </div>
          </div>

          {/* Usage Overview */}
          {usageData && (
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Monthly Usage</h3>
              <div className="space-y-3">
                {/* Captions Usage */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">AI Captions</span>
                    <span className="font-medium">{usageData.captions_used_this_month}/{usageData.caption_limit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        usageData.can_use_captions ? 'bg-blue-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min((usageData.captions_used_this_month / usageData.caption_limit) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
                
                {/* Videos Usage */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Video Processing</span>
                    <span className="font-medium">{usageData.videos_processed_this_month}/{usageData.video_limit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        usageData.can_process_videos ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min((usageData.videos_processed_this_month / usageData.video_limit) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {(!usageData.can_use_captions || !usageData.can_process_videos) && usageData.subscription_plan === 'free' && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <p className="text-xs text-yellow-800">Limits reached</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="mt-2 w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs py-1.5 px-3 rounded-md hover:shadow-md transition-all"
                  >
                    Upgrade Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full group flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200
                      ${getColorClasses(tab.color, isActive)}
                      ${isActive ? 'shadow-lg transform scale-[1.02]' : 'hover:shadow-md hover:transform hover:scale-[1.01]'}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <p className="font-medium text-sm">{tab.name}</p>
                        <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                          {tab.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Quick Stats */}
          <div className="p-6 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Engagement</p>
                <p className="text-lg font-bold text-blue-600">+12%</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Reach</p>
                <p className="text-lg font-bold text-green-600">2.4K</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="flex-1">
          <div className="p-8">
            {/* Usage Warnings */}
            {usageData && (
              <div className="mb-6 space-y-4">
                <UsageWarning
                  feature="captions"
                  used={usageData.captions_used_this_month}
                  limit={usageData.caption_limit}
                  canUse={usageData.can_use_captions}
                  onUpgrade={() => setActiveTab('settings')}
                />
                <UsageWarning
                  feature="videos"
                  used={usageData.videos_processed_this_month}
                  limit={usageData.video_limit}
                  canUse={usageData.can_process_videos}
                  onUpgrade={() => setActiveTab('settings')}
                />
              </div>
            )}

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 min-h-[600px]">
              {activeTab === 'captions' && <CaptionGenerator />}
              {activeTab === 'upload' && <VideoUpload />}
              {activeTab === 'templates' && <Templates />}
              {activeTab === 'library' && <ContentLibrary />}
              {activeTab === 'analytics' && <Analytics />}
              {activeTab === 'settings' && <SettingsComponent user={user} onUserUpdate={onUserUpdate} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 