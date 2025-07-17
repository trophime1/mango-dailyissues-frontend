import { useState, useEffect } from 'react';
import { issueService } from '../services/issueService';
import toast from 'react-hot-toast';

export const useStats = (dateRange = {}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await issueService.getStats({
        ...dateRange,
        ...params,
      });
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateRange.startDate, dateRange.endDate]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
};

export default useStats;
