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
        // console.log("response", response)
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

  // console.log(roles, "roles");

  const hasPermission = (module, subModule, requiredType = "NONE") => {
    if (!roles) return false;
    const requiredRank = typeRank[requiredType];

    console.log("Checking:", module, subModule, requiredType);
    console.log("Roles:", roles);
    console.log("Permissions:", roles.permissions);

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

  return { roles, loading, error, hasPermission, resetRolesCache };
};
