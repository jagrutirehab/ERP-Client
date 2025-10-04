export const StatusBadge = ({ status }) => {
  const styles =
    status === "LOW"
      ? "badge bg-danger bg-gradient text-white border border-danger"
      : "badge bg-success bg-gradient text-white border border-success";
  return (
    <span className={`px-3 py-1 font-weight-bold rounded-pill ${styles}`}>
      {status}
    </span>
  );
};
