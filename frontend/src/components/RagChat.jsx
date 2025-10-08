import React, { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { useParams } from "react-router";

const API_BASE = "https://teachers-toolkit-ai-backend-latest.onrender.com";
// const API_BASE ="http://localhost:5000"

const colors = {
  teal: "#006D77",
  mint: "#83C5BE",
  light: "#EDF6F9",
  peach: "#FFDDD2",
  tan: "#E29578",
};

export default function RagChat() {
  const { session } = useParams();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef();

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!query.trim() || !session) return;
    const userMsg = { role: "user", content: query.trim() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setQuery("");
    setStreaming(true);

    try {
      const res = await fetch(`${API_BASE}/ragChat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg.content,sessionid: session, history: newHistory }),
      });

      if (!res.ok) throw new Error(await res.text());
      const reader = res.body?.getReader();
      if (!reader) return;

      let assistantText = "";
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value);
        setMessages((m) => {
          const copy = [...m];
          if (copy.length && copy[copy.length - 1].role === "assistant") {
            copy[copy.length - 1].content = assistantText;
          } else {
            copy.push({ role: "assistant", content: assistantText });
          }
          return copy;
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div style={{ background: colors.light, minHeight: "100%", padding: 20 }}>
      <div style={{
        maxWidth: 920, margin: "0 auto", background: "#fff",
        borderRadius: 12, padding: 14, border: `3px solid ${colors.mint}`,
      }}>
        <h2 style={{ color: colors.teal }}>Study Chat</h2>

        <div ref={containerRef} style={{
          height: 360, overflow: "auto", padding: 12,
          border: `1px solid ${colors.peach}`, borderRadius: 8,
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{ textAlign: m.role === "user" ? "right" : "left" }}>
              <div style={{
                display: "inline-block", maxWidth: "80%", padding: "8px 12px",
                borderRadius: 10, background: m.role === "user" ? colors.mint : colors.light,
                margin: "4px 0"
              }}>
                {/* <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{m.content}</pre> */}
                <Markdown style={{ margin: 0, whiteSpace: "pre-wrap" }}>{m.content}</Markdown>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} style={{ display: "flex", marginTop: 10 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask something…"
            style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${colors.mint}` }}
          />
          <button type="submit" disabled={streaming} style={btnStyle(colors.teal)}>
            {streaming ? "…" : "Send"}
          </button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

const btnStyle = (bg) => ({
  background: bg, color: "#fff", border: "none", padding: "8px 12px",
  borderRadius: 8, cursor: "pointer", fontWeight: 700,
});

// import React from 'react'
// import { useParams } from "react-router";

// function RagChat() {
//   const { session } = useParams();

//   return (
//     <div>

//     </div>
//   )
// }

// export default RagChat


