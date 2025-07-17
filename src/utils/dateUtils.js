import { format, parseISO, isValid } from 'date-fns';

// Format date for display
export const formatDate = (date, formatString = 'MMM dd, yyyy HH:mm') => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

// Format date for input fields (ISO format)
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

// Calculate time difference in human readable format
export const getTimeDifference = (startDate, endDate = new Date()) => {
  if (!startDate) return '-';
  
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    if (!isValid(start) || !isValid(end)) return '-';
    
    const diffInMinutes = Math.floor((end - start) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''}`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
  } catch (error) {
    console.error('Time difference calculation error:', error);
    return '-';
  }
};
