import React, { useState, useEffect } from 'react';
import './App.css';
import PDFUploader from './components/PDFUploader';
import DocumentDashboard from './components/DocumentDashboard';
import DocumentList from './components/DocumentList';

function App() {
  const [documentId, setDocumentId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [currentView, setCurrentView] = useState('upload'); // upload, dashboard, list
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:5001/api';

  useEffect(() => {
    if (currentView === 'list') {
      fetchDocuments();
    }
  }, [currentView]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE}/documents`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleDocumentUploaded = (docId) => {
    setDocumentId(docId);
    setCurrentView('dashboard');
  };

  const handleDocumentSelected = (docId) => {
    setDocumentId(docId);
    setCurrentView('dashboard');
  };

  const handleNewUpload = () => {
    setDocumentId(null);
    setCurrentView('upload');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🏥 EASEMED RFQ Parser</h1>
          <p>Extract & Analyze Request for Quotations</p>
        </div>
        <nav className="app-nav">
          <button 
            className={`nav-btn ${currentView === 'upload' ? 'active' : ''}`}
            onClick={() => setCurrentView('upload')}
          >
            📤 Upload
          </button>
          <button 
            className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => documentId && setCurrentView('dashboard')}
            disabled={!documentId}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-btn ${currentView === 'list' ? 'active' : ''}`}
            onClick={() => setCurrentView('list')}
          >
            📋 Documents
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentView === 'upload' && (
          <PDFUploader onDocumentUploaded={handleDocumentUploaded} />
        )}

        {currentView === 'dashboard' && documentId && (
          <DocumentDashboard 
            documentId={documentId}
            onNewUpload={handleNewUpload}
          />
        )}

        {currentView === 'list' && (
          <DocumentList 
            documents={documents}
            onSelectDocument={handleDocumentSelected}
            onRefresh={fetchDocuments}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>EASEMED RFQ Parser v1.0 | Powered by PDF Intelligence</p>
      </footer>
    </div>
  );
}

export default App;
