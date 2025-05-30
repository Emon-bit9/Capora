import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Edit3, Trash2, Play, Clock, TrendingUp } from 'lucide-react';

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

interface ContentLibraryProps {
  contentItems: ContentItem[];
  onDeleteContent: (id: number) => void;
  onRefresh: () => void;
}

export const ContentLibrary: React.FC<ContentLibraryProps> = ({
  contentItems,
  onDeleteContent,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'processing' | 'ready' | 'published'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  const filteredAndSortedItems = contentItems
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'popular':
          return (b.analytics?.views || 0) - (a.analytics?.views || 0);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'published': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'tiktok': return '🎵';
      case 'instagram': return '📷';
      case 'youtube': return '📺';
      case 'facebook': return '👥';
      case 'twitter': return '🐦';
      default: return '🎬';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Content Library</h3>
          <p className="text-gray-600 dark:text-gray-400">Manage and track your video content</p>
        </div>
        <button
          onClick={onRefresh}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="processing">Processing</option>
          <option value="ready">Ready</option>
          <option value="published">Published</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Content Grid */}
      {filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-6xl mb-4">📹</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No content found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Start creating your first video!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                {item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                {/* Platform Icons */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  {item.platforms.map((platform, index) => (
                    <span key={index} className="text-lg bg-black bg-opacity-75 rounded px-1">
                      {getPlatformIcon(platform)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content Info */}
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {item.title}
                </h4>
                
                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Analytics */}
                {item.analytics && (
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {formatNumber(item.analytics.views)}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {formatNumber(item.analytics.likes)}
                    </div>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <Clock className="w-4 h-4" />
                  {formatDate(item.created_at)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    onClick={() => window.open(`/content/${item.id}`, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    onClick={() => window.open(`/content/${item.id}/edit`, '_blank')}
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this content?')) {
                        onDeleteContent(item.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 