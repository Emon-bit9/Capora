import React from 'react';
import { AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface UsageWarningProps {
  feature: 'captions' | 'videos';
  used: number;
  limit: number;
  canUse: boolean;
  onUpgrade?: () => void;
}

export const UsageWarning: React.FC<UsageWarningProps> = ({
  feature,
  used,
  limit,
  canUse,
  onUpgrade
}) => {
  const percentage = (used / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = !canUse;

  if (percentage < 80) return null;

  const featureName = feature === 'captions' ? 'AI captions' : 'video processing';
  const icon = feature === 'captions' ? '✍️' : '🎬';

  return (
    <div className={`rounded-lg p-4 border ${
      isAtLimit 
        ? 'bg-red-50 border-red-200' 
        : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`rounded-full p-2 ${
          isAtLimit ? 'bg-red-100' : 'bg-yellow-100'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${
            isAtLimit ? 'text-red-600' : 'text-yellow-600'
          }`} />
        </div>
        
        <div className="flex-1">
          <h4 className={`font-semibold ${
            isAtLimit ? 'text-red-900' : 'text-yellow-900'
          }`}>
            {isAtLimit ? `${icon} ${featureName} limit reached!` : `${icon} Approaching ${featureName} limit`}
          </h4>
          
          <p className={`text-sm mt-1 ${
            isAtLimit ? 'text-red-700' : 'text-yellow-700'
          }`}>
            You've used {used} of {limit} {featureName} this month
            {isAtLimit 
              ? '. Upgrade to continue using this feature.'
              : '. Consider upgrading for unlimited access.'
            }
          </p>
          
          <div className={`mt-3 w-full bg-gray-200 rounded-full h-2`}>
            <div 
              className={`h-2 rounded-full ${
                isAtLimit ? 'bg-red-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          
          {(isAtLimit || isNearLimit) && (
            <div className="mt-4">
              <button
                onClick={onUpgrade}
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  isAtLimit 
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Upgrade to Pro</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 