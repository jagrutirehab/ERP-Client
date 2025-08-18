import { useState, useEffect } from "react";
import { getLoggedinUser } from "../../helpers/api_helper";

const useProfile = () => {
  const userProfileSession = getLoggedinUser();

  const [userProfile, setUserProfile] = useState(userProfileSession || null);
  const [token, setToken] = useState(userProfileSession?.microLogin?.token || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const updatedProfile = getLoggedinUser();
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        setToken(updatedProfile?.microLogin?.token);
      } else {
        setUserProfile(null);
        setToken(null);
      }
    } catch (e) {
      console.error("Error in getLoggedinUser:", e);
      setUserProfile(null);
      setToken(null);
    }
    setLoading(false);
  }, []);

  return { userProfile, loading, token };
};

export { useProfile };