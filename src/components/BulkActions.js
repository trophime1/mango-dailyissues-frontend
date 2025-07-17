import React, { useState } from 'react';
import { 
  CheckIcon, 
  TrashIcon, 
  DocumentArrowDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { issueService } from '../services/issueService';
import { ExcelExportService } from '../utils/excelExport';
import ConfirmationDialog from './ConfirmationDialog';
import toast from 'react-hot-toast';

const BulkActions = ({ selectedIssues, onActionComplete, onClearSelection }) => {
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: '',
    title: '',
    message: '',
  });

  const handleBulkSolve = () => {
    const openIssues = selectedIssues.filter(issue => issue.status === 'OPEN');
    if (openIssues.length === 0) {
      toast.error('No open issues selected');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      type: 'solve',
      title: 'Mark Issues as Solved',
      message: `Are you sure you want to mark ${openIssues.length} issue(s) as solved?`,
    });
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      title: 'Delete Issues',
      message: `Are you sure you want to delete ${selectedIssues.length} issue(s)? This action cannot be undone.`,
    });
  };

  const handleBulkExport = async () => {
    setLoading(true);
    try {
      // Use our Excel export service for consistent formatting
      const result = ExcelExportService.generateExcelFile(selectedIssues);
      toast.success(`${selectedIssues.length} selected issues exported successfully!`);
    } catch (err) {
      console.error('Bulk export error:', err);
      toast.error('Failed to export selected issues');
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async () => {
    setLoading(true);
    try {
      if (confirmDialog.type === 'solve') {
        const openIssues = selectedIssues.filter(issue => issue.status === 'OPEN');
        const promises = openIssues.map(issue => issueService.solveIssue(issue.id));
        await Promise.all(promises);
        toast.success(`${openIssues.length} issue(s) marked as solved!`);
      } else if (confirmDialog.type === 'delete') {
        const promises = selectedIssues.map(issue => issueService.deleteIssue(issue.id));
        await Promise.all(promises);
        toast.success(`${selectedIssues.length} issue(s) deleted successfully!`);
      }
      
      onActionComplete();
      onClearSelection();
    } catch (err) {
      toast.error(`Failed to ${confirmDialog.type} issues`);
    } finally {
      setLoading(false);
      setConfirmDialog({ isOpen: false, type: '', title: '', message: '' });
    }
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, type: '', title: '', message: '' });
  };

  if (selectedIssues.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-sm font-medium text-blue-900">
              {selectedIssues.length} issue(s) selected
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBulkSolve}
              disabled={loading || selectedIssues.filter(i => i.status === 'OPEN').length === 0}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <CheckIcon className="-ml-0.5 mr-2 h-4 w-4" />
              Mark as Solved
            </button>
            <button
              onClick={handleBulkExport}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="-ml-0.5 mr-2 h-4 w-4" />
              Export Selected
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <TrashIcon className="-ml-0.5 mr-2 h-4 w-4" />
              Delete
            </button>
            <button
              onClick={onClearSelection}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <XMarkIcon className="-ml-0.5 mr-2 h-4 w-4" />
              Clear Selection
            </button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={executeAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.type === 'delete' ? 'Delete All' : 'Mark All as Solved'}
        type={confirmDialog.type === 'delete' ? 'danger' : 'warning'}
      />
    </>
  );
};

export default BulkActions;
