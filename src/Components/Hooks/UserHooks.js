import { useEffect, useState } from "react";
import { getLoggedinUser } from "../../helpers/api_helper";

const useProfile = () => {
  const userProfileSession = getLoggedinUser();
  var token =
  userProfileSession &&
  userProfileSession["token"];
  const [loading, setLoading] = useState(userProfileSession ? false : true);
  const [userProfile, setUserProfile] = useState(
    userProfileSession ? userProfileSession : null
  );

  useEffect(() => {
    const userProfileSession = getLoggedinUser();
    var token =
      userProfileSession &&
      userProfileSession["token"];
    setUserProfile(userProfileSession ? userProfileSession : null);
    setLoading(token ? false : true);
  }, []);


  return { userProfile, loading, token };
};

export { useProfile };

// import { useState, useEffect } from "react";
// import { getLoggedinUser } from "../../helpers/api_helper";

// const useProfile = () => {
//   const userProfileSession = getLoggedinUser();

//   const [userProfile, setUserProfile] = useState(userProfileSession || null);
//   const [token, setToken] = useState(userProfileSession?.microLogin?.token || null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     try {
//       const updatedProfile = getLoggedinUser();
//       if (updatedProfile) {
//         setUserProfile(updatedProfile);
//         setToken(updatedProfile?.microLogin?.token);
//       } else {
//         setUserProfile(null);
//         setToken(null);
//       }
//     } catch (e) {
//       console.error("Error in getLoggedinUser:", e);
//       setUserProfile(null);
//       setToken(null);
//     }
//     setLoading(false);
//   }, []);

//   return { userProfile, loading, token };
// };

// export { useProfile };

