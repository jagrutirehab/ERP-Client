import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearUser } from "../../store/features/auth/user/userSlice";
import { resetRolesCache } from "./useRoles";

export const useAuthError = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();



  const handleAuthError = (error) => {
    if (error?.statusCode === 401 || error?.type === "unauthorized") {
      dispatch(clearUser());
      navigate("/login");
      resetRolesCache();
      toast.error("Session expired, please relogin");
      return true;
    }
    return false;
  };

  return handleAuthError;
};
