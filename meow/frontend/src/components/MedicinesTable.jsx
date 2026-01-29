import React, { useState } from 'react';
import './MedicinesTable.css';

const MedicinesTable = ({ medicines }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'line_item_id', direction: 'asc' });
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = medicines.filter(med =>
    med.inn_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.form.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (typeof aVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    return sortConfig.direction === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedData = sorted.slice(startIdx, startIdx + pageSize);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
    setCurrentPage(1);
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <span className="sort-icon">⇅</span>;
    return sortConfig.direction === 'asc' ? 
      <span className="sort-icon">▲</span> : 
      <span className="sort-icon">▼</span>;
  };

  return (
    <div className="medicines-container">
      <div className="medicines-header">
        <h3>💊 Medicines & Line Items</h3>
        <p className="subtitle">Total Items: <strong>{medicines.length}</strong></p>
      </div>

      <div className="medicines-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by INN name, dosage, or form..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="control-group">
          <label>Items per page:</label>
          <select 
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="results-info">
        Showing <strong>{filtered.length}</strong> of <strong>{medicines.length}</strong> items
      </div>

      <div className="table-wrapper">
        <table className="medicines-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('line_item_id')}>
                Item No <SortIcon columnKey="line_item_id" />
              </th>
              <th onClick={() => handleSort('inn_name')}>
                INN Name <SortIcon columnKey="inn_name" />
              </th>
              <th onClick={() => handleSort('dosage')}>
                Dosage <SortIcon columnKey="dosage" />
              </th>
              <th onClick={() => handleSort('form')}>
                Form <SortIcon columnKey="form" />
              </th>
              <th>Brand Allowed</th>
              <th>Generic Allowed</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((med, idx) => (
              <tr key={idx} className="medicine-row">
                <td className="item-no">
                  <strong>#{med.line_item_id}</strong>
                </td>
                <td className="inn-name">{med.inn_name}</td>
                <td className="dosage">{med.dosage}</td>
                <td className="form">
                  <span className="form-badge">{med.form}</span>
                </td>
                <td className="allowed">
                  {med.brand_allowed ? '✅' : '❌'}
                </td>
                <td className="allowed">
                  {med.generic_allowed ? '✅' : '❌'}
                </td>
                <td className="unit">{med.unit_of_issue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          <div className="page-info">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      <div className="medicines-footer">
        <div className="footer-stat">
          <p className="stat-label">Forms Distribution</p>
          <div className="forms-list">
            {[...new Set(medicines.map(m => m.form))].map(form => (
              <span key={form} className="form-tag">
                {form}: {medicines.filter(m => m.form === form).length}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicinesTable;
