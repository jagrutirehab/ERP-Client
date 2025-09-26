import React from "react";
import { Navigate } from "react-router-dom";

//Dashboard
import DashboardEcommerce from "../pages/DashboardEcommerce";

import Patient from "../pages/Patient";

import MeetingComponent from "../pages/Meeting/Components/index.js";
import MyMeetingUI from "../pages/Meeting/MeetingPage.jsx";
import Intern from "../pages/Intern/index.js";

// import SelectIntern from "../pages/Intern/Views/index.js";
//login
const Login = React.lazy(() => import("../pages/Authentication/Login"));
// import Login from "../pages/Authentication/Login";
const ForgetPasswordPage = React.lazy(() =>
  import("../pages/Authentication/ForgetPassword")
);
const Logout = React.lazy(() => import("../pages/Authentication/Logout"));
const Register = React.lazy(() => import("../pages/User"));

//setting
const Setting = React.lazy(() => import("../pages/Setting"));

//notification
const Notification = React.lazy(() => import("../pages/Notification"));

//recycle bin
const Recyclebin = React.lazy(() => import("../pages/Recyclebin"));

//not found
const Basic404 = React.lazy(() =>
  import("../pages/AuthenticationInner/Errors/Basic404")
);

// User Profile
const UserProfile = React.lazy(() =>
  import("../pages/Authentication/user-profile")
);

// Center
const Center = React.lazy(() => import("../pages/Center"));
// Nurse
const Nurse = React.lazy(() => import("../pages/Nurse"));
// Emergency Dashboard
const EmergencyDashboad = React.lazy(() =>
  import("../pages/DashboardEmergency")
);
// Cash Management
const CashManagement = React.lazy(() => import("../pages/CashManagement"));

// Patient
// const Patient = React.lazy(() => import("../pages/Patient"));

// Booking
const Booking = React.lazy(() => import("../pages/Booking"));
const Medicine = React.lazy(() => import("../pages/Medicine"));

//Lead
const Lead = React.lazy(() => import("../pages/Lead"));

//Report
const Report = React.lazy(() => import("../pages/Report"));

const allElements = [
  { element: Register, label: "User" },
  { element: Center, label: "Center" },
  { element: Intern, label: "Intern" },
  { element: Patient, label: "Patient" },
  { element: Intern, label: "Intern" },
  { element: Booking, label: "Booking" },
  { element: Setting, label: "Setting" },
  { element: Recyclebin, label: "Recycle bin" },
  { element: Lead, label: "Lead" },
  { element: Report, label: "Report" },
  { element: Nurse, label: "Nurse" },
  { element: EmergencyDashboad, label: "Emergency" },
  { element: CashManagement, label: "Cash" },
];

const authProtectedRoutes = [
  { path: "/dashboard", component: DashboardEcommerce },
  { path: "/index", component: DashboardEcommerce },

  //User Profile
  { path: "/profile", component: UserProfile },
  { path: "/user/*", component: Register },
  { path: "/patient/*", component: Patient },
  { path: "/setting/*", component: Setting },
  { path: "/recyclebin/*", component: Recyclebin },
  { path: "/medicine", component: Medicine },
  { path: "/notification", component: Notification },
  // { path: "/Lead", component: Lead },
  //Users
  { path: "/intern/*", component: Intern },
  //Center
  { path: "/centers", component: Center },
  { path: "/nurse/*", component: Nurse },
  { path: "/emergency/*", component: EmergencyDashboad },
  { path: "/cash", component: CashManagement },

  // this route should be at the end of all other routes
  // eslint-disable-next-line react/display-name
  {
    path: "/",
    exact: true,
    component: () => <Navigate to="/dashboard" />,
  },
];

const publicRoutes = [
  // Authentication Page
  { path: "/logout", component: Logout },
  { path: "/login", component: Login },
  { path: "/forgot-password", component: ForgetPasswordPage },
  { path: "/meeting", component: MyMeetingUI },
];

export { authProtectedRoutes, publicRoutes, allElements };
