import { useState, useEffect } from "react";
import { getRoles } from "../../helpers/backend_helper";
import { useAuthError } from "./useAuthError";

const typeRank = { NONE: 0, READ: 1, WRITE: 2, DELETE: 3 };

let rolesCache = null;

export const resetRolesCache = () => {
  rolesCache = null; 
};

export const usePermissions = (token) => {
  const [roles, setRoles] = useState(rolesCache);
  const [loading, setLoading] = useState(!rolesCache);
  const [error, setError] = useState(null);
  const handleAuthError = useAuthError();

  useEffect(() => {
    if (!token || rolesCache) return;

    const fetchRoles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getRoles(token);
        rolesCache = response.data;
        setRoles(response.data);
      } catch (error) {
        if (!handleAuthError(error)) {
          setError(error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const hasPermission = (module, subModule, requiredType = "NONE") => {
    if (!roles) return false;
    const requiredRank = typeRank[requiredType];

    return roles.permissions?.some((perm) => {
      if (perm.module !== module) return false;

      if (subModule) {
        const sub = perm.subModules?.find((s) => s.name === subModule);
        if (!sub) return false;

        return typeRank[sub.type] >= requiredRank;
      }

      return typeRank[perm.type] >= requiredRank;
    });
  };

  // An approval right lives in its own sub module (like Vendor Approval). A role that has not been given that sub module
  // yet keeps working: it falls back to WRITE on the base module, as before. Once the sub module is in the role, it alone decides.
  const hasApproval = (module, approvalSubModule, baseSubModule) => {
    if (!roles) return false;
    const perm = roles.permissions?.find((p) => p.module === module);
    const has = perm?.subModules?.some((s) => s.name === approvalSubModule);
    return has ? hasPermission(module, approvalSubModule, "WRITE") : hasPermission(module, baseSubModule, "WRITE");
  };

  return { roles, loading, error, hasPermission, hasApproval, resetRolesCache };
};
