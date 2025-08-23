import React, { useState, useRef } from "react";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

export default function App() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState("extractive");
  const [length, setLength] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState({
    summary: "",
    keywords: [],
    sentiment: "",
    word_count: 0,
    reading_time_minutes: 0,
  });

  const resultsRef = useRef(null);

  const reset = () => {
    setResult({
      summary: "",
      keywords: [],
      sentiment: "",
      word_count: 0,
      reading_time_minutes: 0,
    });
    setError("");
  };

  const scrollToResults = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const submitText = async (e) => {
    e.preventDefault();
    reset();
    if (!text.trim()) return setError("Please paste some text.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/analyze-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode, length }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Request failed");
      setResult(data);
      scrollToResults();
    } catch (err) {
      setError(err.message || "Failed to analyze text.");
    } finally {
      setLoading(false);
    }
  };

  const submitUrl = async (e) => {
    e.preventDefault();
    reset();
    if (!url.trim()) return setError("Please enter a URL.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/analyze-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode, length }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Request failed");
      setResult(data);
      scrollToResults();
    } catch (err) {
      setError(err.message || "Failed to analyze URL.");
    } finally {
      setLoading(false);
    }
  };

  const renderKeywords = () =>
    result.keywords?.map((k, i) => (
      <span key={i} style={styles.keyword}>{k}</span>
    ));

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Text Summariser</h1>

        <section style={styles.controls}>
          <div style={styles.controlRow}>
            <label style={styles.label}>Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              style={styles.select}
            >
              <option value="extractive">Extractive (fast)</option>
              <option value="abstractive">Abstractive (LLM)</option>
            </select>
          </div>

          <div style={styles.controlRow}>
            <label style={styles.label}>Summary Length</label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              style={styles.select}
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
        </section>

        <form onSubmit={submitText} style={styles.form}>
          <label style={styles.label}>Paste Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here..."
            rows={10}
            style={styles.textarea}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading && mode === "extractive" ? <Spinner /> : null}
            {loading ? "Analyzing…" : "Analyze Text"}
          </button>
        </form>

        <div style={styles.divider}><span>or</span></div>

        <form onSubmit={submitUrl} style={styles.form}>
          <label style={styles.label}>Analyze URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading && mode === "extractive" ? <Spinner /> : null}
            {loading ? "Fetching…" : "Analyze URL"}
          </button>
        </form>

        {error && <p style={styles.error}>⚠️ {error}</p>}

        {result.summary && (
          <section ref={resultsRef} style={{ ...styles.results, animation: "fadeIn 0.5s" }}>
            <h2 style={styles.h2}>Summary</h2>
            <p style={styles.summary}>
              {result.summary.split(" ").map((word, i) =>
                result.keywords.includes(word.toLowerCase()) ? (
                  <span key={i} style={styles.highlight}>{word} </span>
                ) : word + " "
              )}
            </p>

            <div style={styles.grid}>
              <div style={styles.stat}>
                <div style={styles.statLabel}>Word Count</div>
                <div style={styles.statValue}>{result.word_count}</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statLabel}>Reading Time</div>
                <div style={styles.statValue}>{result.reading_time_minutes} min</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statLabel}>Sentiment</div>
                <div style={styles.statValue}>{result.sentiment}</div>
              </div>
            </div>

            {result.keywords?.length > 0 && (
              <>
                <h3 style={styles.h3}>Keywords</h3>
                <div style={styles.chips}>{renderKeywords()}</div>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

// Spinner
const Spinner = () => (
  <span style={{ marginRight: 6, display: "inline-block", width: 14, height: 14, border: "2px solid #fff", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
);

// Styles
const styles = {
  page: { minHeight: "100vh", padding: 24, background: "#0f172a" },
  card: {
    maxWidth: 900,
    margin: "0 auto",
    background: "white",
    padding: 24,
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
  title: { marginTop: 0, marginBottom: 12 },
  controls: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 16,
  },
  controlRow: { display: "flex", gap: 8, alignItems: "center" },
  label: { fontWeight: 600, marginBottom: 8 },
  select: {
    padding: 8,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    width: "100%",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  form: { marginTop: 8, display: "grid", gap: 8 },
  textarea: { padding: 12, borderRadius: 8, border: "1px solid #e5e7eb", fontFamily: "inherit" },
  input: { padding: 12, borderRadius: 8, border: "1px solid #e5e7eb", fontFamily: "inherit" },
  button: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    background: "#111827",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "16px 0", color: "#6b7280" },
  results: { marginTop: 24 },
  h2: { margin: "16px 0 8px" },
  h3: { margin: "12px 0 8px" },
  summary: { lineHeight: 1.6 },
  highlight: { backgroundColor: "#fffa91", borderRadius: 4, padding: "0 2px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 },
  stat: { padding: 12, background: "#f3f4f6", borderRadius: 12, textAlign: "center" },
  statLabel: { fontSize: 12, color: "#6b7280" },
  statValue: { fontSize: 18, fontWeight: 700 },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  keyword: {
    background: "linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%)",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 13,
  },
  error: { color: "#b91c1c", fontWeight: 600, marginTop: 12 },
};