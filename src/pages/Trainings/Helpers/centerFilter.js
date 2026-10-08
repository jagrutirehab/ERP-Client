import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

export const buildCenterOptions = (user) => {
  const access = user?.centerAccess || [];
  const centers = access
    .map((id) => ({
      value: id,
      label: user?.userCenters?.find((center) => center._id === id)?.title || "Unknown Center",
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return [...(access.length > 1 ? [{ value: "ALL", label: "All Centers" }] : []), ...centers];
};

export const useCenterFilter = () => {
  const user = useSelector((state) => state.User);
  const options = useMemo(() => buildCenterOptions(user), [user]);
  const [selected, setSelected] = useState("ALL");

  const centerIds = useMemo(
    () => options.filter((option) => option.value !== "ALL").map((option) => option.value),
    [options],
  );

  const value = options.length === 1 ? options[0].value : selected;

  const cntrs = useMemo(() => {
    if (value === "") return "";
    if (value === "ALL") return centerIds.join(",");
    return centerIds.includes(value) ? value : "";
  }, [value, centerIds]);

  return { options, value, cntrs, onChange: setSelected };
};
