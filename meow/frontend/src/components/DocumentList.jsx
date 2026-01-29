import React from 'react';
import './DocumentList.css';

const DocumentList = ({ documents, onSelectDocument, onRefresh }) => {
  if (documents.length === 0) {
    return (
      <div className="document-list-container">
        <div className="empty-state">
          <p className="empty-icon">📭</p>
          <h3>No Documents Found</h3>
          <p>Upload RFQ PDFs to get started</p>
          <button onClick={onRefresh} className="btn-refresh">
            🔄 Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="document-list-container">
      <div className="list-header">
        <h3>📋 Parsed Documents</h3>
        <p className="subtitle">Total: <strong>{documents.length}</strong></p>
      </div>

      <div className="documents-grid">
        {documents.map((doc, idx) => (
          <div key={idx} className="document-card">
            <div className="card-header">
              <h4>{doc.rfq_id || 'Unnamed RFQ'}</h4>
              <span className="doc-id" title={doc.document_id}>
                {doc.document_id.substring(0, 8)}...
              </span>
            </div>

            <div className="card-body">
              <div className="info-item">
                <span className="label">Organization:</span>
                <span className="value">{doc.issuer_org || 'Unknown'}</span>
              </div>
              <div className="info-item">
                <span className="label">Items:</span>
                <span className="value badge">{doc.total_line_items || 0}</span>
              </div>
              <div className="info-item">
                <span className="label">Parsed:</span>
                <span className="value timestamp">
                  {new Date(doc.extracted_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="card-footer">
              <button
                onClick={() => onSelectDocument(doc.document_id)}
                className="btn-view"
              >
                📊 View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;
