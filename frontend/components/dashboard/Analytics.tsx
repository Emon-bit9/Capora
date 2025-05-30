import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Heart, 
  Share, 
  MessageCircle,
  Users,
  Target,
  Calendar,
  Filter,
  Download,
  Instagram,
  Headphones,
  Youtube,
  Facebook,
  Twitter,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    total_views: number;
    total_likes: number;
    total_shares: number;
    total_comments: number;
    engagement_rate: number;
    reach: number;
    content_count: number;
    growth_rate: number;
  };
  platform_performance: {
    [platform: string]: {
      views: number;
      likes: number;
      shares: number;
      comments: number;
      engagement_rate: number;
    };
  };
  recent_content: Array<{
    id: string;
    title: string;
    platform: string;
    views: number;
    likes: number;
    engagement_rate: number;
    created_at: string;
  }>;
  engagement_trend: Array<{
    date: string;
    views: number;
    likes: number;
    shares: number;
  }>;
}

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'purple' },
  { id: 'tiktok', name: 'TikTok', icon: Headphones, color: 'black' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'red' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'blue' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'sky' }
];

// Sample analytics data
const SAMPLE_ANALYTICS: AnalyticsData = {
  overview: {
    total_views: 125420,
    total_likes: 8943,
    total_shares: 1234,
    total_comments: 2156,
    engagement_rate: 7.2,
    reach: 89340,
    content_count: 47,
    growth_rate: 18.5
  },
  platform_performance: {
    instagram: {
      views: 45230,
      likes: 3421,
      shares: 567,
      comments: 892,
      engagement_rate: 8.1
    },
    tiktok: {
      views: 68120,
      likes: 4892,
      shares: 445,
      comments: 1034,
      engagement_rate: 9.3
    },
    youtube: {
      views: 12070,
      likes: 630,
      shares: 222,
      comments: 230,
      engagement_rate: 4.2
    }
  },
  recent_content: [
    {
      id: '1',
      title: 'Morning Workout Routine',
      platform: 'instagram',
      views: 12450,
      likes: 892,
      engagement_rate: 7.2,
      created_at: '2024-01-15'
    },
    {
      id: '2',
      title: 'Quick Recipe Tutorial',
      platform: 'tiktok',
      views: 23680,
      likes: 1456,
      engagement_rate: 6.1,
      created_at: '2024-01-14'
    },
    {
      id: '3',
      title: 'Productivity Tips',
      platform: 'youtube',
      views: 8920,
      likes: 567,
      engagement_rate: 6.4,
      created_at: '2024-01-13'
    }
  ],
  engagement_trend: [
    { date: '2024-01-10', views: 8400, likes: 560, shares: 89 },
    { date: '2024-01-11', views: 9200, likes: 620, shares: 94 },
    { date: '2024-01-12', views: 10100, likes: 680, shares: 102 },
    { date: '2024-01-13', views: 11500, likes: 750, shares: 115 },
    { date: '2024-01-14', views: 13200, likes: 890, shares: 128 },
    { date: '2024-01-15', views: 15600, likes: 1020, shares: 145 },
    { date: '2024-01-16', views: 14200, likes: 920, shares: 135 }
  ]
};

export const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(SAMPLE_ANALYTICS);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    return platform?.icon || Instagram;
  };

  const getPlatformColor = (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    const colors = {
      purple: 'text-purple-600 bg-purple-100',
      black: 'text-gray-600 bg-gray-100',
      red: 'text-red-600 bg-red-100',
      blue: 'text-blue-600 bg-blue-100',
      sky: 'text-sky-600 bg-sky-100'
    };
    return platform ? colors[platform.color as keyof typeof colors] : 'text-gray-600 bg-gray-100';
  };

  const MetricCard: React.FC<{
    title: string;
    value: number;
    icon: React.ComponentType<any>;
    change?: number;
    format?: 'number' | 'percentage';
  }> = ({ title, value, icon: Icon, change, format = 'number' }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span className="ml-1">{Math.abs(change)}{format === 'percentage' ? '%' : ''}</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900">
        {format === 'percentage' ? `${value}%` : formatNumber(value)}
      </h3>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Track your content performance and audience engagement</p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:bg-blue-700 transition-colors">
            <Download className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Platforms</option>
            {PLATFORMS.map(platform => (
              <option key={platform.id} value={platform.id}>{platform.name}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Views"
              value={analyticsData.overview.total_views}
              icon={Eye}
              change={18.5}
            />
            <MetricCard
              title="Total Likes"
              value={analyticsData.overview.total_likes}
              icon={Heart}
              change={12.3}
            />
            <MetricCard
              title="Engagement Rate"
              value={analyticsData.overview.engagement_rate}
              icon={TrendingUp}
              format="percentage"
              change={2.1}
            />
            <MetricCard
              title="Content Count"
              value={analyticsData.overview.content_count}
              icon={Target}
              change={15.7}
            />
          </div>

          {/* Platform Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Performance</h3>
              <div className="space-y-4">
                {Object.entries(analyticsData.platform_performance).map(([platform, data]) => {
                  const Icon = getPlatformIcon(platform);
                  const colorClass = getPlatformColor(platform);
                  
                  return (
                    <div key={platform} className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{platform}</p>
                          <p className="text-sm text-gray-500">{formatNumber(data.views)} views</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{data.engagement_rate}%</p>
                        <p className="text-sm text-gray-500">engagement</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Engagement Trend Chart Placeholder */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Engagement Trend</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization would go here</p>
                  <p className="text-sm text-gray-400">Integration with chart library needed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Content Performance */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Content Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Content</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Platform</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Views</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Likes</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Engagement</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.recent_content.map((content) => {
                    const Icon = getPlatformIcon(content.platform);
                    const colorClass = getPlatformColor(content.platform);
                    
                    return (
                      <tr key={content.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{content.title}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded flex items-center justify-center ${colorClass}`}>
                              <Icon className="w-3 h-3" />
                            </div>
                            <span className="text-sm text-gray-600 capitalize">{content.platform}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-gray-900">
                          {formatNumber(content.views)}
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-gray-900">
                          {formatNumber(content.likes)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            content.engagement_rate >= 8 ? 'bg-green-100 text-green-800' :
                            content.engagement_rate >= 5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {content.engagement_rate}%
                          </span>
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-gray-500">
                          {new Date(content.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-blue-900">Top Performing Platform</h4>
              </div>
              <p className="text-blue-700 text-sm">
                TikTok is your best performing platform with 9.3% engagement rate. 
                Consider creating more content for this audience.
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-green-900">Growth Opportunity</h4>
              </div>
              <p className="text-green-700 text-sm">
                Your content is growing 18.5% month-over-month. Keep up the consistent posting schedule!
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 