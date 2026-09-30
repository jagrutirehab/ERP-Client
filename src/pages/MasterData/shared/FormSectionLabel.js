import React from "react";

const FormSectionLabel = ({ icon, text }) => (
  <div className="im-section-label">
    <i className={`bx ${icon}`}></i>
    <span>{text}</span>
  </div>
);

export default FormSectionLabel;