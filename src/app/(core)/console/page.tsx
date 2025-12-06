"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, RefreshCw, Eye, Clock, DollarSign, Zap, AlertCircle, CheckCircle, XCircle, Download, ChevronDown, ChevronRight, FileWarning } from 'lucide-react';
import { useQuery } from '@apollo/client';
import PageTitle from '@/core/layouts/common/page-title';
import { GET_USAGE_STATS } from './apollo/find-all';
import { GET_LLM_CALL_USAGE_STATS } from './apollo/get-usage-stats';
import StatusBadge from './components/StatusBadge';
import ModelBadge from './components/ModelBadge';
import MetricsCard from './components/MetricsCard';
import TraceDetails from './components/TraceDetails';



export default function LLMConsole() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Update last updated time on client mount
  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // GraphQL queries
  const { data: usageStatsData, loading: usageStatsLoading, error: usageStatsError, refetch: refetchUsageStats } = useQuery(GET_LLM_CALL_USAGE_STATS);
  const { data: llmCallsData, loading: llmCallsLoading, error: llmCallsError, refetch: refetchLLMCalls } = useQuery(GET_USAGE_STATS, {
    variables: {
      pagination: {
        page: currentPage,
        limit: itemsPerPage,
        orderBy: "desc"
      }
    }
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, modelFilter]);

  // Extract data from GraphQL responses
  const usageStats = usageStatsData?.v1LLMCallUsageStats;
  const totalLLMCalls = llmCallsData?.v1LLMCalls?.total || 0;
  const totalPages = Math.ceil(totalLLMCalls / itemsPerPage);

  // Filter calls based on search and filters
  const filteredCalls = useMemo(() => {
    const llmCalls = llmCallsData?.v1LLMCalls?.data || [];

    if (!searchTerm && statusFilter === 'all' && modelFilter === 'all') {
      return llmCalls;
    }

    return llmCalls.filter(call => {
      const lowerTerm = searchTerm.toLowerCase();
      const outputStr = (call.output ?? '').toString().toLowerCase();
      const componentStr = (call.component ?? '').toLowerCase();
      const idStr = (call._id ?? '').toLowerCase();
      const matchesSearch = !searchTerm || outputStr.includes(lowerTerm) || componentStr.includes(lowerTerm) || idStr.includes(lowerTerm);
      const matchesStatus = statusFilter === 'all' || statusFilter === 'success';
      const matchesModel = modelFilter === 'all' || call.component === modelFilter;
      return matchesSearch && matchesStatus && matchesModel;
    });
  }, [llmCallsData?.v1LLMCalls?.data, searchTerm, statusFilter, modelFilter]);

  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // The GraphQL query will automatically refetch with the new page
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    // The GraphQL query will automatically refetch with the new limit
  };

  // Calculate pagination for display - using GraphQL pagination
  const totalFilteredItems = totalLLMCalls;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFilteredItems);
  const paginatedCalls = filteredCalls;

  const toggleRowExpansion = (id: string) => {
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
        title="Inference Console"
        description="Monitor and analyze your LLM API calls in real-time"
      />
          </div>
          <button
            onClick={() => { refetchUsageStats(); refetchLLMCalls(); }}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricsCard
            title="Total Tokens"
            value={usageStatsLoading ? "Loading..." : usageStatsError ? "Error" : usageStats?.totalTokens?.toLocaleString() || 0}
            icon={Zap}
            color="text-black-500"
            subtitle="Input + Output tokens"
          />
          <MetricsCard
            title="Total Queries"
            value={usageStatsLoading ? "Loading..." : usageStatsError ? "Error" : usageStats?.totalCalls?.toLocaleString() || 0}
            icon={CheckCircle}
            color="text-black-500"
            subtitle="LLM API calls made"
          />
          <MetricsCard
            title="Total Cost"
            value={usageStatsLoading ? "Loading..." : usageStatsError ? "Error" : `$${(usageStats?.totalCost || 0).toFixed(4)}`}
            icon={DollarSign}
            color="text-black-500"
            subtitle="USD"
          />
          <MetricsCard
            title="Avg Latency"
            value={usageStatsLoading ? "Loading..." : usageStatsError ? "Error" : `${(usageStats?.avgLatency ? usageStats.avgLatency/1000 : 0).toFixed(2)} sec`}
            icon={Clock}
            color="text-black-500"
            subtitle="Response time"
          />
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
                {llmCallsLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Loading traces...
                      </div>
                    </td>
                  </tr>
                ) : llmCallsError ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center text-red-500">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Error loading traces: {llmCallsError.message}
                      </div>
                    </td>
                  </tr>
                ) : filteredCalls.map((call: any) => (
                  <React.Fragment key={call._id}>
                    <tr className="hover:bg-gray-50 transition-colors">                      <td className="px-6 py-4">
                        <div className="gap-2">
                          <div className="font-mono text-sm">
                            {call._id && call._id.length > 10 ? `${call._id.substring(0, 10)}...` : call._id}
                          </div>
                          <div className="text-xs text-gray-500">
                            {call.timestamps ? new Date(call.timestamps).toLocaleString() : 'No timestamp'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ModelBadge model={call.model || "Unkown"} provider={call.provider || "Unkown"} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={call.status} error={call?.error} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium">{call.duration || "Unknown"}</div>
                          <div className="text-gray-500 text-xs">ms</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium">{(call.input_tokens || 0) + (call.output_tokens || 0)}</div>
                          <div className="text-gray-500 text-xs">{call.input_tokens || 0} in, {call.output_tokens || 0} out</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-sm">
                          ${call.usage ||"Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedTrace(call)}
                          className="text-primary hover:text-primary-dark text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(call._id) && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium">Output:</span>
                              <div className="mt-1 p-3 bg-white border rounded text-xs font-mono whitespace-pre-wrap">
                                {typeof call.output === 'object' ? JSON.stringify(call.output, null, 2) : call.output}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {!llmCallsLoading && !llmCallsError && filteredCalls.length === 0 && (
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalLLMCalls)} of {totalLLMCalls} traces
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                  Show:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
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
                        onClick={() => handlePageChange(1)}
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
                        onClick={() => handlePageChange(i)}
                        className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                          currentPage === i
                            ? 'bg-primary text-white border-primary hover:bg-primary-dark'
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
                        onClick={() => handlePageChange(totalPages)}
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
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
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
            {!llmCallsLoading && !llmCallsError && (
              <>
                {filteredCalls.length < totalLLMCalls && (
                  <span className="text-purple-600 font-medium">
                    Filtered: {filteredCalls.length} of {totalLLMCalls} traces
                  </span>
                )}
                {filteredCalls.length === totalLLMCalls && (
                  <span>Showing all {totalLLMCalls} traces</span>
                )}
              </>
            )}
            {llmCallsError && (
              <span className="text-red-600 font-medium">
                Error loading data
              </span>
            )}
          </div>
          <div>
            {lastUpdated && `Last updated: ${lastUpdated}`}
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