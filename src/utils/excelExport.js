import * as XLSX from 'xlsx';
import { formatDate, formatTimeToSolve } from './dateUtils';

export class ExcelExportService {
  /**
   * Formats time duration from milliseconds to a readable format
   * @param milliseconds - Time duration in milliseconds
   * @returns Formatted string in "Xd Yh Zm" format
   */
  static formatDuration(milliseconds) {
    const totalMinutes = Math.round(milliseconds / (1000 * 60));
    
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
  }

  /**
   * Generate Excel file from issues data
   * @param issues - Array of issue objects
   * @returns void (downloads the file)
   */
  static generateExcelFile(issues) {
    const excelData = issues.map((issue, index) => {
      const submittedAt = new Date(issue.submittedAt);
      const solvedAt = issue.solvedAt ? new Date(issue.solvedAt) : null;
      
      let timeToSolve = '';
      if (solvedAt && issue.status === 'SOLVED') {
        const diffInMs = solvedAt.getTime() - submittedAt.getTime();
        timeToSolve = this.formatDuration(diffInMs);
      }

      return {
        '#': index + 1, // Add index number starting from 1
        'Issue Number': issue.issueNumber,
        'Location': issue.location,
        'Issue Type': issue.issueType,
        'Status': issue.status,
        'Submitted At': submittedAt.toLocaleString(),
        'Solved At': solvedAt ? solvedAt.toLocaleString() : '',
        'Time to Solve': timeToSolve,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    
    // Set column widths
    const columnWidths = [
      { wch: 8 },  // # (Index)
      { wch: 15 }, // Issue Number
      { wch: 25 }, // Location
      { wch: 15 }, // Issue Type
      { wch: 10 }, // Status
      { wch: 20 }, // Submitted At
      { wch: 20 }, // Solved At
      { wch: 20 }, // Time to Solve
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Issues');
    
    // Generate filename with current date and time
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `issues-export-${dateStr}-${timeStr}.xlsx`;
    
    // Download the file
    XLSX.writeFile(workbook, filename);
    
    return { success: true, message: 'Export downloaded successfully', filename };
  }

  /**
   * Export issues with custom filtering
   * @param issues - Array of issue objects
   * @param filters - Object containing filter criteria
   * @returns void (downloads the file)
   */
  static exportWithFilters(issues, filters = {}) {
    let filteredIssues = [...issues];
    
    // Apply status filter
    if (filters.status && filters.status !== '') {
      filteredIssues = filteredIssues.filter(issue => issue.status === filters.status);
    }
    
    // Apply date range filter
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filteredIssues = filteredIssues.filter(issue => 
        new Date(issue.submittedAt) >= startDate
      );
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      filteredIssues = filteredIssues.filter(issue => 
        new Date(issue.submittedAt) <= endDate
      );
    }
    
    return this.generateExcelFile(filteredIssues);
  }
}

export default ExcelExportService;
