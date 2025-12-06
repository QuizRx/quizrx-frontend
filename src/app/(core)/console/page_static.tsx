"use client";

import React, { useState, useMemo } from 'react';
import { Search, Filter, RefreshCw, Eye, Clock, DollarSign, Zap, AlertCircle, CheckCircle, XCircle, Download, ChevronDown, ChevronRight } from 'lucide-react';
import PageTitle from '@/core/layouts/common/page-title';

// Mock LLM calls data removed - will be populated from real data sources
const mockLLMCalls: any[] = [
  {
    id: "trace_002",
    timestamp: new Date("2025-06-17T14:28:45.567Z"),
    model: "claude-3-sonnet",
    provider: "Anthropic",
    operation: "messages",
    prompt: "Review this Python code for security vulnerabilities and suggest improvements.",
    response: "I've analyzed your Python code and identified several security concerns. Here are the key issues and recommended fixes...",
    duration: 2850,
    tokenCount: { input: 234, output: 156, total: 390 },
    status: "success",
    cost: 0.0567,
    latency: 2.85,
    throughput: 54.7,
    metadata: {
      temperature: 0.3,
      maxTokens: 300,
      topP: 0.8,
      userId: "user_789",
      sessionId: "session_123",
      ipAddress: "10.0.0.25",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      requestId: "req_def456"
    },
    tags: ["code-review", "security", "python"],
    version: "v2.1.0"
  },
  {
    id: "trace_003",
    timestamp: new Date("2025-06-17T14:26:30.891Z"),
    model: "gpt-3.5-turbo",
    provider: "OpenAI",
    operation: "chat.completions",
    prompt: "Translate the following text from English to Spanish: 'Hello, how are you today?'",
    response: "",
    duration: 0,
    tokenCount: { input: 18, output: 0, total: 18 },
    status: "error",
    cost: 0,
    latency: 0,
    throughput: 0,
    error: "Rate limit exceeded - too many requests",
    errorCode: "rate_limit_exceeded",
    metadata: {
      temperature: 0.1,
      maxTokens: 100,
      topP: 1.0,
      userId: "user_123",
      sessionId: "session_456",
      ipAddress: "172.16.0.50",
      userAgent: "curl/7.68.0",
      requestId: "req_ghi789"
    },
    tags: ["translation", "spanish"],
    version: "v1.0.1"
  },
  {
    id: "trace_004",
    timestamp: new Date("2025-06-17T14:24:12.345Z"),
    model: "gemini-pro",
    provider: "Google",
    operation: "generateContent",
    prompt: "Create a meal plan for a week including breakfast, lunch, and dinner with nutritional information.",
    response: "Here's a comprehensive 7-day meal plan designed to provide balanced nutrition throughout the week...",
    duration: 4120,
    tokenCount: { input: 32, output: 445, total: 477 },
    status: "success",
    cost: 0.0334,
    latency: 4.12,
    throughput: 108.0,
    metadata: {
      temperature: 0.8,
      maxTokens: 600,
      topP: 0.95,
      userId: "user_456",
      sessionId: "session_789",
      ipAddress: "203.0.113.42",
      userAgent: "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X)",
      requestId: "req_jkl012"
    },
    tags: ["meal-planning", "nutrition", "health"],
    version: "v3.0.2"
  },
  {
    id: "trace_005",
    timestamp: new Date("2025-06-17T14:22:05.678Z"),
    model: "claude-3-haiku",
    provider: "Anthropic",
    operation: "messages",
    prompt: "Summarize this 500-word article in 3 bullet points.",
    response: "• The article discusses the impact of artificial intelligence on modern healthcare systems\n• Key benefits include improved diagnostic accuracy and reduced treatment times\n• Challenges remain around data privacy and integration with existing systems",
    duration: 1230,
    tokenCount: { input: 89, output: 67, total: 156 },
    status: "success",
    cost: 0.0089,
    latency: 1.23,
    throughput: 54.5,
    metadata: {
      temperature: 0.5,
      maxTokens: 150,
      topP: 0.9,
      userId: "user_789",
      sessionId: "session_123",
      ipAddress: "198.51.100.15",
      userAgent: "Mozilla/5.0 (Linux; Android 10; SM-G973F)",
      requestId: "req_mno345"
    },
    tags: ["summarization", "healthcare", "ai"],
    version: "v1.5.0"
  }
];

const StatusBadge = ({ status, error }:any) => {
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

const ModelBadge = ({ model, provider }:any) => {
  const getProviderColor = (provider:any) => {
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
      <span className="font-mono text-sm font-medium">{model}</span>
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getProviderColor(provider)}`}>
        {provider}
      </span>
    </div>
  );
};

const MetricsCard = ({ title, value, icon: Icon, color, subtitle }:any) => (
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

const TraceDetails = ({ trace, onClose }:any) => (
  <div className="fixed inset-0 bg-blue-500 bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-none max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Trace Details: {trace.id}</h2>
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
            value={`${(trace.duration / 1000).toFixed(2)}s`}
            icon={Clock}
            color="text-blue-500" subtitle={""}          />
          <MetricsCard
            title="Cost"
            value={`$${trace.cost.toFixed(4)}`}
            icon={DollarSign}
            color="text-blue-500" subtitle={""}          />
          <MetricsCard
            title="Tokens"
            value={trace.tokenCount.total}
            icon={Zap}
            color="text-blue-500"
            subtitle={`${trace.tokenCount.input} in, ${trace.tokenCount.output} out`}
          />
          <MetricsCard
            title="Throughput"
            value={`${trace.throughput.toFixed(1)}`}
            icon={Zap}
            color="text-blue-500"
            subtitle="tokens/sec"
          />
        </div>

        {/* Request Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Request Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Model & Provider</label>
              <ModelBadge model={trace.model} provider={trace.provider} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <StatusBadge status={trace.status} error={trace.error} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Timestamp</label>
              <p className="text-sm font-mono">{trace.timestamp.toISOString()}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Request ID</label>
              <p className="text-sm font-mono">{trace.metadata.requestId}</p>
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Parameters</h3>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
            <pre className="whitespace-pre-wrap">
{JSON.stringify({
  temperature: trace.metadata.temperature,
  max_tokens: trace.metadata.maxTokens,
  top_p: trace.metadata.topP,
  model: trace.model,
  operation: trace.operation
}, null, 2)}
            </pre>
          </div>
        </div>

        {/* Prompt */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Prompt</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm whitespace-pre-wrap">{trace.prompt}</p>
          </div>
        </div>

        {/* Response */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Response</h3>
          <div className={`border rounded-lg p-4 ${trace.status === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            {trace.status === 'error' ? (
              <div>
                <p className="text-red-800 font-medium">Error: {trace.error}</p>
                <p className="text-red-600 text-sm mt-1">Code: {trace.errorCode}</p>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{trace.response}</p>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Metadata</h3>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
            <pre className="whitespace-pre-wrap">
{JSON.stringify(trace.metadata, null, 2)}
            </pre>
          </div>
        </div>

        {/* Tags */}
        {trace.tags && trace.tags.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {trace.tags.map((tag:any, index:any) => (
                <span
                  key={index}
                  className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function LLMConsole() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredCalls = useMemo(() => {
    return mockLLMCalls.filter(call => {
      const matchesSearch = 
        call.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
      const matchesModel = modelFilter === 'all' || call.model === modelFilter;

      return matchesSearch && matchesStatus && matchesModel;
    });
  }, [searchTerm, statusFilter, modelFilter]);

  // Pagination calculations
  const totalFilteredItems = filteredCalls.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCalls = filteredCalls.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, modelFilter]);

  const totalCalls = mockLLMCalls.length;
  const successCalls = mockLLMCalls.filter(call => call.status === 'success').length;
  const errorCalls = mockLLMCalls.filter(call => call.status === 'error').length;
  const totalCost = mockLLMCalls.reduce((sum, call) => sum + call.cost, 0);
  const avgLatency = mockLLMCalls.reduce((sum, call) => sum + call.latency, 0) / totalCalls;

  const toggleRowExpansion = (id:any) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
          <PageTitle
        title="LLM Inference Console"
        description="Monitor and analyze your LLM API calls in real-time"
      />
            {/* <h1 className="text-3xl font-bold text-gray-900">LLM Inference Console</h1>
            <p className="text-gray-600 mt-2">Monitor and analyze your LLM API calls in real-time</p> */}
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricsCard
            title="Total Calls"
            value={totalCalls}
            icon={Zap}
            color="text-black-500"
            subtitle="Last 24 hours"
          />
          <MetricsCard
            title="Success Rate"
            value={`${((successCalls / totalCalls) * 100).toFixed(1)}%`}
            icon={CheckCircle}
            color="text-black-500"
            subtitle={`${successCalls}/${totalCalls} successful`}
          />
          <MetricsCard
            title="Total Cost"
            value={`$${totalCost.toFixed(4)}`}
            icon={DollarSign}
            color="text-black-500"
            subtitle="USD"
          />
          <MetricsCard
            title="Avg Latency"
            value={`${avgLatency.toFixed(2)}s`}
            icon={Clock}
            color="text-black-500"
            subtitle="Response time"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search traces by prompt, model, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Models</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gemini-pro">Gemini Pro</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
              </select>
            </div>
          </div>
        </div>

        {/* Traces Table */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trace
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCalls.map((call:any) => (
                  <React.Fragment key={call.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleRowExpansion(call.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedRows.has(call.id) ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                            }
                          </button>
                          <div>
                            <div className="font-mono text-sm font-medium">{call.id}</div>
                            <div className="text-xs text-gray-500">
                              {call.timestamp.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ModelBadge model={call.model} provider={call.provider} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={call.status} error={call.error} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium">{(call.duration / 1000).toFixed(2)}s</div>
                          <div className="text-gray-500">{call.throughput.toFixed(1)} t/s</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium">{call.tokenCount.total}</div>
                          <div className="text-gray-500">
                            {call.tokenCount.input} in, {call.tokenCount.output} out
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-sm">${call.cost.toFixed(4)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedTrace(call)}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(call.id) && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Prompt Preview</label>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {call.prompt.length > 150 ? `${call.prompt.substring(0, 150)}...` : call.prompt}
                              </p>
                            </div>
                            {call.status === 'success' && (
                              <div>
                                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Response Preview</label>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {call.response.length > 150 ? `${call.response.substring(0, 150)}...` : call.response}
                                </p>
                              </div>
                            )}
                            {call.tags && call.tags.length > 0 && (
                              <div>
                                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Tags</label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {call.tags.map((tag:any, index:any) => (
                                    <span
                                      key={index}
                                      className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {paginatedCalls.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No traces found</div>
              <div className="text-gray-400 text-sm">
                Try adjusting your search terms or filters
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, totalFilteredItems)} of {totalFilteredItems} traces
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                  Show:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Previous button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                  // Adjust start page if we're near the end
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }

                  // First page and ellipsis
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => setCurrentPage(1)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="start-ellipsis" className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                  }

                  // Visible page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                          currentPage === i
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  // Last page and ellipsis
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="end-ellipsis" className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}
              </div>

              {/* Next button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Status Info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            {totalFilteredItems < totalCalls && (
              <span className="text-blue-600 font-medium">
                Filtered: {totalFilteredItems} of {totalCalls} traces
              </span>
            )}
            {totalFilteredItems === totalCalls && (
              <span>Showing all {totalCalls} traces</span>
            )}
          </div>
          <div>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Trace Details Modal */}
      {selectedTrace && (
        <TraceDetails
          trace={selectedTrace}
          onClose={() => setSelectedTrace(null)}
        />
      )}
    </div>
  );
}