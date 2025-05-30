import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function DebugPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const results: any[] = [];

    // Test 1: Environment Variables
    results.push({
      test: 'Environment Variables',
      status: 'info',
      data: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NODE_ENV: process.env.NODE_ENV,
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side',
        timestamp: new Date().toISOString()
      }
    });

    // Test 2: Backend Health Check
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        results.push({
          test: 'Backend Health Check',
          status: 'success',
          data: {
            url: `${backendUrl}/health`,
            status: response.status,
            response: data
          }
        });
      } else {
        results.push({
          test: 'Backend Health Check',
          status: 'error',
          data: {
            url: `${backendUrl}/health`,
            status: response.status,
            statusText: response.statusText
          }
        });
      }
    } catch (error) {
      results.push({
        test: 'Backend Health Check',
        status: 'error',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
          url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/health`
        }
      });
    }

    // Test 3: CORS Test
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/health`, {
        method: 'OPTIONS',
      });

      results.push({
        test: 'CORS Preflight Test',
        status: response.ok ? 'success' : 'warning',
        data: {
          url: `${backendUrl}/health`,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        }
      });
    } catch (error) {
      results.push({
        test: 'CORS Preflight Test',
        status: 'error',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <>
      <Head>
        <title>Debug - Capora</title>
        <meta name="description" content="Debug connection issues" />
      </Head>

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">🔧 Debug Panel</h1>
              <button
                onClick={runTests}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Running Tests...' : 'Refresh Tests'}
              </button>
            </div>

            <div className="space-y-6">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">{getStatusIcon(result.status)}</span>
                    <h3 className="text-lg font-semibold">{result.test}</h3>
                  </div>
                  
                  <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Fixes:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• If Backend Health Check fails, ensure backend is running on Render</li>
                <li>• If NEXT_PUBLIC_API_URL is undefined, add it to Vercel environment variables</li>
                <li>• If CORS fails, check backend CORS configuration</li>
                <li>• For localhost testing, make sure backend is running on port 8080</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 