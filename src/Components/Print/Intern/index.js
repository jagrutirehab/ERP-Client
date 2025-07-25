import React from "react";
import PropTypes from "prop-types";
import Receipt from "./Receipt";
import RenderWhen from "../../Common/RenderWhen";
import { RECEIPT } from "../../constants/intern";

const Bills = ({ bill, center, intern }) => {
  return (
    <React.Fragment>
      <RenderWhen isTrue={bill.bill === RECEIPT}>
        <Receipt bill={bill} intern={intern} center={center} />
      </RenderWhen>
    </React.Fragment>
  );
};

Bills.propTypes = {
  bill: PropTypes.object.isRequired,
};

export default Bills;
