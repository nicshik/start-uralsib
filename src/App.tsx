import { useEffect } from "react";

const NEW_URL = "https://trailway.tech/start-uralsib/";

const App = () => {
  useEffect(() => {
    window.location.replace(NEW_URL);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        textAlign: "center",
        background: "#fff",
        color: "#111",
      }}
    >
      <h1 style={{ fontSize: "1.75rem", marginBottom: "12px" }}>Сайт переехал</h1>
      <p style={{ marginBottom: "24px", color: "#555" }}>
        Перенаправляем вас на новый адрес…
      </p>
      <a
        href={NEW_URL}
        style={{
          display: "inline-block",
          padding: "12px 24px",
          background: "#0a3d91",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Перейти на trailway.tech/start-uralsib
      </a>
    </main>
  );
};

export default App;
