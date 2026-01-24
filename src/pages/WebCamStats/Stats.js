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

  // -------- ACTION MODAL --------
  const [modal, setModal] = useState(false);
  const [selectedActionItem, setSelectedActionItem] = useState(null);
  const [notificationForm, setNotificationForm] = useState({
    status: {},
    description: "",
  });

  // -------- IMAGE PREVIEW MODAL --------
  const [imageModal, setImageModal] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const toggleImageModal = () => {
    setImageModal(!imageModal);
    if (imageModal) setPreviewImage("");
  };

  const openImagePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setImageModal(true);
  };

  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setNotificationForm({ status: {}, description: "" });
      setSelectedActionItem(null);
    }
  };

  const handleAction = (item) => {
    const initialStatus = {};
    Object.entries(item.alerts || {}).forEach(([k, v]) => {
      if (v) initialStatus[k] = k;
    });
    setNotificationForm({ status: initialStatus, description: "" });
    setSelectedActionItem(item);
    setModal(true);
  };

  const handleStatusChange = (alertKey, value) => {
    setNotificationForm((prev) => ({
      ...prev,
      status: { ...prev.status, [alertKey]: value },
    }));
  };

  const handleConfirm = async () => {
    if (!notificationForm.description) {
      toast.error("Please enter a description");
      return;
    }

    try {
      await axios.put(
        `${api.CCTV_SERVICE_URL}/alerts/${selectedActionItem._id}`,
        {
          actionBy: {
            name: user?.user?.name || "Unknown",
            id: user?.user?._id,
          },
          actionStatus: Object.values(notificationForm.status),
          actionNotes: notificationForm.description,
        },
        {
          headers: {
            "x-api-key":
              "48dd6cc2f04685a14c6a7320b87097b23bd9a2979edfa8d0818902a8659313b0",
          },
        },
      );

      toast.success("Alert updated successfully");
      toggleModal();
      fetchcctvstats(pagination.page, pagination.limit);
    } catch {
      toast.error("Failed to update alert");
    }
  };

  const fetchcctvstats = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (selectedCenter !== "ALL") params.centerId = selectedCenter;
      if (camSearch) params.camId = camSearch;
      if (selectedAlert) params.alertType = selectedAlert;

      const res = await axios.get(`${api.CCTV_SERVICE_URL}/alerts`, {
        params,
        headers: {
          "x-api-key":
            "48dd6cc2f04685a14c6a7320b87097b23bd9a2979edfa8d0818902a8659313b0",
        },
      });

      setData(res.data || []);
      setPagination(res.pagination || pagination);
    } catch {
      toast.error("Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchcctvstats();
  }, [selectedCenter, camSearch, selectedAlert]);

  const renderAlerts = (alerts) =>
    Object.entries(alerts || {}).map(
      ([k, v]) =>
        v && (
          <Badge key={k} color="danger" className="me-1">
            {k}
          </Badge>
        ),
    );

  return (
    <div className="page-content">
      <Container fluid>
        <Table bordered striped responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Center</th>
              <th>Timestamp</th>
              <th>Alerts</th>
              <th>Evidence</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.center?.name}</td>
                <td>{new Date(item.timestamp).toLocaleString()}</td>
                <td>{renderAlerts(item.alerts)}</td>
                <td>
                  {item.fileName ? (
                    <Button
                      size="sm"
                      color="info"
                      onClick={() => openImagePreview(item.fileName)}
                    >
                      View
                    </Button>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  <Button size="sm" onClick={() => handleAction(item)}>
                    Action
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      {/* IMAGE PREVIEW MODAL */}
      <Modal isOpen={imageModal} toggle={toggleImageModal} size="lg" centered>
        <ModalHeader toggle={toggleImageModal}>Evidence Preview</ModalHeader>
        <ModalBody className="text-center">
          {previewImage && (
            <img
              src={previewImage}
              alt="Evidence"
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                borderRadius: "8px",
              }}
            />
          )}
        </ModalBody>
      </Modal>

      {/* ACTION MODAL */}
      <Modal isOpen={modal} toggle={toggleModal} centered>
        <ModalHeader toggle={toggleModal}>Alert Action</ModalHeader>
        <ModalBody>
          <FormGroup>
            {Object.entries(selectedActionItem?.alerts || {})
              .filter(([_, v]) => v)
              .map(([k]) => (
                <FormGroup check key={k}>
                  <Label check>
                    <Input
                      type="radio"
                      checked={notificationForm.status[k] === k}
                      onChange={() => handleStatusChange(k, k)}
                    />{" "}
                    {k}
                  </Label>
                </FormGroup>
              ))}
          </FormGroup>

          <FormGroup>
            <Label>Notes *</Label>
            <Input
              type="textarea"
              value={notificationForm.description}
              onChange={(e) =>
                setNotificationForm({
                  ...notificationForm,
                  description: e.target.value,
                })
              }
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="warning" onClick={handleConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Stats;
