"use client";

import { useState, useEffect } from "react";

export default function ContextPanel({ context, setContext }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`context-panel ${isExpanded ? "expanded" : "collapsed"}`}>
      <div className="header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>Writing Context</h3>
        <button>{isExpanded ? "−" : "+"}</button>
      </div>
      {isExpanded && (
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Describe what you want to write (e.g., 'A sci-fi story about a robot who loves gardening', 'A professional email to a client')..."
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
          cursor: pointer;
          margin-bottom: 0.5rem;
          user-select: none;
        }
        h3 {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
          font-weight: 600;
        }
        button {
          font-size: 1.2rem;
          color: var(--muted);
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
