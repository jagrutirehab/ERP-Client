export const PILOT_CENTER_ID = "668e50d6f2faa02cf9ada8e4";

export const isPilotCenterRow = (center) => {
  if (!center) return false;
  const id = typeof center === "string" ? center : center?._id;
  return id === PILOT_CENTER_ID;
};
