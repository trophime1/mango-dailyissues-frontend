import React, { useState, useMemo, useCallback } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  TrashIcon,
  ArrowPathIcon,
  FunnelIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useIssues } from '../hooks/useIssues';
import { getStatusBadgeClasses, truncateText } from '../utils/helpers';
import { formatDate, formatTimeToSolve } from '../utils/dateUtils';
import { ISSUE_STATUS_OPTIONS } from '../constants';
import { issueService } from '../services/issueService';
import toast from 'react-hot-toast';
import IssueModal from './IssueModal';
import ConfirmationDialog from './ConfirmationDialog';
import LoadingSpinner from './LoadingSpinner';
import BulkActions from './BulkActions';
import IssueRow from './IssueRow';

const IssuesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'create', 'edit', 'view'
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: '',
    issueId: null,
    title: '',
    message: '',
  });

  const {
    issues,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    changePageSize,
    refresh,
  } = useIssues();

  // Debounced search handler to improve performance
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleStatusFilter = useCallback((status) => {
    updateFilters({ status });
  }, [updateFilters]);

  const handleSort = useCallback((sortBy) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    updateFilters({ sortBy, sortOrder: newSortOrder });
  }, [filters.sortBy, filters.sortOrder, updateFilters]);

  const handleSolveIssue = useCallback(async (issueId) => {
    setConfirmDialog({
      isOpen: true,
      type: 'solve',
      issueId,
      title: 'Mark Issue as Solved',
      message: 'Are you sure you want to mark this issue as solved? This action cannot be undone.',
    });
  }, []);

  const handleDeleteIssue = useCallback(async (issueId) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      issueId,
      title: 'Delete Issue',
      message: 'Are you sure you want to delete this issue? This action cannot be undone and all data will be permanently lost.',
    });
  }, []);

  const executeAction = async () => {
    const { type, issueId } = confirmDialog;
    setActionLoading(issueId);
    
    try {
      if (type === 'solve') {
        await issueService.solveIssue(issueId);
        toast.success('Issue marked as solved!');
      } else if (type === 'delete') {
        await issueService.deleteIssue(issueId);
        toast.success('Issue deleted successfully!');
      }
      refresh();
    } catch (err) {
      toast.error(err.message || `Failed to ${type} issue`);
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, type: '', issueId: null, title: '', message: '' });
    }
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, type: '', issueId: null, title: '', message: '' });
  };

  // Bulk selection functions
  const handleSelectAll = () => {
    if (selectedIssues.length === filteredIssues.length) {
      setSelectedIssues([]);
    } else {
      setSelectedIssues([...filteredIssues]);
    }
  };

  const handleSelectIssue = (issue) => {
    const isSelected = selectedIssues.some(selected => selected.id === issue.id);
    if (isSelected) {
      setSelectedIssues(selectedIssues.filter(selected => selected.id !== issue.id));
    } else {
      setSelectedIssues([...selectedIssues, issue]);
    }
  };

  const clearSelection = () => {
    setSelectedIssues([]);
  };

  const handleBulkActionComplete = () => {
    refresh();
    clearSelection();
  };

  const openModal = (mode, issue = null) => {
    setModalMode(mode);
    setSelectedIssue(issue);
  };

  const openTimeEditModal = (issue) => {
    setModalMode('view'); // Use view mode but the modal will detect time editing
    setSelectedIssue(issue);
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedIssue(null);
  };

  const handleModalSuccess = () => {
    closeModal();
    refresh();
  };

  // Memoized filtered issues to prevent unnecessary re-calculations
  const filteredIssues = useMemo(() => {
    if (!searchTerm.trim()) return issues;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return issues.filter(issue =>
      issue.issueNumber?.toLowerCase().includes(lowercaseSearch) ||
      issue.location?.toLowerCase().includes(lowercaseSearch)
    );
  }, [issues, searchTerm]);

  if (loading && issues.length === 0) {
    return <LoadingSpinner text="Loading issues..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading issues</h3>
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
            Issues
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all issues in your system
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              showFilters 
                ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100' 
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <FunnelIcon className="-ml-1 mr-2 h-5 w-5" />
            Filters {showFilters && '(Active)'}
          </button>
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => openModal('create')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            New Issue
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search issues by number or location..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Statuses</option>
                  {ISSUE_STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="submittedAt">Date Submitted</option>
                  <option value="solvedAt">Date Solved</option>
                  <option value="issueNumber">Issue Number</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Per Page</label>
                <select
                  value={pagination.limit}
                  onChange={(e) => changePageSize(Number(e.target.value))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions 
        selectedIssues={selectedIssues}
        onActionComplete={handleBulkActionComplete}
        onClearSelection={clearSelection}
      />

      {/* Issues Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="relative px-6 py-3">
                  <input
                    type="checkbox"
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={filteredIssues.length > 0 && selectedIssues.length === filteredIssues.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('issueNumber')}
                >
                  Issue #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('submittedAt')}
                >
                  Submitted
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time to Solve
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIssues.map((issue, index) => {
                // Calculate the actual index based on pagination
                const actualIndex = (pagination.page - 1) * pagination.limit + index + 1;
                return (
                  <IssueRow
                    key={issue.id}
                    issue={issue}
                    index={actualIndex}
                    isSelected={selectedIssues.some(selected => selected.id === issue.id)}
                    onSelect={handleSelectIssue}
                    onView={(issue) => openModal('view', issue)}
                    onEdit={(issue) => openModal('edit', issue)}
                    onTimeEdit={openTimeEditModal}
                    onSolve={handleSolveIssue}
                    onDelete={handleDeleteIssue}
                    actionLoading={actionLoading}
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  {(() => {
                    const currentPage = pagination.page;
                    const totalPages = pagination.pages;
                    const maxVisiblePages = 5;
                    
                    let startPage, endPage;
                    
                    if (totalPages <= maxVisiblePages) {
                      // Less than maxVisiblePages total pages so show all
                      startPage = 1;
                      endPage = totalPages;
                    } else {
                      // More than maxVisiblePages total pages so calculate start and end pages
                      const maxPagesBeforeCurrentPage = Math.floor(maxVisiblePages / 2);
                      const maxPagesAfterCurrentPage = Math.ceil(maxVisiblePages / 2) - 1;
                      
                      if (currentPage <= maxPagesBeforeCurrentPage) {
                        // Current page near the start
                        startPage = 1;
                        endPage = maxVisiblePages;
                      } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
                        // Current page near the end
                        startPage = totalPages - maxVisiblePages + 1;
                        endPage = totalPages;
                      } else {
                        // Current page somewhere in the middle
                        startPage = currentPage - maxPagesBeforeCurrentPage;
                        endPage = currentPage + maxPagesAfterCurrentPage;
                      }
                    }
                    
                    const pages = [];
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => changePage(i)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            i === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                  
                  <button
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredIssues.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm ? 'No issues found matching your search.' : 'No issues found.'}
            </div>
            <button
              onClick={() => openModal('create')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Create your first issue
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalMode && (
        <IssueModal
          mode={modalMode}
          issue={selectedIssue}
          onClose={closeModal}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={executeAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.type === 'delete' ? 'Delete' : 'Mark as Solved'}
        type={confirmDialog.type === 'delete' ? 'danger' : 'warning'}
      />
    </div>
  );
};

export default IssuesList;
