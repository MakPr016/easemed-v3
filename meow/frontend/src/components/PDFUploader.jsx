import React, { useState } from 'react';
import './PDFUploader.css';

const PDFUploader = ({ onDocumentUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const API_BASE = 'http://localhost:5001/api';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please drop a PDF file');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please select a PDF file');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Step 1: Upload file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      const documentId = uploadData.document_id;

      // Step 2: Parse document
      const parseResponse = await fetch(`${API_BASE}/parse/${documentId}`, {
        method: 'POST',
      });

      if (!parseResponse.ok) {
        throw new Error('Parsing failed');
      }

      // Success - notify parent
      onDocumentUploaded(documentId);
      setFile(null);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="uploader-container">
      <div className="uploader-card">
        <h2>📄 Upload RFQ PDF</h2>
        <p className="subtitle">Drop your RFQ document or click to select</p>

        <div
          className={`dropzone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="file-selected">
              <span className="file-icon">📎</span>
              <p className="file-name">{file.name}</p>
              <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <>
              <span className="dropzone-icon">⬇️</span>
              <p className="dropzone-text">
                Drag and drop your PDF here
              </p>
              <p className="dropzone-subtext">or click below to browse</p>
            </>
          )}
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="file-input"
            disabled={uploading}
          />
        </div>

        {error && <div className="error-message">❌ {error}</div>}

        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? (
            <>
              <span className="spinner"></span> Parsing...
            </>
          ) : (
            <>
              🚀 Parse RFQ
            </>
          )}
        </button>

        <div className="info-box">
          <h3>ℹ️ What we extract:</h3>
          <ul>
            <li>✅ RFQ Metadata (ID, dates, currency, deadlines)</li>
            <li>✅ Vendor Requirements (qualifications, documents, compliance)</li>
            <li>✅ Medicines/Line Items (159+ items with specifications)</li>
            <li>✅ Delivery Requirements (location, transport, expiry)</li>
            <li>✅ Evaluation Criteria (scoring method, post-qualification)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFUploader;
