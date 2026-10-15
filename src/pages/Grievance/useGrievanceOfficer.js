import { useEffect, useState } from "react";
import axios from "axios";

import { GRIEVANCE_OFFICER, REDRESS_DAYS } from "./grievanceOfficer";

const API_BASE = process.env.REACT_APP_API_URL || "";

/**
 * The designated Grievance Officer, read from settings.
 *
 * Falls back to the constants in grievanceOfficer.js if the request fails, so a
 * backend outage degrades to whatever was last hard-coded rather than to a
 * blank page. Rule 5(9) asks for these details to be published; a page that
 * shows nothing because an API call failed is not publishing them.
 *
 * `published` comes from the server rather than being recomputed here, so the
 * public page and the privacy policy cannot disagree about whether an officer
 * has been designated.
 */
export const useGrievanceOfficer = () => {
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    axios
      .get(`${API_BASE}/grievance-officer`)
      .then(({ data }) => {
        if (!cancelled && data?.payload) setOfficer(data.payload);
      })
      .catch(() => {
        if (cancelled) return;
        setOfficer({
          ...GRIEVANCE_OFFICER,
          published: Boolean(
            GRIEVANCE_OFFICER.name &&
              GRIEVANCE_OFFICER.designation &&
              GRIEVANCE_OFFICER.email,
          ),
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { officer, loading, redressDays: REDRESS_DAYS };
};

export default useGrievanceOfficer;
