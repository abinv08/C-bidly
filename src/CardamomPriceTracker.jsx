import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

// Replace with your deployed Google Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyUD8WbyP2tOZZX-sz28bbPvjic1U-i-QUkjjKl23WORNj1uT-gsIO1-rs-q3GA2D4/exec';

// Function to fetch data from Google Apps Script
const fetchDataFromGoogleDrive = async () => {
  try {
    // First attempt direct fetch
    const response = await fetch(`${APPS_SCRIPT_URL}?fetchData=true`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to fetch data');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Function to format date display
const formatDate = (year, month, week) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[month-1]} ${year} (W${week})`;
};

// Function to get available years from data
const getYears = (data) => {
  const years = [...new Set(data.map(item => item.year))];
  return years.sort((a, b) => a - b);
};

// Function to aggregate data by years
const aggregateByYears = (data) => {
  const yearlyData = {};
  
  data.forEach(item => {
    const year = item.year;
    if (!yearlyData[year]) {
      yearlyData[year] = {
        year,
        maxPriceSum: 0,
        avrPriceSum: 0,
        count: 0
      };
    }
    yearlyData[year].maxPriceSum += item.minPrice;
    yearlyData[year].avrPriceSum += item.avrPrice;
    yearlyData[year].count += 1;
  });
  
  return Object.values(yearlyData).map(item => ({
    name: item.year.toString(),
    'Max Price': Math.round(item.maxPriceSum / item.count),
    'Avg Price': Math.round(item.avrPriceSum / item.count)
  }));
};

// Function to filter data by time range
const filterDataByTimeRange = (data, range) => {
  const now = new Date();
  let startDate = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  switch(range) {
    case '1M':
      if (currentMonth === 1) {
        return data.filter(item => (item.year === currentYear - 1 && item.month === 12) || 
                                   (item.year === currentYear && item.month === currentMonth));
      } else {
        return data.filter(item => item.year === currentYear && 
                                   (item.month === currentMonth || item.month === currentMonth - 1));
      }
    case '3M':
      if (currentMonth <= 3) {
        return data.filter(item => (item.year === currentYear - 1 && item.month > 12 - (3 - currentMonth)) || 
                                   (item.year === currentYear && item.month <= currentMonth));
      } else {
        return data.filter(item => item.year === currentYear && 
                                   item.month > currentMonth - 3 && item.month <= currentMonth);
      }
    case '6M':
      if (currentMonth <= 6) {
        return data.filter(item => (item.year === currentYear - 1 && item.month > 12 - (6 - currentMonth)) || 
                                   (item.year === currentYear && item.month <= currentMonth));
      } else {
        return data.filter(item => item.year === currentYear && 
                                   item.month > currentMonth - 6 && item.month <= currentMonth);
      }
    case '1Y':
      return data.filter(item => item.year === currentYear || 
                                 (item.year === currentYear - 1 && item.month >= currentMonth));
    case '3Y':
      return data.filter(item => item.year >= currentYear - 3);
    case '5Y':
      return data.filter(item => item.year >= currentYear - 5);
    case 'ALL':
    default:
      return data;
  }
};

// Function to prepare data for chart
const prepareChartData = (data, viewMode) => {
  if (viewMode === 'yearly') {
    return aggregateByYears(data);
  } else {
    return data.map(item => ({
      name: formatDate(item.year, item.month, item.week),
      'Max Price': item.minPrice,
      'Avg Price': item.avrPrice
    }));
  }
};

// Fallback data in case API fails
const getFallbackData = () => {
  return [
    {year: 2023, month: 1, week: 1, minPrice: 1200, avrPrice: 1000},
    {year: 2023, month: 2, week: 1, minPrice: 1250, avrPrice: 1050},
    {year: 2023, month: 3, week: 1, minPrice: 1300, avrPrice: 1100},
    {year: 2023, month: 4, week: 1, minPrice: 1350, avrPrice: 1150},
    {year: 2023, month: 5, week: 1, minPrice: 1400, avrPrice: 1200},
  ];
};

const CardamomPriceTracker = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('loading');
  const [timeRange, setTimeRange] = useState('ALL');
  const [viewMode, setViewMode] = useState('all');
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  // New state for toggling between max and avg price
  const [priceView, setPriceView] = useState('avg');
  
  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const fetchedData = await fetchDataFromGoogleDrive();
        
        if (fetchedData.length === 0) {
          throw new Error('No data found in the spreadsheet');
        }

        // Filter out invalid data and ensure numeric values
        const validData = fetchedData
          .filter(item => 
            item.year && item.month && item.week && 
            !isNaN(item.minPrice) && !isNaN(item.avrPrice)
          )
          .map(item => ({
            year: Number(item.year),
            month: Number(item.month),
            week: Number(item.week),
            minPrice: Number(item.minPrice),
            avrPrice: Number(item.avrPrice)
          }));

        // Sort data by date
        const sortedData = validData.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          if (a.month !== b.month) return a.month - b.month;
          return a.week - b.week;
        });
        
        setData(sortedData);
        setChartData(prepareChartData(sortedData, viewMode));
        setDataSource('live');
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(`Failed to load data: ${err.message}. Using fallback data.`);
        
        const fallbackData = getFallbackData();
        setData(fallbackData);
        setChartData(prepareChartData(fallbackData, viewMode));
        setDataSource('fallback');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Update chart data when time range or view mode changes
  useEffect(() => {
    if (data.length > 0) {
      const filteredData = filterDataByTimeRange(data, timeRange);
      setChartData(prepareChartData(filteredData, viewMode));
    }
  }, [timeRange, viewMode, data]);
  
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  const togglePriceHistory = () => {
    setShowPriceHistory(!showPriceHistory);
  };

  // Toggle between max price and avg price view
  const togglePriceView = () => {
    setPriceView(priceView === 'avg' ? 'max' : 'avg');
  };
  
  const handleRefreshData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedData = await fetchDataFromGoogleDrive();
      
      if (fetchedData.length === 0) {
        throw new Error('No data found in the spreadsheet');
      }

      const validData = fetchedData
        .filter(item => 
          item.year && item.month && item.week && 
          !isNaN(item.minPrice) && !isNaN(item.avrPrice)
        )
        .map(item => ({
          year: Number(item.year),
          month: Number(item.month),
          week: Number(item.week),
          minPrice: Number(item.minPrice),
          avrPrice: Number(item.avrPrice)
        }));

      const sortedData = validData.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        if (a.month !== b.month) return a.month - b.month;
        return a.week - b.week;
      });
      
      setData(sortedData);
      setChartData(prepareChartData(sortedData, viewMode));
      setDataSource('live');
      setIsLoading(false);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(`Failed to refresh data: ${err.message}`);
      setIsLoading(false);
    }
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate('/Pricesm1');
  };

  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading cardamom price data...</p>
      </div>
    );
  }

  const currentData = data.length > 0 ? data[data.length - 1] : null;
  const previousData = data.length > 1 ? data[data.length - 2] : null;

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <button 
        className="btn btn-secondary mb-3" 
        onClick={handleBackClick}
        style={{ position: 'absolute', top: '10px', left: '10px' }}
      >
        Back
      </button>
      
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2 className="card-title m-0">Cardamom Price Trends</h2>
          <div>
            <button 
              className="btn btn-outline-primary btn-sm me-2" 
              onClick={togglePriceHistory}
            >
              {showPriceHistory ? 'Hide Price History' : 'Show Price History'}
            </button>
            <button 
              className="btn btn-outline-primary btn-sm" 
              onClick={handleRefreshData}
              disabled={isLoading}
            >
              Refresh Data
            </button>
          </div>
        </div>
        
        {error && (
          <div className="card-body p-0">
            <div className="alert alert-warning m-3" role="alert">
              <h4 className="alert-heading">Data Source Notice</h4>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        <div className="card-body">
          <div className="mb-4 d-flex justify-content-between">
            <div className="btn-group">
              {['1M', '3M', '6M', '1Y', '3Y', '5Y', 'ALL'].map(range => (
                <button 
                  key={range}
                  className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleTimeRangeChange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
            
            <div className="btn-group">
              <button 
                className={`btn btn-sm ${viewMode === 'yearly' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleViewModeChange('yearly')}
              >
                Yearly
              </button>
              <button 
                className={`btn btn-sm ${viewMode === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleViewModeChange('all')}
              >
                All Data
              </button>
            </div>
          </div>
          
          {/* Toggle Button for Max/Avg Price */}
          <div className="mb-3 text-center">
            <button 
              className="btn btn-primary"
              onClick={togglePriceView}
            >
              {priceView === 'avg' ? 'Show Maximum Price Graph' : 'Show Average Price Graph'}
            </button>
          </div>

          {/* Graph with reduced height */}
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
                {priceView === 'max' ? (
                  <Line 
                    type="monotone" 
                    dataKey="Max Price" 
                    stroke="#FF6B6B" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ) : (
                  <Line 
                    type="monotone" 
                    dataKey="Avg Price" 
                    stroke="#00B894" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {showPriceHistory && (
            <div className="mt-3">
              <h4>Price History</h4>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Year</th>
                      <th>Month</th>
                      <th>Week</th>
                      <th>Max Price (₹/Kg)</th>
                      <th>Avg Price (₹/Kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterDataByTimeRange(data, timeRange)
                      .sort((a, b) => {
                        if (a.year !== b.year) return b.year - a.year;
                        if (a.month !== b.month) return b.month - a.month;
                        return b.week - a.week;
                      })
                      .map((item, index) => (
                        <tr key={index}>
                          <td>{formatDate(item.year, item.month, item.week)}</td>
                          <td>{item.year}</td>
                          <td>{item.month}</td>
                          <td>{item.week}</td>
                          <td>{item.minPrice.toFixed(2)}</td>
                          <td>{item.avrPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Compact Stats Section */}
          <div className="row mt-3">
            {/* Current Pricing */}
            <div className="col-md-6 mb-3">
              <h5 className="border-bottom pb-2">Current Pricing</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="card bg-light mb-2">
                    <div className="card-body py-2">
                      <h6 className="card-title mb-1">Maximum Price</h6>
                      <h4 className="text-danger mb-1">
                        ₹{currentData ? currentData.minPrice.toFixed(2) : "0.00"}
                      </h4>
                      {previousData && (
                        <p className="text-muted small mb-0">
                          {currentData.minPrice > previousData.minPrice ? (
                            <span className="text-success">
                              ↑ {((currentData.minPrice - previousData.minPrice) / previousData.minPrice * 100).toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-danger">
                              ↓ {((previousData.minPrice - currentData.minPrice) / previousData.minPrice * 100).toFixed(2)}%
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-light">
                    <div className="card-body py-2">
                      <h6 className="card-title mb-1">Average Price</h6>
                      <h4 className="text-success mb-1">
                        ₹{currentData ? currentData.avrPrice.toFixed(2) : "0.00"}
                      </h4>
                      {previousData && (
                        <p className="text-muted small mb-0">
                          {currentData.avrPrice > previousData.avrPrice ? (
                            <span className="text-success">
                              ↑ {((currentData.avrPrice - previousData.avrPrice) / previousData.avrPrice * 100).toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-danger">
                              ↓ {((previousData.avrPrice - currentData.avrPrice) / previousData.avrPrice * 100).toFixed(2)}%
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Statistics */}
            <div className="col-md-6">
              <h5 className="border-bottom pb-2">Price Statistics</h5>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <div className="card">
                    <div className="card-body py-2">
                      <h6 className="card-title mb-1">YTD Change</h6>
                      {data.length > 0 && (() => {
                        const currentYear = new Date().getFullYear();
                        const yearData = data.filter(item => item.year === currentYear);
                        const startOfYear = yearData.length > 0 ? 
                            yearData.sort((a, b) => {
                              if (a.month !== b.month) return a.month - b.month;
                              return a.week - b.week;
                            })[0] :
                            data[0];
                        const current = currentData;
                        const maxPriceChange = ((current.minPrice - startOfYear.minPrice) / startOfYear.minPrice * 100).toFixed(2);
                        return (
                          <h5 className={parseFloat(maxPriceChange) >= 0 ? "text-success mb-0" : "text-danger mb-0"}>
                            {parseFloat(maxPriceChange) >= 0 ? "+" : ""}{maxPriceChange}%
                          </h5>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-2">
                  <div className="card">
                    <div className="card-body py-2">
                      <h6 className="card-title mb-1">1Y High</h6>
                      {data.length > 0 && (() => {
                        const currentYear = new Date().getFullYear();
                        const lastYearData = data.filter(item => 
                          item.year === currentYear || item.year === currentYear - 1
                        );
                        if (lastYearData.length > 0) {
                          const maxPrice = Math.max(...lastYearData.map(item => item.minPrice));
                          return <h5 className="text-primary mb-0">₹{maxPrice.toFixed(2)}</h5>;
                        }
                        return <h5 className="mb-0">₹{Math.max(...data.map(item => item.minPrice)).toFixed(2)}</h5>;
                      })()}
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-2">
                  <div className="card">
                    <div className="card-body py-2">
                      <h6 className="card-title mb-1">1Y Low</h6>
                      {data.length > 0 && (() => {
                        const currentYear = new Date().getFullYear();
                        const lastYearData = data.filter(item => 
                          item.year === currentYear || item.year === currentYear - 1
                        );
                        if (lastYearData.length > 0) {
                          const minPrice = Math.min(...lastYearData.map(item => item.avrPrice));
                          return <h5 className="text-primary mb-0">₹{minPrice.toFixed(2)}</h5>;
                        }
                        return <h5 className="mb-0">₹{Math.min(...data.map(item => item.avrPrice)).toFixed(2)}</h5>;
                      })()}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body py-2">
                      <h6 className="card-title mb-1">All-Time High</h6>
                      {data.length > 0 && (() => {
                        const maxPrice = Math.max(...data.map(item => item.minPrice));
                        return <h5 className="text-primary mb-0">₹{maxPrice.toFixed(2)}</h5>;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <p className="text-muted">
              <small>
                Last updated: {currentData ? formatDate(currentData.year, currentData.month, currentData.week) : 'N/A'} | 
                Data source: {dataSource === 'live' ? 'Google Sheets API' : dataSource === 'fallback' ? 'Fallback Data' : 'Loading Failed'}
              </small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardamomPriceTracker;