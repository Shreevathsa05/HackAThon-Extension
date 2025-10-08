import React, { useRef, useState } from "react";
import { useParams } from "react-router";

const API_BASE = "https://teachers-toolkit-ai-backend-latest.onrender.com";
const colors = {
  teal: "#006D77",
  mint: "#83C5BE",
  light: "#EDF6F9",
  peach: "#FFDDD2",
  tan: "#E29578",
};

export default function Uploader() {
  const { session } = useParams();
  const inputRef = useRef();
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  function pickFile() {
    inputRef.current.click();
  }

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  async function upload(file) {
    setStatus("Uploading...");
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/upload/document/${session}`, true);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setStatus(xhr.status === 200 ? "Uploaded successfully." : "Upload failed.");
    };
    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  }

  return (
    <div style={{ background: colors.light, minHeight: "100%", padding: 20 }}>
      <div style={{
        maxWidth: 600, margin: "0 auto", background: "#fff",
        borderRadius: 12, padding: 18, border: `3px solid ${colors.teal}`,
      }}>
        <h3 style={{ color: colors.teal }}>Upload a Document</h3>
        <input ref={inputRef} type="file" style={{ display: "none" }} onChange={onFileChange} />
        <button onClick={pickFile} style={btnStyle(colors.mint)}>Choose File</button>
        <div style={{ marginTop: 10 }}>{status}</div>
        <div style={{ marginTop: 6, height: 10, background: "#eee", borderRadius: 6 }}>
          <div style={{ width: `${progress}%`, background: colors.peach, height: "100%", borderRadius: 6 }} />
        </div>
      </div>
      <div className="mt-8 border-2 rounded-xl p-2 w-full "><b>Supported file types:</b> ".pdf", ".docx", ".doc", ".pptx", ".txt", ".csv", ".xlsx"</div>
    </div>
  );
}

const btnStyle = (bg) => ({
  background: bg, color: "#fff", border: "none",
  padding: "8px 12px", borderRadius: 8, cursor: "pointer",
});
