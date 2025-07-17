import { useState, useEffect, useCallback } from 'react';
import { issueService } from '../services/issueService';
import { PAGINATION_DEFAULTS } from '../constants';
import toast from 'react-hot-toast';

export const useIssues = (initialParams = {}) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState({
    status: '',
    sortBy: PAGINATION_DEFAULTS.sortBy,
    sortOrder: PAGINATION_DEFAULTS.sortOrder,
    ...initialParams,
  });

  // Fetch issues
  const fetchIssues = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        ...params,
      };
      
      const response = await issueService.getAllIssues(queryParams);
      
      if (response.success) {
        setIssues(response.data.issues);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Update filters and refetch
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Change page
  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Change page size
  const changePageSize = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  // Refresh issues
  const refresh = useCallback(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Load issues on component mount and when dependencies change
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  return {
    issues,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    changePageSize,
    refresh,
    fetchIssues,
  };
};

export default useIssues;
