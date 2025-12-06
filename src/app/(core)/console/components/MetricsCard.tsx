import React from 'react';

export interface MetricsCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white rounded-lg border p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
  </div>
);

export default MetricsCard;
