import React, { useState } from 'react';
import { useStats } from '../hooks/useStats';
import { formatNumber } from '../utils/helpers';
import { formatDate, formatDateForInput, getDetailedTimeDifference } from '../utils/dateUtils';
import { issueService } from '../services/issueService';
import LoadingSpinner from './LoadingSpinner';
import { 
  DocumentArrowDownIcon,
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [exportLoading, setExportLoading] = useState(false);

  const { stats, loading, error, refresh } = useStats(dateRange);

  // Helper function to format average solve time from minutes
  const formatAvgSolveTime = (minutes) => {
    if (!minutes || minutes === 0) return '0m';
    
    const totalMinutes = Math.round(minutes);
    
    if (totalMinutes < 60) {
      return `${totalMinutes}m`;
    }
    
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    
    if (totalHours < 24) {
      return remainingMinutes > 0 
        ? `${totalHours}h ${remainingMinutes}m`
        : `${totalHours}h`;
    }
    
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    
    let result = `${days}d`;
    if (remainingHours > 0) {
      result += ` ${remainingHours}h`;
    }
    if (remainingMinutes > 0) {
      result += ` ${remainingMinutes}m`;
    }
    
    return result;
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExport = async (status = '') => {
    setExportLoading(true);
    try {
      await issueService.exportToExcelFrontend({
        ...dateRange,
        status,
      });
      toast.success(`${status ? `${status} issues` : 'All issues'} exported successfully!`);
    } catch (err) {
      toast.error(err.message || 'Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  const clearDateRange = () => {
    setDateRange({ startDate: '', endDate: '' });
  };

  // Quick date range presets
  const setQuickRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    setDateRange({
      startDate: formatDateForInput(startDate),
      endDate: formatDateForInput(endDate),
    });
  };

  if (loading && !stats) {
    return <LoadingSpinner text="Loading reports..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Reports & Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Generate reports and analyze issue trends
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Date Range and Quick Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Report Filters
        </h3>
        
        {/* Quick Date Presets */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Date Ranges
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setQuickRange(7)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Last 7 days
            </button>
            <button
              onClick={() => setQuickRange(30)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Last 30 days
            </button>
            <button
              onClick={() => setQuickRange(90)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Last 90 days
            </button>
            <button
              onClick={clearDateRange}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              All time
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <div className="mt-1 relative">
              <input
                type="date"
                id="startDate"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <CalendarIcon className="absolute right-3 top-2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <div className="mt-1 relative">
              <input
                type="date"
                id="endDate"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <CalendarIcon className="absolute right-3 top-2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={refresh}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
        
        {stats && (
          <p className="mt-4 text-sm text-gray-500">
            Showing data from {stats.period.startDate} to {stats.period.endDate}
          </p>
        )}
      </div>

      {/* Export Options */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Export Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleExport()}
            disabled={exportLoading}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" />
            {exportLoading ? 'Exporting...' : 'Export All Issues'}
          </button>
          <button
            onClick={() => handleExport('OPEN')}
            disabled={exportLoading}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" />
            Export Open Issues
          </button>
          <button
            onClick={() => handleExport('SOLVED')}
            disabled={exportLoading}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" />
            Export Solved Issues
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Claims</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatNumber(stats.totalClaims)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Open Claims</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatNumber(stats.openClaims)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Solved Claims</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatNumber(stats.solvedClaims)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg. Solve Time</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatAvgSolveTime(stats.avgSolveTimeMinutes)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {stats && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Performance Metrics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resolution Rate */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Resolution Rate</h4>
              <div className="relative">
                <div className="overflow-hidden h-4 mb-2 text-xs flex rounded bg-gray-200">
                  <div
                    style={{
                      width: stats.totalClaims > 0 ? `${(stats.solvedClaims / stats.totalClaims) * 100}%` : '0%'
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Resolved: {stats.totalClaims > 0 ? ((stats.solvedClaims / stats.totalClaims) * 100).toFixed(1) : 0}%
                  </span>
                  <span>
                    Pending: {stats.totalClaims > 0 ? ((stats.openClaims / stats.totalClaims) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Key Metrics</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Unique Issue Numbers:</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatNumber(stats.uniqueIssueNumbers)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Today's Claims:</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatNumber(stats.todayClaims)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Average Resolution Time:</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatAvgSolveTime(stats.avgSolveTimeMinutes)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading reports</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={refresh}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
