import React from 'react';
import './MetadataPanel.css';

const MetadataPanel = ({ metadata }) => {
  const { metadata: meta, delivery_requirements, evaluation_criteria, summary } = metadata;

  return (
    <div className="metadata-container">
      <div className="metadata-grid">
        {/* RFQ Metadata */}
        <div className="panel">
          <h3>📋 RFQ Information</h3>
          <div className="info-group">
            <label>RFQ ID</label>
            <p>{meta?.rfq_id || 'N/A'}</p>
          </div>
          <div className="info-group">
            <label>Organization</label>
            <p>{meta?.issuer_org || 'N/A'}</p>
          </div>
          <div className="info-group">
            <label>Issue Date</label>
            <p>{meta?.issue_date || 'N/A'}</p>
          </div>
          <div className="info-group">
            <label>Submission Deadline</label>
            <p>{meta?.submission_deadline || 'N/A'}</p>
          </div>
          <div className="info-group">
            <label>Currency</label>
            <p>{meta?.currency || 'USD'}</p>
          </div>
        </div>

        {/* Contract Terms */}
        <div className="panel">
          <h3>📜 Contract Terms</h3>
          <div className="info-group">
            <label>Contract Type</label>
            <p className="badge-info">{meta?.contract_type?.replace(/_/g, ' ').toUpperCase()}</p>
          </div>
          <div className="info-group">
            <label>Validity Period</label>
            <p>{meta?.quotation_validity_days || 'N/A'} days</p>
          </div>
          <div className="info-group">
            <label>Evaluation Method</label>
            <p>{meta?.evaluation_method?.replace(/_/g, ' ').toUpperCase()}</p>
          </div>
          <div className="info-group">
            <label>Vendors to Select</label>
            <p>{meta?.vendors_to_select || 'N/A'}</p>
          </div>
          <div className="info-group">
            <label>Local Vendors Only</label>
            <p>{meta?.local_only ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="panel">
          <h3>📦 Delivery Requirements</h3>
          <div className="info-group">
            <label>Delivery Location</label>
            <p>{delivery_requirements?.delivery_location || 'N/A'}</p>
          </div>
          <div className="info-group">
            <label>Transport Mode</label>
            <p>{delivery_requirements?.transport_mode?.toUpperCase() || 'N/A'}</p>
          </div>
          <div className="info-group">
            <label>Min Expiry (Medicines)</label>
            <p>{delivery_requirements?.min_expiry_months || 'N/A'} months</p>
          </div>
          <div className="info-group">
            <label>Customs</label>
            <p>{delivery_requirements?.customs_by?.replace(/_/g, ' ').toUpperCase() || 'N/A'}</p>
          </div>
          <div className="info-group">
            <label>Packaging</label>
            <p>{delivery_requirements?.packaging?.toUpperCase() || 'N/A'}</p>
          </div>
        </div>

        {/* Evaluation Criteria */}
        <div className="panel">
          <h3>✅ Evaluation Criteria</h3>
          <div className="info-group">
            <label>Primary Criteria</label>
            <p>{evaluation_criteria?.primary_criteria?.replace(/_/g, ' ').toUpperCase() || 'N/A'}</p>
          </div>
          <div className="info-group">
            <label>Post-Qualification</label>
            <p>{evaluation_criteria?.post_qualification_required ? '✅ Required' : '❌ Not Required'}</p>
          </div>
          {evaluation_criteria?.compliance_factors && (
            <div className="info-group">
              <label>Compliance Factors</label>
              <ul className="factor-list">
                {evaluation_criteria.compliance_factors.map((factor, idx) => (
                  <li key={idx}>✓ {factor.replace(/_/g, ' ')}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-section">
        <h3>📊 Summary</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">💊</span>
            <div>
              <p className="stat-label">Total Line Items</p>
              <p className="stat-number">{summary?.total_line_items || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📄</span>
            <div>
              <p className="stat-label">Required Documents</p>
              <p className="stat-number">{summary?.total_mandatory_documents || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏆</span>
            <div>
              <p className="stat-label">Vendor Selection</p>
              <p className="stat-number">{summary?.vendor_selection_method || 'Unknown'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataPanel;
