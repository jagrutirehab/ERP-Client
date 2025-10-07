export const Button = ({ children, variant = "default", size = "md", onClick }) => {
  const base =
    "btn font-weight-bold transition-all duration-300 d-flex align-items-center justify-content-center shadow-sm";
  const variants = {
    default: "btn-primary bg-gradient-primary text-white",
    outline: "btn-outline-primary text-primary",
    danger: "btn-danger text-white",
    success: "btn-success text-white",
    ghost: "btn-outline-secondary text-dark",
  };
  const sizes = {
    md: "btn-md px-4 py-2",
    sm: "btn-sm px-3 py-1",
    icon: "p-2",
  };
  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </button>
  );
};