import React, { useState, useEffect } from 'react';
import { User, Save, AlertCircle, CheckCircle, Eye, EyeOff, Lock, CreditCard, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

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

interface SettingsProps {
  user: User | null;
  onUserUpdate: (user: User) => void;
}

interface UserProfileData {
  name: string;
  email: string;
  niche: string;
  bio?: string;
}

interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const NICHE_OPTIONS = [
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'food', label: 'Food & Cooking' },
  { value: 'travel', label: 'Travel' },
  { value: 'business', label: 'Business' },
  { value: 'tech', label: 'Technology' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'music', label: 'Music' },
  { value: 'art', label: 'Art & Design' },
];

const TABS = [
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'security', name: 'Security', icon: Lock },
  { id: 'billing', name: 'Billing & Usage', icon: CreditCard },
];

export const Settings: React.FC<SettingsProps> = ({ user, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [usageData, setUsageData] = useState<UsageData | null>(null);

  const [profileData, setProfileData] = useState<UserProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    niche: user?.niche || 'lifestyle',
    bio: user?.bio || '',
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        niche: user.niche || 'lifestyle',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const updateProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/auth/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        onUserUpdate(updatedUser);
        toast.success('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/auth/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: passwordData.current_password,
            new_password: passwordData.new_password,
          }),
        }
      );

      if (response.ok) {
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
        toast.success('Password updated successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

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
      } else {
        console.error('Failed to fetch usage data');
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
    }
  };

  const upgradeSubscription = async (plan: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/auth/upgrade-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ plan }),
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        fetchUsageData(); // Refresh usage data
      } else {
        toast.error(data.detail || 'Failed to upgrade subscription');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('Error upgrading subscription');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchUsageData();
    }
  }, [activeTab]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Settings</h3>
            <nav className="space-y-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                      ${activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Niche
                    </label>
                    <select
                      value={profileData.niche}
                      onChange={(e) => setProfileData({ ...profileData, niche: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {NICHE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Tell us about yourself and your content..."
                    />
                  </div>

                  <button
                    onClick={updateProfile}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.current ? 'text' : 'password'}
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? 'text' : 'password'}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={updatePassword}
                    disabled={isLoading}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 capitalize">
                          {usageData?.subscription_plan || 'Free'} Plan
                        </h4>
                        {usageData?.subscription_ends_at && (
                          <p className="text-sm text-gray-600 mt-1">
                            Renews on {new Date(usageData.subscription_ends_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {usageData?.subscription_plan === 'free' && (
                        <button
                          onClick={() => upgradeSubscription('pro')}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          Upgrade to Pro
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Usage Statistics */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month's Usage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Caption Usage */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900">AI Captions</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Used</span>
                          <span className="font-medium">
                            {usageData?.captions_used_this_month || 0} / {usageData?.caption_limit || 10}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              usageData?.can_use_captions ? 'bg-blue-600' : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                ((usageData?.captions_used_this_month || 0) / (usageData?.caption_limit || 1)) * 100,
                                100
                              )}%`
                            }}
                          ></div>
                        </div>
                        {!usageData?.can_use_captions && (
                          <p className="text-xs text-red-600 mt-1">Limit reached - upgrade to continue</p>
                        )}
                      </div>
                    </div>

                    {/* Video Usage */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-green-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Video Processing</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Used</span>
                          <span className="font-medium">
                            {usageData?.videos_processed_this_month || 0} / {usageData?.video_limit || 5}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              usageData?.can_process_videos ? 'bg-green-600' : 'bg-red-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                ((usageData?.videos_processed_this_month || 0) / (usageData?.video_limit || 1)) * 100,
                                100
                              )}%`
                            }}
                          ></div>
                        </div>
                        {!usageData?.can_process_videos && (
                          <p className="text-xs text-red-600 mt-1">Limit reached - upgrade to continue</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upgrade Options */}
                {usageData?.subscription_plan === 'free' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade Plans</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Pro Plan */}
                      <div className="bg-white rounded-lg border-2 border-blue-200 p-6">
                        <div className="mb-4">
                          <h4 className="text-xl font-bold text-gray-900">Pro Plan</h4>
                          <p className="text-gray-600">Perfect for serious creators</p>
                        </div>
                        <div className="mb-6">
                          <span className="text-3xl font-bold text-gray-900">$19</span>
                          <span className="text-gray-600 ml-2">/month</span>
                        </div>
                        <ul className="space-y-2 mb-6 text-sm text-gray-600">
                          <li>✅ 1,000 AI captions/month</li>
                          <li>✅ 100 video processing/month</li>
                          <li>✅ Content scheduling</li>
                          <li>✅ Priority support</li>
                          <li>✅ Advanced analytics</li>
                        </ul>
                        <button
                          onClick={() => upgradeSubscription('pro')}
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          Upgrade to Pro
                        </button>
                      </div>

                      {/* Enterprise Plan */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="mb-4">
                          <h4 className="text-xl font-bold text-gray-900">Enterprise</h4>
                          <p className="text-gray-600">For teams and agencies</p>
                        </div>
                        <div className="mb-6">
                          <span className="text-3xl font-bold text-gray-900">$99</span>
                          <span className="text-gray-600 ml-2">/month</span>
                        </div>
                        <ul className="space-y-2 mb-6 text-sm text-gray-600">
                          <li>✅ 10,000 AI captions/month</li>
                          <li>✅ 1,000 video processing/month</li>
                          <li>✅ Team collaboration</li>
                          <li>✅ Custom branding</li>
                          <li>✅ Dedicated support</li>
                        </ul>
                        <button
                          onClick={() => upgradeSubscription('enterprise')}
                          disabled={isLoading}
                          className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                          Upgrade to Enterprise
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 