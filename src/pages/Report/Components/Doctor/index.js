import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { fetchDoctorAnalytics } from "../../../../store/features/report/reportSlice";

const Doctor = ({ data, centerAccess }) => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const limit = 20;
  //   const [centerAccess, setCenterAccess]=useState([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, dispatch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    dispatch(
      fetchDoctorAnalytics({
        page,
        limit,
        search: debouncedSearch,
        centerAccess,
      })
    );
  }, [dispatch, page, limit, debouncedSearch, centerAccess]);

  return (
    <React.Fragment>
      <div className="pt-4">
        <div className="bg-white p-2 m-n3">
          <div className="">
            <h6 className="display-6 fs-6 my-3">Total Patients:- 1000</h6>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  data: state.Report.doctor,
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(Doctor);
