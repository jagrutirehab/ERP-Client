import { useCallback, useEffect, useRef, useState } from "react";

export const useAccordion = (ids, { openFirst = false } = {}) => {
  const [openId, setOpenId] = useState(
    openFirst && ids.length > 0 ? ids[0] : null,
  );
  const previousIds = useRef(ids);
  const key = ids.join("|");

  useEffect(() => {
    const before = previousIds.current;
    const added = ids.filter((id) => !before.includes(id));

    if (added.length > 0) {
      setOpenId(added[added.length - 1]);
    } else if (openId !== null && !ids.includes(openId)) {
      setOpenId(null);
    }

    previousIds.current = ids;
  }, [key]);

  const toggle = useCallback(
    (id) => setOpenId((current) => (current === id ? null : id)),
    [],
  );

  return [openId, toggle];
};

export default useAccordion;
