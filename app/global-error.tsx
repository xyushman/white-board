"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "3rem", fontWeight: 600 }}>500</h1>
          <p style={{ color: "#6b6b6b" }}>Something went wrong.</p>
          <button
            onClick={reset}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1.5rem",
              borderRadius: "9999px",
              border: "1px solid #dadada",
              background: "#0b0b0b",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

