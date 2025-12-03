"use client";

import { useState, useRef, useEffect } from "react";

export default function Editor({ context }) {
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState("");
    const textareaRef = useRef(null);
    const backdropRef = useRef(null);
    const timeoutRef = useRef(null);

    // Sync scroll between textarea and backdrop
    const handleScroll = () => {
        if (backdropRef.current && textareaRef.current) {
            backdropRef.current.scrollTop = textareaRef.current.scrollTop;
            backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    const handleChange = (e) => {
        const newContent = e.target.value;
        setContent(newContent);
        setSuggestion(""); // Clear suggestion on type

        // Debounce fetch
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (newContent.trim().length > 5) { // Only fetch if there's some content
            timeoutRef.current = setTimeout(() => {
                fetchCompletion(newContent);
            }, 1000); // 1 second pause triggers fetch
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            if (suggestion) {
                // Accept suggestion
                const newContent = content + suggestion;
                setContent(newContent);
                setSuggestion("");

                // Restore focus and move cursor to end
                setTimeout(() => {
                    if (textareaRef.current) {
                        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newContent.length;
                        textareaRef.current.focus();
                    }
                }, 0);
            }
        }
    };

    const fetchCompletion = async (currentContent) => {
        if (!currentContent.trim()) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/completion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: currentContent,
                    context: context
                }),
            });

            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.json();
            if (data.completion) {
                setSuggestion(data.completion);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="editor-wrapper">
            <div className="container">
                <div className="backdrop" ref={backdropRef}>
                    <div className="highlights">
                        {content}
                        <span className="ghost">{suggestion}</span>
                    </div>
                </div>
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onScroll={handleScroll}
                    placeholder="Start writing here..."
                    className="editor"
                    spellCheck="false"
                />
            </div>

            {isLoading && <div className="status">AI is thinking...</div>}

            <style jsx>{`
        .editor-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          height: 100%;
        }
        .container {
          position: relative;
          width: 100%;
          height: 100%;
          flex: 1;
        }
        
        /* Shared styles for perfect alignment */
        .backdrop, .editor {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          padding: 3rem;
          font-size: 1.1rem;
          line-height: 1.8;
          font-family: 'Georgia', serif;
          border-radius: 8px;
          box-sizing: border-box;
          white-space: pre-wrap;
          overflow-wrap: break-word;
        }

        .backdrop {
          z-index: 1;
          background-color: var(--background);
          color: transparent; /* Hide the main text in backdrop */
          pointer-events: none;
          overflow: hidden; /* Scroll is controlled by textarea */
          border: 1px solid transparent; /* Match textarea border if any */
        }

        .highlights {
          color: transparent;
        }

        .ghost {
          color: #a0a0a0; /* Grey text for suggestion */
          opacity: 0.6;
        }

        .editor {
          z-index: 2;
          background-color: transparent;
          color: var(--foreground);
          border: none;
          resize: none;
        }
        
        .editor:focus {
          outline: none;
        }

        .status {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          font-size: 0.8rem;
          color: var(--muted);
          pointer-events: none;
        }
      `}</style>
        </div>
    );
}
