import React from "react";
import PropTypes from "prop-types";

const RenderWhen = ({ isTrue, children }) => {
  if (!isTrue) return <></>;
  return <>{children}</>;
};

RenderWhen.prototype = {
  children: PropTypes.node,
  isTrue: PropTypes.bool,
};

export default RenderWhen;
