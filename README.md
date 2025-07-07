# PetroDash-WEB

A comprehensive React-based web application for PetroEnergy's data analytics dashboard, providing real-time monitoring and visualization of environmental, economic, energy, and social responsibility metrics.

## 🚀 Features

### 🎯 Core Dashboards
- **Dashboard**: Main analytics overview with KPI indicators
- **Energy Management**: Power generation tracking and monitoring
- **Environmental Monitoring**: Air quality, water, waste, and energy environmental metrics
- **Economic Analytics**: Financial performance and fund allocation tracking
- **HR Management**: Human resources dashboard and management
- **CSR Activities**: Corporate Social Responsibility project tracking

### 🔐 Security & Administration
- **User Authentication**: Secure login system with protected routes
- **User Management**: Admin panel for user administration
- **Audit Trail**: Activity logging and monitoring
- **Role-based Access Control**: Different access levels for users and admins

### 📊 Data Management
- **Import/Export**: Excel and PDF export capabilities
- **Data Visualization**: Interactive charts and graphs using Recharts
- **Real-time Updates**: Dynamic data refresh and monitoring
- **File Management**: Upload and manage various file formats

## 🛠️ Technology Stack

### Frontend
- **React 19.1.0**: Modern React with hooks and context
- **Vite**: Fast build tool and development server
- **Material-UI (MUI)**: Component library for consistent UI
- **React Router DOM**: Client-side routing
- **Recharts**: Data visualization library
- **Framer Motion**: Animation library
- **Styled Components**: CSS-in-JS styling

### Development Tools
- **ESLint**: Code linting and formatting
- **JavaScript Obfuscator**: Code protection for production builds
- **Axios**: HTTP client for API requests

### Additional Libraries
- **ExcelJS & XLSX**: Excel file processing
- **jsPDF**: PDF generation
- **Date-fns & Dayjs**: Date manipulation
- **React Easy Crop**: Image cropping functionality
- **HTML-to-Image**: Component to image conversion

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **PetroDash-API** backend server running (default: http://localhost:8000)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/PetroDash-WEB.git
cd PetroDash-WEB
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=PetroDash
```

### 4. Development Server
```bash
npm run dev
```
The application will start at `http://localhost:5173`

### 5. Production Build
```bash
npm run build
```
This creates an optimized production build with code obfuscation.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── charts/         # Chart components (Bar, Line, Pie)
│   ├── CustomTable/    # Table components
│   ├── DashboardComponents/  # Dashboard-specific components
│   ├── envi_components/     # Environmental components
│   ├── help_components/     # Help/CSR components
│   ├── hr_components/       # HR components
│   └── ...
├── contexts/           # React contexts for state management
│   ├── AuthContext.jsx # Authentication context
│   └── CO2Context.jsx  # CO2 data context
├── pages/              # Page components
│   ├── Admin/          # Admin pages
│   ├── Dashboard/      # Main dashboard
│   ├── Economic/       # Economic analytics
│   ├── Energy/         # Energy management
│   ├── Envi/          # Environmental monitoring
│   ├── HR/            # Human resources
│   ├── CSR/           # Corporate social responsibility
│   └── ...
├── services/           # API services and utilities
│   ├── api.js         # Main API service
│   ├── auth.js        # Authentication service
│   ├── export.js      # Export utilities
│   └── ...
├── utils/              # Utility functions
└── assets/            # Static assets (images, icons)
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production with obfuscation |
| `npm run lint` | Run ESLint for code quality |
| `npm run preview` | Preview production build locally |

## 🌐 API Integration

The application integrates with PetroDash-API for:
- User authentication and authorization
- Data retrieval and storage
- File uploads and downloads
- Real-time data updates

**API Base URL**: `http://localhost:8000` (configurable via environment variables)

## 📊 Key Features

### Authentication System
- Secure login with JWT tokens
- Protected routes for authenticated users
- Role-based access control (Admin/User)

### Data Visualization
- Interactive charts using Recharts
- Real-time data updates
- Export capabilities (Excel, PDF)
- Custom table components with sorting and filtering

### Environmental Monitoring
- Air quality metrics
- Water usage tracking
- Waste management data
- Energy consumption monitoring

### Economic Analytics
- Financial performance tracking
- Fund allocation visualization
- Budget vs actual comparisons
- ROI calculations

### Energy Management
- Power generation tracking
- Energy efficiency metrics
- Cost analysis
- Environmental impact assessment

## 🔒 Security Features

- Code obfuscation for production builds
- Protected routes and authentication
- Input validation and sanitization
- CORS configuration
- Secure API communication

## 🚀 Deployment

### Development Deployment
```bash
npm run dev
```

### Production Deployment
```bash
npm run build
npm run preview
```

### Custom Host Configuration
The application is configured to run on `esgdash.perc.com.ph` for production deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software developed for PetroEnergy Corporation.

## 📞 Support

For technical support and questions:
- Email: support@petroenergy.com.ph
- Internal Wiki: [Link to internal documentation]

## 🔄 Version History

- **v0.0.0**: Initial development version
- Features implemented: Authentication, Dashboard, Environmental monitoring, Economic analytics

---

**Note**: Ensure PetroDash-API is running at `http://localhost:8000` before starting the development server for full functionality.
