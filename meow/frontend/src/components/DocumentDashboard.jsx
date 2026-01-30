import React, { useState, useEffect } from 'react';
import './DocumentDashboard.css';
import RequirementsTable from './RequirementsTable';
import MedicinesTable from './MedicinesTable';
import MetadataPanel from './MetadataPanel';
import JSONViewer from './JSONViewer';

const DocumentDashboard = ({ documentId, onNewUpload }) => {
  const [document, setDocument] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const API_BASE = 'http://localhost:5001/api';

  useEffect(() => {
    fetchAllData();
  }, [documentId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [docRes, reqRes, medRes, metaRes] = await Promise.all([
        fetch(`${API_BASE}/document/${documentId}`),
        fetch(`${API_BASE}/document/${documentId}/requirements`),
        fetch(`${API_BASE}/document/${documentId}/medicines`),
        fetch(`${API_BASE}/document/${documentId}/metadata`),
      ]);

      if (!docRes.ok || !reqRes.ok || !medRes.ok || !metaRes.ok) {
        throw new Error('Failed to load document');
      }

      const docData = await docRes.json();
      const reqData = await reqRes.json();
      const medData = await medRes.json();
      const metaData = await metaRes.json();

      setDocument(docData);
      setRequirements(reqData.requirements || []);
      setMedicines(medData.medicines || []);
      setMetadata(metaData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const response = await fetch(`${API_BASE}/document/${documentId}/export/json`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Get the JSON blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const element = document.createElement('a');
      element.href = url;
      element.download = `rfq-${documentId.substring(0, 8)}.json`;
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(element);
      
      alert('✅ JSON exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('❌ Export failed. Please try again.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`${API_BASE}/document/${documentId}/export/csv`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Get the CSV blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const element = document.createElement('a');
      element.href = url;
      element.download = `medicines-${documentId.substring(0, 8)}.csv`;
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(element);
      
      alert('✅ CSV exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('❌ Export failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-panel">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={onNewUpload} className="btn-primary">
            Upload New Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-info">
          <h2>📊 RFQ Analysis Dashboard</h2>
          <p>Document ID: <code>{documentId}</code></p>
        </div>
        <div className="header-actions">
          <button onClick={handleExportJSON} className="btn-secondary">
            💾 Export JSON
          </button>
          <button onClick={handleExportCSV} className="btn-secondary">
            📊 Export CSV
          </button>
          <button onClick={onNewUpload} className="btn-secondary">
            📤 New Upload
          </button>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📋 Overview
          </button>
          <button
            className={`tab ${activeTab === 'requirements' ? 'active' : ''}`}
            onClick={() => setActiveTab('requirements')}
          >
            ✅ Requirements ({requirements.length})
          </button>
          <button
            className={`tab ${activeTab === 'medicines' ? 'active' : ''}`}
            onClick={() => setActiveTab('medicines')}
          >
            💊 Medicines ({medicines.length})
          </button>
          <button
            className={`tab ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            <code>{ }</code> JSON
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && metadata && (
          <MetadataPanel metadata={metadata} />
        )}

        {activeTab === 'requirements' && (
          <RequirementsTable requirements={requirements} />
        )}

        {activeTab === 'medicines' && (
          <MedicinesTable medicines={medicines} />
        )}

        {activeTab === 'json' && document && (
          <JSONViewer data={document} />
        )}
      </div>
    </div>
  );
};

export default DocumentDashboard;
