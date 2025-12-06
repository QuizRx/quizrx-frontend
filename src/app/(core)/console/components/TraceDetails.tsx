import React from 'react';
import { Clock, DollarSign, Zap } from 'lucide-react';
import MetricsCard from './MetricsCard';
import ModelBadge from './ModelBadge';
import StatusBadge from './StatusBadge';

export interface TraceDetailsProps {
  trace: any;
  onClose: () => void;
}

const TraceDetails: React.FC<TraceDetailsProps> = ({ trace, onClose }) => (
  <div className="fixed inset-0 bg-white/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Trace Details: {trace._id}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
      </div>
      <div className="p-6 space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricsCard
            title="Duration"
            value={trace.duration || "Unknown"}
            icon={Clock}
            color="text-primary" subtitle={"ms"}          />
          <MetricsCard
            title="Cost"
            value={trace.usage || "Unknown"}
            icon={DollarSign}
            color="text-primary" subtitle={"USD"}          />
          <MetricsCard
            title="Tokens"
            value={trace.input_tokens + trace.output_tokens}
            icon={Zap}
            color="text-primary"
            subtitle={`${trace.input_tokens} in, ${trace.output_tokens} out`}
          />
          <MetricsCard
            title="Throughput"
            value={trace.input_tokens + trace.output_tokens > 0 && trace.duration > 0? ((trace.input_tokens + trace.output_tokens) / trace.duration).toFixed(3) : "Unkonwn"}
            icon={Zap}
            color="text-primary"
            subtitle="tokens/sec"
          />
        </div>        {/* Request Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Request Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Model & Provider</label>
              <ModelBadge model={trace.model || "Unknown"} provider={trace.provider || "Unkown"} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 me-4">Status</label>
              <StatusBadge status="success" error="" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Timestamp</label>
              <p className="text-sm font-mono text-gray-900">
                {trace.timestamps ? new Date(trace.timestamps).toLocaleString("en") : 'No timestamp'}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Session ID</label>
              <p className="text-sm font-mono text-gray-900">{trace.session_id}</p>
            </div>
          </div>
        </div>
        {/* Response */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Response</h3>
          <div className={`border rounded-lg p-4 bg-gray-50 border-gray-200`}>
            <p className="text-sm whitespace-pre-wrap text-gray-900">{typeof trace.output === 'object' ? JSON.stringify(trace.output) : trace.output}</p>
          </div>
        </div>
        {/* Messages/Chat */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {trace.messages && trace.messages.length > 0 ? (
              trace.messages.map((message: any, index: number) => (
                <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      message.role === 'SYSTEM' ? 'bg-purple-100 text-purple-800' :
                      message.role === 'USER' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {message.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{message.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No messages available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TraceDetails;
