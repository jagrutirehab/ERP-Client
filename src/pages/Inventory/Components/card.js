export const Card = ({ children }) => (
  <div className="card border-primary rounded-lg shadow-lg bg-gradient-light hover-shadow">
    {children}
  </div>
);

export const CardContent = ({ children }) => (
  <div className="card-body p-4">{children}</div>
);