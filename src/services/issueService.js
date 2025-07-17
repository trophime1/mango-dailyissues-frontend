import api from './api';
import { ExcelExportService } from '../utils/excelExport';

export const issueService = {
  // Get all issues with pagination and filtering
  getAllIssues: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/issues?${queryString}` : '/issues';
    
    return api.get(url);
  },

  // Get issue by ID
  getIssueById: async (id) => {
    return api.get(`/issues/${id}`);
  },

  // Get issues by issue number
  getIssuesByNumber: async (issueNumber, params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/issues/number/${issueNumber}?${queryString}` : `/issues/number/${issueNumber}`;
    
    return api.get(url);
  },

  // Create new issue
  createIssue: async (issueData) => {
    return api.post('/issues', issueData);
  },

  // Update issue
  updateIssue: async (id, updateData) => {
    return api.put(`/issues/${id}`, updateData);
  },

  // Delete issue
  deleteIssue: async (id) => {
    return api.delete(`/issues/${id}`);
  },

  // Solve issue
  solveIssue: async (id) => {
    return api.patch(`/issues/${id}/solve`);
  },

  // Get statistics
  getStats: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/issues/stats?${queryString}` : '/issues/stats';
    
    return api.get(url);
  },

  // Export to Excel
  exportToExcel: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/issues/export?${queryString}` : '/issues/export';
    
    // For file downloads, we need to handle the response differently
    const response = await api.request({
      url,
      method: 'GET',
      responseType: 'blob',
    });

    // Create blob link to download
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    link.download = `issues-export-${date}.xlsx`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    return { success: true, message: 'Export downloaded successfully' };
  },

  // Frontend-based Excel export with enhanced formatting
  exportToExcelFrontend: async (params = {}) => {
    try {
      // Fetch all issues (without pagination for export)
      const response = await api.get('/issues', {
        params: {
          limit: 10000, // Large limit to get all issues
          ...params
        }
      });

      if (response.success && response.data?.issues) {
        const result = ExcelExportService.exportWithFilters(response.data.issues, params);
        return result;
      } else {
        throw new Error('Failed to fetch issues for export');
      }
    } catch (error) {
      console.error('Frontend export error:', error);
      throw new Error(error.message || 'Export failed');
    }
  },
};

export default issueService;
