import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Video, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchWithAuth } from '../../utils/api';

interface VideoUploadProps {
  onUploadComplete?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UploadedFile {
  file: File;
  preview: string;
  id: string;
}

const PLATFORM_OPTIONS = [
  { id: 'tiktok', name: 'TikTok', specs: '9:16, max 60s' },
  { id: 'instagram', name: 'Instagram Reels', specs: '9:16, max 90s' },
  { id: 'youtube_shorts', name: 'YouTube Shorts', specs: '9:16, max 60s' },
  { id: 'facebook', name: 'Facebook', specs: '16:9, max 4min' },
  { id: 'twitter', name: 'Twitter', specs: '16:9, max 2:20min' },
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_TYPES = ['video/mp4', 'video/avi', 'video/mov', 'video/webm'];

export function VideoUpload({ onUploadComplete, onError }: VideoUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok']);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(`File type ${file.type} not supported. Please use MP4, AVI, MOV, or WebM.`);
      onError?.(`Unsupported file type: ${file.type}`);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      onError?.(`File too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB`);
      return;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);
    
    setUploadedFile({
      file,
      preview,
      id: Date.now().toString()
    });

    toast.success('Video selected successfully!');
  }, [onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ACCEPTED_TYPES.map(type => type.split('/')[1])
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  });

  const handleUpload = async () => {
    if (!uploadedFile) {
      toast.error('Please select a video file first.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', uploadedFile.file);
      formData.append('title', title || 'Untitled Video');
      if (description) formData.append('description', description);
      formData.append('platforms', JSON.stringify(selectedPlatforms));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload video
      const uploadResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/videos/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const uploadData = await uploadResponse.json();
      
      // Process video for selected platforms
      setIsProcessing(true);
      
      const processResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/videos/process/${uploadData.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            platforms: selectedPlatforms
          }),
        }
      );

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.detail || 'Processing failed');
      }

      const processData = await processResponse.json();

      toast.success('Video uploaded and processed successfully! 🎉');
      onUploadComplete?.({ upload: uploadData, processing: processData });

      // Reset form
      setUploadedFile(null);
      setTitle('');
      setDescription('');
      setSelectedPlatforms(['tiktok']);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platformId)) {
        return prev.filter(id => id !== platformId);
      } else {
        return [...prev, platformId];
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Upload Area */}
      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50 text-blue-600' 
              : 'border-gray-300 hover:border-gray-400 text-gray-600'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">
            {isDragActive ? 'Drop your video here' : 'Upload your video'}
          </h3>
          <p className="text-gray-500 mb-4">
            Drag and drop your video file here, or click to browse
          </p>
          <p className="text-sm text-gray-400">
            Supports MP4, AVI, MOV, WebM • Max {MAX_FILE_SIZE / (1024 * 1024)}MB
          </p>
        </div>
      ) : (
        /* File Preview */
        <div className="border rounded-lg p-6 bg-gray-50">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <video
                src={uploadedFile.preview}
                className="w-32 h-32 object-cover rounded-lg"
                controls
              />
              <button
                onClick={removeFile}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{uploadedFile.file.name}</h4>
              <p className="text-sm text-gray-500">
                {(uploadedFile.file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
              
              {/* Upload Progress */}
              {(isUploading || isProcessing) && (
                <div className="mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600">
                      {isUploading ? 'Uploading...' : 'Processing...'}
                    </span>
                  </div>
                  {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      {uploadedFile && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video content..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Platforms
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLATFORM_OPTIONS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`
                    p-3 text-left border rounded-lg transition-colors
                    ${selectedPlatforms.includes(platform.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    {selectedPlatforms.includes(platform.id) ? (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                    <div>
                      <div className="font-medium">{platform.name}</div>
                      <div className="text-xs text-gray-500">{platform.specs}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || isProcessing || selectedPlatforms.length === 0}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold transition-colors
              ${isUploading || isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : selectedPlatforms.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            {isUploading ? (
              <span className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading... {uploadProgress}%</span>
              </span>
            ) : isProcessing ? (
              <span className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Video...</span>
              </span>
            ) : (
              'Upload & Process Video'
            )}
          </button>
        </div>
      )}
    </div>
  );
} 