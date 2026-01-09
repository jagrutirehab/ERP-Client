import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Input, Spinner, Row, Col, Button } from "reactstrap";
import { getFinanceAnalytics } from "../../../../helpers/backend_helper";
import Divider from "../../../../Components/Common/Divider";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { endOfDay, format, startOfDay } from "date-fns";
import Header from "../Header";
import Highlighter from "react-highlight-words";
import CenterDropdown from "../Doctor/components/CenterDropDown";
import { capitalizeWords } from "../../../../utils/toCapitalize";

const Finance = ({ centers, centerAccess }) => {
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
      const res = await getFinanceAnalytics({
        startDate: reportDate.start.toISOString(),
        endDate: reportDate.end.toISOString(),
        page,
        limit,
        search: debouncedSearch,
        centerAccess: selectedCentersIds,
      });
      setData(res || { data: [], pagination: { totalPages: 1, totalDocs: 0 } });
    } catch (err) {
      console.error("Failed to fetch finance analytics", err);
      setData({ data: [], pagination: { totalPages: 1, totalDocs: 0 } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch, selectedCentersIds, limit, reportDate]);

  const columns = [
    { name: "#", selector: (row, idx) => idx + 1, width: "60px" },
    {
      name: "Patient Name",
      cell: (row) => (
        <span className="mb-0">
          <Highlighter
            searchWords={[search]}
            autoEscape
            textToHighlight={capitalizeWords(row.patientName) || "-"}
          />
        </span>
      ),
      wrap: true,
    },
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
    {
      name: "Payment Date",
      selector: (row) =>
        row.paymentDate
          ? format(new Date(row.paymentDate), "d MMM yyyy hh:mm a")
          : "-",
      wrap: true,
    },
    {
      name: "Amount",
      selector: (row) => (row.amount ? `₹${row.amount.toLocaleString()}` : "-"),
    },
    {
      name: "Payment Mode",
      selector: (row) => capitalizeWords(row.paymentMode) || "-",
    },
    {
      name: "Center",
      selector: (row) => capitalizeWords(row.centerName) || "-",
      wrap: true,
    },
    {
      name: "Bill Type",
      selector: (row) => capitalizeWords(row.billType) || "-",
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
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="d-flex gap-2 align-items-center">
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
                type="text"
                placeholder="Search by patient name or UID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "80%" }}
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

Finance.propTypes = {
  centers: PropTypes.array,
  centerAccess: PropTypes.array,
};

const mapStateToProps = (state) => ({
  centers: state.Center.data,
  centerAccess: state.User?.centerAccess,
});

export default connect(mapStateToProps)(Finance);
