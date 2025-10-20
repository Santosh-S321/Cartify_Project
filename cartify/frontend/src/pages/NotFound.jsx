function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "4rem" }}>
      <h1 style={{ fontSize: "6rem" }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ margin: "1rem 0" }}>The page you're looking for doesn't exist.</p>
      <a href="/" style={{ color: "#667eea", fontSize: "1.2rem" }}>Go to Home</a>
    </div>
  );
}

export default NotFound;