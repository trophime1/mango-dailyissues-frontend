import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { issueService } from '../services/issueService';
import { PAGINATION_DEFAULTS } from '../constants';
import toast from 'react-hot-toast';

export const useIssues = (initialParams = {}) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25, // Increase default page size for better performance
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState({
    status: '',
    sortBy: PAGINATION_DEFAULTS.sortBy,
    sortOrder: PAGINATION_DEFAULTS.sortOrder,
    ...initialParams,
  });

  // Cache for API responses to avoid unnecessary requests
  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);
  
  // Create cache key for current request
  const cacheKey = useMemo(() => {
    return JSON.stringify({
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    });
  }, [filters, pagination.page, pagination.limit]);

  // Fetch issues with caching and request cancellation
  const fetchIssues = useCallback(async (params = {}, bypassCache = false) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const queryParams = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
      ...params,
    };

    const requestCacheKey = JSON.stringify(queryParams);
    
    // Check cache first (unless bypassing cache)
    if (!bypassCache && cacheRef.current.has(requestCacheKey)) {
      const cached = cacheRef.current.get(requestCacheKey);
      setIssues(cached.issues);
      setPagination(cached.pagination);
      return;
    }

    setLoading(true);
    setError(null);
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await issueService.getAllIssues(queryParams, {
        signal: abortControllerRef.current.signal
      });
      
      if (response.success) {
        setIssues(response.data.issues);
        setPagination(response.data.pagination);
        
        // Cache the response (limit cache size to prevent memory issues)
        if (cacheRef.current.size > 50) {
          // Remove oldest entries
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
        }
        
        cacheRef.current.set(requestCacheKey, {
          issues: response.data.issues,
          pagination: response.data.pagination,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      // Don't show error for aborted requests
      if (err.name !== 'AbortError' && err.message !== 'canceled') {
        setError(err.message);
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [filters, pagination.page, pagination.limit]);

  // Debounced filter updates to prevent excessive API calls
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    // Clear cache when filters change
    cacheRef.current.clear();
  }, []);

  // Change page (optimized to use cache)
  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Change page size (clear cache when changing page size)
  const changePageSize = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
    cacheRef.current.clear(); // Clear cache when page size changes
  }, []);

  // Refresh issues (bypass cache)
  const refresh = useCallback(() => {
    cacheRef.current.clear(); // Clear cache on manual refresh
    fetchIssues({}, true); // Bypass cache
  }, [fetchIssues]);

  // Debounce effect for automatic fetching
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for debounced fetch
    timeoutRef.current = setTimeout(() => {
      fetchIssues();
    }, 100); // 100ms debounce
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cacheKey]); // Use memoized cache key to prevent unnecessary re-renders

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
