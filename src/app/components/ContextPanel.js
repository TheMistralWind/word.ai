"use client";

import { useState, useRef } from "react";

export default function ContextPanel({ context, setContext }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const separator = context ? "\n\n" : "";
      setContext(context + separator + `--- [File: ${file.name}] ---\n` + text);
    };
    reader.readAsText(file);

    // Reset input so the same file can be selected again if needed
    e.target.value = null;
  };

  return (
    <div className={`context-panel ${isExpanded ? "expanded" : "collapsed"}`}>
      <div className="header">
        <div className="title-group" onClick={() => setIsExpanded(!isExpanded)}>
          <h3>Writing Context</h3>
          <span className="toggle-icon">{isExpanded ? "−" : "+"}</span>
        </div>

        {isExpanded && (
          <button
            className="import-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Import text file"
          >
            Import File
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".txt,.md,.json,.csv"
          style={{ display: 'none' }}
        />
      </div>

      {isExpanded && (
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Describe what you want to write (e.g., 'A sci-fi story about a robot who loves gardening')... or import a file."
        />
      )}
      <style jsx>{`
        .context-panel {
          background: var(--background);
          border-bottom: 1px solid var(--border);
          padding: 1rem 0;
          margin-bottom: 2rem;
          transition: all 0.3s ease;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .title-group {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
          gap: 0.5rem;
        }
        h3 {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
          font-weight: 600;
        }
        .toggle-icon {
          font-size: 1.2rem;
          color: var(--muted);
        }
        .import-btn {
          font-size: 0.8rem;
          color: var(--accent);
          border: 1px solid var(--accent);
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .import-btn:hover {
          background: var(--accent);
          color: var(--accent-foreground);
        }
        textarea {
          width: 100%;
          min-height: 80px;
          padding: 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          resize: vertical;
          font-size: 0.95rem;
          line-height: 1.5;
          background: rgba(0, 0, 0, 0.02);
          color: var(--foreground);
        }
        textarea:focus {
          background: var(--background);
          border-color: var(--accent);
          box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
