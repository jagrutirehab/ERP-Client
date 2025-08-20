import React, { Children } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";

//permission = create, edit, delete
// page = Patient, Setting etc
//subAccess = Page sub access like charting, billing
//pages = array of given page access
//accessRoles= array of permissions that have access to the page
//children to be rendered
/**
 *
 * @param {permission} Permission
 * @param {subAccess} SubAccess
 * @param {pages} Pages
 * @param {children} Children
 * @returns Children
 */
const CheckPermission = ({
  permission,
  subAccess,
  pages,
  accessRolePermission,
  children,
  allowedRoles,
  userRole
}) => {
  //page,
  const location = useLocation();
  const currentLocation = location.pathname.split("/")[1];
  const page = `${currentLocation[0].toUpperCase()}${currentLocation.slice(1)}`;

  let pg = pages?.find((p) => p.name === page);

  if (allowedRoles) {
    if (!allowedRoles.includes(userRole)) return <></>;
    return children;
  }

  if (accessRolePermission) {
    let permissions = accessRolePermission.find(
      (p) => p.module === page.toUpperCase()
    );

    if (!permissions || permissions.type === "NONE") return <></>;

    if (!subAccess) {
      if (permissions.type === "DELETE") return children;
      if (permissions.type === "WRITE") {
        if (["create", "edit", "read"].includes(permission)) {
          return children;
        } else {
          return <></>;
        }
      }
      if (permissions.type === "READ" && permission === "read") {
        return children;
      } else {
        return <></>;
      }
    } else {
      const subPerm = permissions.subModules?.find(
        (sub) => sub.name.toUpperCase() === subAccess.toUpperCase()
      );

      if (!subPerm || subPerm.type === "NONE") return <></>;

      if (subPerm.type === "DELETE") return children;
      if (subPerm.type === "WRITE") {
        if (["create", "edit", "read"].includes(permission)) return children;
        return <></>;
      }
      if (subPerm.type === "READ" && permission === "read") return children;
      return <></>;
    }
  }

  if (subAccess) {
    const sub = pg?.subAccess?.find((s) => s.name === subAccess);
    if (!sub?.permissions[permission]) return <></>;
  } else if (!pg?.permissions[permission]) return <></>;
  return children;
};

CheckPermission.propTypes = {
  permission: PropTypes.string,
  subAccess: PropTypes.string,
  pages: PropTypes.array,
  children: PropTypes.node,
  accessRolePermission: PropTypes.array,
  allowedRoles:PropTypes.array,
  userRole:PropTypes.string
};

const mapStateToProps = (state) => ({
  pages: state.User.user?.pageAccess?.pages,
});

export default connect(mapStateToProps)(CheckPermission);
