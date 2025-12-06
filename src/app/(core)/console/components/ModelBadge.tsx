import React from 'react';

export interface ModelBadgeProps {
  model: string;
  provider: string;
}

const ModelBadge: React.FC<ModelBadgeProps> = ({ model, provider }) => {
  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai':
        return 'bg-blue-100 text-blue-500';
      case 'anthropic':
        return 'bg-blue-100 text-blue-500';
      case 'google':
        return 'bg-blue-100 text-blue-500';
      default:
        return 'bg-blue-100 text-blue-500';
    }
  };
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-sm font-medium text-gray-900">{model}</span>
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getProviderColor(provider)}`}>
        {provider}
      </span>
    </div>
  );
};

export default ModelBadge;
