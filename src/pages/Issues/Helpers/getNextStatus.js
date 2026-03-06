export const returnButtonText = (status) => {
  if (status === "new") return "Assign";
  if (status === "assigned") return "Mark In Progress";
  if (status === "in_progress") return "Mark On Hold";
  if (status === "on_hold") return "Pending User";
  if (status === "pending_user") return "Pending Change/Release";
  if (status === "pending_release") return "Resolved";

  return null;
};

export const getNextStatus = (status) => {
  if (status === "new") return "assigned";
  if (status === "assigned") return "in_progress";
  if (status === "in_progress") return "on_hold";
  if (status === "on_hold") return "pending_user";
  if (status === "pending_user") return "pending_release";
  if (status === "pending_release") return "resolved";

  return null;
};