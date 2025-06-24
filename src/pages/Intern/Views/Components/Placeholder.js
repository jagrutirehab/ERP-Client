import React from "react";
import PropTypes from "prop-types";
import { Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";

const Placeholder = (props) => {
  return (
    <React.Fragment>
      <Card className="border-0">
        {/* <img src={img2} className="card-img-top" alt="card dummy img" /> */}
        <CardBody className="border-0">
          <p className="card-text placeholder-glow">
            <span className="placeholder col-12"></span>
            <span className="placeholder col-12 mt-3"></span>
            <span className="placeholder col-12 mt-3"></span>
            {/* <span className="placeholder col-6"></span> */}
          </p>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

Placeholder.propTypes = {};

export default Placeholder;
