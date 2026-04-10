import React from "react";

const Banner = ({ totalAmount }) => {
  return (
    <React.Fragment>
      <div className="p-4 mt-3 shadow bg-body rounded">
        <div className="d-flex flex-wrap justify-content-between justify-content-md-around">
          <div className="d-flex align-items-center">
            <h6 className="display-6 fs-6">TOTAL CONVERTED AMOUNT (₹): </h6>
            <h5 className="display-5 ms-2 fs-17 font-semi-bold">
              {totalAmount || 0.0}
            </h5>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Banner;
