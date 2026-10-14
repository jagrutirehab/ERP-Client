import React from "react";
import Loader from "./Loader";

const CountBoxes = ({ data, loading }) => {
  const usersCount = data?.users?.length ?? 0;
  const employeesCount = data?.employees?.length ?? 0;

  return (
    <div className="row g-3 align-items-stretch">
      {/* Total Users */}
      <div className="col-md-6">
        <div className="h-100 p-4 bg-white border rounded-3 shadow-sm">
          <p className="text-muted mb-1">Total Users</p>
          <h2 className="fw-bold mb-0 text-primary">
            {loading ? <Loader /> : usersCount}
          </h2>
        </div>
      </div>

      {/* Total Employees */}
      <div className="col-md-6">
        <div className="h-100 p-4 bg-white border rounded-3 shadow-sm">
          <p className="text-muted mb-1">Total Employees</p>
          <h2 className="fw-bold mb-0 text-success">
            {loading ? <Loader /> : employeesCount}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountBoxes;
