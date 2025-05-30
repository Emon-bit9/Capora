import React from 'react';

interface PublishingProps {
  className?: string;
}

export const Publishing: React.FC<PublishingProps> = ({ className }) => {
  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Publishing Center</h2>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600 text-center">
          Publishing features coming soon! Connect your social media accounts to automatically post your content.
        </p>
      </div>
    </div>
  );
}; 