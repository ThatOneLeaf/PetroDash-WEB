import { useState, useEffect } from 'react';
import api from '../../services/api';
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
  Cell
} from 'recharts';
import Sidebar from '../../components/Sidebar';

const COLORS = ['#3B82F6', '#F97316', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B'];

function EnvironmentEnergyDash() {
  const [activeTab, setActiveTab] = useState('electricity'); // 'electricity' or 'diesel'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [companyId, setCompanyId] = useState('');
  const [quarter, setQuarter] = useState('');
  const [fromYear, setFromYear] = useState('');
  const [toYear, setToYear] = useState('');
  const [consumptionSource, setConsumptionSource] = useState(''); // Electricity filter
  
  // Diesel-specific filters
  const [companyPropertyName, setCompanyPropertyName] = useState('');
  const [companyPropertyType, setCompanyPropertyType] = useState('');
  const [month, setMonth] = useState('');

  // State for API data
  const [companies, setCompanies] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [consumptionSources, setConsumptionSources] = useState([]);
  
  // Diesel-specific API data
  const [companyProperties, setCompanyProperties] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [dieselYears, setDieselYears] = useState([]);

  // Static key metrics - fetched once on mount and don't change with filters
  const [staticElectricityMetrics, setStaticElectricityMetrics] = useState({
    total_consumption: 0,
    unit_of_measurement: 'kWh',
    peak_year: null,
    peak_consumption: 0,
    average_consumption: 0
  });
  const [staticDieselMetrics, setStaticDieselMetrics] = useState({
    total_diesel_consumption: 0,
    unit_of_measurement: 'Liters',
    average_annual_consumption: 0,
    yearly_deviation: []
  });

  // Mock chart data (to be replaced with API calls later)
  const electricityChartData = {
    pieData: [
      { label: 'PSC', value: 1845732, color: '#3B82F6' },
      { label: 'PMC', value: 867535, color: '#F97316' }
    ],
    lineChartData: [
      { year: 2018, psc: 150000, pmc: 120000 },
      { year: 2019, psc: 160000, pmc: 125000 },
      { year: 2020, psc: 155000, pmc: 115000 },
      { year: 2021, psc: 170000, pmc: 130000 },
      { year: 2022, psc: 180000, pmc: 140000 },
      { year: 2023, psc: 185000, pmc: 145000 },
      { year: 2024, psc: 190000, pmc: 150000 }
    ],
    stackedBarData: [
      { quarter: 'Q1', psc: 150000, pmc: 65000 },
      { quarter: 'Q2', psc: 165000, pmc: 70000 },
      { quarter: 'Q3', psc: 180000, pmc: 75000 },
      { quarter: 'Q4', psc: 170000, pmc: 68000 }
    ]
  };

  // Diesel mock chart data (to be replaced with API calls later)
  const dieselChartData = {
    pieData: [
      { label: 'PSC', value: 15200, color: '#10B981' },
      { label: 'PMC', value: 6250, color: '#F97316' }
    ],
    lineChartData: [
      { year: 2018, psc: 1200, pmc: 800 },
      { year: 2019, psc: 1350, pmc: 750 },
      { year: 2020, psc: 1100, pmc: 900 },
      { year: 2021, psc: 1400, pmc: 850 },
      { year: 2022, psc: 1500, pmc: 950 },
      { year: 2023, psc: 1450, pmc: 900 },
      { year: 2024, psc: 1600, pmc: 1000 }
    ],
    stackedBarData: [
      { quarter: 'Q1', psc: 400, pmc: 250 },
      { quarter: 'Q2', psc: 420, pmc: 280 },
      { quarter: 'Q3', psc: 450, pmc: 300 },
      { quarter: 'Q4', psc: 380, pmc: 270 }
    ]
  };

  // Month options for diesel filter
  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get current data based on active tab
  const getCurrentData = () => {
    if (activeTab === 'electricity') {
      return {
        pieData: electricityChartData.pieData,
        lineChartData: electricityChartData.lineChartData,
        stackedBarData: electricityChartData.stackedBarData,
        unit: staticElectricityMetrics.unit_of_measurement || 'kWh'
      };
    } else {
      return {
        pieData: dieselChartData.pieData,
        lineChartData: dieselChartData.lineChartData,
        stackedBarData: dieselChartData.stackedBarData,
        unit: staticDieselMetrics.unit_of_measurement || 'Liters'
      };
    }
  };

  const currentData = getCurrentData();

  // Fetch companies and available years on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [
          companiesResponse, 
          yearsResponse, 
          sourcesResponse,
          companyPropertiesResponse,
          propertyTypesResponse,
          dieselYearsResponse
        ] = await Promise.all([
          api.get('/reference/companies'),
          api.get('/environment_dash/water-years'),
          api.get('/environment_dash/comsumption-source'),
          api.get('/environment_dash/diesel-cp-name'),
          api.get('/environment_dash/diesel-cp-type'),
          api.get('/environment_dash/diesel-years')
        ]);

        console.log('Companies fetched:', companiesResponse.data);
        console.log('Available years fetched:', yearsResponse.data);
        console.log('Consumption sources fetched:', sourcesResponse.data);
        console.log('Company properties fetched:', companyPropertiesResponse.data);
        console.log('Property types fetched:', propertyTypesResponse.data);
        console.log('Diesel years fetched:', dieselYearsResponse.data);
        
        setCompanies(companiesResponse.data);
        setAvailableYears(yearsResponse.data.data || []);
        setConsumptionSources(sourcesResponse.data.data || []);
        setCompanyProperties(companyPropertiesResponse.data.data || []);
        setPropertyTypes(propertyTypesResponse.data.data || []);
        setDieselYears(dieselYearsResponse.data.data || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setCompanies([]);
        setAvailableYears([]);
        setConsumptionSources([]);
        setCompanyProperties([]);
        setPropertyTypes([]);
        setDieselYears([]);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch static key metrics once on component mount (no filter dependencies)
  useEffect(() => {
    const fetchStaticKeyMetrics = async () => {
      if (companies.length === 0 || availableYears.length === 0) return;

      try {
        setLoading(true);
        
        // Static parameters - all companies, all quarters, all years, all sources
        const electricityParams = {
          company_id: companies.map(company => company.id),
          quarter: ['Q1', 'Q2', 'Q3', 'Q4'],
          year: availableYears,
          consumption_source: consumptionSources
        };

        const dieselParams = {
          company_id: companies.map(company => company.id),
          quarter: ['Q1', 'Q2', 'Q3', 'Q4'],
          year: dieselYears.length > 0 ? dieselYears : availableYears
        };

        console.log('Fetching static electricity metrics with params:', electricityParams);
        console.log('Fetching static diesel metrics with params:', dieselParams);

        const [electricityResponse, dieselResponse] = await Promise.all([
          api.get('/environment_dash/electricity-key-metrics', { 
            params: electricityParams,
            paramsSerializer: { indexes: null }
          }),
          api.get('/environment_dash/diesel-key-metrics', { 
            params: dieselParams,
            paramsSerializer: { indexes: null }
          })
        ]);

        console.log('Static electricity metrics response:', electricityResponse.data);
        console.log('Static diesel metrics response:', dieselResponse.data);
        
        setStaticElectricityMetrics(electricityResponse.data);
        setStaticDieselMetrics(dieselResponse.data);
        
      } catch (error) {
        console.error('Failed to fetch static key metrics:', error);
        console.error('Error response:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch once when all initial data is loaded
    if (companies.length > 0 && availableYears.length > 0 && consumptionSources.length > 0 && dieselYears.length > 0) {
      fetchStaticKeyMetrics();
    }
  }, [companies, availableYears, consumptionSources, dieselYears]);

  // Clear all filters function
  const clearAllFilters = () => {
    setCompanyId('');
    setQuarter('');
    setFromYear('');
    setToYear('');
    setConsumptionSource('');
    
    // Clear diesel-specific filters
    setCompanyPropertyName('');
    setCompanyPropertyType('');
    setMonth('');
  };

  // Custom tooltip for pie chart
  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '12px'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{data.payload.label}</p>
          <p style={{ margin: 0, color: data.payload.color }}>
            {data.value.toLocaleString()} {currentData.unit}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for stacked bar chart
  const renderStackedBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '12px'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: 0, color: entry.color }}>
              {entry.name.toUpperCase()}: {Number(entry.value).toLocaleString()} {currentData.unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
              Environment - Energy
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
            onClick={() => setActiveTab('electricity')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'electricity' ? '#10B981' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '80px'
            }}
          >
            Electricity
          </button>
          <button
            onClick={() => setActiveTab('diesel')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'diesel' ? '#10B981' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '80px'
            }}
          >
            Diesel
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
            <option value="">All Companies</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>

          {/* Source Filter - Only show for electricity tab */}
          {activeTab === 'electricity' && (
            <select 
              value={consumptionSource}
              onChange={(e) => setConsumptionSource(e.target.value)}
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
              <option value="">All Sources</option>
              {consumptionSources.map((source, index) => (
                <option key={index} value={source}>
                  {source}
                </option>
              ))}
            </select>
          )}

          {/* Company Property Name Filter - Only show for diesel tab */}
          {activeTab === 'diesel' && (
            <select 
              value={companyPropertyName}
              onChange={(e) => setCompanyPropertyName(e.target.value)}
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
              <option value="">All Company Properties</option>
              {companyProperties.map((property, index) => (
                <option key={index} value={property}>
                  {property}
                </option>
              ))}
            </select>
          )}

          {/* Property Type Filter - Only show for diesel tab */}
          {activeTab === 'diesel' && (
            <select 
              value={companyPropertyType}
              onChange={(e) => setCompanyPropertyType(e.target.value)}
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
              <option value="">All Property Types</option>
              {propertyTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          )}

          {/* Month Filter - Only show for diesel tab */}
          {activeTab === 'diesel' && (
            <select 
              value={month}
              onChange={(e) => setMonth(e.target.value)}
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
              <option value="">All Months</option>
              {monthOptions.map((monthName, index) => (
                <option key={index} value={monthName}>
                  {monthName}
                </option>
              ))}
            </select>
          )}

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
            <option value="">All Quarters</option>
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
              <option value="">From Year</option>
              {(activeTab === 'diesel' ? dieselYears : availableYears).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <span style={{ 
              color: '#64748b', 
              fontSize: '12px', 
              fontWeight: '500' 
            }}>
              to
            </span>

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
              <option value="">To Year</option>
              {(activeTab === 'diesel' ? dieselYears : availableYears)
                .filter(year => !fromYear || year >= parseInt(fromYear))
                .map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
            </select>
          </div>

          {/* Clear All Filters Button */}
          {(companyId || quarter || fromYear || toYear || 
            (activeTab === 'electricity' && consumptionSource) ||
            (activeTab === 'diesel' && (companyPropertyName || companyPropertyType || month))) && (
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
          gridTemplateColumns: activeTab === 'electricity' ? '1fr 1fr 1fr' : '1fr 1fr', 
          gap: '12px',
          marginBottom: '15px',
          flexShrink: 0
        }}>
          {activeTab === 'electricity' ? (
            <>
              <div style={{
                backgroundColor: '#3B82F6',
                color: 'white',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
                  YEAR-ON-YEAR CUMULATIVE ELECTRICITY CONSUMPTION
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>
                  {loading ? 'Loading...' : staticElectricityMetrics.total_consumption.toLocaleString()} {staticElectricityMetrics.unit_of_measurement}
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
                  YEAR WITH HIGHEST ELECTRICITY CONSUMPTION
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>
                  {loading ? 'Loading...' : staticElectricityMetrics.peak_consumption.toLocaleString()} {staticElectricityMetrics.unit_of_measurement}
                </div>
                <div style={{ fontSize: '9px', opacity: 0.8 }}>
                  {staticElectricityMetrics.peak_year || ''}
                </div>
              </div>

              <div style={{
                backgroundColor: '#10B981',
                color: 'white',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
                  AVERAGE ANNUAL ELECTRICITY CONSUMPTION
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>
                  {loading ? 'Loading...' : staticElectricityMetrics.average_consumption.toLocaleString()} {staticElectricityMetrics.unit_of_measurement}
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{
                backgroundColor: '#3B82F6',
                color: 'white',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
                  YEAR-ON-YEAR CUMULATIVE DIESEL CONSUMPTION
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>
                  {loading ? 'Loading...' : staticDieselMetrics.total_diesel_consumption.toLocaleString()} {staticDieselMetrics.unit_of_measurement}
                </div>
              </div>

              <div style={{
                backgroundColor: '#F97316',
                color: 'white',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
                  AVERAGE ANNUAL DIESEL CONSUMPTION
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>
                  {loading ? 'Loading...' : staticDieselMetrics.average_annual_consumption.toLocaleString()} {staticDieselMetrics.unit_of_measurement}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Charts Section */}
        <div style={{ 
          flex: 1,
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          minHeight: 0
        }}>
          {/* Pie Chart */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '12px', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}>
            <h3 style={{
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#1e293b',
              flexShrink: 0
            }}>
              {activeTab === 'electricity' ? 'Distribution of Electricity Consumption by Company' : 'Distribution of Diesel Consumption by Company'}
            </h3>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentData.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      innerRadius={35}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                      startAngle={90}
                      endAngle={450}
                    >
                      {currentData.pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={renderCustomTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '10px',
                flexShrink: 0,
                marginTop: '8px'
              }}>
                {currentData.pieData.map((entry, index) => (
                  <div
                    key={index}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px'
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: entry.color || COLORS[index % COLORS.length],
                      borderRadius: '1px',
                      flexShrink: 0
                    }}></div>
                    <span style={{ fontWeight: '500', fontSize: '9px' }}>
                      {entry.label}: {(entry.value || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Second Column - Line Chart and Stacked Bar Chart */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            minHeight: 0
          }}>
            {/* Line Chart */}
            <div style={{ 
              flex: 1,
              backgroundColor: 'white', 
              padding: '12px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}>
              <h3 style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                marginBottom: '10px',
                color: '#1e293b',
                flexShrink: 0
              }}>
                {activeTab === 'electricity' ? 'Electricity Consumption Over Years by Company' : 'Diesel Consumption Over Time - PSC'}
              </h3>
              
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentData.lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="year" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${Number(value).toLocaleString()} ${currentData.unit}`, 
                        name.toUpperCase()
                      ]}
                      labelStyle={{ color: '#1e293b', fontSize: '12px' }}
                      contentStyle={{ fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="psc" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                      name="PSC"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pmc" 
                      stroke="#F97316" 
                      strokeWidth={2}
                      dot={{ fill: '#F97316', strokeWidth: 2, r: 3 }}
                      name="PMC"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stacked Bar Chart */}
            <div style={{ 
              flex: 1,
              backgroundColor: 'white', 
              padding: '12px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}>
              <h3 style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                marginBottom: '10px',
                color: '#1e293b',
                flexShrink: 0
              }}>
                {activeTab === 'electricity' ? 'Electricity Consumption per Quarter - 2024' : 'PSC: Diesel Consumption by Property (2024)'}
              </h3>
              
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentData.stackedBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="quarter"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip content={renderStackedBarTooltip} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar 
                      dataKey="psc" 
                      stackId="a" 
                      fill="#3B82F6" 
                      name="PSC" 
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar 
                      dataKey="pmc" 
                      stackId="a" 
                      fill="#F97316" 
                      name="PMC" 
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnvironmentEnergyDash;