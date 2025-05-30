import React, { useState } from 'react';
import { 
  PenTool, 
  Sparkles, 
  Copy, 
  RefreshCw, 
  Instagram, 
  Headphones,
  Youtube,
  Facebook,
  Twitter,
  Video,
  Hash,
  Smile,
  Briefcase,
  Heart,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const TONES = [
  { id: 'casual', name: 'Casual', icon: Smile, color: 'blue', description: 'Friendly and relaxed' },
  { id: 'professional', name: 'Professional', icon: Briefcase, color: 'gray', description: 'Formal and business-like' },
  { id: 'fun', name: 'Fun', icon: Heart, color: 'pink', description: 'Playful and energetic' },
  { id: 'motivational', name: 'Motivational', icon: Zap, color: 'orange', description: 'Inspiring and uplifting' },
];

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'purple' },
  { id: 'tiktok', name: 'TikTok', icon: Headphones, color: 'black' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'red' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'blue' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'sky' },
];

export const CaptionGenerator: React.FC = () => {
  const [formData, setFormData] = useState({
    video_description: '',
    tone: 'casual',
    platforms: ['instagram'],
    include_hashtags: true,
    include_emojis: true,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.video_description.trim()) {
      toast.error('Please describe your video content');
      return;
    }

    setIsGenerating(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/captions/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      
      if (response.ok) {
        setGeneratedCaption(result.caption);
        setGeneratedHashtags(result.hashtags || []);
        toast.success('Caption generated successfully! 🎉');
      } else {
        if (response.status === 402) {
          toast.error('Caption limit reached! Upgrade to Pro for unlimited captions.');
        } else {
          toast.error(result.detail || 'Failed to generate caption');
        }
      }
    } catch (error) {
      console.error('Caption generation error:', error);
      toast.error('Failed to generate caption. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard! 📋');
  };

  const togglePlatform = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(id => id !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const getPlatformColor = (color: string) => {
    const colors = {
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      black: 'bg-gray-100 text-gray-700 border-gray-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      sky: 'bg-sky-100 text-sky-700 border-sky-200',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getToneColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      gray: 'bg-gray-100 text-gray-700 border-gray-200',
      pink: 'bg-pink-100 text-pink-700 border-pink-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <PenTool className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Caption Generator</h1>
            <p className="text-gray-600">Transform your video ideas into engaging captions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video Description */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                <Video className="w-4 h-4 inline mr-2" />
                Describe Your Video Content
              </label>
              <textarea
                value={formData.video_description}
                onChange={(e) => setFormData({ ...formData, video_description: e.target.value })}
                placeholder="Example: A quick morning workout routine with 5 exercises to energize your day..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
              />
              <p className="text-xs text-gray-500">
                Be specific about your content to get better captions
              </p>
            </div>

            {/* Tone Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                Choose Tone
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TONES.map((tone) => {
                  const Icon = tone.icon;
                  const isSelected = formData.tone === tone.id;
                  
                  return (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, tone: tone.id })}
                      className={`
                        p-4 rounded-xl border-2 text-left transition-all duration-200
                        ${isSelected 
                          ? `${getToneColor(tone.color)} border-current shadow-lg transform scale-[1.02]` 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <div>
                          <p className="font-medium text-sm">{tone.name}</p>
                          <p className="text-xs opacity-75">{tone.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                Target Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = formData.platforms.includes(platform.id);
                  
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      className={`
                        inline-flex items-center space-x-2 px-4 py-2 rounded-lg border font-medium text-sm transition-all
                        ${isSelected 
                          ? `${getPlatformColor(platform.color)} shadow-md` 
                          : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{platform.name}</span>
                      {isSelected && <CheckCircle className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                Additional Options
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.include_hashtags}
                    onChange={(e) => setFormData({ ...formData, include_hashtags: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">Include hashtags</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.include_emojis}
                    onChange={(e) => setFormData({ ...formData, include_emojis: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Smile className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">Include emojis</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={isGenerating || !formData.video_description.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Caption</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output */}
        <div className="space-y-6">
          {generatedCaption ? (
            <div className="space-y-6">
              {/* Generated Caption */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Generated Caption</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(generatedCaption)}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-white rounded-lg border border-gray-300 hover:border-gray-400 transition-colors text-sm font-medium text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {generatedCaption}
                  </p>
                </div>
              </div>

              {/* Generated Hashtags */}
              {generatedHashtags.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Hash className="w-5 h-5 text-purple-600" />
                      <span>Hashtags</span>
                    </h3>
                    <button
                      onClick={() => copyToClipboard(generatedHashtags.join(' '))}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-white rounded-lg border border-gray-300 hover:border-gray-400 transition-colors text-sm font-medium text-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy All</span>
                    </button>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {generatedHashtags.map((hashtag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium cursor-pointer hover:bg-purple-200 transition-colors"
                          onClick={() => copyToClipboard(hashtag)}
                        >
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-300 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
              <p className="text-gray-600">
                Describe your video content and click generate to create an engaging caption
              </p>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Pro Tips</span>
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Be specific about your video content for better results</li>
              <li>• Mention your target audience or niche</li>
              <li>• Include the main benefit or takeaway</li>
              <li>• Choose the right tone for your brand voice</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}; 