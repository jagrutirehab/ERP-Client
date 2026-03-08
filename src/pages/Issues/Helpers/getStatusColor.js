export const getStatusColor = (status) => {
  const statusColors = {
    new: "primary",
    assigned: "info",
    in_progress: "warning",
    on_hold: "secondary",
    pending_user: "dark",
    pending_release: "warning",
    resolved: "success",
    closed: "secondary",
    approved: "success"
  };

  return statusColors[status] || "light";
};