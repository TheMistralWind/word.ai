"use client";

import { useState, useRef, useEffect } from "react";
import { diffWords } from "diff";

export default function Editor({ context }) {
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState("");

    // Refactor state
    const [showRefactorModal, setShowRefactorModal] = useState(false);
    const [refactorInstruction, setRefactorInstruction] = useState("");
    const [selectedText, setSelectedText] = useState("");
    const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
    const [diffResult, setDiffResult] = useState(null);
    const [isRefactoring, setIsRefactoring] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

    const textareaRef = useRef(null);
    const backdropRef = useRef(null);
    const timeoutRef = useRef(null);
    const modalInputRef = useRef(null);

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
            }, 500); // 0.5 second pause triggers fetch
        }
    };

    const handleKeyDown = (e) => {
        // Cmd+K or Ctrl+K for Refactor
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
            e.preventDefault();
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;

            if (start !== end) {
                const selected = content.substring(start, end);
                setSelectedText(selected);
                setSelectionRange({ start, end });

                // Calculate position for modal (simplified approximation)
                // In a real app, we'd use getBoundingClientRect of a dummy element or similar
                // For now, we'll center it or place it near the top
                setModalPosition({ top: 100, left: '50%' });

                setShowRefactorModal(true);
                setDiffResult(null);
                setRefactorInstruction("");

                // Focus input after render
                setTimeout(() => modalInputRef.current?.focus(), 0);
            }
            return;
        }

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

    const handleRefactorSubmit = async (e) => {
        e.preventDefault();
        if (!refactorInstruction) return;

        setIsRefactoring(true);
        try {
            const res = await fetch("/api/refactor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    originalText: selectedText,
                    instruction: refactorInstruction
                }),
            });

            if (!res.ok) throw new Error("Failed to refactor");

            const data = await res.json();
            if (data.rewrittenText) {
                const diff = diffWords(selectedText, data.rewrittenText);
                setDiffResult(diff);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to refactor text");
        } finally {
            setIsRefactoring(false);
        }
    };

    const acceptRefactor = () => {
        if (!diffResult) return;

        // Reconstruct the full text from the diff (which is just the new text effectively)
        // But we want to replace the *selected* range in the original content

        // Construct new text from diff
        const newTextSegment = diffResult
            .filter(part => !part.removed)
            .map(part => part.value)
            .join("");

        const newContent =
            content.substring(0, selectionRange.start) +
            newTextSegment +
            content.substring(selectionRange.end);

        setContent(newContent);
        closeModal();
    };

    const closeModal = () => {
        setShowRefactorModal(false);
        setDiffResult(null);
        setRefactorInstruction("");
        // Return focus to editor
        textareaRef.current?.focus();
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
                    placeholder="Start writing here... (Select text and press Cmd+K to refactor)"
                    className="editor"
                    spellCheck="false"
                />
            </div>

            {isLoading && <div className="status">AI is thinking...</div>}

            {showRefactorModal && (
                <div className="refactor-modal-overlay">
                    <div className="refactor-modal">
                        {!diffResult ? (
                            <form onSubmit={handleRefactorSubmit}>
                                <h4>Refactor Selection</h4>
                                <div className="selected-preview">
                                    "{selectedText.length > 50 ? selectedText.substring(0, 50) + "..." : selectedText}"
                                </div>
                                <input
                                    ref={modalInputRef}
                                    type="text"
                                    value={refactorInstruction}
                                    onChange={(e) => setRefactorInstruction(e.target.value)}
                                    placeholder="How should I change this? (e.g., 'Make it punchier')"
                                    className="refactor-input"
                                    autoFocus
                                />
                                <div className="modal-actions">
                                    <button type="button" onClick={closeModal} className="cancel-btn">Cancel</button>
                                    <button type="submit" disabled={isRefactoring} className="submit-btn">
                                        {isRefactoring ? "Thinking..." : "Refactor"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="diff-view">
                                <h4>Review Changes</h4>
                                <div className="diff-content">
                                    {diffResult.map((part, index) => {
                                        const color = part.added ? '#e6ffec' : part.removed ? '#ffebe9' : 'transparent';
                                        const textDecoration = part.removed ? 'line-through' : 'none';
                                        const textColor = part.added ? '#1a7f37' : part.removed ? '#cf222e' : 'inherit';

                                        return (
                                            <span key={index} style={{ backgroundColor: color, textDecoration, color: textColor }}>
                                                {part.value}
                                            </span>
                                        );
                                    })}
                                </div>
                                <div className="modal-actions">
                                    <button onClick={closeModal} className="cancel-btn">Reject</button>
                                    <button onClick={acceptRefactor} className="submit-btn">Accept</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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

        /* Refactor Modal */
        .refactor-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.2);
            z-index: 100;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 20vh;
        }

        .refactor-modal {
            background: var(--background);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1.5rem;
            width: 500px;
            max-width: 90vw;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
            from { transform: translateY(-10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .refactor-modal h4 {
            margin: 0 0 1rem 0;
            font-size: 1rem;
            color: var(--foreground);
        }

        .selected-preview {
            font-size: 0.9rem;
            color: var(--muted);
            margin-bottom: 1rem;
            font-style: italic;
            border-left: 2px solid var(--border);
            padding-left: 0.5rem;
        }

        .refactor-input {
            width: 100%;
            padding: 0.8rem;
            border: 1px solid var(--border);
            border-radius: 6px;
            font-size: 1rem;
            margin-bottom: 1rem;
            background: var(--background);
            color: var(--foreground);
        }

        .refactor-input:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
        }

        .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
        }

        .submit-btn, .cancel-btn {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
            cursor: pointer;
            border: none;
        }

        .submit-btn {
            background: var(--accent);
            color: white;
        }

        .cancel-btn {
            background: transparent;
            color: var(--muted);
        }

        .cancel-btn:hover {
            background: rgba(0,0,0,0.05);
        }

        .diff-content {
            background: rgba(0,0,0,0.02);
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            line-height: 1.6;
            font-family: 'Georgia', serif;
        }
      `}</style>
        </div>
    );
}
