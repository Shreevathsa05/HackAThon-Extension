import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Markdown from 'react-markdown'

const API_BASE = "https://teachers-toolkit-ai-backend-latest.onrender.com";
const colors = {
  teal: "#006D77",
  mint: "#83C5BE",
  light: "#EDF6F9",
  peach: "#FFDDD2",
  tan: "#E29578",
};

export default function SummaryComponent() {
  const { session } = useParams();
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) fetchSummary();
    // eslint-disable-next-line
  }, [session]);

  async function fetchSummary() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/summary/${session}`);
      const data = await res.json();
      if(data.summary=='No summary found.'){setSummary("Upload a document!! \n Wait for a minute");}
      else{setSummary(data.summary || "Upload a document!! \n Wait for a minute");}
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: colors.light, minHeight: "100%", padding: 20 }}>
      <div style={{
        maxWidth: 920, margin: "0 auto", background: "#fff",
        borderRadius: 12, padding: 18, border: `3px solid ${colors.tan}`,
      }}>
        <h2 style={{ color: colors.teal }}>Summary</h2>
        {loading ? <p>Loading…</p> : <Markdown >{summary}</Markdown>}
      </div>
    </div>
  );
}
