import React from 'react';
import Head from 'next/head';

export default function EnvironmentCheck() {
  const envVars = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  const isProduction = process.env.NODE_ENV === 'production';
  const hasApiUrl = !!process.env.NEXT_PUBLIC_API_URL;

  return (
    <>
      <Head>
        <title>Environment Check - Capora</title>
        <meta name="description" content="Check environment variables" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              🔧 Environment Check
            </h1>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className={`p-4 rounded-lg border-2 ${
                hasApiUrl 
                  ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20' 
                  : 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{hasApiUrl ? '✅' : '❌'}</span>
                  <div>
                    <h3 className={`font-semibold ${
                      hasApiUrl ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                    }`}>
                      API URL
                    </h3>
                    <p className={`text-sm ${
                      hasApiUrl ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {hasApiUrl ? 'Configured' : 'Missing'}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${
                isProduction 
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20' 
                  : 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{isProduction ? '🚀' : '⚠️'}</span>
                  <div>
                    <h3 className={`font-semibold ${
                      isProduction ? 'text-blue-800 dark:text-blue-300' : 'text-yellow-800 dark:text-yellow-300'
                    }`}>
                      Environment
                    </h3>
                    <p className={`text-sm ${
                      isProduction ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {process.env.NODE_ENV || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Environment Variables */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Environment Variables
              </h2>
              
              <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
                  {JSON.stringify(envVars, null, 2)}
                </pre>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  ℹ️ Setup Instructions
                </h3>
                <div className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
                  {!hasApiUrl && (
                    <div className="space-y-1">
                      <p className="font-medium">❌ NEXT_PUBLIC_API_URL is missing!</p>
                      <p>Add this to your Vercel environment variables:</p>
                      <code className="block bg-blue-100 dark:bg-blue-800 p-2 rounded text-xs font-mono">
                        NEXT_PUBLIC_API_URL=https://capora-backend.onrender.com
                      </code>
                    </div>
                  )}
                  
                  {hasApiUrl && (
                    <div className="space-y-1">
                      <p className="font-medium">✅ API URL is configured correctly!</p>
                      <p>Backend endpoint: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-xs">{process.env.NEXT_PUBLIC_API_URL}</code></p>
                    </div>
                  )}
                </div>
              </div>

              {/* Test API Connection */}
              <div className="mt-4">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/health`);
                      const data = await response.json();
                      alert(`✅ Backend connection successful!\n\nResponse: ${JSON.stringify(data, null, 2)}`);
                    } catch (error) {
                      alert(`❌ Backend connection failed!\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  🔗 Test Backend Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 