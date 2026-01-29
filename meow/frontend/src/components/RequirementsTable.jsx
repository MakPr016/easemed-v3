import React, { useState } from 'react';
import './RequirementsTable.css';

const RequirementsTable = ({ requirements }) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', ...new Set(requirements.map(r => r.category))];

  const filtered = requirements.filter(req => {
    const categoryMatch = filterCategory === 'all' || req.category === filterCategory;
    const searchMatch = req.requirement.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const categoryColors = {
    'Legal': '#e3f2fd',
    'Technical': '#f3e5f5',
    'Financial': '#e8f5e9',
    'Document': '#fff3e0'
  };

  const categoryIcons = {
    'Legal': '⚖️',
    'Technical': '🔧',
    'Financial': '💰',
    'Document': '📄'
  };

  return (
    <div className="requirements-container">
      <div className="requirements-header">
        <h3>Vendor Requirements & Eligibility Criteria</h3>
        <p className="subtitle">Total Requirements: <strong>{requirements.length}</strong></p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Filter by Category:</label>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search requirements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <p className="results-count">{filtered.length} requirement(s) found</p>
      </div>

      <div className="requirements-grid">
        {filtered.length > 0 ? (
          filtered.map((req, idx) => (
            <div
              key={idx}
              className="requirement-card"
              style={{ borderLeftColor: '#667eea' }}
            >
              <div className="req-header">
                <span className="req-icon">{categoryIcons[req.category] || '✓'}</span>
                <span className="req-category" style={{ backgroundColor: categoryColors[req.category] }}>
                  {req.category}
                </span>
                {req.mandatory && <span className="req-badge">Mandatory</span>}
              </div>
              <p className="req-text">{req.requirement}</p>
              {req.value && (
                <p className="req-value">📍 {req.value}</p>
              )}
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No requirements match your filters</p>
          </div>
        )}
      </div>

      <div className="summary-stats">
        <div className="stat">
          <span className="stat-icon">⚖️</span>
          <div>
            <p className="stat-label">Legal Requirements</p>
            <p className="stat-value">{requirements.filter(r => r.category === 'Legal').length}</p>
          </div>
        </div>
        <div className="stat">
          <span className="stat-icon">🔧</span>
          <div>
            <p className="stat-label">Technical Requirements</p>
            <p className="stat-value">{requirements.filter(r => r.category === 'Technical').length}</p>
          </div>
        </div>
        <div className="stat">
          <span className="stat-icon">💰</span>
          <div>
            <p className="stat-label">Financial Requirements</p>
            <p className="stat-value">{requirements.filter(r => r.category === 'Financial').length}</p>
          </div>
        </div>
        <div className="stat">
          <span className="stat-icon">📄</span>
          <div>
            <p className="stat-label">Documents Required</p>
            <p className="stat-value">{requirements.filter(r => r.category === 'Document').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementsTable;
