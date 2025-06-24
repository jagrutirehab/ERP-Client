import React from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";

const Register = ({ data, title, background, className, children }) => {
  return (
    <React.Fragment>
      <div className={className}>
        <div className={background}>
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="display-5 text-capitalize text-primary fs-12 mb-0">
              {title}
            </h6>
            <div className="fs-13">
              <div>
                <h6 className="display-5 text-primary fs-12 mb-0 fst-italic">
                  {data.author?.name} ({data.author?.role})
                </h6>
              </div>
              <div>
                {format(new Date(data.createdAt), "dd MMMM yyyy hh:mm a")}
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </React.Fragment>
  );
};

Register.propTypes = {
  data: PropTypes.object,
};

export default Register;
