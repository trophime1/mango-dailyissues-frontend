import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { useStats } from '../hooks/useStats';
import { formatNumber } from '../utils/helpers';
import { formatDateForInput } from '../utils/dateUtils';
import { issueService } from '../services/issueService';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${colorClasses[color]}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{formatNumber(value)}</dd>
              {subtitle && (
                <dd className="text-sm text-gray-500">{subtitle}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [exportLoading, setExportLoading] = useState(false);

  const { stats, loading, error, refresh } = useStats(dateRange);

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      await issueService.exportToExcel(dateRange);
      toast.success('Export downloaded successfully!');
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
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your issue management system
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
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" />
            {exportLoading ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          <CalendarDaysIcon className="inline h-5 w-5 mr-2" />
          Date Range Filter
        </h3>
        
        {/* Quick Date Presets */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Ranges
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setQuickRange(7)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Last 7 days
            </button>
            <button
              onClick={() => setQuickRange(30)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Last 30 days
            </button>
            <button
              onClick={() => setQuickRange(90)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Last 90 days
            </button>
            <button
              onClick={clearDateRange}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              All time
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              onClick={clearDateRange}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Clear Filter
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Showing data for: {stats?.period?.startDate} to {stats?.period?.endDate}
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Claims"
            value={stats.totalClaims}
            icon={ChartBarIcon}
            color="blue"
          />
          <StatCard
            title="Open Claims"
            value={stats.openClaims}
            icon={ExclamationTriangleIcon}
            color="red"
          />
          <StatCard
            title="Solved Claims"
            value={stats.solvedClaims}
            icon={CheckCircleIcon}
            color="green"
          />
          <StatCard
            title="Unique Issue Numbers"
            value={stats.uniqueIssueNumbers}
            icon={ChartBarIcon}
            color="blue"
          />
        </div>
      )}

      {/* Additional Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <StatCard
            title="Today's Claims"
            value={stats.todayClaims}
            icon={ClockIcon}
            color="yellow"
            subtitle="Submitted today"
          />
          <StatCard
            title="Avg. Solve Time"
            value={stats.avgSolveTimeMinutes}
            icon={ClockIcon}
            color="green"
            subtitle="Minutes"
          />
        </div>
      )}

      {/* Resolution Rate */}
      {stats && stats.totalClaims > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Resolution Rate
          </h3>
          <div className="relative">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div
                style={{
                  width: `${(stats.solvedClaims / stats.totalClaims) * 100}%`
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Solved: {((stats.solvedClaims / stats.totalClaims) * 100).toFixed(1)}%</span>
              <span>Open: {((stats.openClaims / stats.totalClaims) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
