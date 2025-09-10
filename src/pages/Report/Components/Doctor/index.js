import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Input, Spinner, Row, Col, Button } from "reactstrap";
import { getDoctorAnalytics } from "../../../../helpers/backend_helper";
import Divider from "../../../../Components/Common/Divider";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { differenceInYears, endOfDay, format, startOfDay } from "date-fns";
import Header from "../Header";
import Highlighter from "react-highlight-words";
import CenterDropdown from "./components/CenterDropDown";

const Doctor = ({ centers, centerAccess }) => {
  const [reportDate, setReportDate] = useState({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });
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
  const [patientFilter, setPatientFilter] = useState("");

  const centerOptions = centers
    ?.filter((c) => centerAccess.includes(c._id))
    .map((c) => ({
      _id: c._id,
      title: c.title,
    }));

  const [selectedCenters, setSelectedCenters] = useState(centerOptions);
  const [selectedCentersIds, setSelectedCentersIds] = useState(
    centerOptions.map((c) => c._id)
  );

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => setPage(1), [debouncedSearch, limit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getDoctorAnalytics({
        startDate: reportDate.start.toISOString(),
        endDate: reportDate.end.toISOString(),
        page,
        limit,
        search: debouncedSearch,
        centerAccess: selectedCentersIds,
        role: roleFilter,
        patient: patientFilter,
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
  }, [
    page,
    debouncedSearch,
    selectedCentersIds,
    limit,
    roleFilter,
    reportDate,
    patientFilter,
  ]);

  const columns = [
    { name: "#", selector: (row, idx) => idx + 1, width: "60px" },
    {
      name: "Name",
      cell: (row) => (
        <span className="mb-0">
          <Highlighter
            searchWords={[search]}
            autoEscape
            textToHighlight={row.name || "-"}
          />
        </span>
      ),
    },
    { name: "Role", selector: (row) => row.role || "-" },
    { name: "Patient", selector: (row) => row.patientName || "-" },
    {
      name: "UID",
      cell: (row) => (
        <span className="mb-0">
          <Highlighter
            searchWords={[search]}
            autoEscape
            textToHighlight={row.uid || "-"}
          />
        </span>
      ),
    },
    { name: "Gender", selector: (row) => row.gender || "-" },
    { name: "Referred By", selector: (row) => row.referredBy || "-" },
    { name: "Phone No", selector: (row) => row.phoneNumber || "-" },
    {
      name: "Age",
      selector: (row) =>
        row.dateOfBirth
          ? `${differenceInYears(new Date(), new Date(row.dateOfBirth))} years`
          : "-",
      wrap: true,
    },
    {
      name: "Guardian",
      selector: (row) => row.guardianName || "-",
      wrap: true,
    },
    {
      name: "Guardian Number",
      selector: (row) => row.guardianPhoneNumber || "-",
      wrap: true,
    },
    {
      name: "Admission Date",
      selector: (row) =>
        row.addmissionDate
          ? format(new Date(row.addmissionDate), "d MMM yyyy hh:mm a")
          : "-",
      wrap: true,
    },
    {
      name: "Discharge Date",
      selector: (row) =>
        row.dischargeDate
          ? format(new Date(row.dischargeDate), "d MMM yyyy hh:mm a")
          : "-",
      wrap: true,
    },
  ];

  return (
    <>
      <div className="pt-4">
        <div className="bg-white p-2 m-n3">
          <div className="">
            <h6 className="display-6 fs-6 my-3">
              Total:-{" "}
              {loading ? (
                <span
                  style={{
                    display: "inline-block",
                    width: "20px",
                    height: "18px",
                    borderRadius: "4px",
                    background:
                      "linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%)",
                    backgroundSize: "200% 100%",
                    animation: "skeletonShimmer 1.2s infinite",
                    verticalAlign: "middle",
                  }}
                ></span>
              ) : (
                data?.pagination?.totalDocs || 0
              )}
              <style>
                {`
                 @keyframes skeletonShimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
               `}
              </style>
            </h6>
          </div>
          <Header reportDate={reportDate} setReportDate={setReportDate} />
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
            <Input
              type="select"
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              style={{ width: "200px" }}
            >
              <option value="">All Patients</option>
              <option value="admitted_patients">Admitted Patients</option>
            </Input>
            <Input
              type="text"
              placeholder="Search patient UID, doctor, or psychologist"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "30%" }}
            />
            <CenterDropdown
              options={centerOptions}
              value={selectedCentersIds}
              onChange={(ids) => {
                setSelectedCentersIds(ids);
                setSelectedCenters(
                  centerOptions.filter((c) => ids.includes(c._id))
                );
              }}
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
