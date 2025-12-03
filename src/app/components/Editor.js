"use client";

import { useState, useRef, useEffect } from "react";

export default function Editor({ context }) {
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState("");
    const textareaRef = useRef(null);

    const handleKeyDown = async (e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            if (suggestion) {
                // Accept suggestion
                insertText(suggestion);
                setSuggestion("");
            } else {
                // Trigger completion
                await fetchCompletion();
            }
        }
    };

    const insertText = (text) => {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const newContent = content.substring(0, start) + text + content.substring(end);
        setContent(newContent);

        // Restore cursor position after insertion
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + text.length;
            textarea.focus();
        }, 0);
    };

    const fetchCompletion = async () => {
        if (!content.trim() && !context.trim()) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/completion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: content,
                    context: context
                }),
            });

            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.json();
            if (data.completion) {
                // For now, just insert it directly or set as suggestion
                // The user asked for "Tab to place the word", implying we might show it first?
                // Or "suggests the next word... placed by clicking tab".
                // Let's insert it directly for now as a "Tab to autocomplete" flow.
                insertText(data.completion);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="editor-container">
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Start writing here... Press Tab to let AI suggest the next words."
                className="editor"
                spellCheck="false"
            />
            {isLoading && <div className="loading-indicator">AI is thinking...</div>}

            <style jsx>{`
        .editor-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .editor {
          flex: 1;
          width: 100%;
          padding: 3rem;
          font-size: 1.1rem;
          line-height: 1.8;
          border: none;
          resize: none;
          background: var(--background);
          color: var(--foreground);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border-radius: 8px;
          font-family: 'Georgia', serif; /* More writer-friendly font */
        }
        .editor:focus {
          outline: none;
        }
        .loading-indicator {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          font-size: 0.8rem;
          color: var(--muted);
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
}
