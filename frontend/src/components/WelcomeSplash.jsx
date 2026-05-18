import { useEffect, useState } from "react";

const STORAGE_KEY = "tw_welcomed";

export function WelcomeSplash() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      setDone(true);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, "1");

    // Trigger enter animation on next frame
    const t1 = requestAnimationFrame(() => setVisible(true));
    const t2 = setTimeout(() => setLeaving(true), 2000);
    const t3 = setTimeout(() => setDone(true), 2600);

    return () => {
      cancelAnimationFrame(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (done) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: leaving ? 0 : visible ? 1 : 0,
        transition: leaving
          ? "opacity 0.55s ease-in"
          : "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: leaving ? "none" : "auto",
      }}
      onClick={() => { setLeaving(true); setTimeout(() => setDone(true), 560); }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          transform: visible && !leaving ? "translateY(0)" : "translateY(10px)",
          transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Logo */}
        <img
          src="/trabalengua-logo.png"
          alt=""
          style={{
            width: "64px",
            height: "64px",
            objectFit: "contain",
            marginBottom: "8px",
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

        {/* Brand */}
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
            letterSpacing: "0.01em",
          }}
        >
          Uniformes Escolares
        </p>

        {/* Red accent line */}
        <div
          style={{
            marginTop: "12px",
            width: visible && !leaving ? "40px" : "0px",
            height: "2px",
            backgroundColor: "#FF4D4D",
            borderRadius: "1px",
            transition: "width 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
          }}
        />
      </div>
    </div>
  );
}
