import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Row,
  Col,
  Input,
  Button,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  FormGroup,
} from "reactstrap";
import Select from "react-select";
import axios from "axios";
import { useSelector } from "react-redux";
import { api } from "../../config";
import { toast } from "react-toastify";

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
  const [exporting, setExporting] = useState(false);
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

  // Media View Modal
  const [mediaModal, setMediaModal] = useState({
    isOpen: false,
    mediaUrl: null,
    mediaType: "image", // "image" | "video"
  });

  const toggleMediaModal = (url = null, type = "image") => {
    setMediaModal({
      isOpen: !!url,
      mediaUrl: url,
      mediaType: type,
    });
  };

  // Action Modal (existing)
  const [modal, setModal] = useState(false);
  const [selectedActionItem, setSelectedActionItem] = useState(null);
  const [notificationForm, setNotificationForm] = useState({
    status: {},
    person: "",
    description: "",
  });

  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setNotificationForm({
        status: {},
        person: "",
        description: "",
      });
      setSelectedActionItem(null);
    }
  };

  const handleAction = (item) => {
    setSelectedActionItem(item);
    const initialStatus = {};
    if (item.alerts) {
      Object.entries(item.alerts).forEach(([key, value]) => {
        if (value) initialStatus[key] = key;
      });
    }
    setNotificationForm({
      status: initialStatus,
      person: "",
      description: "",
    });
    setModal(true);
  };

  const handleStatusChange = (alertKey, value) => {
    setNotificationForm((prev) => ({
      ...prev,
      status: {
        ...prev.status,
        [alertKey]: value,
      },
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNotificationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConfirm = async () => {
    if (!notificationForm.description) {
      toast.error("Please enter a description");
      return;
    }

    try {
      const payload = {
        actionBy: {
          name: user?.user?.name || "Unknown",
          id: user?.user?._id,
        },
        actionStatus: Object.values(notificationForm.status),
        actionNotes: notificationForm.description,
      };

      await axios.put(
        `${api.CCTV_SERVICE_URL}/alerts/${selectedActionItem._id}`,
        payload,
        {
          headers: {
            "x-api-key":
              "48dd6cc2f04685a14c6a7320b87097b23bd9a2979edfa8d0818902a8659313b0",
          },
        },
      );

      toast.success("Alert notification updated successfully");
      toggleModal();
      fetchcctvstats(pagination.page, pagination.limit);
    } catch (error) {
      console.error("Error updating alert:", error);
      toast.error("Failed to update alert");
    }
  };

  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const [dataAge, setDataAge] = useState(0);

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

  const fetchcctvstats = async (page = 1, limit = 10) => {
    try {
      setLoading(true);

      const params = { page, limit };

      if (selectedCenter !== "ALL") params.centerId = selectedCenter;
      if (camSearch) params.camId = camSearch;
      if (selectedAlert) params.alertType = selectedAlert;

      const response = await axios.get(`${api.CCTV_SERVICE_URL}/alerts`, {
        params,
        headers: {
          "x-api-key":
            "48dd6cc2f04685a14c6a7320b87097b23bd9a2979edfa8d0818902a8659313b0",
        },
      });

      setData(response?.data || []);
      setPagination(
        response?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      );

      setLastFetchedAt(Date.now());
      setDataAge(0);
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = {};

      if (selectedCenter !== "ALL") params.centerId = selectedCenter;
      if (camSearch) params.camId = camSearch;
      if (selectedAlert) params.alertType = selectedAlert;

      const response = await axios.get(
        `${api.CCTV_SERVICE_URL}/alerts/export`,
        {
          params,
          headers: {
            "x-api-key":
              "48dd6cc2f04685a14c6a7320b87097b23bd9a2979edfa8d0818902a8659313b0",
          },
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.setAttribute("download", `alerts_export_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("No records found to export");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchcctvstats(1, pagination.limit);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchcctvstats(1, pagination.limit);
    // eslint-disable-next-line
  }, [selectedCenter, camSearch, selectedAlert]);

  useEffect(() => {
    if (!lastFetchedAt) return;
    const interval = setInterval(() => {
      setDataAge(Math.floor((Date.now() - lastFetchedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastFetchedAt]);

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
      ) : null,
    );
  };

  const getMediaType = (filename) => {
    if (!filename) return "image";
    const ext = filename.split(".").pop().toLowerCase();
    if (["mp4", "webm", "ogg"].includes(ext)) return "video";
    return "image";
  };

  return (
    <div className="page-content overflow-hidden">
      <Container fluid>
        <div className="chat-wrapper d-flex row gap-1 mx-n4 my-n4 mb-n5 p-1">
          {/* HEADER */}
          <Row className="align-items-center mb-3">
            <Col>
              <h4>Webcam Alert Stats</h4>
              {lastFetchedAt && (
                <small className="text-muted">
                  Data updated {dataAge} seconds ago
                </small>
              )}
            </Col>
            <Col md="auto" className="d-flex gap-2">
              <Button
                color="success"
                size="sm"
                onClick={handleExport}
                disabled={exporting || loading}
              >
                {exporting ? "Downloading..." : "📥 Export CSV"}
              </Button>
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
                placeholder="Filter By Camera Name"
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
          <div
            className="table-responsive"
            style={{
              maxHeight: "calc(100vh - 280px)",
              overflow: "auto",
              width: "98%",
              margin: "0 auto",
            }}
          >
            <Table
              bordered
              striped
              className="mb-0"
              style={{ whiteSpace: "nowrap" }}
            >
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  background: "#fff",
                }}
              >
                <tr>
                  <th>Name</th>
                  <th>Center</th>
                  <th>Timestamp</th>
                  <th>Alerts</th>
                  <th>Event</th>
                  <th>Last Occurrence</th>
                  <th>Evidence</th>
                  <th>Take Action</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Action Notes</th>
                  <th>Action Date</th>
                  <th>Action By</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={13} className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : data.length ? (
                  data.map((item) => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.center?.name || "N/A"}</td>
                      <td>{new Date(item.timestamp).toLocaleString()}</td>
                      <td>{renderAlerts(item.alerts)}</td>
                      <td>{item.eventCount || "N/A"}</td>
                      <td>
                        {item.lastOccurrence
                          ? new Date(item.lastOccurrence).toLocaleString()
                          : "N/A"}
                      </td>
                      <td>
                        {item.fileName ? (
                          <Button
                            color="info"
                            size="sm"
                            onClick={() =>
                              toggleMediaModal(
                                item.fileName,
                                getMediaType(item.fileName),
                              )
                            }
                          >
                            View
                          </Button>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        <Button
                          color="primary"
                          size="sm"
                          onClick={() => handleAction(item)}
                        >
                          Action
                        </Button>
                      </td>
                      <td>
                        <Badge
                          color={
                            item.action === "resolved" ? "success" : "warning"
                          }
                        >
                          {item.action || "investigate"}
                        </Badge>
                      </td>
                      <td>
                        {item.actionStatus?.map((status, i) => (
                          <Badge color="secondary" className="me-1" key={i}>
                            {status}
                          </Badge>
                        )) || "N/A"}
                      </td>
                      <td>{item.actionNotes || "N/A"}</td>
                      <td>
                        {item.actionTime
                          ? new Date(item.actionTime).toLocaleString()
                          : "N/A"}
                      </td>
                      <td>{item.actionBy?.name || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={13} className="text-center">
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
                style={{ width: "80px" }}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
              </Input>
            </Col>

            <Col md="auto">
              <span className="me-2 text-muted">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                size="sm"
                className="me-1"
                disabled={pagination?.page <= 1}
                onClick={() => handlePageChange(pagination?.page - 1)}
              >
                Prev
              </Button>
              <Button
                size="sm"
                disabled={pagination?.page >= pagination?.totalPages}
                onClick={() => handlePageChange(pagination?.page + 1)}
              >
                Next
              </Button>
            </Col>
          </Row>
        </div>
      </Container>

      {/* MEDIA VIEW MODAL */}
      <Modal
        isOpen={mediaModal.isOpen}
        toggle={() => toggleMediaModal()}
        size="xl"
        centered
      >
        <ModalHeader toggle={() => toggleMediaModal()}>
          Evidence Preview
        </ModalHeader>
        <ModalBody className="text-center p-3">
          {mediaModal.mediaUrl ? (
            mediaModal.mediaType === "video" ? (
              <video
                controls
                autoPlay
                style={{ maxWidth: "100%", maxHeight: "70vh" }}
              >
                <source src={mediaModal.mediaUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={mediaModal.mediaUrl}
                alt="Evidence"
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
            )
          ) : (
            <p>No media available</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => toggleMediaModal()}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* EXISTING ACTION MODAL */}
      <Modal isOpen={modal} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal}>Alert Notification</ModalHeader>
        <ModalBody>
          {selectedActionItem && (
            <div className="bg-light p-3 rounded mb-3">
              <div className="d-flex align-items-center mb-2">
                <span className="me-2">
                  {renderAlerts(selectedActionItem.alerts)}
                </span>
                <small className="ms-auto text-muted">
                  {new Date(selectedActionItem.timestamp).toLocaleString()}
                </small>
              </div>
              <p className="mb-0 text-muted small">
                Resident at {selectedActionItem.center?.name || "Unknown"}
              </p>
            </div>
          )}

          <FormGroup tag="fieldset">
            <div className="d-flex gap-3">
              <div className="d-flex gap-3 flex-wrap">
                {selectedActionItem?.alerts &&
                  Object.entries(selectedActionItem.alerts)
                    .filter(([_, value]) => value)
                    .map(([alertKey]) => {
                      const label =
                        alertOptions.find((opt) => opt.value === alertKey)
                          ?.label ||
                        alertKey.charAt(0).toUpperCase() + alertKey.slice(1);
                      return (
                        <React.Fragment key={alertKey}>
                          <FormGroup check>
                            <Label check>
                              <Input
                                type="radio"
                                name={`status_${alertKey}`}
                                value={alertKey}
                                checked={
                                  notificationForm.status[alertKey] === alertKey
                                }
                                onChange={() =>
                                  handleStatusChange(alertKey, alertKey)
                                }
                              />{" "}
                              {label}
                            </Label>
                          </FormGroup>
                          <FormGroup check>
                            <Label check>
                              <Input
                                type="radio"
                                name={`status_${alertKey}`}
                                value={`no_${alertKey}`}
                                checked={
                                  notificationForm.status[alertKey] ===
                                  `no_${alertKey}`
                                }
                                onChange={() =>
                                  handleStatusChange(alertKey, `no_${alertKey}`)
                                }
                              />{" "}
                              No {label}
                            </Label>
                          </FormGroup>
                        </React.Fragment>
                      );
                    })}
              </div>
            </div>
          </FormGroup>

          <FormGroup className="mb-0">
            <Label for="description">Notes *</Label>
            <Input
              type="textarea"
              name="description"
              id="description"
              rows="3"
              value={notificationForm.description}
              onChange={handleFormChange}
              style={{
                borderColor: notificationForm.description ? "#28a745" : "",
              }}
            />
            {notificationForm.description && (
              <div className="text-end mt-1">
                <i className="bx bx-check-circle text-success font-size-18"></i>
              </div>
            )}
          </FormGroup>
        </ModalBody>
        <ModalFooter className="justify-content-center">
          <Button color="warning" onClick={handleConfirm} className="px-4">
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Stats;
