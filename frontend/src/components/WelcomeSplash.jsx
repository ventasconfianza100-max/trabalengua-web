import { useEffect, useState } from "react";

const STORAGE_KEY = "tw_welcomed";

export function WelcomeSplash() {
  // Synchronous init — no re-render gap, no flicker
  const [show] = useState(() => !sessionStorage.getItem(STORAGE_KEY));
  const [contentIn, setContentIn] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem(STORAGE_KEY, "1");

    const raf = requestAnimationFrame(() => setContentIn(true));
    const t1 = setTimeout(() => setLeaving(true), 2000);
    const t2 = setTimeout(() => setDone(true), 2580);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [show]);

  if (!show || done) return null;

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => setDone(true), 560);
  };

  return (
    <div
      onClick={dismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Overlay starts fully opaque — no flicker
        opacity: leaving ? 0 : 1,
        transition: leaving ? "opacity 0.55s ease-in" : "none",
        pointerEvents: leaving ? "none" : "auto",
      }}
    >
      {/* Inner content slides + fades in */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          opacity: contentIn ? 1 : 0,
          transform: contentIn ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Logo circular */}
        <img
          src="/trabalengua-logo.png"
          alt="Trabalengua"
          style={{
            width: "72px",
            height: "72px",
            objectFit: "cover",
            borderRadius: "50%",
            marginBottom: "10px",
          }}
        />

        {/* Eyebrow */}
        <span
          style={{
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#FF4D4D",
          }}
        >
          Bienvenido
        </span>

        {/* Brand name */}
        <h1
          style={{
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontSize: "clamp(2.2rem, 7vw, 3.5rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#0A0A0A",
            margin: 0,
            lineHeight: 1,
          }}
        >
          Trabalengua
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            color: "#9CA3AF",
            margin: 0,
          }}
        >
          Uniformes Escolares
        </p>

        {/* Animated red line */}
        <div
          style={{
            marginTop: "14px",
            width: contentIn ? "40px" : "0px",
            height: "2px",
            backgroundColor: "#FF4D4D",
            borderRadius: "1px",
            transition: "width 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s",
          }}
        />
      </div>
    </div>
  );
}
