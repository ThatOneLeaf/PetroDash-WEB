import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar,
  Line,
  LineChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import Sidebar from '../../components/Sidebar';

const COLORS = ['#3B82F6', '#F97316', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B', '#64748b', '#06B6D4', '#84CC16'];

function EnvironmentWasteDash() {
  const [activeTab, setActiveTab] = useState('hazardous_generated'); // 'hazardous_generated', 'hazardous_disposed', 'non_hazardous_generated'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters - Common for all tabs
  const [companyId, setCompanyId] = useState('');
  const [quarter, setQuarter] = useState('');
  const [fromYear, setFromYear] = useState('');
  const [toYear, setToYear] = useState('');

  // Mock data for companies and years
  const [companies] = useState([
    { id: 'PSC', name: 'PSC' },
    { id: 'PWEI', name: 'PWEI' },
    { id: 'PMC', name: 'PMC' }
  ]);
  const [availableYears] = useState([2018, 2019, 2020, 2021, 2022, 2023, 2024]);

  // Get tab display properties
  const getTabInfo = () => {
    switch(activeTab) {
      case 'hazardous_generated':
        return {
          title: 'Hazardous Generated',
          keyMetrics: {
            card1: { title: 'YEAR-ON-YEAR CUMULATIVE HAZARDOUS WASTE GENERATED', value: '26,275.47', unit: 'kg | 24,353.33 L' },
            card2: { title: 'MOST GENERATED WASTE TYPE', value: '24,353.33 L', subtitle: 'Used Oil' },
            card3: { title: 'AVERAGE ANNUAL HAZARDOUS WASTE GENERATED', value: '3,284.43', unit: 'kg | 3,044.17 L' }
          }
        };
      case 'hazardous_disposed':
        return {
          title: 'Hazardous Disposed', 
          keyMetrics: {
            card1: { title: 'YEAR-ON-YEAR CUMULATIVE HAZARDOUS WASTE DISPOSED', value: '22,343.47', unit: 'kg | 16,864.45 L' },
            card2: { title: 'MOST DISPOSED WASTE TYPE', value: '16,864.44 L', subtitle: 'Used Oil' },
            card3: { title: 'AVERAGE ANNUAL HAZARDOUS WASTE DISPOSED', value: '2,792.93', unit: 'kg | 2,108.06 L' }
          }
        };
      case 'non_hazardous_generated':
        return {
          title: 'Non-hazardous Generated',
          keyMetrics: {
            card1: { title: 'YEAR-ON-YEAR CUMULATIVE NON-HAZARDOUS WASTE GENERATED', value: '17909.95', unit: 'kg' },
            card2: { title: 'MOST GENERATED METRIC', value: '9574.26', unit: 'kg', subtitle: 'Residual' },
            card3: { title: 'AVERAGE ANNUAL NON HAZARDOUS WASTE GENERATED', value: '2238.74', unit: 'kg' }
          }
        };
      default:
        return { title: '', keyMetrics: {} };
    }
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setCompanyId('');
    setQuarter('');
    setFromYear('');
    setToYear('');
  };

  const tabInfo = getTabInfo();

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'row',
      height: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      backgroundColor: '#f8fafc'
    }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{ 
        flex: 1,
        padding: '15px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px',
          flexShrink: 0
        }}>
          <div>
            <div style={{ 
              color: '#64748b', 
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '3px'
            }}>
              DASHBOARD
            </div>
            <h1 style={{ 
              fontSize: '24px',
              fontWeight: 'bold', 
              color: '#1e293b',
              margin: 0 
            }}>
              Environment - Waste
            </h1>
          </div>
          <button style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '8px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            📊 EXPORT DATA
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          marginBottom: '15px',
          flexShrink: 0
        }}>
          <button
            onClick={() => setActiveTab('hazardous_generated')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'hazardous_generated' ? '#10B981' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '120px'
            }}
          >
            Hazardous Generated
          </button>
          <button
            onClick={() => setActiveTab('hazardous_disposed')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'hazardous_disposed' ? '#10B981' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '120px'
            }}
          >
            Hazardous Disposed
          </button>
          <button
            onClick={() => setActiveTab('non_hazardous_generated')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'non_hazardous_generated' ? '#10B981' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            Non-hazardous Generated
          </button>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          marginBottom: '15px',
          flexWrap: 'wrap',
          alignItems: 'center',
          flexShrink: 0
        }}>
          {/* Company Filter */}
          <select 
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '2px solid #e2e8f0',
              borderRadius: '20px',
              backgroundColor: 'white',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '100px'
            }}
          >
            <option value="">Filter</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>

          {/* Quarter Filter */}
          <select 
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '2px solid #e2e8f0',
              borderRadius: '20px',
              backgroundColor: 'white',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '100px'
            }}
          >
            <option value="">Filter</option>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>

          {/* Year Range Filter */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select 
              value={fromYear}
              onChange={(e) => setFromYear(e.target.value)}
              style={{
                padding: '8px 10px',
                border: '2px solid #e2e8f0',
                borderRadius: '20px',
                backgroundColor: 'white',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                minWidth: '85px'
              }}
            >
              <option value="">Filter</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select 
              value={toYear}
              onChange={(e) => setToYear(e.target.value)}
              style={{
                padding: '8px 10px',
                border: '2px solid #e2e8f0',
                borderRadius: '20px',
                backgroundColor: 'white',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                minWidth: '85px'
              }}
            >
              <option value="">Filter</option>
              {availableYears
                .filter(year => !fromYear || year >= parseInt(fromYear))
                .map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
            </select>
          </div>

          {/* Clear All Filters Button */}
          {(companyId || quarter || fromYear || toYear) && (
            <button
              onClick={clearAllFilters}
              style={{
                padding: '8px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Key Metrics Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '12px',
          marginBottom: '15px',
          flexShrink: 0
        }}>
          <div style={{
            backgroundColor: '#3B82F6',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
              {tabInfo.keyMetrics.card1?.title}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>
              {tabInfo.keyMetrics.card1?.value} {tabInfo.keyMetrics.card1?.unit}
            </div>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
              {tabInfo.keyMetrics.card2?.title}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>
              {tabInfo.keyMetrics.card2?.value}
            </div>
            {tabInfo.keyMetrics.card2?.subtitle && (
              <div style={{ fontSize: '9px', opacity: 0.8 }}>
                {tabInfo.keyMetrics.card2?.subtitle}
              </div>
            )}
          </div>

          <div style={{
            backgroundColor: '#10B981',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
              {tabInfo.keyMetrics.card3?.title}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>
              {tabInfo.keyMetrics.card3?.value} {tabInfo.keyMetrics.card3?.unit}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ 
          flex: 1,
          display: 'grid',
          gridTemplateColumns: activeTab === 'non_hazardous_generated' ? '1fr 1fr' : '1fr 1fr 1fr 1fr',
          gridTemplateRows: activeTab === 'non_hazardous_generated' ? '1fr 1fr' : '1fr 1fr',
          gap: '15px',
          minHeight: 0
        }}>
          {activeTab === 'hazardous_generated' && (
            <>
              {/* Top Row - 4 charts */}
              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Hazardous Waste Generated in Year
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Company Comparison
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Solid Waste by Company (Kilograms)
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Hazardous Waste Comparison by Type
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Row - 4 pie charts */}
              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  WM Hazardous Waste Generated by Company-Online
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[]} cx="50%" cy="50%" outerRadius={60} innerRadius={25} fill="#8884d8" dataKey="value" />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Liquid Waste by Company (Liters)
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[]} cx="50%" cy="50%" outerRadius={60} innerRadius={25} fill="#8884d8" dataKey="value" />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Solid Waste by Company (Kilograms)
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[]} cx="50%" cy="50%" outerRadius={60} innerRadius={25} fill="#8884d8" dataKey="value" />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Hazardous Waste Composition by Type
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[]} cx="50%" cy="50%" outerRadius={60} innerRadius={25} fill="#8884d8" dataKey="value" />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {activeTab === 'hazardous_disposed' && (
            <>
              {/* Top Row - 4 charts */}
              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Waste Disposed in Company
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis type="category" dataKey="company" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Total Hazardous Waste Disposed by Unit
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[]} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Hazardous Waste Disposed in Year
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Hazard Disposed Yearly Comparison
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Row - 4 charts */}
              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  YoH Control Consumption Waste Types
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Yearly Disposal Change %
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Additional Chart
                </h3>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '12px' }}>
                  {/* Placeholder for additional chart */}
                </div>
              </div>
            </>
          )}

          {activeTab === 'non_hazardous_generated' && (
            <>
              {/* Top Row - 2 charts */}
              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Distribution of Non-Hazardous Waste Generated by Company
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[]} cx="50%" cy="50%" outerRadius={80} innerRadius={40} fill="#8884d8" dataKey="value" />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Non-Hazardous Waste by Year and Metric (Kilograms)
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Row - 2 charts */}
              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Total Non-Hazardous Waste by Metrics per Company (Unit: Kilograms)
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis type="category" dataKey="company" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="food" stackId="a" fill="#F59E0B" />
                      <Bar dataKey="residual" stackId="a" fill="#EF4444" />
                      <Bar dataKey="compostable" stackId="a" fill="#84CC16" />
                      <Bar dataKey="petBottles" stackId="a" fill="#06B6D4" />
                      <Bar dataKey="scrapMetal" stackId="a" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  PWEI - Non-Hazardous Waste by Quarter - 2024
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="food" fill="#F59E0B" name="Food" />
                      <Bar dataKey="residual" fill="#06B6D4" name="Residual" />
                      <Bar dataKey="scrapTires" fill="#EC4899" name="Scrap Tires" />
                      <Bar dataKey="compostable" fill="#84CC16" name="Compostable" />
                      <Bar dataKey="petBottles" fill="#10B981" name="PET Bottles" />
                      <Bar dataKey="scrapMetal" fill="#64748b" name="Scrap Metal" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnvironmentWasteDash;