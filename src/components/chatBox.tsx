import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Ensure CSS is imported

import { runAgentTurn, type ChatMessage } from "../lib/agentRunner";

export default function ChatBox() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, streamingText]);

  async function handleSend() {
    const msg = input.trim();
    if (!msg || streaming) return;

    const userMessage: ChatMessage = { role: "user", content: msg };
    setHistory((h) => [...h, userMessage]);
    setInput("");
    setStreaming(true);
    setStreamingText("");

    try {
      let accumulated = "";

      const fullResponse = await runAgentTurn(history, msg, (delta) => {
        accumulated += delta;
        setStreamingText(accumulated);
      });

      setHistory((h) => [...h, { role: "assistant", content: fullResponse }]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      setHistory((h) => [...h, { role: "assistant", content: `${errMsg}` }]);
    } finally {
      setStreaming(false);
      setStreamingText("");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0f172a",
        borderTop: "1px solid #1e293b",
      }}
    >
      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "auto",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {history.length === 0 && !streaming && (
          <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>
            Ask me to add matrices, compute operations, or explain concepts.
          </p>
        )}

        {history.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {streaming && streamingText && (
          <MessageBubble
            message={{ role: "assistant", content: streamingText }}
            isStreaming
          />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "10px 16px",
          borderTop: "1px solid #1e293b",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="New Message..."
          disabled={streaming}
          style={{
            flex: 1,
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 6,
            color: "white",
            padding: "8px 12px",
            fontFamily: "monospace",
            fontSize: 13,
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={streaming || !input.trim()}
          style={{
            background: streaming ? "#334155" : "#38bdf8",
            color: streaming ? "#64748b" : "#0f172a",
            border: "none",
            borderRadius: 6,
            padding: "8px 16px",
            fontWeight: 600,
            cursor: streaming ? "not-allowed" : "pointer",
            fontSize: 13,
          }}
        >
          {streaming ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "85%",
      }}
    >
      <div
        style={{
          background: isUser ? "#1d4ed8" : "#1e293b",
          borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          padding: "8px 12px",
          fontSize: 13,
          color: "#e2e8f0",
          lineHeight: 1.6,
          opacity: isStreaming ? 0.85 : 1,
        }}
      >

        <style>{`
        .katex {
          white-space: nowrap;
        }
        .katex-display {
          overflow-x: auto;
          overflow-y: hidden;
          padding: 4px 0;
          margin: 0.5em 0 !important;
        }
      `}</style>


        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
            pre: ({ children }) => (
              <pre
                style={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 4,
                  padding: "8px 10px",
                  margin: "6px 0",
                  overflowX: "auto",
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "#38bdf8",
                }}
              >
                {children}
              </pre>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>

        {isStreaming && (
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 12,
              background: "#38bdf8",
              marginLeft: 2,
              animation: "blink 1s step-end infinite",
            }}
          />
        )}
      </div>
    </div>
  );
}