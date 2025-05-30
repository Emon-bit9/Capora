import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { VideoUpload } from '../components/video-upload/VideoUpload';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/ui/Loading';
import { ArrowLeft, Sparkles, Zap, Clock, Shield } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check for dark mode preference
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleUploadComplete = (data: any) => {
    // Redirect to dashboard library after successful upload
    router.push('/dashboard?tab=library');
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // Stay on upload page for retry
  };

  if (isLoading) {
    return <Loading text="Loading upload workspace..." />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <>
      <Head>
        <title>Upload Video - Capora</title>
        <meta name="description" content="Upload and optimize your videos for social media platforms" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              
              {/* Logo and Back */}
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className="font-medium">Back to Dashboard</span>
                </Link>
                
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Capora
                  </span>
                </Link>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.niche} Creator</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Upload Your Video
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Upload once and automatically optimize for all your social media platforms. 
              Our ultra-fast processing ensures you're ready to publish in seconds.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Optimized processing pipeline delivers results in seconds, not minutes
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Real-Time Progress</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Watch your video being processed live with detailed status updates
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Platform Optimized</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatic aspect ratio and format optimization for each platform
              </p>
            </div>
          </div>

          {/* Upload Component */}
          <VideoUpload 
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />

          {/* Help Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Select Video</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose your video file (MP4, MOV, AVI, WebM up to 100MB)
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Choose Platforms</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select which social media platforms you want to optimize for
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Upload & Process</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Watch real-time progress as we optimize your video for each platform
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  4
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Download & Share</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get platform-optimized videos ready for publishing
                </p>
              </div>

            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard?tab=captions"
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Generate AI Captions
              </Link>
              <Link 
                href="/dashboard?tab=templates"
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Browse Templates
              </Link>
              <Link 
                href="/dashboard?tab=analytics"
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                View Analytics
              </Link>
            </div>
          </div>

        </main>
      </div>
    </>
  );
} 