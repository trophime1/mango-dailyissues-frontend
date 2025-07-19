import React, { memo } from 'react';
import { 
  EyeIcon,
  PencilIcon,
  CheckIcon,
  TrashIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { getStatusBadgeClasses } from '../utils/helpers';
import { formatDate, formatTimeToSolve } from '../utils/dateUtils';

const IssueRow = memo(({ 
  issue, 
  index, // Add index prop
  isSelected, 
  onSelect, 
  onView, 
  onEdit, 
  onTimeEdit, 
  onSolve, 
  onDelete, 
  actionLoading 
}) => {
  return (
    <tr 
      className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={isSelected}
          onChange={() => onSelect(issue)}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {index}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {issue.issueNumber}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {issue.location}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {issue.issueType}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={getStatusBadgeClasses(issue.status)}>
          {issue.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(issue.submittedAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {issue.status === 'SOLVED' && issue.solvedAt 
          ? formatTimeToSolve(issue.submittedAt, issue.solvedAt)
          : '-'
        }
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => onView(issue)}
            className="text-blue-600 hover:text-blue-900"
            title="View"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(issue)}
            className="text-yellow-600 hover:text-yellow-900"
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onTimeEdit(issue)}
            className="text-purple-600 hover:text-purple-900"
            title="Set Solved Time"
          >
            <ClockIcon className="h-4 w-4" />
          </button>
          {issue.status === 'OPEN' && (
            <button
              onClick={() => onSolve(issue.id)}
              disabled={actionLoading === issue.id}
              className="text-green-600 hover:text-green-900 disabled:opacity-50"
              title="Mark as Solved"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(issue.id)}
            disabled={actionLoading === issue.id}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

IssueRow.displayName = 'IssueRow';

export default IssueRow;
