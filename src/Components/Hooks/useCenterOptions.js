import { useMemo } from "react";
import { useSelector } from "react-redux";

/**
 *
 * @param {Object} [options]
 * @param {boolean} [options.includeAll=true] Prepend an "All Centers" option
 *        (only when the user has more than one accessible center).
 * @returns {{ value: string, label: string, isDisabled?: boolean }[]}
 */
export const useCenterOptions = ({ includeAll = true } = {}) => {
  const centers = useSelector((state) => state.Center.data);
  const centerAccess = useSelector((state) => state.User?.centerAccess);

  return useMemo(() => {
    const options = (centers || [])
      .filter((center) => centerAccess?.includes(center._id))
      .map((center) => ({
        value: center._id,
        label: center.title || "Unknown Center",
      }));

    if (includeAll && options.length > 1) {
      return [
        { value: "ALL", label: "All Centers", isDisabled: false },
        ...options,
      ];
    }

    return options;
  }, [centers, centerAccess, includeAll]);
};

export default useCenterOptions;
