import React, { useState } from 'react';
import './JSONViewer.css';

const JSONViewer = ({ data }) => {
  const [expandedKeys, setExpandedKeys] = useState(new Set(['metadata', 'vendor_requirements']));
  const [copied, setCopied] = useState(false);

  const toggleKey = (key) => {
    const newSet = new Set(expandedKeys);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedKeys(newSet);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderValue = (value, depth = 0) => {
    if (value === null) return <span className="json-null">null</span>;
    if (value === true) return <span className="json-bool">true</span>;
    if (value === false) return <span className="json-bool">false</span>;
    if (typeof value === 'number') return <span className="json-number">{value}</span>;
    if (typeof value === 'string') return <span className="json-string">"{value}"</span>;
    if (Array.isArray(value)) return renderArray(value, depth);
    if (typeof value === 'object') return renderObject(value, depth);
    return <span>{String(value)}</span>;
  };

  const renderArray = (arr, depth) => {
    if (arr.length === 0) return <span className="json-bracket">[]</span>;
    
    return (
      <div className="json-array">
        <span className="json-bracket">[</span>
        <div className="json-items" style={{ marginLeft: `${(depth + 1) * 16}px` }}>
          {arr.map((item, idx) => (
            <div key={idx} className="json-item">
              {renderValue(item, depth + 1)}
              {idx < arr.length - 1 && <span>,</span>}
            </div>
          ))}
        </div>
        <span className="json-bracket">]</span>
      </div>
    );
  };

  const renderObject = (obj, depth) => {
    const keys = Object.keys(obj);
    if (keys.length === 0) return <span className="json-bracket">{}</span>;

    const isExpanded = expandedKeys.has(String(depth));

    return (
      <div className="json-object">
        <span 
          className="json-bracket expandable"
          onClick={() => toggleKey(String(depth))}
        >
          {isExpanded ? '▼' : '▶'} {'{'}
        </span>
        {isExpanded && (
          <div className="json-properties" style={{ marginLeft: `${(depth + 1) * 16}px` }}>
            {keys.map((key, idx) => (
              <div key={idx} className="json-property">
                <span className="json-key">"{key}"</span>
                <span>: </span>
                {renderValue(obj[key], depth + 1)}
                {idx < keys.length - 1 && <span>,</span>}
              </div>
            ))}
          </div>
        )}
        <span className="json-bracket">{'}'}</span>
      </div>
    );
  };

  return (
    <div className="json-viewer-container">
      <div className="json-header">
        <h3>📄 Raw JSON Export</h3>
        <button 
          className="copy-btn"
          onClick={copyToClipboard}
          title="Copy to clipboard"
        >
          {copied ? '✅ Copied!' : '📋 Copy JSON'}
        </button>
      </div>

      <div className="json-content">
        <pre className="json-pre">
          <code className="json-code">
            {JSON.stringify(data, null, 2)}
          </code>
        </pre>
      </div>

      <div className="json-footer">
        <p>💡 Tip: Use this JSON for programmatic integration with your EASEMED backend</p>
      </div>
    </div>
  );
};

export default JSONViewer;
