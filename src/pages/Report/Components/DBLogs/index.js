import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button, Col, Row, Input, Spinner } from "reactstrap";
import { getDoctorAnalytics } from "../../../../helpers/backend_helper";
import Divider from "../../../../Components/Common/Divider";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import WebAppsDropdown from "../../../../Components/Common/WebAppsDropdown";

const Doctor = ({ centers, centerAccess }) => {
  const [data, setData] = useState({
    data: [],
    pagination: { totalPages: 1, totalDocs: 0 },
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [centerFilter, setCenterFilter] = useState([...centerAccess]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => setPage(1), [debouncedSearch, limit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getDoctorAnalytics({
        page,
        limit,
        search: debouncedSearch,
        centerAccess: centerFilter,
        role: roleFilter,
      });
      setData(res || { data: [], pagination: { totalPages: 1, totalDocs: 0 } });
    } catch (err) {
      console.error("Failed to fetch doctor analytics", err);
      setData({ data: [], pagination: { totalPages: 1, totalDocs: 0 } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch, centerFilter, limit, roleFilter]);

  const columns = [
    { name: "#", selector: (row, idx) => idx + 1, width: "60px" },
    { name: "Name", selector: (row) => row.name || "-" },
    { name: "Role", selector: (row) => row.role || "-" },
    { name: "Patient", selector: (row) => row.patientName || "-" },
    { name: "UID", selector: (row) => row.uid || "-" },
  ];

  return (
    <>
      <div className="pt-4">
        <div className="bg-white p-2 m-n3">
          <div className="">
            <h6 className="display-6 fs-6 my-3">
              Total Patients: {data?.pagination?.totalDocs || 0}
            </h6>
          </div>
          <div className="d-flex gap-2 align-items-center mt-3">
            <Input
              type="select"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              style={{ width: "100px" }}
            >
              {[10, 20, 30, 40, 50].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Input>
            <Input
              type="select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ width: "200px" }}
            >
              <option value="">All</option>
              <option value="doctor">Doctor</option>
              <option value="psychologist">Psychologist</option>
            </Input>
            <WebAppsDropdown
              centers={centers}
              centerAccess={centerFilter}
              onApply={(selectedCenters) => setCenterFilter(selectedCenters)}
            />
            <Input
              type="text"
              placeholder="Search patient UID, doctor, or psychologist"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "30%" }}
            />
          </div>

          <Divider />
          {loading ? (
            <div className="text-center py-4">
              <Spinner color="primary" />
            </div>
          ) : (
            <DataTable
              fixedHeader
              columns={columns}
              data={data?.data || []}
              highlightOnHover
              noHeader
            />
          )}

          {!loading && data?.pagination?.totalPages > 1 && (
            <Row className="mt-4 justify-content-center align-items-center">
              <Col xs="auto">
                <Button
                  color="secondary"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Previous
                </Button>
              </Col>
              <Col xs="auto" className="text-center text-muted mx-3">
                Showing {(page - 1) * limit + 1}–
                {Math.min(page * limit, data?.pagination?.totalDocs || 0)} of{" "}
                {data?.pagination?.totalDocs || 0}
              </Col>
              <Col xs="auto">
                <Button
                  color="secondary"
                  disabled={page === data?.pagination?.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </Button>
              </Col>
            </Row>
          )}
        </div>
      </div>
    </>
  );
};

Doctor.prototype = {
  centers: PropTypes.array,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  centerAccess: state.User?.centerAccess,
});
export default connect(mapStateToProps)(Doctor);
