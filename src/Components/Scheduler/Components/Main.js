import React from "react";

//components
import Day from "./Layouts/Day";

const Main = (props) => {
  return (
    <React.Fragment>
      <div className="w-100">
        <Day {...props} />
      </div>
    </React.Fragment>
  );
};

export default Main;
