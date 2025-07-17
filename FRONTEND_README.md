# Issue Tracker Frontend

A comprehensive React-based frontend application for managing and tracking issues, integrated with the Node.js/Express backend API.

## 🚀 Features

### 📊 **Dashboard**
- **Real-time Statistics** with visual charts and metrics
- **Quick Date Filtering** with preset ranges (7, 30, 90 days)
- **Export Functionality** for filtered data
- **Resolution Rate Visualization** with progress bars
- **Key Performance Indicators** (KPIs) display

### 🎯 **Issue Management**
- **Complete CRUD Operations** (Create, Read, Update, Delete)
- **Bulk Actions** for multiple issues
- **Status Tracking** (Open/Solved) with one-click updates
- **Advanced Search & Filter** by status, date, content
- **Real-time Updates** with loading states
- **Form Validation** with proper error handling

### 📋 **Issue Features**
- **Issue Creation** with required fields validation
- **Issue Editing** with pre-populated data
- **Issue Viewing** in detailed modal
- **Issue Deletion** with confirmation dialogs
- **Bulk Selection** with checkbox interface
- **Quick Actions** (View, Edit, Solve, Delete)

### 📈 **Reports & Analytics**
- **Advanced Filtering** by date ranges and status
- **Export Options** (All issues, Open only, Solved only)
- **Performance Metrics** and trend analysis
- **Statistical Overview** with charts
- **Custom Date Ranges** with calendar picker

### 🎨 **User Experience**
- **Responsive Design** for all device sizes
- **Loading States** with spinners and progress indicators
- **Toast Notifications** for user feedback
- **Confirmation Dialogs** for destructive actions
- **Accessible UI** with proper focus management
- **Clean Interface** with Tailwind CSS styling

## 🛠 Tech Stack

- **React 19** with modern hooks and functional components
- **React Router** for single-page application navigation
- **Tailwind CSS** for responsive and utility-first styling
- **Headless UI** for accessible component primitives
- **Heroicons** for consistent iconography
- **React Hook Form** for performant form handling
- **Zod** for robust schema validation
- **React Hot Toast** for elegant notifications
- **Axios** for HTTP requests with interceptors
- **Date-fns** for date manipulation and formatting

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── Dashboard.js     # Main dashboard with statistics
│   ├── IssuesList.js    # Issues list with CRUD operations
│   ├── IssueModal.js    # Modal for create/edit/view issues
│   ├── Layout.js        # Navigation layout wrapper
│   ├── Reports.js       # Reports and analytics page
│   ├── BulkActions.js   # Bulk operations component
│   ├── ConfirmationDialog.js # Confirmation dialogs
│   └── LoadingSpinner.js # Loading indicator component
├── hooks/               # Custom React hooks
│   ├── useIssues.js     # Hook for issues data management
│   └── useStats.js      # Hook for statistics
├── services/            # API service layer
│   ├── api.js           # Axios configuration with interceptors
│   └── issueService.js  # Issue-related API calls
├── utils/               # Utility functions
│   ├── dateUtils.js     # Date formatting and manipulation
│   └── helpers.js       # General utility functions
├── constants/           # Application constants
│   └── index.js         # Issue types, statuses, defaults
└── App.js              # Main app component with routing
```

## 🔧 Setup Instructions

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Environment Configuration**
Copy the example environment file and configure:
```bash
cp .env.example .env
```

Update `.env` with your settings:
```env
REACT_APP_API_URL=https://mango-dailyissues.onrender.com/api
REACT_APP_NAME=Issue Tracker
REACT_APP_VERSION=1.0.0
```

### 3. **Start Development Server**
```bash
npm start
```
Application opens at http://localhost:3000

### 4. **Backend Requirements**
Ensure your backend server is running with:
- Server on `http://localhost:5000`
- CORS configured for `http://localhost:3000`
- All API endpoints implemented

## 🔌 API Integration

### **Endpoints Used:**
- `GET /api/issues` - List issues with pagination and filtering
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get specific issue details
- `PUT /api/issues/:id` - Update existing issue
- `DELETE /api/issues/:id` - Delete issue
- `PATCH /api/issues/:id/solve` - Mark issue as solved
- `GET /api/issues/stats` - Get dashboard statistics
- `GET /api/issues/export` - Export issues to Excel
- `GET /api/issues/number/:issueNumber` - Get issues by number

### **Data Models:**
Based on your Prisma schema:
```javascript
{
  id: String,           // MongoDB ObjectId
  issueNumber: String,  // Required
  title: String?,       // Optional
  description: String?, // Optional
  location: String,     // Required
  issueType: Enum,      // SLOWNESS, NO_CONNECTION, ON_OFF, RELOCATION, OFFLINE, OTHER
  status: Enum,         // OPEN, SOLVED (default: OPEN)
  submittedAt: DateTime, // Auto-generated
  solvedAt: DateTime?,   // Set when status changes to SOLVED
  createdAt: DateTime,   // Auto-generated
  updatedAt: DateTime    // Auto-updated
}
```

## 🎯 Key Features Breakdown

### **Dashboard Features:**
- ✅ Real-time statistics display
- ✅ Date range filtering with presets
- ✅ Export functionality
- ✅ Resolution rate visualization
- ✅ Performance metrics
- ✅ Quick action buttons

### **Issues Management:**
- ✅ Create new issues with validation
- ✅ Edit existing issues
- ✅ View detailed issue information
- ✅ Delete issues with confirmation
- ✅ Mark issues as solved
- ✅ Bulk operations (select, solve, delete, export)
- ✅ Advanced search and filtering
- ✅ Pagination with configurable page sizes
- ✅ Sorting by multiple fields

### **User Interface:**
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Loading states and progress indicators
- ✅ Toast notifications for feedback
- ✅ Confirmation dialogs for destructive actions
- ✅ Form validation with error messages
- ✅ Accessible navigation and focus management

### **Reports & Analytics:**
- ✅ Statistical overview with charts
- ✅ Date range filtering
- ✅ Export options (All, Open, Solved)
- ✅ Performance metrics calculation
- ✅ Trend analysis capabilities

## 🚀 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

## 🔒 Environment Variables

```env
# API Configuration
REACT_APP_API_URL=https://mango-dailyissues.onrender.com/api  # Backend API URL

# Application Configuration
REACT_APP_NAME=Issue Tracker                 # Application name
REACT_APP_VERSION=1.0.0                     # Application version
```

## 🎨 Styling & Theming

- **Tailwind CSS** for utility-first styling
- **Responsive breakpoints** for all screen sizes
- **Color scheme** with consistent brand colors
- **Component variants** for different states
- **Accessibility** with proper contrast ratios

## 📱 Responsive Design

- **Mobile-first** approach
- **Tablet optimization** with adjusted layouts
- **Desktop enhancement** with full feature set
- **Touch-friendly** interactions
- **Flexible grids** and components

## 🔧 Development Guidelines

### **Code Organization:**
- Functional components with hooks
- Custom hooks for data management
- Service layer for API communication
- Utility functions for common operations
- Constants for configuration values

### **Best Practices:**
- TypeScript-like validation with Zod
- Error boundaries for graceful failures
- Loading states for better UX
- Confirmation dialogs for destructive actions
- Consistent naming conventions

## 🚨 Troubleshooting

### **Common Issues:**

1. **API Connection Problems:**
   - Verify backend server is running
   - Check CORS configuration
   - Confirm API URL in environment variables

2. **Build or Runtime Errors:**
   - Clear node_modules and reinstall
   - Check for dependency conflicts
   - Verify environment variables

3. **Styling Issues:**
   - Ensure Tailwind CSS is properly configured
   - Check PostCSS configuration
   - Verify CSS imports

### **Performance Optimization:**
- React.memo for expensive components
- Debounced search functionality
- Pagination for large datasets
- Lazy loading for routes
- Optimized bundle size

## 🔮 Future Enhancements

- **Real-time updates** with WebSocket integration
- **Advanced filtering** with multiple criteria
- **User authentication** and role management
- **File attachments** for issues
- **Comments system** for issue tracking
- **Email notifications** for status changes
- **Advanced analytics** with charts and graphs
- **Mobile app** version with React Native

## 🤝 Contributing

1. Follow the existing code structure
2. Use functional components with hooks
3. Implement proper error handling
4. Add loading states for async operations
5. Ensure responsive design works on all devices
6. Write meaningful commit messages
7. Test thoroughly before submitting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
