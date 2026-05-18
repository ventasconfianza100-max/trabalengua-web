import { useEffect, useState } from "react";

const STORAGE_KEY = "tw_welcomed";

export function WelcomeSplash() {
  const [phase, setPhase] = useState("in"); // "in" | "visible" | "out" | "done"

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      setPhase("done");
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, "1");

    const fadeIn = setTimeout(() => setPhase("visible"), 80);
    const fadeOut = setTimeout(() => setPhase("out"), 2200);
    const unmount = setTimeout(() => setPhase("done"), 2850);

    return () => {
      clearTimeout(fadeIn);
      clearTimeout(fadeOut);
      clearTimeout(unmount);
    };
  }, []);

  if (phase === "done") return null;

  const opacity = phase === "in" ? 0 : phase === "out" ? 0 : 1;
  const translateY = phase === "in" ? 8 : 0;

  return (
    <div
      onClick={() => setPhase("done")}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#FF4D4D",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        cursor: "pointer",
        opacity,
        transition: phase === "out"
          ? "opacity 0.55s cubic-bezier(0.4,0,1,1)"
          : "opacity 0.45s cubic-bezier(0.16,1,0.3,1)",
        userSelect: "none",
      }}
    >
      {/* Logo */}
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          transition: "transform 0.55s cubic-bezier(0.16,1,0.3,1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <img
          src="/trabalengua-logo.png"
          alt="Trabalengua"
          style={{
            width: "72px",
            height: "72px",
            objectFit: "contain",
            filter: "brightness(0) invert(1)",
          }}
        />

        {/* Eyebrow */}
        <p
          style={{
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.7)",
            margin: 0,
          }}
        >
          Bienvenido a
        </p>

        {/* Brand name */}
        <h1
          style={{
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontSize: "clamp(2.4rem, 8vw, 4rem)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "#ffffff",
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
            fontSize: "15px",
            fontWeight: 400,
            letterSpacing: "0.01em",
            color: "rgba(255,255,255,0.75)",
            margin: 0,
          }}
        >
          Uniformes Escolares
        </p>
      </div>

      {/* Divider line */}
      <div
        style={{
          width: "32px",
          height: "1px",
          backgroundColor: "rgba(255,255,255,0.35)",
          marginTop: "8px",
        }}
      />

      {/* Dismiss hint */}
      <p
        style={{
          fontFamily: "'Manrope', system-ui, sans-serif",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.45)",
          margin: 0,
          textTransform: "uppercase",
        }}
      >
        Toca para continuar
      </p>
    </div>
  );
}
