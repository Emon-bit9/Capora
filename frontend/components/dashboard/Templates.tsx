import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Copy, 
  Star, 
  Plus, 
  Search, 
  Filter,
  Heart,
  Briefcase,
  Smile,
  Zap,
  Instagram,
  Headphones,
  Youtube,
  Facebook,
  Twitter,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  title: string;
  content: string;
  tone: string;
  niche: string;
  platforms: string[];
  usage_count: number;
  is_favorite: boolean;
}

const NICHES = [
  { id: 'all', name: 'All Niches' },
  { id: 'fitness', name: 'Fitness' },
  { id: 'food', name: 'Food & Cooking' },
  { id: 'lifestyle', name: 'Lifestyle' },
  { id: 'business', name: 'Business' },
  { id: 'tech', name: 'Technology' },
  { id: 'education', name: 'Education' }
];

const TONES = [
  { id: 'all', name: 'All Tones' },
  { id: 'casual', name: 'Casual', icon: Smile, color: 'blue' },
  { id: 'professional', name: 'Professional', icon: Briefcase, color: 'gray' },
  { id: 'fun', name: 'Fun', icon: Heart, color: 'pink' },
  { id: 'motivational', name: 'Motivational', icon: Zap, color: 'orange' }
];

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'purple' },
  { id: 'tiktok', name: 'TikTok', icon: Headphones, color: 'black' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'red' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'blue' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'sky' }
];

// Sample templates data
const SAMPLE_TEMPLATES: Template[] = [
  {
    id: '1',
    title: 'Morning Workout Motivation',
    content: 'Rise and grind! 💪 {description} Remember, the only bad workout is the one that didn\'t happen. Who\'s crushing their fitness goals today?',
    tone: 'motivational',
    niche: 'fitness',
    platforms: ['instagram', 'tiktok'],
    usage_count: 245,
    is_favorite: true
  },
  {
    id: '2',
    title: 'Recipe Share - Casual',
    content: 'Made this deliciousness today and had to share! 😋 {description} Recipe details in my stories - save this post so you don\'t lose it!',
    tone: 'casual',
    niche: 'food',
    platforms: ['instagram', 'facebook'],
    usage_count: 189,
    is_favorite: false
  },
  {
    id: '3',
    title: 'Professional Business Update',
    content: 'Excited to share this milestone with our community. {description} Thank you for your continued support as we grow together.',
    tone: 'professional',
    niche: 'business',
    platforms: ['linkedin', 'twitter'],
    usage_count: 67,
    is_favorite: false
  },
  {
    id: '4',
    title: 'Tech Tutorial - Educational',
    content: 'Here\'s a quick tutorial on {description} 📱 Swipe through for step-by-step instructions. Save this for later reference!',
    tone: 'educational',
    niche: 'tech',
    platforms: ['youtube', 'instagram'],
    usage_count: 134,
    is_favorite: true
  },
  {
    id: '5',
    title: 'Daily Lifestyle Vibe',
    content: 'Just living my best life! ✨ {description} What\'s bringing you joy today? Drop it in the comments! 👇',
    tone: 'fun',
    niche: 'lifestyle',
    platforms: ['instagram', 'tiktok'],
    usage_count: 298,
    is_favorite: false
  }
];

export const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>(SAMPLE_TEMPLATES);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(SAMPLE_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('all');
  const [selectedTone, setSelectedTone] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter templates based on search and filters
  useEffect(() => {
    let filtered = templates;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply niche filter
    if (selectedNiche !== 'all') {
      filtered = filtered.filter(template => template.niche === selectedNiche);
    }

    // Apply tone filter
    if (selectedTone !== 'all') {
      filtered = filtered.filter(template => template.tone === selectedTone);
    }

    setFilteredTemplates(filtered);
  }, [templates, searchQuery, selectedNiche, selectedTone]);

  const copyTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.content);
    toast.success('Template copied to clipboard! 📋');
    
    // Update usage count
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usage_count: t.usage_count + 1 }
        : t
    ));
  };

  const toggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId 
        ? { ...t, is_favorite: !t.is_favorite }
        : t
    ));
    toast.success('Favorites updated! ⭐');
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    return platform ? platform.icon : Instagram;
  };

  const getPlatformColor = (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    const colors = {
      purple: 'text-purple-600',
      black: 'text-gray-600',
      red: 'text-red-600',
      blue: 'text-blue-600',
      sky: 'text-sky-600'
    };
    return platform ? colors[platform.color as keyof typeof colors] : 'text-gray-600';
  };

  const getToneInfo = (toneId: string) => {
    return TONES.find(t => t.id === toneId);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Caption Templates</h1>
              <p className="text-gray-600">Ready-to-use caption templates for every occasion</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:shadow-lg transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Niche Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
            >
              {NICHES.map(niche => (
                <option key={niche.id} value={niche.id}>{niche.name}</option>
              ))}
            </select>
          </div>

          {/* Tone Filter */}
          <select
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
          >
            {TONES.map(tone => (
              <option key={tone.id} value={tone.id}>{tone.name}</option>
            ))}
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-500 ml-auto">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedNiche('all');
              setSelectedTone('all');
            }}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const toneInfo = getToneInfo(template.tone);
            const ToneIcon = toneInfo?.icon || Smile;
            
            return (
              <div key={template.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{template.title}</h3>
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className={`p-1 rounded-lg transition-colors ${template.is_favorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-500'}`}
                    >
                      <Star className={`w-4 h-4 ${template.is_favorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <ToneIcon className="w-3 h-3" />
                      <span className="capitalize">{template.tone}</span>
                    </div>
                    <div className="capitalize">{template.niche}</div>
                    <div>{template.usage_count} uses</div>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="p-4">
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {template.content.replace('{description}', 'your content description')}
                  </p>

                  {/* Platforms */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xs text-gray-500">Platforms:</span>
                    <div className="flex space-x-1">
                      {template.platforms.slice(0, 3).map((platformId) => {
                        const Icon = getPlatformIcon(platformId);
                        return (
                          <Icon 
                            key={platformId}
                            className={`w-4 h-4 ${getPlatformColor(platformId)}`}
                          />
                        );
                      })}
                      {template.platforms.length > 3 && (
                        <span className="text-xs text-gray-400">+{template.platforms.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => copyTemplate(template)}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Template</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pro Tip */}
      <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-purple-900 mb-2">Pro Tip</h4>
            <p className="text-purple-700 text-sm">
              Templates use placeholder text like {'{description}'} that you can replace with your specific content. 
              Copy a template and customize it to match your brand voice and message!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 