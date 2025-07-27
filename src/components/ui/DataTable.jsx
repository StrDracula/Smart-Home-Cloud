// src/components/ui/DataTable.jsx
import React, { useState } from 'react';
import { MdSearch, MdSort } from 'react-icons/md';
import '../../styles/DataTable.css';

const DataTable = ({ 
  data, 
  columns, 
  emptyMessage = "No data available", 
  searchable = true, 
  searchFields = [], 
  pagination = true, 
  itemsPerPage = 10 
}) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter data based on search term
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    
    return searchFields.some(field => {
      const value = item[field];
      return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === bValue) return 0;
    
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (aValue === null || aValue === undefined) return 1 * direction;
    if (bValue === null || bValue === undefined) return -1 * direction;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * direction;
    }
    
    return (aValue < bValue ? -1 : 1) * direction;
  });

  // Paginate data
  const totalPages = pagination ? Math.ceil(sortedData.length / itemsPerPage) : 1;
  const paginatedData = pagination 
    ? sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) 
    : sortedData;

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="data-table-container">
      {/* Search input */}
      {searchable && searchFields.length > 0 && (
        <div className="data-table-search">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      
      {/* Table */}
      <div className="data-table">
        {/* Table Header */}
        <div className="table-header">
          {columns.map((column) => (
            <div 
              key={column.field} 
              className={`header-cell ${column.sortable !== false ? 'sortable' : ''}`}
              onClick={() => column.sortable !== false && handleSort(column.field)}
              style={{ width: column.width || 'auto' }}
            >
              {column.name}
              {column.sortable !== false && (
                <span className="sort-indicator">
                  <MdSort className={sortField === column.field ? 'active' : ''} />
                </span>
              )}
            </div>
          ))}
        </div>
        
        {/* Table Body */}
        <div className="table-body">
          {paginatedData.length > 0 ? (
            paginatedData.map((row, rowIndex) => (
              <div key={rowIndex} className="table-row">
                {columns.map((column) => (
                  <div 
                    key={`${rowIndex}-${column.field}`} 
                    className="cell"
                    style={{ width: column.width || 'auto' }}
                  >
                    {column.render 
                      ? column.render(row[column.field], row) 
                      : row[column.field]}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="empty-table">
              <p>{emptyMessage}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="table-pagination">
          <button 
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => {
              // Show first page, last page, and pages near the current page
              return page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1);
            })
            .map((page, i, arr) => {
              // If there's a gap, show an ellipsis
              const prevPage = arr[i - 1];
              const showEllipsis = prevPage && page - prevPage > 1;
              
              return (
                <React.Fragment key={page}>
                  {showEllipsis && <span className="pagination-ellipsis">...</span>}
                  <button 
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}
          
          <button 
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;