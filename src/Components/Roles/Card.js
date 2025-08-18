export const Card = ({ children, className = "" }) => (
  <div
    style={{
      minWidth: "250px",
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      transition: "box-shadow 0.3s ease-in-out",
    }}
    className={className}
  >
    {children}
  </div>
);
