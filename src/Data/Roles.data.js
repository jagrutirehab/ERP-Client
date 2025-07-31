export const permissionList = [
  {
    key: "USER",
    label: "User",
    subModules: [
      { name: "userlist", label: "User List", type: "LIST" },
      { name: "createuser", label: "Create User", type: "CREATE" },
      { name: "edituser", label: "Edit User", type: "EDIT" },
      { name: "deleteuser", label: "Delete User", type: "DELETE" },
    ],
  },
  {
    key: "BILLING",
    label: "Billing",
    subModules: [],
  },
];

export const modulePermissionOptions = ["READ", "WRITE", "NONE"];
export const getSubmoduleOptions = (subType) => {
  switch (subType) {
    case "DELETE":
      return ["DELETE", "NONE"];
    case "LIST":
      return ["READ", "NONE"];
    case "CREATE":
    case "EDIT":
      return ["WRITE", "NONE"];
    default:
      return ["NONE"];
  }
};
