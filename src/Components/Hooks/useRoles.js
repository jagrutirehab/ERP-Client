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
       if(!handleAuthError(error)){
          setError(error);
       }
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
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


  return { roles, loading, error, hasPermission, resetRolesCache };
};
