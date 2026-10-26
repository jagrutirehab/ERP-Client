export const PILOT_CENTER_IDS = [
  "668e50d6f2faa02cf9ada8e4",
  "694e565ed6e6dd32a39c9815",
  "65ce3220dfed79197f913958",
];

export const isPilotCenterRow = (center) => {
  if (!center) return false;
  const id = typeof center === "string" ? center : center?._id;
  return PILOT_CENTER_IDS.includes(id);
};
