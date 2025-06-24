import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";

//permission = create, edit, delete
// page = Patient, Setting etc
//subAccess = Page sub access like charting, billing
//pages = array of given page access
//children to be rendered
/**
 *
 * @param {permission} Permission
 * @param {subAccess} SubAccess
 * @param {pages} Pages
 * @param {children} Children
 * @returns Children
 */
const CheckPermission = ({ permission, subAccess, pages, children }) => {
  //page,
  const location = useLocation();
  const currentLocation = location.pathname.split("/")[1];
  const page = `${currentLocation[0].toUpperCase()}${currentLocation.slice(1)}`;
  
  let pg = pages.find((p) => p.name === page);
 


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
};

const mapStateToProps = (state) => ({
  pages: state.User.user?.pageAccess?.pages,
});

export default connect(mapStateToProps)(CheckPermission);
