import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { issueService } from '../services/issueService';
import { ISSUE_TYPE_OPTIONS, ISSUE_STATUS_OPTIONS } from '../constants';
import { getStatusBadgeClasses } from '../utils/helpers';
import { formatDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';

// Validation schema
const issueSchema = z.object({
  issueNumber: z.string().min(1, 'Issue number is required'),
  title: z.string().optional(),
  description: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  issueType: z.enum(['SLOWNESS', 'NO_CONNECTION', 'ON_OFF', 'RELOCATION', 'OFFLINE', 'OTHER'], {
    errorMap: () => ({ message: 'Please select a valid issue type' }),
  }),
  status: z.enum(['OPEN', 'SOLVED']).optional(),
});

const IssueModal = ({ mode, issue, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const isReadonly = mode === 'view';
  const isEdit = mode === 'edit';
  const isCreate = mode === 'create';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      issueNumber: '',
      title: '',
      description: '',
      location: '',
      issueType: '',
      status: 'OPEN',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (issue && (isEdit || isReadonly)) {
      setValue('issueNumber', issue.issueNumber || '');
      setValue('title', issue.title || '');
      setValue('description', issue.description || '');
      setValue('location', issue.location || '');
      setValue('issueType', issue.issueType || '');
      setValue('status', issue.status || 'OPEN');
    }
  }, [issue, isEdit, isReadonly, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isCreate) {
        await issueService.createIssue(data);
        toast.success('Issue created successfully!');
      } else if (isEdit) {
        await issueService.updateIssue(issue.id, data);
        toast.success('Issue updated successfully!');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return 'Create New Issue';
      case 'edit':
        return 'Edit Issue';
      case 'view':
        return 'Issue Details';
      default:
        return 'Issue';
    }
  };

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-6">
                      {getModalTitle()}
                    </Dialog.Title>

                    {/* View Mode - Display Only */}
                    {isReadonly && issue && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Issue Number</label>
                            <div className="mt-1 text-sm text-gray-900">{issue.issueNumber}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <div className="mt-1">
                              <span className={getStatusBadgeClasses(issue.status)}>
                                {issue.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Title</label>
                          <div className="mt-1 text-sm text-gray-900">{issue.title || 'No title'}</div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                            {issue.description || 'No description'}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <div className="mt-1 text-sm text-gray-900">{issue.location}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <div className="mt-1 text-sm text-gray-900">{issue.issueType}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Submitted At</label>
                            <div className="mt-1 text-sm text-gray-900">{formatDate(issue.submittedAt)}</div>
                          </div>
                          {issue.solvedAt && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Solved At</label>
                              <div className="mt-1 text-sm text-gray-900">{formatDate(issue.solvedAt)}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Create/Edit Mode - Form */}
                    {!isReadonly && (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                          <label htmlFor="issueNumber" className="block text-sm font-medium text-gray-700">
                            Issue Number *
                          </label>
                          <input
                            type="text"
                            id="issueNumber"
                            {...register('issueNumber')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter issue number"
                          />
                          {errors.issueNumber && (
                            <p className="mt-1 text-sm text-red-600">{errors.issueNumber.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            id="title"
                            {...register('title')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter issue title"
                          />
                          {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            id="description"
                            rows={4}
                            {...register('description')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter issue description"
                          />
                          {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                              Location *
                            </label>
                            <input
                              type="text"
                              id="location"
                              {...register('location')}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Enter location"
                            />
                            {errors.location && (
                              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="issueType" className="block text-sm font-medium text-gray-700">
                              Issue Type *
                            </label>
                            <select
                              id="issueType"
                              {...register('issueType')}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="">Select type</option>
                              {ISSUE_TYPE_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {errors.issueType && (
                              <p className="mt-1 text-sm text-red-600">{errors.issueType.message}</p>
                            )}
                          </div>
                        </div>

                        {isEdit && (
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                              Status
                            </label>
                            <select
                              id="status"
                              {...register('status')}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              {ISSUE_STATUS_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="mt-6 flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={handleClose}
                            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                          >
                            {loading ? 'Saving...' : isCreate ? 'Create Issue' : 'Update Issue'}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* View Mode Footer */}
                    {isReadonly && (
                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          onClick={handleClose}
                          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default IssueModal;
