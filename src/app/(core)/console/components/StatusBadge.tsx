import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export interface StatusBadgeProps {
  status: string;
  error?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, error }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return { icon: CheckCircle, color: 'text-green-600 bg-green-50', text: 'Success' };
      case 'error':
        return { icon: XCircle, color: 'text-red-600 bg-red-50', text: 'Error' };
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600 bg-yellow-50', text: 'Pending' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600 bg-gray-50', text: 'Unknown' };
    }
  };

  const { icon: Icon, color, text } = getStatusConfig();

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {text}
      {error && (
        <span className="ml-1 text-xs opacity-75">
          ({error.split(' ')[0]})
        </span>
      )}
    </div>
  );
};

export default StatusBadge;
