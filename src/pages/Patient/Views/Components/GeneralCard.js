import React from "react";
import PropTypes from "prop-types";
import { Col } from "reactstrap";
import { connect } from "react-redux";

const GeneralCard = ({ data, children }) => {
  return (
    <React.Fragment>
      <Col xs={12}>
        <div className="d-flex flex-wrap justify-content-between position-relative px-3 bg-light timeline-date border border-dark py-2">
          <div>
            {data ? <h6 className="display-6 fs-6 mb-0">{data}</h6> :
              <h6></h6>
            }

          </div>
          {children}
        </div>
      </Col>
    </React.Fragment>
  );
};

GeneralCard.propTypes = {
  data: PropTypes.object,
};

const mapStateToProps = (state) => ({
  // loading: state.Bill.billLoading,
});

export default connect(mapStateToProps)(GeneralCard);
