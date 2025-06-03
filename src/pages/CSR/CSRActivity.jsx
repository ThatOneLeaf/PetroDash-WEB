import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Btn from '../../components/ButtonComp';
import { 
  Box,
  Typography
 } from '@mui/material'
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';
import api from '../../services/api';
import Overlay from '../../components/modal';
import AddValueGeneratedModal from '../../components/AddValueGeneratedModal';
import Table from '../../components/Table/Table';
import Filter from '../../components/Filter/Filter';
import Search from '../../components/Filter/Search';
import Pagination from '../../components/Pagination/pagination';

function CSR() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Table state
  const [sortConfig, setSortConfig] = useState({
    key: 'year',
    direction: 'desc'
  });
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCSRData();
  }, []);

  const fetchCSRData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/help/activities');
      setData(response.data);
    } catch (error) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Table columns config
  const columns = [
    { key: 'companyId', label: 'Company ID',
      render: (val) => val
    },
    { key: 'projectId', label: 'Project ID',
      render: (val) => val
    },
    { key: 'projectYear', label: 'Year',
      render: (val) => val
    },
    { key: 'csrReport', label: 'Beneficiaries',
      render: (val) => val != null ? Number(val).toLocaleString() : ''
    },
    { key: 'projectExpenses', label: 'Investments (₱)',
      render: (val) => val != null ? Number(val).toLocaleString() : ''
    },
    { key: 'statusId', label: 'Approval Status',
      render: (val) => val
    },
    { key: 'action', label: 'Action',
      render: (val) => val != null ? Number(val).toLocaleString() : ''
    }
  ];

  console.log(data)

  // Sorting logic
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filtering and searching logic
  const filteredData = data
    .filter(row => {
      // Filter
      return Object.entries(filters).every(([key, value]) => {
        if (value == null || value.length === 0) return true;
        if (Array.isArray(value)) return value.includes(row[key]);
        return row[key] === value;
      });
    })
    .filter(row => {
      // Search (searches all fields as string)
      if (!search) return true;
      const searchStr = search.toLowerCase();
      return Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchStr)
      );
    });

  // Sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const pagedData = sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Reset to page 1 if filters/search change and page is out of range
  useEffect(() => {
    if (page > totalPages) setPage(1);
    // eslint-disable-next-line
  }, [filteredData.length, rowsPerPage]);

  // Year filter options (add "All Years" option at the top)
  const yearOptions = [
    { label: "All Years", value: "" },
    ...data
      .map(d => ({ label: d.year, value: d.year }))
      .filter((v, i, a) => a.findIndex(t => t.value === v.value) === i)
  ];

  // Table actions (optional)
  const renderActions = (row) => (
    <></>
    // Add action buttons here if needed
  );

  console.log(pagedData)

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box style={{ display: 'flex', flexDirection: 'row', height: '200dvh', width: '100%', margin: 0, padding: 0, overflowX: 'hidden' }}>
      <Box style={{}}>
        <Sidebar />
      </Box>
      <Box sx={{ width: '100%', height: 'full', display: 'flex', flexDirection: 'column', padding: '40px' }}>
        {/* Title */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'}}>
          <Typography sx={{ 
            fontSize: '0.9rem', 
            fontWeight: 800,
          }}>
            REPOSITORY
          </Typography>
          <Typography sx={{ fontSize: '2.75rem', color: '#182959', fontWeight: 800}}>
            Social - H.E.L.P
          </Typography>
        </Box>
        
        {/* Filter and buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Btn label="ADD RECORD" color="green"></Btn>
          <Btn label="IMPORT" color="green"></Btn>
        </Box>
        <Box>
          <Table
            columns={columns}
            rows={pagedData}
            onSort={handleSort}
            sortConfig={sortConfig}
            // actions={actions}
            emptyMessage="No data available."
          />
        </Box>
      </Box>
    </Box>
  )
}

export default CSR;