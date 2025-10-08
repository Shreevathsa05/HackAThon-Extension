import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

const API_BASE = "https://hackathon-extension.onrender.com";
const colors = {
  teal: "#006D77",
  mint: "#83C5BE",
  light: "#EDF6F9",
  peach: "#FFDDD2",
  tan: "#E29578",
};

export default function FlashCardComponent() {
  const { session } = useParams();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetchCards();
  }, [session]);

  async function fetchCards() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/flashcards/${session}`);
      if (!res.ok) throw new Error("Upload a valid pdf\n Wait a minute");
      const data = await res.json();
      setCards(data.flashcards || []);
      setIndex(0);
      setFlipped(false);
    } catch (err) {
      setError("...Wait a minute... OR ...Upload a valid pdf... ");
    } finally {
      setLoading(false);
    }
  }

  function nextCard() {
    setFlipped(false);
    setIndex((prev) => (prev + 1) % cards.length);
  }

  function prevCard() {
    setFlipped(false);
    setIndex((prev) => (prev - 1 + cards.length) % cards.length);
  }

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!cards.length) return <p style={{ textAlign: "center" }}>No flashcards found.</p>;

  const card = cards[index];

  return (
    <div style={{ background: colors.light, minHeight: "100vh", padding: 40 }}>
      <div style={{
        maxWidth: 600, margin: "0 auto", textAlign: "center"
      }}>
        <h2 style={{ color: colors.teal }}>Flashcards</h2>
        <div
          onClick={() => setFlipped(!flipped)}
          style={{
            margin: "40px auto",
            width: 400,
            height: 250,
            perspective: "1000px",
            cursor: "pointer"
          }}
        >
          <div style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transition: "transform 0.6s",
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "none"
          }}>
            {/* FRONT */}
            <div style={cardFace(colors.peach, false)}>
              <h3 style={{ color: colors.teal }}>{card.title}</h3>
              <p style={{ fontSize: "1.2rem" }}>Tap to reveal answer</p>
            </div>
            {/* BACK */}
            <div style={cardFace("#fff", true)}>
              {Array.isArray(card.body)
                ? <ul>{card.body.map((b, i) => <li key={i}>{b}</li>)}</ul>
                : <p>{card.body}</p>}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <button onClick={prevCard} style={btnStyle(colors.teal)}>◀ Prev</button>
          <button onClick={fetchCards} style={btnStyle(colors.mint)}>⟳ Refresh</button>
          <button onClick={nextCard} style={btnStyle(colors.tan)}>Next ▶</button>
        </div>

        <p style={{ marginTop: 12 }}>
          Card {index + 1} of {cards.length}
        </p>
      </div>
    </div>
  );
}

const cardFace = (bg, back) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  backfaceVisibility: "hidden",
  background: bg,
  color: "#333",
  borderRadius: 12,
  boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
  padding: 20,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  transform: back ? "rotateY(180deg)" : "none",
});

const btnStyle = (bg) => ({
  background: bg,
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
  color: "#fff",
  fontWeight: 600
});

// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router";

// const API_BASE = "https://teachers-toolkit-ai-backend-latest.onrender.com";
// const colors = {
//   teal: "#006D77",
//   mint: "#83C5BE",
//   light: "#EDF6F9",
//   peach: "#FFDDD2",
//   tan: "#E29578",
// };

// export default function FlashCardComponent() {
//   const { session } = useParams();
//   const [cards, setCards] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [expanded, setExpanded] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!session) return;
//     fetchCards();
//     // eslint-disable-next-line
//   }, [session]);

//   async function fetchCards() {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/flashcards/${session}`);
//       if (!res.ok) throw new Error("Failed fetching flashcards");
//       const data = await res.json();
//       setCards(data.flashcards || []);
//     } catch (err) {
//       setError(err.message || "Error");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div style={{ background: colors.light, minHeight: "100%", padding: 20 }}>
//       <div style={{
//         maxWidth: 920, margin: "0 auto", background: "#fff",
//         borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
//         padding: 18, border: `4px solid ${colors.teal}`
//       }}>
//         <header style={{ display: "flex", justifyContent: "space-between" }}>
//           <h2 style={{ color: colors.teal }}>Flashcards</h2>
//           <button onClick={fetchCards} style={btnStyle(colors.mint)}>Refresh</button>
//         </header>

//         {loading && <p>Loading…</p>}
//         {error && <p style={{ color: "red" }}>{error}</p>}
//         {!loading && cards.length === 0 && <p>No flashcards found.</p>}

//         {cards.map((card, idx) => (
//           <div key={idx} style={{ marginBottom: 12 }}>
//             <div
//               style={{
//                 padding: "10px 12px",
//                 background: colors.peach,
//                 borderRadius: 8,
//                 cursor: "pointer",
//                 border: `1px solid ${colors.tan}`,
//               }}
//               onClick={() => setExpanded(expanded === idx ? null : idx)}
//             >
//               <strong style={{ color: colors.teal }}>{card.title}</strong>
//               <span style={{ float: "right" }}>{expanded === idx ? "▲" : "▼"}</span>
//             </div>
//             {expanded === idx && (
//               <div style={{
//                 padding: 12,
//                 background: "#fff",
//                 border: `1px solid ${colors.mint}`,
//                 borderTop: "none",
//                 borderRadius: "0 0 8px 8px"
//               }}>
//                 {Array.isArray(card.body) ? (
//                   <ul>{card.body.map((b, i) => <li key={i}>{b}</li>)}</ul>
//                 ) : <p>{card.body}</p>}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// const btnStyle = (bg) => ({
//   background: bg, border: "none", padding: "8px 12px",
//   borderRadius: 8, cursor: "pointer", color: "#fff", fontWeight: 600
// });

