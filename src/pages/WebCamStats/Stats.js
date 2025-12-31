import React, { useEffect, useState } from "react";
import { Container, Table, Row, Col, Input, Button, Badge } from "reactstrap";
import Select from "react-select";
import axios from "axios";
import { useSelector } from "react-redux";
import { api } from "../../config";

const alertOptions = [
  { value: "", label: "All Alerts" },
  { value: "fall", label: "Fall" },
  { value: "panic", label: "Panic" },
  { value: "fight", label: "Fight" },
  { value: "staff", label: "Staff" },
  { value: "washroom", label: "Washroom" },
  { value: "night_exit", label: "Night Exit" },
  { value: "aggression", label: "Aggression" },
  { value: "yoga", label: "Yoga" },
];

const Stats = () => {
  const user = useSelector((state) => state.User);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const [selectedCenter, setSelectedCenter] = useState("ALL");
  const [camSearch, setCamSearch] = useState("");
  const [selectedAlert, setSelectedAlert] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const [dataAge, setDataAge] = useState(0);

  // ---------------- CENTER OPTIONS ----------------
  const centerOptions = [
    ...(user?.centerAccess?.length > 1
      ? [{ value: "ALL", label: "All Centers" }]
      : []),
    ...(user?.centerAccess?.map((id) => {
      const center = user?.userCenters?.find((c) => c._id === id);
      return {
        value: id,
        label: center?.title || "Unknown Center",
      };
    }) || []),
  ];

  const selectedCenterOption =
    centerOptions.find((opt) => opt.value === selectedCenter) ||
    centerOptions[0];

  // ---------------- FETCH DATA ----------------
  const fetchcctvstats = async (page = 1, limit = 10) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit,
      };

      if (selectedCenter !== "ALL") {
        params.centerId = selectedCenter;
      }

      if (camSearch) {
        params.camId = camSearch;
      }

      if (selectedAlert) {
        params.alertType = selectedAlert;
      }

      const response = await axios.get(`${api.CCTV_SERVICE_URL}/alerts`, {
        params,
        headers: {
          "x-api-key":
            "48dd6cc2f04685a14c6a7320b87097b23bd9a2979edfa8d0818902a8659313b0",
        },
      });

      if (response) {
        setData(response.data || []);
        setPagination(response.pagination);

        setLastFetchedAt(Date.now());
        setDataAge(0);
      }
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    fetchcctvstats(1, pagination.limit);
  }, []);

  // ---------------- FILTER CHANGE ----------------
  useEffect(() => {
    fetchcctvstats(1, pagination.limit);
  }, [selectedCenter, camSearch, selectedAlert]);

  // ---------------- DATA AGE COUNTER ----------------
  useEffect(() => {
    if (!lastFetchedAt) return;

    const interval = setInterval(() => {
      setDataAge(Math.floor((Date.now() - lastFetchedAt) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastFetchedAt]);

  // ---------------- HANDLERS ----------------
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchcctvstats(newPage, pagination.limit);
    }
  };

  const handlePageSizeChange = (e) => {
    const newLimit = parseInt(e.target.value);
    fetchcctvstats(1, newLimit);
  };

  const handleReload = () => {
    fetchcctvstats(pagination.page, pagination.limit);
  };

  const renderAlerts = (alerts) => {
    if (!alerts) return null;

    return Object.entries(alerts).map(([key, value]) =>
      value ? (
        <Badge color="danger" className="me-1" key={key}>
          {key}
        </Badge>
      ) : null
    );
  };

  // ---------------- UI ----------------
  return (
    <div className="page-content overflow-hidden">
      <Container fluid>
        <div className="chat-wrapper d-flex row gap-1 mx-n4 my-n4 mb-n5 p-1">
          {/* HEADER */}
          <Row className="align-items-center">
            <Col>
              <h4>Webcam Alert Stats</h4>
              {lastFetchedAt && (
                <small className="text-muted">
                  Data updated {dataAge} seconds ago
                </small>
              )}
            </Col>
            <Col md="auto">
              <Button color="secondary" size="sm" onClick={handleReload}>
                🔄 Reload
              </Button>
            </Col>
          </Row>

          {/* FILTERS */}
          <Row className="mb-3 g-2">
            <Col md="3">
              <Select
                value={selectedCenterOption}
                onChange={(opt) => setSelectedCenter(opt.value)}
                options={centerOptions}
                placeholder="Select Center"
              />
            </Col>

            <Col md="3">
              <Input
                placeholder="Search Cam ID"
                value={camSearch}
                onChange={(e) => setCamSearch(e.target.value)}
              />
            </Col>

            <Col md="3">
              <Select
                options={alertOptions}
                onChange={(opt) => setSelectedAlert(opt.value)}
                placeholder="Filter Alert Type"
              />
            </Col>
          </Row>

          {/* TABLE */}
          <div className="table-responsive">
            <Table bordered striped>
              <thead>
                <tr>
                  <th>Cam ID</th>
                  <th>Center</th>
                  <th>Timestamp</th>
                  <th>Alerts</th>
                  <th>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : data.length ? (
                  data.map((item) => (
                    <tr key={item._id}>
                      <td>{item.cam_id}</td>
                      <td>{item.center.name}</td>
                      <td>{new Date(item.timestamp).toLocaleString()}</td>
                      <td>{renderAlerts(item.alerts)}</td>
                      <td>
                        {item.fileName ? (
                          <Button
                            color="info"
                            size="sm"
                            onClick={() => window.open(item.fileName, "_blank")}
                          >
                            View
                          </Button>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No Record Found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* PAGINATION */}
          <Row className="justify-content-between align-items-center mt-3">
            <Col md="auto">
              <Input
                type="select"
                value={pagination?.limit}
                onChange={handlePageSizeChange}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
              </Input>
            </Col>

            <Col md="auto">
              <Button
                disabled={pagination?.page === 1}
                onClick={() => handlePageChange(pagination?.page - 1)}
              >
                Prev
              </Button>{" "}
              <Button
                disabled={pagination?.page === pagination?.totalPages}
                onClick={() => handlePageChange(pagination?.page + 1)}
              >
                Next
              </Button>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default Stats;
