"use client";

import { useState } from "react";
import ContextPanel from "./components/ContextPanel";
import Editor from "./components/Editor";

export default function Home() {
  const [context, setContext] = useState("");

  return (
    <main className="main-layout">
      <aside className="sidebar">
        <h3>Shortcuts</h3>
        <ul>
          <li>
            <kbd>Tab</kbd> <span>Get Suggestion</span>
          </li>
          <li>
            <kbd>Cmd</kbd>+<kbd>Y</kbd> <span>Accept Suggestion</span>
          </li>
          <li>
            <kbd>Cmd</kbd>+<kbd>K</kbd> <span>Refactor Selection</span>
          </li>
          <li>
            <kbd>Cmd</kbd>+<kbd>G</kbd> <span>Expand Headline</span>
          </li>
        </ul>
      </aside>
      <div className="content-area">
        <ContextPanel context={context} setContext={setContext} />
        <Editor context={context} />
      </div>
      <style jsx>{`
        .main-layout {
          display: flex;
          height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
        }
        .sidebar {
          width: 250px;
          padding: 2rem;
          border-right: 1px solid var(--border);
          font-size: 0.9rem;
        }
        .sidebar h3 {
          margin-bottom: 1.5rem;
          font-size: 0.8rem;
          text-transform: uppercase;
          color: var(--muted);
          letter-spacing: 1px;
        }
        .sidebar ul {
          list-style: none;
        }
        .sidebar li {
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--foreground);
        }
        kbd {
          background: rgba(0,0,0,0.05);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 0.1rem 0.4rem;
          font-family: var(--font-mono);
          font-size: 0.8rem;
        }
        .content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 2rem;
          height: 100%;
        }
      `}</style>
    </main>
  );
}
