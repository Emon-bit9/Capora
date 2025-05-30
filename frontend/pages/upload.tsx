import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Loading from '../components/ui/Loading';
import { fetchWithAuth } from '../utils/api';

interface VideoVariant {
  id: string;
  platform: string;
  video_url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  file_size: number;
  duration: number;
  processing_status: string;
}

interface ProcessedContent {
  content_id: string;
  content_status: string;
  title: string;
  caption: string;
  variants: VideoVariant[];
}

interface ProcessingStatus {
  content_id: string;
  status: string;
  progress: number;
  error_message?: string;
}

type WorkflowStep = 'upload' | 'process' | 'review' | 'complete';

const UploadWorkflow = () => {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  
  // State management
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'tiktok']);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [contentId, setContentId] = useState<string | null>(null);
  const [processedContent, setProcessedContent] = useState<ProcessedContent | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Dark mode setup
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a video file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title || 'Untitled Video');
      formData.append('platforms', JSON.stringify(selectedPlatforms));

      const response = await fetchWithAuth('http://localhost:8080/api/v1/videos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setContentId(data.content_id);
      setCurrentStep('process');
      
      // Start monitoring processing status
      startStatusMonitoring(data.content_id);
      
    } catch (error: any) {
      console.error('Upload failed:', error);
      setError(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const startStatusMonitoring = (contentId: string) => {
    setProcessing(true);
    
    const checkStatus = async () => {
      try {
        const response = await fetchWithAuth(`http://localhost:8080/api/v1/videos/status/${contentId}`);
        if (response.ok) {
          const status: ProcessingStatus = await response.json();
          setProcessingStatus(status);
          
          if (status.status === 'completed') {
            // Processing completed, fetch variants
            await fetchProcessedVariants(contentId);
            setProcessing(false);
            setCurrentStep('review');
            
            if (statusCheckInterval.current) {
              clearInterval(statusCheckInterval.current);
            }
          } else if (status.status === 'failed') {
            setError(status.error_message || 'Processing failed');
            setProcessing(false);
            
            if (statusCheckInterval.current) {
              clearInterval(statusCheckInterval.current);
            }
          }
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    };

    // Check immediately and then every 2 seconds
    checkStatus();
    statusCheckInterval.current = setInterval(checkStatus, 2000);
  };

  const fetchProcessedVariants = async (contentId: string) => {
    try {
      const response = await fetchWithAuth(`http://localhost:8080/api/v1/videos/variants/${contentId}`);
      if (response.ok) {
        const data = await response.json();
        setProcessedContent(data);
      }
    } catch (error) {
      console.error('Failed to fetch variants:', error);
      setError('Failed to fetch processed videos');
    }
  };

  const handlePlatformPublish = async (platform: string) => {
    if (!processedContent) return;

    try {
      const response = await fetchWithAuth(`http://localhost:8080/api/v1/publishing/publish/${processedContent.content_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platforms: [platform]
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully published to ${platform}! ${result.message || ''}`);
      } else {
        const error = await response.json();
        alert(`Failed to publish to ${platform}: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Publishing error:', error);
      alert(`Error publishing to ${platform}. Please try again.`);
    }
  };

  const handlePublishAll = async () => {
    if (!processedContent) return;

    try {
      const platforms = processedContent.variants.map(v => v.platform);
      const response = await fetchWithAuth(`http://localhost:8080/api/v1/publishing/publish/${processedContent.content_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platforms: platforms
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully published to all platforms! ${result.message || ''}`);
        setCurrentStep('complete');
      } else {
        const error = await response.json();
        alert(`Failed to publish: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Publishing error:', error);
      alert('Error publishing to platforms. Please try again.');
    }
  };

  const handlePublish = async () => {
    // Legacy function - redirect to publish all
    await handlePublishAll();
  };

  const resetWorkflow = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setVideoPreview(null);
    setContentId(null);
    setProcessedContent(null);
    setProcessingStatus(null);
    setTitle('');
    setSelectedPlatforms(['instagram', 'tiktok']);
    setError(null);
    setUploading(false);
    setProcessing(false);
    
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'upload', label: 'Upload', number: 1 },
      { key: 'process', label: 'Process', number: 2 },
      { key: 'review', label: 'Review', number: 3 },
      { key: 'complete', label: 'Complete', number: 4 }
    ];

    const getStepIndex = (step: string) => steps.findIndex(s => s.key === step);
    const currentIndex = getStepIndex(currentStep);

    return (
      <div className="flex items-center justify-center mb-12">
        {steps.map((step, index) => {
          const isActive = step.key === currentStep;
          const isCompleted = index < currentIndex;
          const isNext = index === currentIndex + 1;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all duration-300
                  ${isActive 
                    ? 'bg-blue-500 border-blue-500 text-white shadow-lg scale-110' 
                    : isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isNext && processing
                    ? 'bg-blue-100 border-blue-300 text-blue-600 animate-pulse'
                    : 'bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
                  }
                `}>
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`
                  mt-2 text-sm font-medium transition-colors duration-300
                  ${isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : isCompleted 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  h-1 w-16 mx-4 rounded transition-colors duration-500
                  ${index < currentIndex 
                    ? 'bg-green-400' 
                    : index === currentIndex && processing
                    ? 'bg-gradient-to-r from-blue-400 to-blue-200 animate-pulse'
                    : 'bg-gray-200 dark:bg-gray-600'
                  }
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderUploadStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Upload Your Video
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select a video file to optimize for your chosen social media platforms
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!selectedFile ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-300">
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Drop your video here
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                or click to browse files
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Choose Video File
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Video Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <video
                  src={videoPreview || ''}
                  controls
                  className="w-32 h-32 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedFile.name}
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <p>Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <p>Type: {selectedFile.type}</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                >
                  Change file
                </button>
              </div>
            </div>
          </div>

          {/* Video Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your video..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Target Platforms
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'tiktok', name: 'TikTok', specs: '1080x1920 (9:16)' },
                { id: 'instagram', name: 'Instagram', specs: '1080x1920 (9:16)' },
                { id: 'youtube_shorts', name: 'YouTube Shorts', specs: '1080x1920 (9:16)' },
                { id: 'facebook', name: 'Facebook', specs: '1080x1080 (1:1)' },
                { id: 'twitter', name: 'Twitter', specs: '1280x720 (16:9)' }
              ].map((platform) => (
                <label
                  key={platform.id}
                  className={`
                    relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                    ${selectedPlatforms.includes(platform.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlatforms([...selectedPlatforms, platform.id]);
                      } else {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                      }
                    }}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {platform.name}
                    </span>
                    {selectedPlatforms.includes(platform.id) && (
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {platform.specs}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex justify-center pt-6">
            <button
              onClick={handleUpload}
              disabled={uploading || selectedPlatforms.length === 0}
              className="flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="animate-spin w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                  Uploading & Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Start Processing
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );

  const renderProcessStep = () => (
    <div className="max-w-xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Processing Your Video
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We're creating optimized versions for each platform. This may take a few moments.
        </p>
        
        {processingStatus && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {processingStatus.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${processingStatus.progress}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              Status: {processingStatus.status.replace('_', ' ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Review Your Videos
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
          Your videos have been optimized for each platform with proper aspect ratios and formats.
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm">
          🎬 Preview each video to ensure quality • 📐 Check aspect ratios match platform requirements • 🚀 Publish individually or all at once
        </p>
      </div>

      {processedContent && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {processedContent.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Status: <span className="capitalize font-medium">{processedContent.content_status}</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedContent.variants.map((variant) => {
              // Calculate aspect ratio for proper display
              const getAspectRatioClass = (platform: string) => {
                switch (platform) {
                  case 'tiktok':
                  case 'instagram':
                  case 'youtube_shorts':
                    return 'aspect-[9/16]'; // Vertical video
                  case 'facebook':
                    return 'aspect-square'; // Square video
                  case 'twitter':
                    return 'aspect-video'; // 16:9 landscape
                  default:
                    return 'aspect-video';
                }
              };

              const getPlatformIcon = (platform: string) => {
                switch (platform) {
                  case 'tiktok':
                    return '🎵';
                  case 'instagram':
                    return '📸';
                  case 'youtube_shorts':
                    return '🎬';
                  case 'facebook':
                    return '👥';
                  case 'twitter':
                    return '🐦';
                  default:
                    return '📹';
                }
              };

              return (
                <div key={variant.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className={`${getAspectRatioClass(variant.platform)} bg-gray-100 dark:bg-gray-700 relative max-w-sm mx-auto`}>
                    <video
                      src={`http://localhost:8080${variant.video_url}`}
                      controls
                      className="w-full h-full object-cover rounded-t-lg"
                      poster={variant.thumbnail_url ? `http://localhost:8080${variant.thumbnail_url}` : undefined}
                      preload="metadata"
                      onError={(e) => {
                        console.error('Video load error:', e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <span>{getPlatformIcon(variant.platform)}</span>
                      {variant.platform}
                    </div>
                    <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      {variant.width}×{variant.height}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 capitalize flex items-center gap-2">
                      <span>{getPlatformIcon(variant.platform)}</span>
                      {variant.platform.replace('_', ' ')}
                    </h4>
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                      <p><span className="font-medium">Dimensions:</span> {variant.width} × {variant.height}</p>
                      <p><span className="font-medium">Size:</span> {(variant.file_size / (1024 * 1024)).toFixed(2)} MB</p>
                      <p><span className="font-medium">Duration:</span> {variant.duration.toFixed(1)}s</p>
                      <p><span className="font-medium">Aspect Ratio:</span> {
                        variant.platform === 'tiktok' || variant.platform === 'instagram' || variant.platform === 'youtube_shorts' ? '9:16 (Vertical)' :
                        variant.platform === 'facebook' ? '1:1 (Square)' :
                        '16:9 (Landscape)'
                      }</p>
                    </div>
                    
                    {/* Individual Platform Publish Button */}
                    <button
                      onClick={() => handlePlatformPublish(variant.platform)}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center group"
                    >
                      <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Publish to {variant.platform.charAt(0).toUpperCase() + variant.platform.slice(1).replace('_', ' ')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center space-x-4 pt-6">
            <button
              onClick={resetWorkflow}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Start Over
            </button>
            <button
              onClick={handlePublishAll}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Publish to All Platforms
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderCompleteStep = () => (
    <div className="max-w-xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Successfully Published!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your videos have been published to all selected platforms.
        </p>
        <div className="space-y-4">
          <button
            onClick={resetWorkflow}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Create Another Video
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Head>
        <title>Upload Video - Capora</title>
        <meta name="description" content="Upload and optimize your videos for multiple social media platforms" />
      </Head>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Capora
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {renderStepIndicator()}
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          {currentStep === 'upload' && renderUploadStep()}
          {currentStep === 'process' && renderProcessStep()}
          {currentStep === 'review' && renderReviewStep()}
          {currentStep === 'complete' && renderCompleteStep()}
        </div>
      </main>
    </div>
  );
};

export default UploadWorkflow; 